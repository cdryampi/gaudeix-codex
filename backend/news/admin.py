from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from parler.admin import TranslatableAdmin
from .models import News

@admin.register(News)
class NewsAdmin(TranslatableAdmin):
    list_display = ("title", "published_at", "is_published")
    search_fields = ("translations__title", "translations__summary")
    list_filter = ("is_published", "published_at")
    fieldsets = (
        (None, {"fields": ("slug", "is_published", "published_at")}),
        (_("Content"), {"fields": ("title", "summary", "body", "featured_media")}),
    )

    def get_prepopulated_fields(self, request, obj=None):
        return {"slug": ("title",)}
