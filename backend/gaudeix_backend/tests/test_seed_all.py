from __future__ import annotations

import os
from unittest.mock import call, patch

import pytest
from django.core.management import call_command
from django.core.management.base import CommandError

from automations.models import AutomationJob
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
    assert (
        AutomationJob.objects.filter(
            template_slug__in={
                "weather.refresh_municipality_forecast",
                "beach_safety.evaluate_red_flag_proposal",
            }
        ).count()
        == 2
    )


@pytest.mark.slow
def test_seed_all_hard_reset_is_idempotent(settings, tmp_path, transactional_db):
    settings.MEDIA_ROOT = tmp_path / "media"
    settings.MEDIA_ROOT.mkdir(parents=True, exist_ok=True)

    User.objects.create_user(username="temp", password="pass123")
    assert User.objects.filter(username="temp").exists()

    call_command("seed_all", "--hard-reset", "--noinput", verbosity=0)

    assert not User.objects.filter(username="temp").exists()
    assert User.objects.count() >= 2


def test_seed_all_only_runs_selected_domains():
    with patch("core.management.commands.seed_all.call_command") as mock_call:
        call_command("seed_all", "--only", "users,events", verbosity=0)

    assert mock_call.call_args_list == [
        call("seed_users"),
        call("seed_events"),
    ]


def test_seed_all_dry_run_does_not_execute_subcommands():
    with patch("core.management.commands.seed_all.call_command") as mock_call:
        call_command("seed_all", "--dry-run", "--only", "users", verbosity=0)

    mock_call.assert_not_called()


def test_seed_all_rejects_unknown_only_value():
    with pytest.raises(CommandError):
        call_command("seed_all", "--only", "unknown", verbosity=0)


def test_seed_all_seed_sets_and_cleans_env_var():
    with patch("core.management.commands.seed_all.call_command") as mock_call:
        assert os.getenv("GAUDEIX_SEED") is None
        call_command("seed_all", "--seed", "123", "--only", "users", verbosity=0)
        assert mock_call.call_args_list == [call("seed_users")]
        assert os.getenv("GAUDEIX_SEED") is None
