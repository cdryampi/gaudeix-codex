from __future__ import annotations

import os

from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError

from core.seed_utils import GLOBAL_SEED_ENV_VAR


SEED_PIPELINE: list[tuple[str, str, str]] = [
    ("users", "seed_users", "Seeding users..."),
    ("media_files", "seed_media_files", "Seeding media files..."),
    ("static_pages", "seed_static_pages", "Seeding static pages..."),
    ("site_settings", "seed_site_settings", "Seeding site settings..."),
    ("menu_items", "seed_menu_items", "Seeding header menu items..."),
    ("social", "seed_social", "Seeding social content..."),
    ("tags", "seed_tags", "Seeding tags..."),
    ("places_category", "seed_places_category", "Seeding places categories..."),
    ("places", "seed_places", "Seeding places..."),
    ("events_category", "seed_events_category", "Seeding events category..."),
    ("events", "seed_events", "Seeding events..."),
    ("gamification", "seed_gamification", "Seeding gamification..."),
]


class Command(BaseCommand):
    help = "Seed database demo data using a reproducible and observable orchestration flow."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Flush DB and run migrations before seeding (DANGEROUS).",
        )
        parser.add_argument(
            "--hard-reset",
            action="store_true",
            help="Deprecated alias of --reset.",
        )
        parser.add_argument(
            "--noinput",
            action="store_true",
            help="Do not prompt for input (used with --reset).",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show planned operations but do not execute them.",
        )
        parser.add_argument(
            "--seed",
            type=int,
            help="Deterministic seed used by commands that support randomness.",
        )
        parser.add_argument(
            "--only",
            type=str,
            help="Comma-separated domains from seed_all pipeline (e.g. users,events).",
        )

    def handle(self, *args, **options):
        reset: bool = options["reset"] or options["hard_reset"]
        hard_reset_alias: bool = options["hard_reset"]
        noinput: bool = options["noinput"]
        dry_run: bool = options["dry_run"]
        seed: int | None = options.get("seed")

        if hard_reset_alias:
            self.stdout.write(
                self.style.WARNING("`--hard-reset` is deprecated. Use `--reset` instead.")
            )

        selected_steps = self._resolve_steps(options.get("only"))

        if seed is not None:
            os.environ[GLOBAL_SEED_ENV_VAR] = str(seed)
            self.stdout.write(self.style.NOTICE(f"Using deterministic seed={seed}."))

        if dry_run:
            self.stdout.write(self.style.WARNING("Dry-run mode enabled. No writes will occur."))

        if reset:
            self.stdout.write(
                self.style.WARNING(
                    "Reset requested: flushing database and re-applying migrations."
                )
            )
            self._run_command("flush", dry_run=dry_run, interactive=not noinput)
            self._run_command("migrate", dry_run=dry_run, interactive=not noinput)

        for domain, command_name, message in selected_steps:
            self.stdout.write(self.style.MIGRATE_HEADING(f"[{domain}] {message}"))
            self._run_command(command_name, dry_run=dry_run)

        if seed is not None:
            os.environ.pop(GLOBAL_SEED_ENV_VAR, None)

        self.stdout.write(self.style.SUCCESS("Seed process completed."))

    def _resolve_steps(self, only: str | None) -> list[tuple[str, str, str]]:
        if not only:
            return SEED_PIPELINE

        requested = [item.strip() for item in only.split(",") if item.strip()]
        if not requested:
            return SEED_PIPELINE

        available = {domain for domain, _, _ in SEED_PIPELINE}
        invalid = sorted(set(requested) - available)
        if invalid:
            raise CommandError(
                f"Unknown values in --only: {', '.join(invalid)}. "
                f"Allowed: {', '.join(sorted(available))}"
            )

        requested_set = set(requested)
        return [step for step in SEED_PIPELINE if step[0] in requested_set]

    def _run_command(self, command_name: str, *, dry_run: bool, **kwargs):
        if dry_run:
            self.stdout.write(self.style.NOTICE(f"[dry-run] would run `{command_name}`"))
            return
        try:
            call_command(command_name, **kwargs)
        except CommandError as exc:
            raise CommandError(f"seed_all failed running `{command_name}`: {exc}") from exc
