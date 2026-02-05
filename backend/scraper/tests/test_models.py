"""
Tests for scraper models: ScraperSource and ScrapedNews.

Covers:
- Model creation and field validation
- Properties and computed fields
- Relationships and constraints
- Status transitions
"""

import pytest
from django.db import IntegrityError
from django.utils import timezone

from scraper.models import ScraperSource, ScrapedNews


pytestmark = pytest.mark.django_db


class TestScraperSource:
    """Tests for ScraperSource model."""

    def test_create_source(self, scraper_source):
        """Test basic source creation with all fields."""
        assert scraper_source.pk is not None
        assert scraper_source.name == "Cabrera de Mar"
        assert scraper_source.slug == "cabrera-de-mar"
        assert scraper_source.base_url == "https://www.cabrerademar.cat"
        assert scraper_source.news_path == "/actualitat/noticies"
        assert scraper_source.is_active is True
        assert scraper_source.config == {"max_pages": 2}

    def test_full_news_url_property(self, scraper_source):
        """Test computed full_news_url property."""
        expected = "https://www.cabrerademar.cat/actualitat/noticies"
        assert scraper_source.full_news_url == expected

    def test_full_news_url_strips_trailing_slash(self, db):
        """Test that trailing slash is handled correctly."""
        source = ScraperSource.objects.create(
            name="Test",
            slug="test-trailing",
            base_url="https://example.com/",  # Trailing slash
            news_path="/news",
        )
        assert source.full_news_url == "https://example.com/news"

    def test_slug_uniqueness(self, scraper_source):
        """Test that slug must be unique."""
        with pytest.raises(IntegrityError):
            ScraperSource.objects.create(
                name="Duplicate",
                slug="cabrera-de-mar",  # Same slug
                base_url="https://other.com",
            )

    def test_str_representation(self, scraper_source):
        """Test string representation."""
        assert str(scraper_source) == "Cabrera de Mar"

    def test_default_values(self, db):
        """Test default field values."""
        source = ScraperSource.objects.create(
            name="Minimal",
            slug="minimal",
            base_url="https://example.com",
        )
        assert source.news_path == "/actualitat/noticies"
        assert source.is_active is True
        assert source.last_scraped_at is None
        assert source.config == {}

    def test_timestamps_auto_set(self, scraper_source):
        """Test that created_at and updated_at are set automatically."""
        assert scraper_source.created_at is not None
        assert scraper_source.updated_at is not None

    def test_ordering(self, db):
        """Test default ordering by name."""
        ScraperSource.objects.create(
            name="Zebra", slug="zebra", base_url="https://z.com"
        )
        ScraperSource.objects.create(
            name="Alpha", slug="alpha", base_url="https://a.com"
        )

        sources = list(ScraperSource.objects.all())
        assert sources[0].name == "Alpha"
        assert sources[1].name == "Zebra"


class TestScrapedNews:
    """Tests for ScrapedNews model."""

    def test_create_scraped_news(self, scraped_news_pending):
        """Test basic news creation with all fields."""
        news = scraped_news_pending
        assert news.pk is not None
        assert news.source.slug == "cabrera-de-mar"
        assert news.external_id == "test-news"
        assert news.title == "Notícia de prova per al scraper"
        assert "català" in news.summary
        assert "<p>" in news.body
        assert news.status == ScrapedNews.Status.PENDING

    def test_featured_image_and_gallery(self, scraped_news_pending):
        """Test media URL fields."""
        news = scraped_news_pending
        assert "test.jpg" in news.featured_image_url
        assert len(news.gallery_image_urls) == 2
        assert "gallery1.jpg" in news.gallery_image_urls[0]

    def test_is_imported_property(self, scraped_news_pending, scraped_news_imported):
        """Test is_imported computed property."""
        assert scraped_news_pending.is_imported is False
        assert scraped_news_imported.is_imported is True

    def test_status_choices(self, scraped_news_pending):
        """Test all valid status values."""
        news = scraped_news_pending

        for status in [
            ScrapedNews.Status.PENDING,
            ScrapedNews.Status.IMPORTED,
            ScrapedNews.Status.SKIPPED,
            ScrapedNews.Status.ERROR,
        ]:
            news.status = status
            news.save()
            news.refresh_from_db()
            assert news.status == status

    def test_str_representation(self, scraped_news_pending):
        """Test string representation includes source and truncated title."""
        expected = "[cabrera-de-mar] Notícia de prova per al scraper"
        assert str(scraped_news_pending) == expected

    def test_str_truncates_long_title(self, scraper_source):
        """Test that long titles are truncated in str."""
        long_title = "A" * 100
        news = ScrapedNews.objects.create(
            source=scraper_source,
            source_url="https://example.com/long.html",
            external_id="long-title",
            title=long_title,
        )
        assert len(str(news)) < len(long_title) + 20  # Reasonable truncation

    def test_unique_together_constraint(self, scraper_source, scraped_news_pending):
        """Test that source + external_id must be unique."""
        with pytest.raises(IntegrityError):
            ScrapedNews.objects.create(
                source=scraper_source,
                source_url="https://other.com/test.html",
                external_id="test-news",  # Same external_id
                title="Duplicate",
            )

    def test_same_external_id_different_source(self, scraper_source, inactive_source):
        """Test that same external_id is allowed for different sources."""
        ScrapedNews.objects.create(
            source=scraper_source,
            source_url="https://cabrera.com/news.html",
            external_id="shared-id",
            title="News from Cabrera",
        )
        # This should NOT raise
        news2 = ScrapedNews.objects.create(
            source=inactive_source,
            source_url="https://other.com/news.html",
            external_id="shared-id",  # Same ID, different source
            title="News from Other",
        )
        assert news2.pk is not None

    def test_cascade_delete_with_source(self, scraper_source, scraped_news_pending):
        """Test that news is deleted when source is deleted."""
        news_id = scraped_news_pending.pk
        scraper_source.delete()

        assert not ScrapedNews.objects.filter(pk=news_id).exists()

    def test_related_name_access(self, scraper_source, scraped_news_pending):
        """Test accessing news from source via related_name."""
        assert scraper_source.scraped_news.count() == 1
        assert scraper_source.scraped_news.first() == scraped_news_pending

    def test_ordering_by_published_date(self, scraper_source):
        """Test default ordering by published_at descending."""
        now = timezone.now()
        old = ScrapedNews.objects.create(
            source=scraper_source,
            source_url="https://example.com/old.html",
            external_id="old",
            title="Old News",
            published_at=now - timezone.timedelta(days=7),
        )
        new = ScrapedNews.objects.create(
            source=scraper_source,
            source_url="https://example.com/new.html",
            external_id="new",
            title="New News",
            published_at=now,
        )

        news_list = list(ScrapedNews.objects.all())
        assert news_list[0] == new
        assert news_list[1] == old

    def test_import_error_field(self, scraped_news_pending):
        """Test storing import error messages."""
        scraped_news_pending.status = ScrapedNews.Status.ERROR
        scraped_news_pending.import_error = "Failed to download image: 404 Not Found"
        scraped_news_pending.save()

        scraped_news_pending.refresh_from_db()
        assert "404" in scraped_news_pending.import_error

    def test_raw_metadata_json(self, scraper_source):
        """Test storing arbitrary metadata as JSON."""
        metadata = {
            "canonical": "https://example.com/canonical",
            "author": "Ajuntament",
            "keywords": ["festa", "cultura", "tradició"],
        }
        news = ScrapedNews.objects.create(
            source=scraper_source,
            source_url="https://example.com/meta.html",
            external_id="meta-test",
            title="Metadata Test",
            raw_metadata=metadata,
        )
        news.refresh_from_db()

        assert news.raw_metadata["author"] == "Ajuntament"
        assert len(news.raw_metadata["keywords"]) == 3

    def test_optional_fields_nullable(self, scraper_source):
        """Test that optional fields can be empty."""
        news = ScrapedNews.objects.create(
            source=scraper_source,
            source_url="https://example.com/minimal.html",
            external_id="minimal",
            title="Minimal News",
            # All other fields use defaults
        )
        assert news.summary == ""
        assert news.body == ""
        assert news.published_at is None
        assert news.featured_image_url == ""
        assert news.gallery_image_urls == []
        assert news.imported_news is None
