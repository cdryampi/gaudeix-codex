"""Local development settings for gaudeix_backend."""

from __future__ import annotations

from .base import *  # noqa: F401,F403

DEBUG = True

DATABASES = {
    "default": env.db(
        "DATABASE_URL",
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
    )
}

DATABASES["default"].setdefault("TEST", {})
DATABASES["default"]["TEST"].setdefault("NAME", ":memory:")
