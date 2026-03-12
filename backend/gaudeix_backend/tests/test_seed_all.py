from __future__ import annotations

import os
from unittest.mock import call, patch

import pytest
from django.core.management import call_command
from django.core.management.base import CommandError

from automations.models import AutomationJob
from core.models import Category
from events.models import Event
from festes.models import Festa
from media_files.models import DocumentFile, ImageFile
from places.models import Beach, Place
from routes.models import Route
from site_settings.models import SiteSettings
from site_settings.models import FooterBadge
from static_pages.models import StaticPage
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


def test_seed_all_bootstrap_keeps_public_media_links_stable(settings, tmp_path, transactional_db, client):
    settings.MEDIA_ROOT = tmp_path / "media"
    settings.MEDIA_ROOT.mkdir(parents=True, exist_ok=True)

    call_command("seed_all", verbosity=0)

    categories_resp = client.get("/api/v1/categories/")
    assert categories_resp.status_code == 200
    assert len(categories_resp.json()) > 0
    assert any(item.get("featured_media") for item in categories_resp.json())

    places_resp = client.get("/api/v1/places/?is_published=true&limit=100")
    assert places_resp.status_code == 200
    places_payload = places_resp.json()
    assert len(places_payload) > 0
    assert any(item.get("featured_media") for item in places_payload)

    events_resp = client.get("/api/v1/events/?is_published=true&limit=10&upcoming=true")
    assert events_resp.status_code == 200
    events_payload = events_resp.json()
    assert len(events_payload) > 0
    assert any(item.get("featured_media") for item in events_payload)

    site_settings = SiteSettings.get_solo()
    page = StaticPage.objects.filter(featured_media__isnull=False, attachment__isnull=False).first()
    badge = FooterBadge.objects.filter(image__isnull=False).first()
    place = Place.objects.filter(featured_media__isnull=False).first()
    beach = Beach.objects.filter(featured_media__isnull=False).first()
    event = Event.objects.filter(featured_media__isnull=False).first()
    route = Route.objects.filter(featured_media__isnull=False).first()
    festa = Festa.objects.filter(featured_media__isnull=False, program_pdf__isnull=False).first()

    assert site_settings.logo_id is not None
    assert page is not None
    assert badge is not None
    assert place is not None
    assert beach is not None
    assert event is not None
    assert route is not None
    assert festa is not None

    image_count = ImageFile.objects.count()
    document_count = DocumentFile.objects.count()
    stable_ids = {
        "site_logo": site_settings.logo_id,
        "site_favicon": site_settings.favicon_id,
        "page_featured_media": page.featured_media_id,
        "page_attachment": page.attachment_id,
        "badge_image": badge.image_id,
        "place_featured_media": place.featured_media_id,
        "beach_featured_media": beach.featured_media_id,
        "event_featured_media": event.featured_media_id,
        "route_featured_media": route.featured_media_id,
        "festa_featured_media": festa.featured_media_id,
        "festa_program_pdf": festa.program_pdf_id,
    }
    stable_keys = {
        "page_pk": page.pk,
        "badge_title": badge.title,
        "place_slug": place.slug,
        "beach_slug": beach.slug,
        "event_slug": event.slug,
        "route_slug": route.slug,
        "festa_slug": festa.slug,
    }

    call_command("seed_all", verbosity=0)
    call_command("seed_media_files", verbosity=0)

    site_settings.refresh_from_db()
    page = StaticPage.objects.get(pk=stable_keys["page_pk"])
    badge = FooterBadge.objects.get(title=stable_keys["badge_title"])
    place = Place.objects.get(slug=stable_keys["place_slug"])
    beach = Beach.objects.get(slug=stable_keys["beach_slug"])
    event = Event.objects.get(slug=stable_keys["event_slug"])
    route = Route.objects.get(slug=stable_keys["route_slug"])
    festa = Festa.objects.get(slug=stable_keys["festa_slug"])

    assert ImageFile.objects.count() == image_count
    assert DocumentFile.objects.count() == document_count
    assert site_settings.logo_id == stable_ids["site_logo"]
    assert site_settings.favicon_id == stable_ids["site_favicon"]
    assert page.featured_media_id == stable_ids["page_featured_media"]
    assert page.attachment_id == stable_ids["page_attachment"]
    assert badge.image_id == stable_ids["badge_image"]
    assert place.featured_media_id == stable_ids["place_featured_media"]
    assert beach.featured_media_id == stable_ids["beach_featured_media"]
    assert event.featured_media_id == stable_ids["event_featured_media"]
    assert route.featured_media_id == stable_ids["route_featured_media"]
    assert festa.featured_media_id == stable_ids["festa_featured_media"]
    assert festa.program_pdf_id == stable_ids["festa_program_pdf"]
