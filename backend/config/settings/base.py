"""Base Django settings for the gaudeix_backend project."""

from __future__ import annotations

from pathlib import Path

import environ
import warnings

# Suppress specific deprecation warnings from dj-rest-auth
warnings.filterwarnings('ignore', message='.*USERNAME_REQUIRED is deprecated.*')
warnings.filterwarnings('ignore', message='.*EMAIL_REQUIRED is deprecated.*')

BASE_DIR = Path(__file__).resolve().parent.parent.parent

env = environ.Env(
    DJANGO_SECRET_KEY=(str, ""),
    ENVIRONMENT=(str, "local"),
    DEBUG=(bool, False),
    ALLOWED_HOSTS=(list, []),
    DB_ENGINE=(str, "django.db.backends.postgresql"),
    DB_NAME=(str, "postgres"),
    DB_USER=(str, "postgres"),
    DB_PASSWORD=(str, ""),
    DB_HOST=(str, "localhost"),
    DB_PORT=(str, "5432"),
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
    "users",
    "rest_framework",
    "rest_framework.authtoken",
    "parler",
    "social",
    "drf_spectacular",
    "dj_rest_auth",
    "django.contrib.sites",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "dj_rest_auth.registration",
    "simple_history",
    "media_files.apps.MediaFilesConfig",
]

SITE_ID = 1

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
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
        "DIRS": [],
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
LANGUAGES = [
    (code, _all_languages_dict.get(code, code))
    for code in _env_languages
]

PARLER_LANGUAGES = {
    None: tuple({'code': code} for code in _env_languages),
    'default': {
        'fallbacks': [LANGUAGE_CODE],
        'hide_untranslated': False,
    }
}
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'dj_rest_auth.jwt_auth.JWTCookieAuthentication',
    ),
}

from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}

REST_AUTH = {
    'USE_JWT': True,
    'JWT_AUTH_COOKIE': 'gaudeix-auth',
    'JWT_AUTH_REFRESH_COOKIE': 'gaudeix-refresh-token',
}

AUTH_USER_MODEL = "users.User"

SPECTACULAR_SETTINGS = {
    'TITLE': 'Gaudeix Codex API',
    'DESCRIPTION': 'API for Gaudeix Codex project',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5174",
]
CORS_ALLOW_CREDENTIALS = True

