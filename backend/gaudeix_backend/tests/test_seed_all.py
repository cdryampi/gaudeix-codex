from __future__ import annotations

import pytest
from django.core.management import call_command

from core.models import Category
from site_settings.models import SiteSettings
from users.models import User

pytestmark = pytest.mark.django_db


def test_seed_all_creates_expected_basics(settings, tmp_path, transactional_db):
    settings.MEDIA_ROOT = tmp_path / "media"
    settings.MEDIA_ROOT.mkdir(parents=True, exist_ok=True)

    call_command("seed_all", verbosity=0)

    assert User.objects.count() >= 2
    assert Category.objects.filter(slug__in={"places", "events"}).count() >= 1
    assert SiteSettings.get_solo().site_name


@pytest.mark.slow
def test_seed_all_hard_reset_is_idempotent(settings, tmp_path, transactional_db):
    settings.MEDIA_ROOT = tmp_path / "media"
    settings.MEDIA_ROOT.mkdir(parents=True, exist_ok=True)

    User.objects.create_user(username="temp", password="pass123")
    assert User.objects.filter(username="temp").exists()

    call_command("seed_all", "--hard-reset", "--noinput", verbosity=0)

    assert not User.objects.filter(username="temp").exists()
    assert User.objects.count() >= 2
