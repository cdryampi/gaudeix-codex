"""
Management command to scrape news from configured sources.

Usage:
    python manage.py scrape_news                    # All active sources
    python manage.py scrape_news cabrera-de-mar     # Specific source
    python manage.py scrape_news --max-pages=3      # Limit pages
    python manage.py scrape_news --no-skip          # Re-scrape existing
    python manage.py scrape_news --list-parsers     # Show available parsers
"""

from django.core.management.base import BaseCommand, CommandError

from scraper.parser_registry import ParserRegistry
from scraper.services.scraper_service import ScraperService


class Command(BaseCommand):
    help = "Scrape news from municipality websites"

    def add_arguments(self, parser):
        parser.add_argument(
            "source",
            nargs="?",
            type=str,
            help="Source slug to scrape (e.g., cabrera-de-mar). If not specified, scrapes all active sources.",
        )
        parser.add_argument(
            "--max-pages",
            type=int,
            default=None,
            help="Maximum number of listing pages to scrape",
        )
        parser.add_argument(
            "--no-skip",
            action="store_true",
            help="Re-scrape news that already exist in database",
        )
        parser.add_argument(
            "--delay",
            type=float,
            default=1.0,
            help="Delay between requests in seconds (default: 1.0)",
        )
        parser.add_argument(
            "--list-parsers",
            action="store_true",
            help="List all available parsers and exit",
        )

    def handle(self, *args, **options):
        # List parsers mode
        if options["list_parsers"]:
            self.list_parsers()
            return

        service = ScraperService(delay=options["delay"])
        skip_existing = not options["no_skip"]
        max_pages = options["max_pages"]

        if options["source"]:
            # Scrape specific source
            source_slug = options["source"]

            if not ParserRegistry.has(source_slug):
                available = ", ".join(ParserRegistry.list_all())
                raise CommandError(
                    f"Unknown source '{source_slug}'. Available: {available}"
                )

            self.stdout.write(f"Scraping {source_slug}...")
            result = service.scrape_source(
                source_slug,
                max_pages=max_pages,
                skip_existing=skip_existing,
            )
            self.print_result(result)

        else:
            # Scrape all active sources
            parsers = ParserRegistry.list_all()
            if not parsers:
                self.stdout.write(
                    self.style.WARNING("No parsers registered. Nothing to scrape.")
                )
                return

            self.stdout.write(f"Scraping {len(parsers)} source(s)...")
            results = service.scrape_all_active(
                max_pages=max_pages,
                skip_existing=skip_existing,
            )

            for result in results:
                self.print_result(result)

            # Summary
            total_created = sum(r.news_created for r in results)
            total_updated = sum(r.news_updated for r in results)
            total_errors = sum(len(r.errors) for r in results)

            self.stdout.write("")
            self.stdout.write(
                self.style.SUCCESS(
                    f"Total: {total_created} created, {total_updated} updated, "
                    f"{total_errors} errors"
                )
            )

    def list_parsers(self):
        """Print available parsers."""
        parsers = ParserRegistry.get_all_info()

        if not parsers:
            self.stdout.write(self.style.WARNING("No parsers registered."))
            return

        self.stdout.write("Available parsers:")
        self.stdout.write("-" * 60)

        for p in parsers:
            self.stdout.write(f"  {p['slug']:<25} {p['name']:<20} {p['base_url']}")

        self.stdout.write("-" * 60)
        self.stdout.write(f"Total: {len(parsers)} parser(s)")

    def print_result(self, result):
        """Print scraping result."""
        self.stdout.write("")
        self.stdout.write(f"=== {result.source_slug} ===")
        self.stdout.write(f"  Pages scraped: {result.pages_scraped}")
        self.stdout.write(f"  News found:    {result.news_found}")
        self.stdout.write(f"  Created:       {result.news_created}")
        self.stdout.write(f"  Updated:       {result.news_updated}")
        self.stdout.write(f"  Skipped:       {result.news_skipped}")

        if result.errors:
            self.stdout.write(self.style.ERROR(f"  Errors: {len(result.errors)}"))
            for error in result.errors[:5]:  # Show first 5 errors
                self.stdout.write(self.style.ERROR(f"    - {error[:80]}"))
            if len(result.errors) > 5:
                self.stdout.write(
                    self.style.ERROR(f"    ... and {len(result.errors) - 5} more")
                )
        else:
            self.stdout.write(self.style.SUCCESS("  Status: OK"))
