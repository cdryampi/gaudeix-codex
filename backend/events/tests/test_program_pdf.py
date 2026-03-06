from __future__ import annotations

import os
import sys
import types
from pathlib import Path

import pytest
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from rest_framework.test import APIRequestFactory

from core.models import Category
from events.models import Event, EventCategorySingleton, EventDate
from events.services import pdf_generator
from events import views as event_views
from media_files.models import ImageFile

User = get_user_model()

pytestmark = pytest.mark.django_db

@pytest.fixture
def events_category() -> Category:
    category, _ = Category.objects.get_or_create(
        slug="events", defaults={"taxonomy": "events", "nombre": "Events"}
    )
    return category


@pytest.fixture
def events_singleton(events_category: Category) -> EventCategorySingleton:
    singleton, _ = EventCategorySingleton.objects.get_or_create(category=events_category)
    return singleton


@pytest.fixture
def culture_category() -> Category:
    category, _ = Category.objects.get_or_create(
        slug="culture", defaults={"taxonomy": "events", "nombre": "Culture"}
    )
    return category


@pytest.fixture
def family_category() -> Category:
    category, _ = Category.objects.get_or_create(
        slug="family", defaults={"taxonomy": "events", "nombre": "Family"}
    )
    return category


@pytest.fixture
def sample_files_path() -> Path:
    return Path(__file__).resolve().parent / "files"


@pytest.fixture
def sample_image(sample_files_path: Path) -> ImageFile:
    image_path = sample_files_path / "sample.png"
    if image_path.exists():
        content = image_path.read_bytes()
        return ImageFile.objects.create(
            file=ContentFile(content, name=image_path.name),
            original_name=image_path.name,
            mime_type="image/png",
            size_bytes=len(content),
        )

    return ImageFile.objects.create(
        file=ContentFile(b"fake-image", name="test.png"),
        original_name="test.png",
        mime_type="image/png",
        size_bytes=10,
    )


@pytest.fixture
def staff_user() -> User:
    return User.objects.create_user(
        username="program-pdf-admin",
        password="secret",
        is_staff=True,
    )


def _create_event(
    *,
    title: str,
    start_at,
    category: Category | None = None,
    image: ImageFile | None = None,
    is_published: bool = True,
) -> Event:
    event = Event.objects.create(
        title=title,
        category=category,
        featured_media=image,
        is_published=is_published,
        summary=f"Summary for {title}",
        location_text="Plaça Major",
    )
    EventDate.objects.create(
        event=event,
        start_at=start_at,
        end_at=start_at + timezone.timedelta(hours=2),
    )
    return event


def _assert_pdf_response(response) -> None:
    content_type = response.headers.get("Content-Type", "")
    assert content_type.startswith("application/pdf")
    assert response.content.startswith(b"%PDF")
    content_disposition = response.headers.get("Content-Disposition", "")
    assert ".pdf" in content_disposition.lower()


def _build_view_and_request(method: str, path: str, data: dict | None = None):
    factory = APIRequestFactory()
    django_request_factory = getattr(factory, method.lower())
    django_request = django_request_factory(path, data or {}, format="json")
    view = event_views.EventViewSet()
    view.action = "program_pdf" if method.lower() == "get" else "regenerate_program_pdf"
    view.action_map = {method.lower(): view.action}
    view.args = ()
    view.kwargs = {}
    drf_request = view.initialize_request(django_request)
    view.request = drf_request
    return view, drf_request


class _DummyRequest:
    def build_absolute_uri(self, path="/"):
        return f"https://gaudeix.test{path}"


def test_generate_events_pdf_groups_events_by_date_and_uses_request_base_url(
    settings, culture_category, sample_image, monkeypatch, tmp_path
):
    settings.BASE_DIR = tmp_path
    render_calls = {}
    first_start = timezone.make_aware(
        timezone.datetime.combine(
            (timezone.now().replace(microsecond=0) + timezone.timedelta(days=1)).date(),
            timezone.datetime.min.time(),
        )
    ) + timezone.timedelta(hours=10)

    first_event = _create_event(
        title="Morning Concert",
        start_at=first_start,
        category=culture_category,
        image=sample_image,
    )
    second_event = _create_event(
        title="Evening Cinema",
        start_at=first_event.start_at + timezone.timedelta(hours=3),
        category=culture_category,
    )
    third_event = _create_event(
        title="Saturday Market",
        start_at=first_event.start_at + timezone.timedelta(days=1),
        category=culture_category,
    )

    def fake_render(template_name, context):
        render_calls["template_name"] = template_name
        render_calls["context"] = context
        return "<html><body>program</body></html>"

    monkeypatch.setattr(pdf_generator, "render_to_string", fake_render)

    pdf_bytes = pdf_generator.generate_events_pdf(
        [third_event, second_event, first_event],
        request=_DummyRequest(),
        start_date=first_event.start_at.date(),
        end_date=third_event.start_at.date(),
        categories=[culture_category.slug],
        format="A3",
    )

    assert pdf_bytes.startswith(b"%PDF-")
    assert render_calls["template_name"] == "events/pdf/program.html"
    assert render_calls["context"]["base_url"] == "https://gaudeix.test/"
    assert render_calls["context"]["format"] == "A3"
    assert render_calls["context"]["categories"] == [culture_category.slug]
    assert render_calls["context"]["cell_width"] == round(100.0 / 7, 2)

    flattened_cells = [
        cell
        for row in render_calls["context"]["grid_rows"]
        for cell in row
        if cell["type"] != "empty"
    ]
    date_cells = [cell for cell in flattened_cells if cell["type"] == "date"]
    event_cells = [cell for cell in flattened_cells if cell["type"] == "event"]

    assert [cell["date"] for cell in date_cells] == sorted(cell["date"] for cell in date_cells)
    assert [cell["event"] for cell in event_cells] == [first_event, second_event, third_event]


def test_generate_events_pdf_uses_site_url_without_request(
    settings, culture_category, monkeypatch, tmp_path
):
    settings.BASE_DIR = tmp_path
    settings.SITE_URL = "https://municipi.example"

    event = _create_event(
        title="Fallback Site URL Event",
        start_at=timezone.now().replace(microsecond=0) + timezone.timedelta(days=2),
        category=culture_category,
    )

    render_calls = {}
    def fake_render(template_name, context):
        render_calls["context"] = context
        return "<html><body>fallback</body></html>"
    
    monkeypatch.setattr(pdf_generator, "render_to_string", fake_render)

    pdf_bytes = pdf_generator.generate_events_pdf([event], request=None, format="A4")

    assert pdf_bytes.startswith(b"%PDF-")
    assert render_calls["context"]["base_url"] == "https://municipi.example"


def test_generate_events_pdf_loads_print_stylesheet_when_present(
    settings, culture_category, monkeypatch, tmp_path
):
    settings.BASE_DIR = tmp_path
    css_dir = tmp_path / "static" / "events" / "pdf"
    css_dir.mkdir(parents=True)
    css_file = css_dir / "style.css"
    css_file.write_text("@page { size: A4; }", encoding="utf-8")

    event = _create_event(
        title="Styled Event",
        start_at=timezone.now().replace(microsecond=0) + timezone.timedelta(days=3),
        category=culture_category,
    )

    render_calls = {}
    def fake_render(template_name, context):
        render_calls["context"] = context
        return "<html><body>styled</body></html>"
    
    monkeypatch.setattr(pdf_generator, "render_to_string", fake_render)

    pdf_bytes = pdf_generator.generate_events_pdf([event], request=_DummyRequest())

    assert pdf_bytes.startswith(b"%PDF-")
    assert "@page { size: A4; }" in render_calls["context"]["style_block"]


def test_program_pdf_download_returns_pdf_for_valid_a4_request(
    events_singleton, culture_category, sample_image, monkeypatch
):
    now = timezone.now().replace(microsecond=0)
    start_date = (now + timezone.timedelta(days=1)).date()
    end_date = start_date + timezone.timedelta(days=6)
    generator_calls = {}

    included_event = _create_event(
        title="Jazz Night",
        start_at=timezone.make_aware(
            timezone.datetime.combine(start_date, timezone.datetime.min.time())
        )
        + timezone.timedelta(hours=20),
        category=culture_category,
        image=sample_image,
    )
    _create_event(
        title="Old Festival",
        start_at=now - timezone.timedelta(days=2),
        category=culture_category,
        is_published=True,
    )
    _create_event(
        title="Draft Event",
        start_at=now + timezone.timedelta(days=2),
        category=culture_category,
        is_published=False,
    )

    def fake_generate(**kwargs):
        generator_calls.update(kwargs)
        return b"%PDF-export-a4"

    monkeypatch.setattr(event_views, "generate_events_pdf", fake_generate)

    view, request = _build_view_and_request(
        "get",
        "/api/v1/events/program-pdf/",
        {
            "start_from": start_date.isoformat(),
            "start_to": end_date.isoformat(),
            "format": "A4",
            "category": culture_category.slug,
        },
    )
    response = view._generate_program_pdf_response(request, request.query_params)

    assert response.status_code == 200
    _assert_pdf_response(response)
    exported_titles = [event.title for event in generator_calls["events"]]
    assert exported_titles == [included_event.title]
    assert generator_calls["start_date"] == start_date
    assert generator_calls["end_date"] == end_date
    assert generator_calls["categories"] == culture_category.slug
    assert generator_calls["format"] == "A4"


def test_program_pdf_download_supports_a3_with_busy_days_and_missing_images(
    events_singleton, family_category, monkeypatch
):
    now = timezone.now().replace(microsecond=0)
    target_day = (now + timezone.timedelta(days=4)).date()
    day_start = timezone.make_aware(
        timezone.datetime.combine(target_day, timezone.datetime.min.time())
    )
    generator_calls = {}

    for index in range(8):
        _create_event(
            title=f"Busy Day Event {index + 1}",
            start_at=day_start + timezone.timedelta(hours=9 + index),
            category=family_category,
            image=None,
        )

    def fake_generate(**kwargs):
        generator_calls.update(kwargs)
        return b"%PDF-export-a3"

    monkeypatch.setattr(event_views, "generate_events_pdf", fake_generate)

    view, request = _build_view_and_request(
        "get",
        "/api/v1/events/program-pdf/",
        {
            "start_from": target_day.isoformat(),
            "start_to": target_day.isoformat(),
            "paper_format": "A3",
            "category": family_category.slug,
        },
    )
    response = view._generate_program_pdf_response(request, request.query_params)

    assert response.status_code == 200
    _assert_pdf_response(response)
    assert len(generator_calls["events"]) == 8
    assert generator_calls["format"] == "A3"
    assert generator_calls["categories"] == family_category.slug


def test_program_pdf_download_rejects_invalid_date_range(events_singleton):
    view, request = _build_view_and_request(
        "get",
        "/api/v1/events/program-pdf/",
        {
            "start_from": "2026-05-30",
            "start_to": "2026-05-01",
            "format": "A4",
        },
    )
    with pytest.raises(ValidationError) as exc:
        view._generate_program_pdf_response(request, request.query_params)

    assert "start_from" in str(exc.value).lower()


def test_program_pdf_download_normalizes_unknown_format_to_a4(
    events_singleton, culture_category, monkeypatch
):
    event = _create_event(
        title="Fallback Format Event",
        start_at=timezone.now().replace(microsecond=0) + timezone.timedelta(days=5),
        category=culture_category,
    )
    generator_calls = {}

    def fake_generate(**kwargs):
        generator_calls.update(kwargs)
        return b"%PDF-export-default"

    monkeypatch.setattr(event_views, "generate_events_pdf", fake_generate)

    view, request = _build_view_and_request(
        "get",
        "/api/v1/events/program-pdf/",
        {
            "start_from": event.start_at.date().isoformat(),
            "start_to": event.start_at.date().isoformat(),
            "paper_format": "A5",
        },
    )
    with pytest.raises(ValidationError) as exc:
        view._generate_program_pdf_response(request, request.query_params)

    assert "invalid format" in str(exc.value).lower()


def test_program_pdf_download_accepts_format_alias_for_get_requests(
    events_singleton, culture_category, monkeypatch
):
    event = _create_event(
        title="Format Alias Event",
        start_at=timezone.now().replace(microsecond=0) + timezone.timedelta(days=6),
        category=culture_category,
    )
    generator_calls = {}

    def fake_generate(**kwargs):
        generator_calls.update(kwargs)
        return b"%PDF-export-alias"

    monkeypatch.setattr(event_views, "generate_events_pdf", fake_generate)

    view, request = _build_view_and_request(
        "get",
        "/api/v1/events/program-pdf/",
        {
            "start_from": event.start_at.date().isoformat(),
            "start_to": event.start_at.date().isoformat(),
            "format": "A3",
        },
    )
    response = view._generate_program_pdf_response(request, request.query_params)

    assert response.status_code == 200
    _assert_pdf_response(response)
    assert generator_calls["format"] == "A3"


def test_program_pdf_download_filters_category_slug_for_get_requests(
    events_singleton, culture_category, family_category, monkeypatch
):
    start_at = timezone.now().replace(microsecond=0) + timezone.timedelta(days=7)
    included_event = _create_event(
        title="Culture Only Event",
        start_at=start_at,
        category=culture_category,
    )
    _create_event(
        title="Family Event Same Day",
        start_at=start_at + timezone.timedelta(hours=1),
        category=family_category,
    )
    generator_calls = {}

    def fake_generate(**kwargs):
        generator_calls.update(kwargs)
        return b"%PDF-export-category-slug"

    monkeypatch.setattr(event_views, "generate_events_pdf", fake_generate)

    view, request = _build_view_and_request(
        "get",
        "/api/v1/events/program-pdf/",
        {
            "start_from": start_at.date().isoformat(),
            "start_to": start_at.date().isoformat(),
            "category_slug": culture_category.slug,
            "paper_format": "A4",
        },
    )
    response = view._generate_program_pdf_response(request, request.query_params)

    assert response.status_code == 200
    _assert_pdf_response(response)
    assert [event.title for event in generator_calls["events"]] == [included_event.title]
    assert generator_calls["categories"] == culture_category.slug


def test_program_pdf_download_is_public(events_singleton, culture_category, monkeypatch):
    event = _create_event(
        title="Public Brochure Event",
        start_at=timezone.now().replace(microsecond=0) + timezone.timedelta(days=2),
        category=culture_category,
    )

    monkeypatch.setattr(
        event_views,
        "generate_events_pdf",
        lambda **kwargs: b"%PDF-public-brochure",
    )

    view, request = _build_view_and_request(
        "get",
        "/api/v1/events/program-pdf/",
        {
            "start_from": event.start_at.date().isoformat(),
            "start_to": event.start_at.date().isoformat(),
            "format": "A4",
        },
    )
    response = view._generate_program_pdf_response(request, request.query_params)

    assert response.status_code == 200
    _assert_pdf_response(response)


def test_program_pdf_regenerate_filters_category_for_post_payload(
    events_singleton, culture_category, family_category, monkeypatch
):
    start_at = timezone.now().replace(microsecond=0) + timezone.timedelta(days=2)
    included_event = _create_event(
        title="Admin Regenerated Event",
        start_at=start_at,
        category=culture_category,
    )
    _create_event(
        title="Other Category Event",
        start_at=start_at,
        category=family_category,
    )
    generator_calls = {}

    def fake_generate(**kwargs):
        generator_calls.update(kwargs)
        return b"%PDF-admin-regenerate"

    monkeypatch.setattr(event_views, "generate_events_pdf", fake_generate)

    view, request = _build_view_and_request(
        "post",
        "/api/v1/events/program-pdf/regenerate/",
        {
            "start_date": start_at.date().isoformat(),
            "end_date": start_at.date().isoformat(),
            "format": "A4",
            "category": culture_category.slug,
        },
    )
    response = view._generate_program_pdf_response(request, request.data)

    assert response.status_code == 200
    _assert_pdf_response(response)
    assert [event.title for event in generator_calls["events"]] == [included_event.title]
    assert generator_calls["categories"] == culture_category.slug


def test_program_pdf_permission_is_public():
    view = event_views.EventViewSet()
    view.action = "program_pdf"

    permissions = view.get_permissions()

    assert len(permissions) == 1
    assert permissions[0].__class__.__name__ == "AllowAny"


def test_regenerate_program_pdf_permission_requires_admin():
    view = event_views.EventViewSet()
    view.action = "regenerate_program_pdf"

    permissions = view.get_permissions()

    assert len(permissions) == 1
    assert permissions[0].__class__.__name__ == "IsAdminUser"
