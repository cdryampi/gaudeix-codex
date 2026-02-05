"""
Admin configuration for the scraper app.

Provides admin interfaces for ScraperSource and ScrapedNews models
with filtering, search, and bulk actions.
"""

from django.contrib import admin
from django.utils.html import format_html

from .models import ScraperSource, ScrapedNews


@admin.register(ScraperSource)
class ScraperSourceAdmin(admin.ModelAdmin):
    """Admin interface for ScraperSource model."""

    list_display = ["name", "slug", "is_active", "last_scraped_at", "created_at"]
    list_filter = ["is_active"]
    search_fields = ["name", "slug", "base_url"]
    readonly_fields = ["created_at", "updated_at"]
    ordering = ["name"]

    fieldsets = [
        (None, {"fields": ["name", "slug", "base_url", "news_path", "is_active"]}),
        ("Configuration", {"fields": ["config"], "classes": ["collapse"]}),
        (
            "Timestamps",
            {
                "fields": ["last_scraped_at", "created_at", "updated_at"],
                "classes": ["collapse"],
            },
        ),
    ]


@admin.register(ScrapedNews)
class ScrapedNewsAdmin(admin.ModelAdmin):
    """Admin interface for ScrapedNews model."""

    list_display = [
        "title_truncated",
        "source",
        "status",
        "published_at",
        "is_imported_display",
        "scraped_at",
    ]
    list_filter = ["status", "source", "scraped_at"]
    search_fields = ["title", "summary", "external_id"]
    readonly_fields = [
        "source_url",
        "external_id",
        "scraped_at",
        "updated_at",
        "raw_html",
        "raw_metadata",
        "featured_image_preview",
    ]
    raw_id_fields = ["source", "imported_news"]
    ordering = ["-scraped_at"]
    date_hierarchy = "scraped_at"
    actions = ["mark_as_pending", "mark_as_skipped"]

    fieldsets = [
        (
            None,
            {"fields": ["source", "status", "imported_news", "import_error"]},
        ),
        (
            "Content",
            {"fields": ["title", "summary", "body", "published_at"]},
        ),
        (
            "Media",
            {
                "fields": [
                    "featured_image_url",
                    "featured_image_preview",
                    "gallery_image_urls",
                ],
            },
        ),
        (
            "Source Info",
            {
                "fields": ["source_url", "external_id", "scraped_at", "updated_at"],
                "classes": ["collapse"],
            },
        ),
        (
            "Raw Data",
            {
                "fields": ["raw_html", "raw_metadata"],
                "classes": ["collapse"],
            },
        ),
    ]

    def title_truncated(self, obj):
        """Display truncated title."""
        if len(obj.title) > 60:
            return f"{obj.title[:60]}..."
        return obj.title

    title_truncated.short_description = "Title"

    def is_imported_display(self, obj):
        """Display import status with icon."""
        if obj.is_imported:
            return format_html('<span style="color: green;">&#10004;</span>')
        return format_html('<span style="color: gray;">-</span>')

    is_imported_display.short_description = "Imported"

    def featured_image_preview(self, obj):
        """Show preview of featured image."""
        if obj.featured_image_url:
            return format_html(
                '<img src="{}" style="max-width: 300px; max-height: 200px;" />',
                obj.featured_image_url,
            )
        return "-"

    featured_image_preview.short_description = "Image Preview"

    @admin.action(description="Mark selected as pending")
    def mark_as_pending(self, request, queryset):
        """Bulk action to mark news as pending."""
        updated = queryset.update(status=ScrapedNews.Status.PENDING)
        self.message_user(request, f"{updated} item(s) marked as pending.")

    @admin.action(description="Mark selected as skipped")
    def mark_as_skipped(self, request, queryset):
        """Bulk action to mark news as skipped."""
        updated = queryset.update(status=ScrapedNews.Status.SKIPPED)
        self.message_user(request, f"{updated} item(s) marked as skipped.")
