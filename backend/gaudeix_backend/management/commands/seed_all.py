from __future__ import annotations

from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Seed the database with demo data for all apps."

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("Seeding media files..."))
        call_command("seed_media_files")
        self.stdout.write(self.style.SUCCESS("Seed process completed."))
