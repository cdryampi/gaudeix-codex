from __future__ import annotations

from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Seed the database with demo data for all apps (optionally hard reset first)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--hard-reset",
            action="store_true",
            help="Flush DB and run migrations before seeding (DANGEROUS).",
        )
        parser.add_argument(
            "--noinput",
            action="store_true",
            help="Do not prompt for input (used with --hard-reset).",
        )

    def handle(self, *args, **options):
        hard_reset: bool = options["hard_reset"]
        noinput: bool = options["noinput"]

        if hard_reset:
            self.stdout.write(self.style.WARNING("Hard reset requested: flushing database and re-applying migrations."))
            call_command("flush", interactive=not noinput)
            call_command("migrate", interactive=not noinput)

        seed_commands: list[tuple[str, str]] = [
            ("seed_users", "Seeding users..."),
            ("seed_media_files", "Seeding media files..."),
            ("seed_static_pages", "Seeding static pages..."),
            ("seed_site_settings", "Seeding site settings..."),
            ("seed_social", "Seeding social content..."),
            ("seed_places_category", "Seeding places categories..."),
            ("seed_places", "Seeding places..."),
            ("seed_events_category", "Seeding events category..."),
            ("seed_events", "Seeding events..."),
        ]

        for command_name, message in seed_commands:
            self.stdout.write(self.style.MIGRATE_HEADING(message))
            try:
                call_command(command_name)
            except CommandError as exc:
                raise CommandError(f"seed_all failed running `{command_name}`: {exc}") from exc

        self.stdout.write(self.style.SUCCESS("Seed process completed."))
