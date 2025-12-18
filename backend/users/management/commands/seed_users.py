"""
Management command to seed users from JSON + environment variables.

Idempotent: safe to run multiple times.
"""

from __future__ import annotations

import json
from pathlib import Path

import environ
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

User = get_user_model()


class Command(BaseCommand):
    """
    Seeds the database with admin and system users from environment variables.
    """
    help = "Seeds users from JSON + environment variables."

    def handle(self, *args, **options):
        env = environ.Env()
        seed_users = self._load_seed_users()
        self.stdout.write("Seeding users...")

        created = 0
        updated = 0

        with transaction.atomic():
            for entry in seed_users:
                username = self._resolve_env(
                    env,
                    entry.get("username_env"),
                    entry.get("default_username", ""),
                )
                password = self._resolve_env(
                    env,
                    entry.get("password_env"),
                    entry.get("default_password", ""),
                )
                defaults = entry.get("defaults", {}) or {}

                user, was_created = User.objects.get_or_create(
                    username=username,
                    defaults=defaults,
                )

                changed = False
                for field, value in defaults.items():
                    if getattr(user, field) != value:
                        setattr(user, field, value)
                        changed = True

                if password and (was_created or not user.check_password(password)):
                    user.set_password(password)
                    changed = True

                if changed:
                    user.save()

                if was_created:
                    created += 1
                    self.stdout.write(self.style.SUCCESS(f"Created user: {username}"))
                elif changed:
                    updated += 1
                    self.stdout.write(self.style.WARNING(f"Updated user: {username}"))

        self.stdout.write(
            self.style.SUCCESS(f"Successfully seeded users. created={created}, updated={updated}")
        )

    def _resolve_env(self, env: environ.Env, env_key: str | None, default: str) -> str:
        if not env_key:
            return default
        return env(env_key, default=default)

    def _load_seed_users(self) -> list[dict]:
        seed_path = Path(__file__).resolve().parents[2] / "seed" / "users.json"
        try:
            data = json.loads(seed_path.read_text(encoding="utf-8"))
        except FileNotFoundError as exc:
            raise CommandError(f"Seed file not found: {seed_path}") from exc
        except json.JSONDecodeError as exc:
            raise CommandError(f"Invalid JSON in {seed_path}: {exc}") from exc

        users = data.get("users")
        if not isinstance(users, list):
            raise CommandError(f"Expected a 'users' array in {seed_path}")
        return users
