"""Base Django settings for the gaudeix_backend project."""

from __future__ import annotations

from pathlib import Path

import environ

BASE_DIR = Path(__file__).resolve().parent.parent.parent

env = environ.Env(
    DJANGO_SECRET_KEY=(str, ""),
    ENVIRONMENT=(str, "local"),
    DEBUG=(bool, False),
    ALLOWED_HOSTS=(list, []),
    DJANGO_ALLOWED_CORS_ORIGINS=(list, []),
    DJANGO_CSRF_TRUSTED_ORIGINS=(list, []),
    DB_ENGINE=(str, "django.db.backends.postgresql"),
    DB_NAME=(str, "postgres"),
    DB_USER=(str, "postgres"),
    DB_PASSWORD=(str, ""),
    DB_HOST=(str, "localhost"),
    DB_PORT=(str, "5432"),
    # LLM Translation API Keys
    LLM_OPENROUTER_API_KEY=(str, ""),
    LLM_GEMINI_API_KEY=(str, ""),
    FCM_CREDENTIALS_FILE=(str, ""),
    ASSET_LEGACY_DEPRECATION_RELEASE_WINDOW=(int, 2),
    REDIS_URL=(str, "redis://localhost:6379/0"),
    CELERY_BROKER_URL=(str, ""),
    CELERY_RESULT_BACKEND=(str, ""),
    CELERY_TASK_ALWAYS_EAGER=(bool, False),
    CELERY_TASK_EAGER_PROPAGATES=(bool, True),
    SERVE_MEDIA_FILES=(bool, False),
    SERVE_STATIC_FILES=(bool, False),
)

ENV_FILE = BASE_DIR / ".env"
if ENV_FILE.exists():
    environ.Env.read_env(str(ENV_FILE))

SECRET_KEY = env("DJANGO_SECRET_KEY")
ENVIRONMENT = env("ENVIRONMENT")
DEBUG = env("DEBUG")
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=[])

database_url = env("DATABASE_URL", default="")
if database_url:
    DATABASES = {
        "default": env.db("DATABASE_URL"),
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": env("DB_ENGINE"),
            "NAME": env("DB_NAME"),
            "USER": env("DB_USER"),
            "PASSWORD": env("DB_PASSWORD"),
            "HOST": env("DB_HOST"),
            "PORT": env("DB_PORT"),
        }
    }

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "core.apps.CoreConfig",
    "users",
    "rest_framework",
    "rest_framework.authtoken",
    "parler",
    "social",
    "events",
    "gamification.apps.GamificationConfig",
    "notifications.apps.NotificationsConfig",
    "places",
    "automations.apps.AutomationsConfig",
    "beach_safety.apps.BeachSafetyConfig",
    "drf_spectacular",
    "dj_rest_auth",
    "django.contrib.sites",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "dj_rest_auth.registration",
    "simple_history",
    "solo",
    "media_files.apps.MediaFilesConfig",
    "llm_translations",
    "static_pages.apps.StaticPagesConfig",
    "site_settings.apps.SiteSettingsConfig",
    "news",
    "routes.apps.RoutesConfig",
    "festes.apps.FestesConfig",
    "scraper.apps.ScraperConfig",
]

SITE_ID = 1

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
    "simple_history.middleware.HistoryRequestMiddleware",
]

ROOT_URLCONF = "gaudeix_backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [str(BASE_DIR / "templates")],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "gaudeix_backend.wsgi.application"
ASGI_APPLICATION = "gaudeix_backend.asgi.application"

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

from django.utils.translation import gettext_lazy as _
import django.conf.global_settings as global_settings

LANGUAGE_CODE = env("DJANGO_LANGUAGE_CODE", default="ca")

# Get list of languages from env, default to ca, es, en, fr
_env_languages = env.list("DJANGO_LANGUAGES", default=["ca", "es", "en", "fr"])

# Filter global languages to match env list, preserving order is tricky with dict,
# but we can iterate over env list and find name in global_settings.
_all_languages_dict = dict(global_settings.LANGUAGES)
LANGUAGES = [(code, _all_languages_dict.get(code, code)) for code in _env_languages]

PARLER_LANGUAGES = {
    None: tuple({"code": code} for code in _env_languages),
    "default": {
        "fallbacks": [LANGUAGE_CODE],
        "hide_untranslated": False,
    },
}
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "dj_rest_auth.jwt_auth.JWTCookieAuthentication",
    ),
}

from datetime import timedelta

REST_AUTH = {
    "USE_JWT": True,
    "JWT_AUTH_COOKIE": "gaudeix-auth",
    "JWT_AUTH_REFRESH_COOKIE": "gaudeix-refresh-token",
    "LOGIN_METHODS": {"email", "username"},
}

# django-allauth signup fields (replaces deprecated *_REQUIRED settings).
ACCOUNT_SIGNUP_FIELDS = ["username*", "email", "password1*", "password2*"]

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "AUTH_HEADER_TYPES": ("Bearer",),
}

AUTH_USER_MODEL = "users.User"

SPECTACULAR_SETTINGS = {
    "TITLE": "Gaudeix Codex API",
    "DESCRIPTION": "API for Gaudeix Codex project",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}
CORS_ALLOWED_ORIGINS = env.list(
    "DJANGO_ALLOWED_CORS_ORIGINS",
    default=[
        "http://localhost:4173",
        "http://localhost:4174",
        "http://127.0.0.1:4173",
        "http://127.0.0.1:4174",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
)
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = env.list(
    "DJANGO_CSRF_TRUSTED_ORIGINS",
    default=[
        "http://localhost:4173",
        "http://localhost:4174",
        "http://127.0.0.1:4173",
        "http://127.0.0.1:4174",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
)

# ==============================================================================
# LLM TRANSLATION SETTINGS
# ==============================================================================
LLM_OPENROUTER_API_KEY = env("LLM_OPENROUTER_API_KEY")
LLM_GEMINI_API_KEY = env("LLM_GEMINI_API_KEY")

# ==============================================================================
# EXTERNAL SERVICES
# ==============================================================================
FCM_CREDENTIALS_FILE = env("FCM_CREDENTIALS_FILE")


ASSET_LEGACY_DEPRECATION_RELEASE_WINDOW = env("ASSET_LEGACY_DEPRECATION_RELEASE_WINDOW")
REDIS_URL = env("REDIS_URL")
CELERY_BROKER_URL = env("CELERY_BROKER_URL") or REDIS_URL
CELERY_RESULT_BACKEND = env("CELERY_RESULT_BACKEND") or REDIS_URL
CELERY_TASK_ALWAYS_EAGER = env("CELERY_TASK_ALWAYS_EAGER")
CELERY_TASK_EAGER_PROPAGATES = env("CELERY_TASK_EAGER_PROPAGATES")
SERVE_MEDIA_FILES = env("SERVE_MEDIA_FILES")
SERVE_STATIC_FILES = env("SERVE_STATIC_FILES")
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = TIME_ZONE
