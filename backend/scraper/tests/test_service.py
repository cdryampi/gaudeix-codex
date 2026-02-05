"""
Tests for ScraperService.

Covers:
- Scraping workflow with mocked HTTP requests
- Source auto-creation from registry
- Error handling
- Results aggregation
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from requests.exceptions import RequestException

from scraper.models import ScraperSource, ScrapedNews
from scraper.services.scraper_service import ScraperService, ScrapeResult
from scraper.parser_registry import ParserRegistry


pytestmark = pytest.mark.django_db


class TestScraperServiceInit:
    """Tests for ScraperService initialization."""

    def test_default_initialization(self):
        """Test service initializes with defaults."""
        service = ScraperService()
        assert service.delay == 1.0
        assert service.session is not None

    def test_custom_delay(self):
        """Test custom delay configuration."""
        service = ScraperService(delay=0.5)
        assert service.delay == 0.5


class TestScrapeResult:
    """Tests for ScrapeResult dataclass."""

    def test_scrape_result_success_property(self):
        """Test success property when no errors."""
        result = ScrapeResult(
            source_slug="test",
            pages_scraped=1,
            news_found=5,
            news_created=5,
            news_updated=0,
            news_skipped=0,
            errors=[],
        )
        assert result.success is True

    def test_scrape_result_failure_property(self):
        """Test success property when errors exist."""
        result = ScrapeResult(
            source_slug="test",
            pages_scraped=1,
            news_found=5,
            news_created=3,
            news_updated=0,
            news_skipped=0,
            errors=["Connection timeout"],
        )
        assert result.success is False


class TestScrapeSourceAutoCreate:
    """Tests for source auto-creation from registry."""

    def test_unknown_parser_returns_error(self):
        """Test unknown parser slug returns error in result."""
        service = ScraperService()
        result = service.scrape_source("unknown-municipality")

        assert result.pages_scraped == 0
        assert len(result.errors) == 1
        assert "No parser found" in result.errors[0]

    def test_auto_creates_source_from_registry(self):
        """Test source is auto-created when it doesn't exist."""
        # Ensure source doesn't exist
        ScraperSource.objects.filter(slug="cabrera-de-mar").delete()

        # Mock HTTP to avoid real requests
        with patch("requests.Session") as MockSession:
            mock_session = MagicMock()
            mock_session.get.side_effect = RequestException("Mocked")
            MockSession.return_value = mock_session

            service = ScraperService(delay=0)
            service.scrape_source("cabrera-de-mar", max_pages=1)

        # Source should have been created
        assert ScraperSource.objects.filter(slug="cabrera-de-mar").exists()
        source = ScraperSource.objects.get(slug="cabrera-de-mar")
        assert source.name == "Cabrera de Mar"
        assert source.base_url == "https://www.cabrerademar.cat"


class TestScrapeSourceWorkflow:
    """Tests for scraping workflow with mocked requests."""

    def test_successful_scrape_returns_result(
        self, scraper_source, cabrera_list_page_html, cabrera_detail_page_html
    ):
        """Test successful scraping returns ScrapeResult."""
        with patch("requests.Session") as MockSession:
            mock_session = MagicMock()
            # Mock responses
            list_response = Mock()
            list_response.text = cabrera_list_page_html
            list_response.raise_for_status = Mock()

            detail_response = Mock()
            detail_response.text = cabrera_detail_page_html
            detail_response.raise_for_status = Mock()

            mock_session.get.side_effect = [list_response] + [detail_response] * 10
            mock_session.headers = MagicMock()
            MockSession.return_value = mock_session

            service = ScraperService(delay=0)
            result = service.scrape_source("cabrera-de-mar", max_pages=1)

        assert isinstance(result, ScrapeResult)
        assert result.source_slug == "cabrera-de-mar"
        assert result.pages_scraped == 1

    def test_scrape_creates_scraped_news(
        self, scraper_source, cabrera_list_page_html, cabrera_detail_page_html
    ):
        """Test that ScrapedNews records are created."""
        with patch("requests.Session") as MockSession:
            mock_session = MagicMock()
            list_response = Mock()
            list_response.text = cabrera_list_page_html
            list_response.raise_for_status = Mock()

            detail_response = Mock()
            detail_response.text = cabrera_detail_page_html
            detail_response.raise_for_status = Mock()

            mock_session.get.side_effect = [list_response] + [detail_response] * 10
            mock_session.headers = MagicMock()
            MockSession.return_value = mock_session

            service = ScraperService(delay=0)
            result = service.scrape_source("cabrera-de-mar", max_pages=1)

        # Verify records created
        news_items = ScrapedNews.objects.filter(source=scraper_source)
        assert news_items.count() >= 1
        assert result.news_created >= 1

        # Check content was extracted
        news = news_items.first()
        assert news.title
        assert news.external_id
        assert news.status == ScrapedNews.Status.PENDING

    def test_scrape_updates_existing_news(
        self, scraper_source, cabrera_list_page_html, cabrera_detail_page_html
    ):
        """Test that existing news is updated, not duplicated."""
        # Pre-create a news item
        ScrapedNews.objects.create(
            source=scraper_source,
            source_url="https://www.cabrerademar.cat/actualitat/noticies/festa-major-2026.html",
            external_id="festa-major-2026",
            title="Old Title",
        )

        with patch("requests.Session") as MockSession:
            mock_session = MagicMock()
            list_response = Mock()
            list_response.text = cabrera_list_page_html
            list_response.raise_for_status = Mock()

            detail_response = Mock()
            detail_response.text = cabrera_detail_page_html
            detail_response.raise_for_status = Mock()

            mock_session.get.side_effect = [list_response] + [detail_response] * 10
            mock_session.headers = MagicMock()
            MockSession.return_value = mock_session

            service = ScraperService(delay=0)
            # Don't skip existing to force update
            result = service.scrape_source(
                "cabrera-de-mar", max_pages=1, skip_existing=False
            )

        # Verify no duplicates
        festa_news = ScrapedNews.objects.filter(
            source=scraper_source, external_id="festa-major-2026"
        )
        assert festa_news.count() == 1

    def test_scrape_handles_list_page_error(self, scraper_source):
        """Test error handling when list page fails."""
        with patch("requests.Session") as MockSession:
            mock_session = MagicMock()
            mock_session.get.side_effect = RequestException("Connection timeout")
            mock_session.headers = MagicMock()
            MockSession.return_value = mock_session

            service = ScraperService(delay=0)
            result = service.scrape_source("cabrera-de-mar", max_pages=1)

        assert len(result.errors) >= 1
        assert "Connection timeout" in result.errors[0]

    def test_scrape_handles_detail_page_error(
        self, scraper_source, cabrera_list_page_html
    ):
        """Test error handling when detail page fails."""
        with patch("requests.Session") as MockSession:
            mock_session = MagicMock()
            list_response = Mock()
            list_response.text = cabrera_list_page_html
            list_response.raise_for_status = Mock()

            # List succeeds, detail fails
            def side_effect(url, **kwargs):
                if "noticies?" in url or url.endswith("noticies"):
                    return list_response
                raise RequestException("404 Not Found")

            mock_session.get.side_effect = side_effect
            mock_session.headers = MagicMock()
            MockSession.return_value = mock_session

            service = ScraperService(delay=0)
            result = service.scrape_source("cabrera-de-mar", max_pages=1)

        # Should complete with errors logged
        assert len(result.errors) >= 1

    def test_scrape_updates_last_scraped_at(
        self, scraper_source, cabrera_list_page_html, cabrera_detail_page_html
    ):
        """Test that source.last_scraped_at is updated after scraping."""
        assert scraper_source.last_scraped_at is None

        with patch("requests.Session") as MockSession:
            mock_session = MagicMock()
            list_response = Mock()
            list_response.text = cabrera_list_page_html
            list_response.raise_for_status = Mock()

            detail_response = Mock()
            detail_response.text = cabrera_detail_page_html
            detail_response.raise_for_status = Mock()

            mock_session.get.side_effect = [list_response] + [detail_response] * 10
            mock_session.headers = MagicMock()
            MockSession.return_value = mock_session

            service = ScraperService(delay=0)
            service.scrape_source("cabrera-de-mar", max_pages=1)

        scraper_source.refresh_from_db()
        assert scraper_source.last_scraped_at is not None


class TestScrapeAllActive:
    """Tests for scraping all active sources."""

    def test_scrape_all_active_only_active_sources(
        self, scraper_source, inactive_source
    ):
        """Test that only active sources are scraped."""
        with patch.object(ScraperService, "scrape_source") as mock_scrape:
            mock_scrape.return_value = ScrapeResult(
                source_slug="cabrera-de-mar",
                pages_scraped=1,
                news_found=5,
                news_created=5,
                news_updated=0,
                news_skipped=0,
                errors=[],
            )

            service = ScraperService()
            results = service.scrape_all_active(max_pages=1)

        # Only active source should be scraped
        assert len(results) == 1
        assert results[0].source_slug == "cabrera-de-mar"

    def test_scrape_all_returns_list_of_results(self, scraper_source):
        """Test results are returned as list."""
        with patch.object(ScraperService, "scrape_source") as mock_scrape:
            mock_scrape.return_value = ScrapeResult(
                source_slug="cabrera-de-mar",
                pages_scraped=2,
                news_found=10,
                news_created=8,
                news_updated=2,
                news_skipped=0,
                errors=[],
            )

            service = ScraperService()
            results = service.scrape_all_active()

        assert isinstance(results, list)
        assert len(results) == 1
        assert results[0].news_found == 10


class TestRegistryIntegration:
    """Tests for parser registry integration."""

    def test_parser_registry_has_cabrera(self):
        """Test cabrera-de-mar is registered."""
        assert ParserRegistry.has("cabrera-de-mar")

    def test_parser_registry_get_parser(self):
        """Test retrieving parser from registry."""
        parser = ParserRegistry.get("cabrera-de-mar")
        assert parser is not None
        assert parser.name == "Cabrera de Mar"

    def test_parser_registry_list_all(self):
        """Test listing all registered parsers."""
        slugs = ParserRegistry.list_all()
        assert "cabrera-de-mar" in slugs
