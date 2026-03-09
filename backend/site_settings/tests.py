from __future__ import annotations

import pytest
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from core.models import Category
from media_files.models import ImageFile
from site_settings.models import (
    FooterBadge,
    FooterLink,
    FooterSettings,
    MenuItem,
    SiteSettings,
)
from static_pages.models import StaticPage

User = get_user_model()

pytestmark = pytest.mark.django_db


@pytest.fixture
def auth_client():
    user = User.objects.create_user(username="settings", password="pass123")
    client = APIClient()
    client.force_authenticate(user=user)
    return client


def make_static_page(template: str, slug: str, title: str) -> StaticPage:
    return StaticPage.objects.create(
        slug=slug,
        template=template,
        titulo=title,
        cuerpo=f"Contenido {title}",
    )


def test_get_site_settings_public():
    settings_obj = SiteSettings.get_solo()
    settings_obj.site_name = "Demo"
    settings_obj.save()

    client = APIClient()
    url = reverse("site-settings-list")
    resp = client.get(url)
    assert resp.status_code == status.HTTP_200_OK
    assert resp.data["site_name"] == "Demo"


def test_update_requires_auth(auth_client):
    url = reverse("site-settings-detail", kwargs={"pk": 1})
    resp = auth_client.patch(
        url,
        {
            "site_name": "Updated",
            "youtube_url": "https://youtu.be/demo",
            "video_enabled": False,
        },
        format="json",
    )
    assert resp.status_code == status.HTTP_200_OK
    settings_obj = SiteSettings.get_solo()
    assert settings_obj.site_name == "Updated"
    assert settings_obj.youtube_url == "https://youtu.be/demo"
    assert settings_obj.video_enabled is False


def test_update_unauthenticated_forbidden():
    client = APIClient()
    url = reverse("site-settings-list")
    resp = client.patch(url, {"site_name": "Hacker"}, format="json")
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED


def test_menu_items_public_list_filtered_by_location():
    settings_obj = SiteSettings.get_solo()
    cat = Category.objects.create(slug="routes", nombre="Rutes", taxonomy="routes")
    MenuItem.objects.create(
        settings=settings_obj,
        location="header",
        type="category",
        category=cat,
        order=1,
    )
    MenuItem.objects.create(
        settings=settings_obj,
        location="footer",
        type="custom",
        label="Footer link",
        url="https://example.com",
        order=1,
    )

    client = APIClient()
    url = reverse("menu-items-list")
    resp = client.get(url, {"location": "header"})
    assert resp.status_code == status.HTTP_200_OK
    assert len(resp.data) == 1
    assert resp.data[0]["type"] == "category"


def test_create_custom_menu_item_requires_auth_and_fields(auth_client):
    url = reverse("menu-items-list")
    resp = auth_client.post(
        url, {"type": "custom", "label": "", "url": ""}, format="json"
    )
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert "url" in resp.data or "label" in resp.data

    resp_ok = auth_client.post(
        url,
        {
            "location": "header",
            "type": "custom",
            "label": "Comprar",
            "url": "https://maresme.example/compres",
        },
        format="json",
    )
    assert resp_ok.status_code == status.HTTP_201_CREATED
    assert resp_ok.data["label"] == "Comprar"


def test_menu_item_max_depth_three_levels(auth_client):
    url = reverse("menu-items-list")
    root = auth_client.post(
        url,
        {
            "location": "header",
            "type": "custom",
            "label": "Root",
            "url": "https://example.com",
        },
        format="json",
    ).data
    child = auth_client.post(
        url,
        {
            "location": "header",
            "parent": root["id"],
            "type": "custom",
            "label": "Child",
            "url": "https://example.com/child",
        },
        format="json",
    ).data
    grandchild = auth_client.post(
        url,
        {
            "location": "header",
            "parent": child["id"],
            "type": "custom",
            "label": "Grandchild",
            "url": "https://example.com/grandchild",
        },
        format="json",
    )
    assert grandchild.status_code == status.HTTP_201_CREATED

    too_deep = auth_client.post(
        url,
        {
            "location": "header",
            "parent": grandchild.data["id"],
            "type": "custom",
            "label": "Too deep",
            "url": "https://example.com/deep",
        },
        format="json",
    )
    assert too_deep.status_code == status.HTTP_400_BAD_REQUEST


def test_footer_settings_public_list_creates_singleton():
    client = APIClient()
    resp = client.get(reverse("footer-settings-list"))
    assert resp.status_code == status.HTTP_200_OK
    assert FooterSettings.objects.count() == 1
    assert resp.data["show_social_links"] is True


def test_footer_settings_update_requires_auth(auth_client):
    url = reverse("footer-settings-detail", kwargs={"pk": 1})
    resp = auth_client.patch(
        url,
        {
            "eyebrow": "Portal oficial",
            "title": "Descubre Cabrera",
            "show_badges_block": False,
        },
        format="json",
    )
    assert resp.status_code == status.HTTP_200_OK

    footer_settings = FooterSettings.for_site_settings()
    assert footer_settings.eyebrow == "Portal oficial"
    assert footer_settings.title == "Descubre Cabrera"
    assert footer_settings.show_badges_block is False


def test_footer_link_crud_validation_and_section_filter(auth_client):
    category = Category.objects.create(
        slug="beaches", nombre="Playas", taxonomy="places"
    )
    static_page = make_static_page("contact", "contacto", "Contacto")
    url = reverse("footer-links-list")

    invalid_resp = auth_client.post(
        url,
        {"section": "explore", "type": "custom", "label": "", "url": ""},
        format="json",
    )
    assert invalid_resp.status_code == status.HTTP_400_BAD_REQUEST

    category_resp = auth_client.post(
        url,
        {
            "section": "explore",
            "type": "category",
            "category_id": category.id,
            "order": 1,
        },
        format="json",
    )
    assert category_resp.status_code == status.HTTP_201_CREATED

    static_page_resp = auth_client.post(
        url,
        {
            "section": "institutional",
            "type": "static_page",
            "static_page_id": static_page.id,
            "order": 2,
        },
        format="json",
    )
    assert static_page_resp.status_code == status.HTTP_201_CREATED

    custom_resp = auth_client.post(
        url,
        {
            "section": "institutional",
            "type": "custom",
            "label": "Sede electronica",
            "url": "/sede-electronica",
            "order": 3,
        },
        format="json",
    )
    assert custom_resp.status_code == status.HTTP_201_CREATED

    public_resp = APIClient().get(url, {"section": "institutional"})
    assert public_resp.status_code == status.HTTP_200_OK
    assert len(public_resp.data) == 2
    assert all(item["section"] == "institutional" for item in public_resp.data)


def test_footer_badge_public_payload_only_returns_active_and_image_optional():
    footer_settings = FooterSettings.for_site_settings()
    FooterBadge.objects.create(
        footer_settings=footer_settings,
        title="Compromiso sostenible",
        alt_text="Sello sostenible",
        url="https://example.com/sostenible",
        order=1,
        is_active=True,
    )
    FooterBadge.objects.create(
        footer_settings=footer_settings,
        title="Badge oculto",
        alt_text="Oculto",
        url="https://example.com/hidden",
        order=2,
        is_active=False,
    )

    resp = APIClient().get(reverse("footer-settings-public"))
    assert resp.status_code == status.HTTP_200_OK
    assert len(resp.data["badges"]) == 1
    assert resp.data["badges"][0]["title"] == "Compromiso sostenible"
    assert resp.data["badges"][0]["image"] is None


def test_footer_public_payload_includes_branding_contact_legal_and_grouped_links():
    settings_obj = SiteSettings.get_solo()
    settings_obj.site_name = "Gaudeix Cabrera"
    settings_obj.tagline = "Turismo mediterraneo"
    settings_obj.phone = "+34 937 501 006"
    settings_obj.contact_email = "turismo@cabrerademar.cat"
    settings_obj.address = "Placa Ajuntament, 1"
    settings_obj.schedule = "Lu-Vi 9:00-14:00"
    settings_obj.maps_base_url = "https://maps.example/cabrera"
    settings_obj.facebook_url = "https://facebook.example/cabrera"
    settings_obj.instagram_url = "https://instagram.example/cabrera"
    settings_obj.youtube_url = "https://youtube.example/cabrera"
    settings_obj.twitter_url = "https://twitter.example/cabrera"
    settings_obj.privacy_page = make_static_page("privacy", "privacidad", "Privacidad")
    settings_obj.cookies_page = make_static_page("cookies", "cookies", "Cookies")
    settings_obj.legal_page = make_static_page("legal_notice", "legal", "Aviso legal")
    settings_obj.inclusion_page = make_static_page("inclusion", "inclusion", "Inclusividad")
    settings_obj.save()

    footer_settings = FooterSettings.for_site_settings(settings_obj)
    footer_settings.eyebrow = "Portal oficial"
    footer_settings.title = "Footer premium"
    footer_settings.description = "Cierre institucional y turistico"
    footer_settings.save()

    FooterLink.objects.create(
        footer_settings=footer_settings,
        section="explore",
        type="custom",
        label="Agenda",
        url="/agenda",
        order=1,
        is_active=True,
    )
    FooterLink.objects.create(
        footer_settings=footer_settings,
        section="institutional",
        type="custom",
        label="Transparencia",
        url="https://example.com/transparencia",
        order=1,
        is_active=True,
    )
    FooterLink.objects.create(
        footer_settings=footer_settings,
        section="institutional",
        type="custom",
        label="Oculto",
        url="https://example.com/hidden",
        order=2,
        is_active=False,
    )
    FooterBadge.objects.create(
        footer_settings=footer_settings,
        title="Sello activo",
        alt_text="Sello activo",
        url="https://example.com/sello",
        order=1,
        is_active=True,
    )

    resp = APIClient().get(reverse("footer-settings-public"))
    assert resp.status_code == status.HTTP_200_OK
    assert resp.data["branding"]["site_name"] == "Gaudeix Cabrera"
    assert resp.data["contact"]["contact_email"] == "turismo@cabrerademar.cat"
    assert resp.data["legal"]["privacy_page"]["slug"] == "privacidad"
    assert len(resp.data["links"]["explore"]) == 1
    assert len(resp.data["links"]["institutional"]) == 1
    assert resp.data["links"]["institutional"][0]["label"] == "Transparencia"
    assert len(resp.data["badges"]) == 1


def test_seed_footer_settings_is_idempotent():
    call_command("seed_footer_settings")
    call_command("seed_footer_settings")

    footer_settings = FooterSettings.for_site_settings()
    assert FooterSettings.objects.count() == 1
    assert footer_settings.title != ""


def test_seed_footer_links_is_idempotent():
    call_command("seed_footer_settings")
    call_command("seed_footer_links")
    first_count = FooterLink.objects.count()

    call_command("seed_footer_links")
    assert FooterLink.objects.count() == first_count
    assert first_count > 0


def test_seed_footer_badges_is_idempotent_and_links_seed_images():
    call_command("seed_footer_settings")
    call_command("seed_footer_badges")
    first_count = FooterBadge.objects.count()
    first_image_count = ImageFile.objects.filter(
        original_name__startswith="badge_"
    ).count()

    call_command("seed_footer_badges")
    assert FooterBadge.objects.count() == first_count
    assert first_count > 0
    assert (
        ImageFile.objects.filter(original_name__startswith="badge_").count()
        == first_image_count
    )
    assert FooterBadge.objects.filter(is_active=False, image__isnull=False).count() == first_count
