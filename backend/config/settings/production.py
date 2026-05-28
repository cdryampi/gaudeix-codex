"""Production settings for gaudeix_backend."""

from __future__ import annotations

from .base import *  # noqa: F401,F403

DEBUG = False
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

DATABASES = {
    "default": env.db("DATABASE_URL"),
}

if DATABASES["default"]["ENGINE"] != "django.db.backends.postgresql":
    raise ValueError("Production configuration requires a PostgreSQL DATABASE_URL")
