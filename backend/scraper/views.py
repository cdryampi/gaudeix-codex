"""
Views for scraper API endpoints.

Provides:
- ScraperSourceViewSet: CRUD for scraper sources
- ScrapedNewsViewSet: List, detail, delete scraped news + import action
"""

import base64
import logging
import os
import time
from pathlib import Path
from urllib.parse import urljoin, urlparse
import threading
from django.conf import settings
from django.db import models, transaction
from rest_framework import viewsets, status, mixins
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.core.files.base import ContentFile
from bs4 import BeautifulSoup
import requests

from .models import ScraperSource, ScrapedNews, ScrapeJob
from .serializers import (
    ScraperSourceSerializer,
    ScrapedNewsListSerializer,
    ScrapedNewsDetailSerializer,
    ScrapedNewsUpdateSerializer,
    ImportScrapedNewsSerializer,
    ScrapeJobSerializer,
)
from .services.scraper_service import ScraperService
from media_files import utils as media_utils
from media_files.models import ImageFile, DocumentFile

logger = logging.getLogger(__name__)


class ScraperSourceViewSet(viewsets.ModelViewSet):
    """
    API endpoints for scraper sources.

    list: GET /scraper/sources/
    retrieve: GET /scraper/sources/{slug}/
    create/update/delete: Admin only
    """

    queryset = ScraperSource.objects.all()
    serializer_class = ScraperSourceSerializer
    lookup_field = "slug"
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    @action(detail=True, methods=["post"], permission_classes=[IsAdminUser])
    def run_scrape(self, request, slug=None):
        """
        Start a background scraping job for this source.

        POST /scraper/sources/{slug}/run_scrape/
        Body:
        - max_pages: int (optional)
        """
        source = self.get_object()
        max_pages = request.data.get("max_pages")
        if max_pages:
            try:
                max_pages = int(max_pages)
            except ValueError:
                max_pages = None

        # Create job record
        job = ScrapeJob.objects.create(
            source=source,
            max_pages=max_pages or 5,  # Default to 5 pages if not specified
            status=ScrapeJob.Status.PENDING,
        )

        # Define background task
        def scrape_task(job_id, source_slug, max_pages_val):
            try:
                from django.db import close_old_connections

                close_old_connections()
                service = ScraperService()
                result = service.scrape_source(
                    source_slug=source_slug, max_pages=max_pages_val, job_id=job_id
                )

                # Safety: ensure job is finalized if still running
                try:
                    from django.utils import timezone

                    j = ScrapeJob.objects.get(id=job_id)
                    if j.status in [ScrapeJob.Status.PENDING, ScrapeJob.Status.RUNNING]:
                        if result.errors and result.news_found == 0:
                            j.status = ScrapeJob.Status.FAILED
                            j.error_message = "\n".join(result.errors)
                        else:
                            j.status = ScrapeJob.Status.COMPLETED
                        j.completed_at = timezone.now()
                        j.save(
                            update_fields=["status", "error_message", "completed_at"]
                        )
                except Exception as finalize_err:
                    logger.error(f"Failed to finalize job {job_id}: {finalize_err}")
            except Exception as e:
                logger.exception(f"Scrape job {job_id} failed unexpectedly")
                try:
                    # Re-fetch job to avoid stale data
                    from django.utils import timezone

                    j = ScrapeJob.objects.get(id=job_id)
                    j.status = ScrapeJob.Status.FAILED
                    j.error_message = f"Critical error: {str(e)}"
                    j.completed_at = timezone.now()
                    j.save()
                except Exception as db_err:
                    logger.error(f"Failed to update job status on error: {db_err}")
            finally:
                try:
                    from django.db import close_old_connections

                    close_old_connections()
                except Exception:
                    pass

        # Launch in background thread
        thread = threading.Thread(
            target=scrape_task, args=(job.id, source.slug, max_pages)
        )
        thread.daemon = True
        thread.start()

        return Response(
            {
                "success": True,
                "job_id": job.id,
                "message": f"Scraping started for {source.name}",
            }
        )


class ScrapeJobViewSet(
    mixins.RetrieveModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet
):
    """
    API endpoints for scraping jobs.

    list: GET /scraper/jobs/
    retrieve: GET /scraper/jobs/{id}/
    """

    queryset = ScrapeJob.objects.all().order_by("-started_at")
    serializer_class = ScrapeJobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        source = self.request.query_params.get("source")
        if source:
            queryset = queryset.filter(source__slug=source)
        return queryset

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        """
        Cancel a running scrape job.

        POST /scraper/jobs/{id}/cancel/
        """
        job = self.get_object()
        if job.status in [
            ScrapeJob.Status.RUNNING,
            ScrapeJob.Status.PENDING,
            ScrapeJob.Status.CANCELLING,
        ]:
            from django.utils import timezone

            job.status = ScrapeJob.Status.CANCELLED
            job.error_message = job.error_message or "Cancelled by user"
            job.completed_at = timezone.now()
            job.save(update_fields=["status", "error_message", "completed_at"])
            return Response({"success": True, "message": "Job cancelled"})

        return Response(
            {"success": False, "message": "Job is not running"},
            status=status.HTTP_400_BAD_REQUEST,
        )


class ScrapedNewsViewSet(viewsets.ModelViewSet):
    """
    API endpoints for scraped news.

    Supports:
    - list: GET /scraper/scraped-news/
    - retrieve: GET /scraper/scraped-news/{id}/
    - update: PATCH /scraper/scraped-news/{id}/ (status only)
    - delete: DELETE /scraper/scraped-news/{id}/
    - import: POST /scraper/scraped-news/{id}/do_import/

    Filters:
    - ?source=slug - Filter by source slug
    - ?status=pending|imported|skipped|error - Filter by status
    - ?search=term - Search in title
    """

    queryset = ScrapedNews.objects.all().select_related("source", "imported_news")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return ScrapedNewsListSerializer
        elif self.action in ["update", "partial_update"]:
            return ScrapedNewsUpdateSerializer
        return ScrapedNewsDetailSerializer

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        response["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        response["Pragma"] = "no-cache"
        response["Expires"] = "0"
        return response

    def get_queryset(self):
        queryset = ScrapedNews.objects.all().select_related("source", "imported_news")
        params = self.request.query_params

        # Filter by source
        source = params.get("source")
        if source:
            queryset = queryset.filter(source__slug=source)

        # Filter by status
        status_filter = params.get("status")
        if status_filter and status_filter in dict(ScrapedNews.Status.choices):
            queryset = queryset.filter(status=status_filter)

        # Search in title
        search = params.get("search") or params.get("q")
        if search:
            queryset = queryset.filter(title__icontains=search)

        return queryset

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def do_import(self, request, pk=None):
        """
        Import scraped news into the News model.

        POST /scraper/scraped-news/{id}/do_import/

        Body:
        - auto_translate: bool (default: false)
        - publish: bool (default: false)
        - category_id: int (optional, uses news default if not provided)

        Returns:
        - success: bool
        - news_id: int (if successful)
        - news_slug: str (if successful)
        - error: str (if failed)
        """
        scraped_news = self.get_object()

        # Validate request
        serializer = ImportScrapedNewsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Check if already imported
        if scraped_news.status == ScrapedNews.Status.IMPORTED:
            return Response(
                {
                    "success": False,
                    "error": "Esta noticia ya ha sido importada",
                    "news_id": scraped_news.imported_news_id,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                # Import dependencies
                from news.models import News, NewsCategorySingleton
                from core.models import Category

                # Determine category
                category = None
                if data.get("category_id"):
                    category = Category.objects.filter(id=data["category_id"]).first()

                if not category:
                    # Use default news category
                    try:
                        singleton = NewsCategorySingleton.objects.first()
                        if singleton:
                            category = singleton.category
                    except Exception:
                        pass

                def normalize_media_url(raw_url: str) -> str:
                    if not raw_url:
                        return ""
                    if raw_url.startswith("http://") or raw_url.startswith("https://"):
                        return raw_url
                    if raw_url.startswith("//"):
                        return f"https:{raw_url}"
                    base = scraped_news.source.base_url or scraped_news.source_url or ""
                    if not base:
                        return raw_url
                    return urljoin(base.rstrip("/") + "/", raw_url)

                def download_file(url: str) -> tuple[bytes, str] | tuple[None, None]:
                    max_bytes = media_utils.MAX_FILE_SIZE_MB * 1024 * 1024
                    for attempt in range(3):
                        try:
                            response = requests.get(url, timeout=20)
                            response.raise_for_status()
                            content = response.content
                            if len(content) > max_bytes:
                                return None, None
                            return content, response.headers.get(
                                "Content-Type", ""
                            ) or ""
                        except Exception as exc:
                            if attempt == 2:
                                logger.warning(f"Failed to download media {url}: {exc}")
                                return None, None
                            time.sleep(0.5 * (attempt + 1))
                    return None, None

                def create_image_from_url(url: str) -> ImageFile | None:
                    content, mime = download_file(url)
                    if not content:
                        return None
                    filename = os.path.basename(urlparse(url).path) or "image.jpg"
                    file_obj = ContentFile(content, name=filename)
                    try:
                        media_utils.validate_max_file_size(file_obj)
                        media_utils.validate_image_extension(file_obj)
                    except Exception as exc:
                        logger.warning(f"Invalid image {url}: {exc}")
                        return None
                    image = ImageFile(
                        file=file_obj,
                        original_name=filename,
                        mime_type=mime,
                        size_bytes=len(content),
                    )
                    image.save()
                    return image

                def create_document_from_url(url: str) -> DocumentFile | None:
                    content, mime = download_file(url)
                    if not content:
                        return None
                    filename = os.path.basename(urlparse(url).path) or "document.pdf"
                    file_obj = ContentFile(content, name=filename)
                    try:
                        media_utils.validate_max_file_size(file_obj)
                        media_utils.validate_document_extension(file_obj)
                    except Exception as exc:
                        logger.warning(f"Invalid document {url}: {exc}")
                        return None
                    doc = DocumentFile(
                        file=file_obj,
                        original_name=filename,
                        mime_type=mime,
                        size_bytes=len(content),
                    )
                    doc.save()
                    return doc

                def get_default_image() -> ImageFile | None:
                    existing = ImageFile.objects.filter(
                        original_name="scraped-news-placeholder.png"
                    ).first()
                    if existing:
                        return existing
                    try:
                        seed_path = (
                            Path(settings.BASE_DIR)
                            / "media_files"
                            / "seed_assets"
                            / "images"
                            / "noticia_ple.png"
                        )
                        if seed_path.exists():
                            png_bytes = seed_path.read_bytes()
                        else:
                            png_bytes = base64.b64decode(
                                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=="
                            )
                        file_obj = ContentFile(
                            png_bytes, name="scraped-news-placeholder.png"
                        )
                        media_utils.validate_max_file_size(file_obj)
                        media_utils.validate_image_extension(file_obj)
                        image = ImageFile(
                            file=file_obj,
                            original_name="scraped-news-placeholder.png",
                            mime_type="image/png",
                            size_bytes=len(png_bytes),
                        )
                        image.save()
                        return image
                    except Exception as exc:
                        logger.warning(f"Failed to create default image: {exc}")
                        return None

                # Create News instance
                publish_requested = data.get("publish", False)

                news = News(
                    is_published=False,
                    category=category,
                    creado_por=request.user,
                    modificado_por=request.user,
                )

                # Set translatable fields in primary language
                primary_lang = settings.LANGUAGE_CODE
                news.set_current_language(primary_lang, initialize=True)
                news.title = scraped_news.title
                news.summary = scraped_news.summary or ""
                news.body = scraped_news.body or ""

                # Attach featured image
                image_url = scraped_news.featured_image_url
                if not image_url and scraped_news.gallery_image_urls:
                    image_url = scraped_news.gallery_image_urls[0]
                image_url = normalize_media_url(image_url)
                image_file = None
                if image_url:
                    image_file = create_image_from_url(image_url)
                if not image_file:
                    image_file = get_default_image()
                if image_file:
                    news.featured_media = image_file

                news.save()

                # Attach PDF documents from body
                if scraped_news.body:
                    soup = BeautifulSoup(scraped_news.body, "lxml")
                    pdf_urls: list[str] = []
                    for link in soup.find_all("a", href=True):
                        href = link.get("href", "")
                        if not href:
                            continue
                        resolved = normalize_media_url(href)
                        if not resolved:
                            continue
                        if urlparse(resolved).path.lower().endswith(".pdf"):
                            pdf_urls.append(resolved)
                    docs = []
                    for pdf_url in pdf_urls:
                        doc = create_document_from_url(pdf_url)
                        if doc:
                            docs.append(doc)
                    if docs:
                        news.attachments.add(*docs)

                # Update scraped news status
                scraped_news.status = ScrapedNews.Status.IMPORTED
                scraped_news.imported_news = news
                scraped_news.import_error = ""
                scraped_news.save(
                    update_fields=["status", "imported_news", "import_error"]
                )

                translation_errors: list[str] = []

                # Auto-translate if requested
                if data.get("auto_translate", False):
                    try:
                        from llm_translations.utils import translate_text

                        target_langs = [
                            lang[0]
                            for lang in settings.LANGUAGES
                            if lang[0] != primary_lang
                        ]

                        for target_lang in target_langs:
                            try:
                                trans_title = translate_text(
                                    text=news.title,
                                    source_lang=primary_lang,
                                    target_lang=target_lang,
                                )
                                trans_summary = (
                                    translate_text(
                                        text=news.summary,
                                        source_lang=primary_lang,
                                        target_lang=target_lang,
                                    )
                                    if news.summary
                                    else ""
                                )
                                trans_body = (
                                    translate_text(
                                        text=news.body,
                                        source_lang=primary_lang,
                                        target_lang=target_lang,
                                    )
                                    if news.body
                                    else ""
                                )

                                news.set_current_language(target_lang, initialize=True)
                                news.title = trans_title
                                news.summary = trans_summary
                                news.body = trans_body
                                news.save_translations()

                            except Exception as e:
                                translation_errors.append(f"{target_lang}: {e}")
                                logger.warning(
                                    f"Translation to {target_lang} failed: {e}"
                                )

                    except ImportError:
                        logger.warning("LLM translations module not available")
                        translation_errors = ["LLM translations module not available"]

                # Publish at the end (after translations) if requested
                if publish_requested and not translation_errors:
                    news.is_published = True
                    news.save(update_fields=["is_published"])

                logger.info(
                    f"Imported scraped news {scraped_news.id} as News {news.id}"
                )

                return Response(
                    {
                        "success": True,
                        "news_id": news.id,
                        "news_slug": news.slug,
                        "translation_errors": translation_errors,
                    },
                    status=status.HTTP_201_CREATED,
                )

        except Exception as e:
            logger.exception(f"Failed to import scraped news {scraped_news.id}: {e}")
            scraped_news.status = ScrapedNews.Status.ERROR
            scraped_news.import_error = str(e)
            scraped_news.save(update_fields=["status", "import_error"])

            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=False, methods=["post"], permission_classes=[IsAdminUser])
    def bulk_import(self, request):
        """
        Import multiple scraped news at once.

        POST /scraper/scraped-news/bulk_import/

        Body:
        - ids: list[int] - IDs of scraped news to import
        - auto_translate: bool (default: false)
        - publish: bool (default: false)
        """
        ids = request.data.get("ids", [])
        if not ids:
            return Response(
                {"success": False, "error": "No IDs provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        results = {"imported": [], "failed": [], "skipped": []}

        for scraped_id in ids:
            try:
                scraped_news = ScrapedNews.objects.get(id=scraped_id)

                if scraped_news.status == ScrapedNews.Status.IMPORTED:
                    results["skipped"].append(scraped_id)
                    continue

                # Use do_import logic but simplified
                from news.models import News, NewsCategorySingleton

                category = None
                try:
                    singleton = NewsCategorySingleton.objects.first()
                    if singleton:
                        category = singleton.category
                except Exception:
                    pass

                news = News(
                    is_published=request.data.get("publish", False),
                    category=category,
                    creado_por=request.user,
                    modificado_por=request.user,
                )
                news.set_current_language(settings.LANGUAGE_CODE, initialize=True)
                news.title = scraped_news.title
                news.summary = scraped_news.summary or ""
                news.body = scraped_news.body or ""
                news.save()

                scraped_news.status = ScrapedNews.Status.IMPORTED
                scraped_news.imported_news = news
                scraped_news.save(update_fields=["status", "imported_news"])

                results["imported"].append({"id": scraped_id, "news_id": news.id})

            except ScrapedNews.DoesNotExist:
                results["failed"].append({"id": scraped_id, "error": "Not found"})
            except Exception as e:
                results["failed"].append({"id": scraped_id, "error": str(e)})

        return Response(
            {
                "success": len(results["failed"]) == 0,
                "results": results,
            }
        )

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def stats(self, request):
        """
        Get statistics about scraped news.

        GET /scraper/scraped-news/stats/
        """
        from django.db.models import Count, Q

        stats = ScrapedNews.objects.values("status").annotate(count=Count("id"))
        by_source = (
            ScrapedNews.objects.values("source__slug", "source__name")
            .annotate(
                total=Count("id"),
                pending=Count("id", filter=Q(status=ScrapedNews.Status.PENDING)),
            )
            .order_by("-total")
        )

        return Response(
            {
                "by_status": {item["status"]: item["count"] for item in stats},
                "by_source": list(by_source),
                "total": ScrapedNews.objects.count(),
            }
        )
