"""Production settings for gaudeix_backend."""

from __future__ import annotations

from .base import *  # noqa: F401,F403

DEBUG = False

DATABASES = {
    "default": env.db("DATABASE_URL"),
}

if DATABASES["default"]["ENGINE"] != "django.db.backends.postgresql":
    raise ValueError("Production configuration requires a PostgreSQL DATABASE_URL")
