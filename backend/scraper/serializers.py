"""
Serializers for scraper API endpoints.
"""

from rest_framework import serializers
from .models import ScraperSource, ScrapedNews, ScrapeJob


class ScraperSourceSerializer(serializers.ModelSerializer):
    """Serializer for ScraperSource model."""

    news_count = serializers.SerializerMethodField()
    pending_count = serializers.SerializerMethodField()

    class Meta:
        model = ScraperSource
        fields = [
            "id",
            "name",
            "slug",
            "base_url",
            "news_path",
            "is_active",
            "last_scraped_at",
            "config",
            "created_at",
            "updated_at",
            "full_news_url",
            "news_count",
            "pending_count",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "full_news_url"]

    def get_news_count(self, obj):
        return obj.scraped_news.count()

    def get_pending_count(self, obj):
        return obj.scraped_news.filter(status=ScrapedNews.Status.PENDING).count()


class ScrapedNewsListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""

    source_name = serializers.CharField(source="source.name", read_only=True)
    source_slug = serializers.CharField(source="source.slug", read_only=True)

    class Meta:
        model = ScrapedNews
        fields = [
            "id",
            "source",
            "source_name",
            "source_slug",
            "source_url",
            "external_id",
            "title",
            "summary",
            "published_at",
            "featured_image_url",
            "status",
            "is_imported",
            "imported_news",
            "scraped_at",
            "updated_at",
        ]
        read_only_fields = fields


class ScrapedNewsDetailSerializer(serializers.ModelSerializer):
    """Full serializer for detail views."""

    source_name = serializers.CharField(source="source.name", read_only=True)
    source_slug = serializers.CharField(source="source.slug", read_only=True)
    imported_news_title = serializers.SerializerMethodField()

    class Meta:
        model = ScrapedNews
        fields = [
            "id",
            "source",
            "source_name",
            "source_slug",
            "source_url",
            "external_id",
            "title",
            "summary",
            "body",
            "published_at",
            "featured_image_url",
            "gallery_image_urls",
            "status",
            "is_imported",
            "imported_news",
            "imported_news_title",
            "import_error",
            "raw_metadata",
            "scraped_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_imported_news_title(self, obj):
        if obj.imported_news:
            return obj.imported_news.title
        return None


class ScrapedNewsUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating scraped news (status changes)."""

    class Meta:
        model = ScrapedNews
        fields = ["status"]


class ImportScrapedNewsSerializer(serializers.Serializer):
    """Serializer for import action request."""

    auto_translate = serializers.BooleanField(default=False)
    publish = serializers.BooleanField(default=False)
    category_id = serializers.IntegerField(required=False, allow_null=True)


class ImportResultSerializer(serializers.Serializer):
    """Serializer for import action response."""

    success = serializers.BooleanField()
    news_id = serializers.IntegerField(required=False)
    news_slug = serializers.CharField(required=False)
    error = serializers.CharField(required=False)


class ScrapeJobSerializer(serializers.ModelSerializer):
    """Serializer for ScrapeJob model."""

    source_name = serializers.CharField(source="source.name", read_only=True)

    class Meta:
        model = ScrapeJob
        fields = [
            "id",
            "source",
            "source_name",
            "status",
            "progress",
            "max_pages",
            "pages_scraped",
            "news_found",
            "news_created",
            "news_updated",
            "news_skipped",
            "error_message",
            "started_at",
            "completed_at",
        ]
        read_only_fields = fields
