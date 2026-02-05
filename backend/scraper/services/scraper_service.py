"""
Scraper service - orchestrates the scraping process.

This service coordinates fetching pages, parsing content, and storing results.
"""

import logging
import time
from dataclasses import dataclass
from typing import List, Optional, Set

import requests
from django.utils import timezone

from scraper.base_parser import BaseNewsParser, ScrapedNewsData
from scraper.models import ScrapedNews, ScraperSource, ScrapeJob
from scraper.parser_registry import ParserRegistry

logger = logging.getLogger(__name__)


@dataclass
class ScrapeResult:
    """Result of a scraping operation."""

    source_slug: str
    pages_scraped: int
    news_found: int
    news_created: int
    news_updated: int
    news_skipped: int
    errors: List[str]

    @property
    def success(self) -> bool:
        return len(self.errors) == 0


class ScraperService:
    """
    Main service for scraping news from configured sources.

    Usage:
        service = ScraperService()
        result = service.scrape_source("cabrera-de-mar")
        # or
        results = service.scrape_all_active()
    """

    # Default delay between requests (seconds)
    DEFAULT_DELAY = 1.0

    # Request timeout (seconds)
    REQUEST_TIMEOUT = 30

    # User-Agent header
    USER_AGENT = (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 "
        "GaudeixScraper/1.0"
    )

    def __init__(self, delay: Optional[float] = None):
        self.delay = delay if delay is not None else self.DEFAULT_DELAY
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": self.USER_AGENT})

    def scrape_source(
        self,
        source_slug: str,
        max_pages: Optional[int] = None,
        skip_existing: bool = True,
        job_id: Optional[int] = None,
    ) -> ScrapeResult:
        """
        Scrape news from a single source.

        Args:
            source_slug: Slug of the source to scrape
            max_pages: Maximum number of list pages to scrape
            skip_existing: Skip news that already exist in database
            job_id: ID of ScrapeJob to track progress

        Returns:
            ScrapeResult with statistics
        """
        errors = []
        news_found = 0
        news_created = 0
        news_updated = 0
        news_skipped = 0
        pages_scraped = 0

        job = None
        if job_id:
            try:
                job = ScrapeJob.objects.get(id=job_id)
                job.status = ScrapeJob.Status.RUNNING
                job.save(update_fields=["status"])
            except ScrapeJob.DoesNotExist:
                logger.warning(f"ScrapeJob {job_id} not found")

        # Helper to update job
        def update_job(progress=None, check_cancel=True):
            if job:
                # Check for cancellation
                if check_cancel:
                    job.refresh_from_db()
                    if job.status in [
                        ScrapeJob.Status.CANCELLING,
                        ScrapeJob.Status.CANCELLED,
                    ]:
                        raise InterruptedError("Scrape job cancelled by user")

                if progress is not None:
                    job.progress = progress
                job.pages_scraped = pages_scraped
                job.news_found = news_found
                job.news_created = news_created
                job.news_updated = news_updated
                job.news_skipped = news_skipped
                job.save(
                    update_fields=[
                        "progress",
                        "pages_scraped",
                        "news_found",
                        "news_created",
                        "news_updated",
                        "news_skipped",
                    ]
                )

        # Get or create source configuration
        try:
            source = ScraperSource.objects.get(slug=source_slug)
        except ScraperSource.DoesNotExist:
            # Auto-create from parser registry
            if not ParserRegistry.has(source_slug):
                error_msg = f"No parser found for '{source_slug}'"
                if job:
                    job.status = ScrapeJob.Status.FAILED
                    job.error_message = error_msg
                    job.completed_at = timezone.now()
                    job.save()
                return ScrapeResult(
                    source_slug=source_slug,
                    pages_scraped=0,
                    news_found=0,
                    news_created=0,
                    news_updated=0,
                    news_skipped=0,
                    errors=[error_msg],
                )

            parser_class = ParserRegistry.get_class(source_slug)
            source = ScraperSource.objects.create(
                name=parser_class.name,
                slug=parser_class.slug,
                base_url=parser_class.base_url,
            )
            logger.info(f"Created source configuration for {source_slug}")

        # Get parser instance
        try:
            parser = ParserRegistry.get(source_slug, config=source.config)
        except KeyError as e:
            if job:
                job.status = ScrapeJob.Status.FAILED
                job.error_message = str(e)
                job.completed_at = timezone.now()
                job.save()
            return ScrapeResult(
                source_slug=source_slug,
                pages_scraped=0,
                news_found=0,
                news_created=0,
                news_updated=0,
                news_skipped=0,
                errors=[str(e)],
            )

        # Get existing source_ids to skip
        existing_ids: Set[str] = set()
        if skip_existing:
            existing_ids = set(
                ScrapedNews.objects.filter(source=source).values_list(
                    "source_id", flat=True
                )
            )

        # Phase 1: Collect news URLs from listing pages
        try:
            update_job(progress=10)
        except InterruptedError:
            if job:
                job.status = ScrapeJob.Status.CANCELLED
                job.completed_at = timezone.now()
                job.save(update_fields=["status", "completed_at"])
            return ScrapeResult(
                source_slug=source_slug,
                pages_scraped=0,
                news_found=0,
                news_created=0,
                news_updated=0,
                news_skipped=0,
                errors=["Job cancelled by user"],
            )

        list_urls = parser.get_list_page_urls(max_pages=max_pages)
        all_news_urls = []

        total_list_pages = len(list_urls)

        for i, list_url in enumerate(list_urls):
            try:
                logger.info(f"Fetching list page: {list_url}")
                response = self.session.get(list_url, timeout=self.REQUEST_TIMEOUT)
                response.raise_for_status()

                items = parser.parse_list_page(response.text, list_url)
                pages_scraped += 1

                # Update progress: 10% -> 40% reserved for list pages
                list_progress = 10 + int((i + 1) / total_list_pages * 30)
                update_job(progress=list_progress)

                for item in items:
                    source_id = parser.extract_slug_from_url(item.url)
                    if skip_existing and source_id in existing_ids:
                        news_skipped += 1
                        continue
                    all_news_urls.append((item.url, source_id))

                time.sleep(self.delay)

            except requests.RequestException as e:
                logger.error(f"Error fetching {list_url}: {e}")
                errors.append(f"List page error: {list_url} - {e}")
            except InterruptedError:
                if job:
                    job.status = ScrapeJob.Status.CANCELLED
                    job.completed_at = timezone.now()
                    job.save(update_fields=["status", "completed_at"])
                return ScrapeResult(
                    source_slug=source_slug,
                    pages_scraped=pages_scraped,
                    news_found=news_found,
                    news_created=news_created,
                    news_updated=news_updated,
                    news_skipped=news_skipped,
                    errors=["Job cancelled by user"],
                )

        news_found = len(all_news_urls) + news_skipped
        update_job()

        # Phase 2: Fetch and parse detail pages
        total_news = len(all_news_urls)

        for i, (detail_url, source_id) in enumerate(all_news_urls):
            try:
                logger.info(f"Fetching detail: {detail_url}")
                response = self.session.get(detail_url, timeout=self.REQUEST_TIMEOUT)
                response.raise_for_status()

                data = parser.parse_detail_page(response.text, detail_url)

                # Save to database
                scraped_news, created = ScrapedNews.objects.update_or_create(
                    source=source,
                    external_id=data.source_id,
                    defaults={
                        "source_url": data.source_url,
                        "title": data.title,
                        "summary": data.summary,
                        "body": data.body,
                        "published_at": data.published_at,
                        "featured_image_url": data.featured_image_url,
                        "gallery_image_urls": data.gallery_image_urls,
                        "raw_html": data.raw_html,
                        "raw_metadata": data.raw_metadata,
                    },
                )

                if created:
                    news_created += 1
                    logger.info(f"Created: {data.title[:50]}")
                else:
                    news_updated += 1
                    logger.info(f"Updated: {data.title[:50]}")

                # Update progress: 40% -> 100% reserved for detail pages
                detail_progress = (
                    40 + int((i + 1) / total_news * 60) if total_news > 0 else 100
                )
                update_job(progress=detail_progress)

                time.sleep(self.delay)

            except requests.RequestException as e:
                logger.error(f"Error fetching {detail_url}: {e}")
                errors.append(f"Detail page error: {detail_url} - {e}")
            except InterruptedError:
                if job:
                    job.status = ScrapeJob.Status.CANCELLED
                    job.completed_at = timezone.now()
                    job.save(update_fields=["status", "completed_at"])
                return ScrapeResult(
                    source_slug=source_slug,
                    pages_scraped=pages_scraped,
                    news_found=news_found,
                    news_created=news_created,
                    news_updated=news_updated,
                    news_skipped=news_skipped,
                    errors=["Job cancelled by user"],
                )
            except Exception as e:
                logger.exception(f"Error parsing {detail_url}: {e}")
                errors.append(f"Parse error: {detail_url} - {e}")

        # Update last scraped timestamp
        source.last_scraped_at = timezone.now()
        source.save(update_fields=["last_scraped_at"])

        if job:
            job.refresh_from_db()
            if job.status in [ScrapeJob.Status.CANCELLING, ScrapeJob.Status.CANCELLED]:
                job.status = ScrapeJob.Status.CANCELLED
                job.completed_at = timezone.now()
                job.save(update_fields=["status", "completed_at"])
                return ScrapeResult(
                    source_slug=source_slug,
                    pages_scraped=pages_scraped,
                    news_found=news_found,
                    news_created=news_created,
                    news_updated=news_updated,
                    news_skipped=news_skipped,
                    errors=["Job cancelled by user"],
                )

            # Final stats update (do not refresh/cancel-check to avoid overwriting status)
            update_job(check_cancel=False)

            if errors:
                job.error_message = "\n".join(errors)
                # If NO news found and there are errors, mark as FAILED
                if news_found == 0:
                    job.status = ScrapeJob.Status.FAILED
                else:
                    # Partial success
                    job.status = ScrapeJob.Status.COMPLETED
            else:
                job.status = ScrapeJob.Status.COMPLETED
                job.progress = 100

            job.completed_at = timezone.now()
            job.save(
                update_fields=["status", "progress", "error_message", "completed_at"]
            )

        return ScrapeResult(
            source_slug=source_slug,
            pages_scraped=pages_scraped,
            news_found=news_found,
            news_created=news_created,
            news_updated=news_updated,
            news_skipped=news_skipped,
            errors=errors,
        )

    def scrape_all_active(
        self,
        max_pages: Optional[int] = None,
        skip_existing: bool = True,
    ) -> List[ScrapeResult]:
        """
        Scrape all active sources.

        Returns:
            List of ScrapeResult for each source
        """
        sources = ScraperSource.objects.filter(is_active=True)
        results = []

        for source in sources:
            logger.info(f"Starting scrape for {source.name}")
            result = self.scrape_source(
                source.slug,
                max_pages=max_pages,
                skip_existing=skip_existing,
            )
            results.append(result)

        return results
