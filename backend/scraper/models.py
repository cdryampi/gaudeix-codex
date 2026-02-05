"""
Models for the scraper app.

ScraperSource: Configuration for each municipality scraper.
ScrapedNews: Raw scraped news data before import.
"""

from django.db import models
from django.utils.translation import gettext_lazy as _


class ScraperSource(models.Model):
    """
    Configuration for a news source (municipality website).

    Each source has an associated parser class that knows how to
    extract news from that specific website structure.
    """

    name = models.CharField(
        _("Name"),
        max_length=100,
        help_text=_("Display name of the source (e.g., 'Cabrera de Mar')"),
    )
    slug = models.SlugField(
        _("Slug"),
        unique=True,
        help_text=_("Unique identifier matching the parser slug"),
    )
    base_url = models.URLField(
        _("Base URL"),
        help_text=_("Base URL of the municipality website"),
    )
    news_path = models.CharField(
        _("News path"),
        max_length=200,
        default="/actualitat/noticies",
        help_text=_("Path to the news listing page"),
    )
    is_active = models.BooleanField(
        _("Active"),
        default=True,
        help_text=_("Whether this source should be scraped"),
    )
    last_scraped_at = models.DateTimeField(
        _("Last scraped"),
        null=True,
        blank=True,
    )
    config = models.JSONField(
        _("Configuration"),
        default=dict,
        blank=True,
        help_text=_("Parser-specific configuration as JSON"),
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Scraper Source")
        verbose_name_plural = _("Scraper Sources")
        ordering = ["name"]

    def __str__(self):
        return self.name

    @property
    def full_news_url(self) -> str:
        """Full URL to the news listing page."""
        return f"{self.base_url.rstrip('/')}{self.news_path}"


class ScrapedNews(models.Model):
    """
    Raw scraped news data.

    This stores the original scraped content before it's imported
    into the main News model. Allows review and re-import if needed.
    """

    class Status(models.TextChoices):
        PENDING = "pending", _("Pending")
        IMPORTED = "imported", _("Imported")
        SKIPPED = "skipped", _("Skipped")
        ERROR = "error", _("Error")

    source = models.ForeignKey(
        ScraperSource,
        on_delete=models.CASCADE,
        related_name="scraped_news",
        verbose_name=_("Source"),
    )
    source_url = models.URLField(
        _("Source URL"),
        help_text=_("Original URL of the news article"),
    )
    external_id = models.CharField(
        _("External ID"),
        max_length=200,
        help_text=_("Unique identifier from the source (usually slug or path)"),
    )

    # Scraped content
    title = models.CharField(_("Title"), max_length=500)
    summary = models.TextField(_("Summary"), blank=True)
    body = models.TextField(_("Body"), blank=True, help_text=_("Full HTML content"))
    published_at = models.DateTimeField(_("Published at"), null=True, blank=True)

    # Media
    featured_image_url = models.URLField(_("Featured image URL"), blank=True)
    gallery_image_urls = models.JSONField(
        _("Gallery image URLs"),
        default=list,
        blank=True,
    )

    # Import status
    status = models.CharField(
        _("Status"),
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    imported_news = models.ForeignKey(
        "news.News",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="scraped_source",
        verbose_name=_("Imported news"),
    )
    import_error = models.TextField(_("Import error"), blank=True)

    # Raw data backup
    raw_html = models.TextField(_("Raw HTML"), blank=True)
    raw_metadata = models.JSONField(_("Raw metadata"), default=dict, blank=True)

    # Timestamps
    scraped_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Scraped News")
        verbose_name_plural = _("Scraped News")
        ordering = ["-published_at", "-scraped_at"]
        unique_together = ["source", "external_id"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["source", "status"]),
        ]

    def __str__(self):
        return f"[{self.source.slug}] {self.title[:50]}"

    @property
    def is_imported(self) -> bool:
        return self.status == self.Status.IMPORTED


class ScrapeJob(models.Model):
    """
    Tracks the progress and status of a scraping background job.
    """

    class Status(models.TextChoices):
        PENDING = "pending", _("Pending")
        RUNNING = "running", _("Running")
        COMPLETED = "completed", _("Completed")
        FAILED = "failed", _("Failed")
        CANCELLING = "cancelling", _("Cancelling")
        CANCELLED = "cancelled", _("Cancelled")

    source = models.ForeignKey(
        ScraperSource,
        on_delete=models.CASCADE,
        related_name="scrape_jobs",
        verbose_name=_("Source"),
    )
    status = models.CharField(
        _("Status"),
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    progress = models.IntegerField(
        _("Progress"),
        default=0,
        help_text=_("Progress percentage (0-100)"),
    )
    max_pages = models.IntegerField(
        _("Max pages"),
        help_text=_("Maximum number of pages to scrape"),
    )
    pages_scraped = models.IntegerField(_("Pages scraped"), default=0)
    news_found = models.IntegerField(_("News found"), default=0)
    news_created = models.IntegerField(_("News created"), default=0)
    news_updated = models.IntegerField(_("News updated"), default=0)
    news_skipped = models.IntegerField(_("News skipped"), default=0)
    error_message = models.TextField(_("Error message"), blank=True)

    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _("Scrape Job")
        verbose_name_plural = _("Scrape Jobs")
        ordering = ["-started_at"]

    def __str__(self):
        return f"[{self.source.slug}] {self.status} ({self.progress}%)"
