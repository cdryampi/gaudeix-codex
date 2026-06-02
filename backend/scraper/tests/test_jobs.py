import pytest
from unittest.mock import patch, MagicMock
from scraper.models import ScrapeJob, ScraperSource
from scraper.services.scraper_service import ScraperService
from rest_framework.test import APIClient
from rest_framework import status


@pytest.fixture
def source():
    return ScraperSource.objects.create(
        name="Test Source", slug="test-source", base_url="https://example.com"
    )


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user(django_user_model):
    return django_user_model.objects.create_superuser(
        username="admin", password="password", email="admin@example.com"
    )


@pytest.mark.django_db
class TestScrapeJobModel:
    def test_create_job(self, source):
        job = ScrapeJob.objects.create(
            source=source, max_pages=5, status=ScrapeJob.Status.PENDING
        )
        assert job.pk is not None
        assert job.status == "pending"
        assert job.progress == 0
        assert job.max_pages == 5


@pytest.mark.django_db
class TestScraperServiceWithJob:
    @patch("requests.Session")
    @patch("scraper.parser_registry.ParserRegistry.has", return_value=True)
    @patch("scraper.parser_registry.ParserRegistry.get_class")
    @patch("scraper.parser_registry.ParserRegistry.get")
    def test_scrape_updates_job_progress(
        self, mock_get_parser, mock_get_class, mock_has, mock_session, source
    ):
        # Setup mocks
        mock_parser_class = MagicMock()
        mock_parser_class.name = "Test Source"
        mock_parser_class.slug = "test-source"
        mock_parser_class.base_url = "https://example.com"
        mock_get_class.return_value = mock_parser_class

        mock_parser = MagicMock()
        mock_parser.get_list_page_urls.return_value = ["https://example.com/news"]
        mock_parser.parse_list_page.return_value = []
        mock_get_parser.return_value = mock_parser

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.text = "<html></html>"
        mock_session.return_value.get.return_value = mock_response

        # Create job
        job = ScrapeJob.objects.create(
            source=source, max_pages=1, status=ScrapeJob.Status.PENDING
        )

        # Run scrape
        service = ScraperService(delay=0)
        service.scrape_source(source.slug, job_id=job.id)

        # Reload job
        job.refresh_from_db()

        assert job.status == ScrapeJob.Status.COMPLETED
        assert job.progress == 100
        assert job.completed_at is not None


@pytest.mark.django_db
class TestScrapeJobAPI:
    def test_run_scrape_endpoint(self, api_client, admin_user, source):
        api_client.force_authenticate(user=admin_user)

        # Patch threading to avoid actual background execution
        with patch("threading.Thread") as mock_thread:
            url = f"/api/v1/scraper/sources/{source.slug}/run_scrape/"
            response = api_client.post(url, {"max_pages": 3})

            assert response.status_code == status.HTTP_200_OK
            assert response.data["success"] is True
            assert "job_id" in response.data

            # Verify job created
            job = ScrapeJob.objects.get(id=response.data["job_id"])
            assert job.source == source
            assert job.max_pages == 3
            assert job.status == ScrapeJob.Status.PENDING

            # Verify thread started
            assert mock_thread.called
            mock_thread.return_value.start.assert_called_once()

    def test_list_jobs(self, api_client, admin_user, source):
        api_client.force_authenticate(user=admin_user)

        # Create some jobs
        ScrapeJob.objects.create(
            source=source, max_pages=1, status="completed", progress=100
        )
        ScrapeJob.objects.create(
            source=source, max_pages=1, status="pending", progress=0
        )

        url = "/api/v1/scraper/jobs/"
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK

        # Handle both paginated and non-paginated responses
        results = (
            response.data["results"]
            if isinstance(response.data, dict) and "results" in response.data
            else response.data
        )
        assert len(results) == 2
