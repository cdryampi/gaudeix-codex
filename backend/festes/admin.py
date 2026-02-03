"""Admin configuration for the festes app."""

from django.contrib import admin
from parler.admin import TranslatableAdmin
from solo.admin import SingletonModelAdmin

from .models import Festa, FestaCategorySingleton, Sponsor


@admin.register(FestaCategorySingleton)
class FestaCategorySingletonAdmin(SingletonModelAdmin):
    """Admin for the Festes Category singleton."""

    fields = ("category",)

    def has_add_permission(self, request):
        """Only one instance allowed."""
        return not FestaCategorySingleton.objects.exists()

    def has_delete_permission(self, request, obj=None):
        """Cannot delete the singleton."""
        return False


class SponsorInline(admin.TabularInline):
    """Inline admin for festa sponsors."""

    model = Sponsor
    extra = 1
    fields = ("order", "name", "tier", "logo", "website")
    ordering = ("tier", "order")


@admin.register(Festa)
class FestaAdmin(TranslatableAdmin):
    """Admin for Festa model."""

    list_display = (
        "__str__",
        "category",
        "year",
        "start_date",
        "end_date",
        "is_published",
        "is_featured",
        "is_current",
    )
    list_filter = (
        "is_published",
        "is_featured",
        "is_current",
        "year",
        "category",
    )
    search_fields = ("translations__title", "slug")
    readonly_fields = (
        "slug",
        "fecha_creacion",
        "fecha_modificacion",
        "creado_por",
        "modificado_por",
    )
    inlines = [SponsorInline]
    filter_horizontal = ("tags", "gallery", "events")

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "category",
                    "year",
                    ("start_date", "end_date"),
                    "is_published",
                    "is_featured",
                    "is_current",
                )
            },
        ),
        (
            "Content",
            {
                "fields": (
                    "title",
                    "subtitle",
                    "summary",
                    "description",
                    "program_text",
                )
            },
        ),
        (
            "Media",
            {
                "fields": (
                    "featured_media",
                    "poster",
                    "program_pdf",
                    "gallery",
                ),
                "classes": ("collapse",),
            },
        ),
        (
            "Events",
            {
                "fields": ("events", "tags"),
                "classes": ("collapse",),
            },
        ),
        (
            "Metadata",
            {
                "fields": (
                    "slug",
                    "metatitulo",
                    "metadescripcion",
                    "fecha_creacion",
                    "fecha_modificacion",
                    "creado_por",
                    "modificado_por",
                ),
                "classes": ("collapse",),
            },
        ),
    )


@admin.register(Sponsor)
class SponsorAdmin(admin.ModelAdmin):
    """Admin for Sponsor model."""

    list_display = ("name", "festa", "tier", "order")
    list_filter = ("tier", "festa")
    search_fields = ("name", "festa__translations__title")
    ordering = ("festa", "tier", "order")
