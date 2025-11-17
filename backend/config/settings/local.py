"""Local development settings for gaudeix_backend."""

from __future__ import annotations

from .base import *  # noqa: F401,F403

DEBUG = True

default_engine = DATABASES["default"].get("ENGINE", "")
DATABASES["default"].setdefault("TEST", {})
if "sqlite" in default_engine:
    DATABASES["default"]["TEST"].setdefault("NAME", ":memory:")
