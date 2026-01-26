from django.contrib import admin
from parler.admin import TranslatableAdmin
from solo.admin import SingletonModelAdmin

from .models import Event, EventCategorySingleton, EventDate


@admin.register(EventCategorySingleton)
class EventCategorySingletonAdmin(SingletonModelAdmin):
    """Admin for the Events Category singleton."""

    fields = ("category",)

    def has_add_permission(self, request):
        """Only one instance allowed."""
        return not EventCategorySingleton.objects.exists()

    def has_delete_permission(self, request, obj=None):
        """Cannot delete the singleton."""
        return False


class EventDateInline(admin.TabularInline):
    model = EventDate
    extra = 1
    fields = ("start_at", "end_at")
    ordering = ("start_at",)


@admin.register(Event)
class EventAdmin(TranslatableAdmin):
    list_display = (
        "__str__",
        "category",
        "start_at",
        "end_at",
        "is_published",
        "is_featured",
        "is_free",
    )
    list_filter = ("is_published", "is_featured", "is_free", "start_at", "category")
    search_fields = ("translations__title", "slug")
    readonly_fields = (
        "slug",
        "fecha_creacion",
        "fecha_modificacion",
        "creado_por",
        "modificado_por",
    )
    inlines = [EventDateInline]

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "category",
                    "start_at",
                    "end_at",
                    "is_published",
                    "is_featured",
                    "is_free",
                    "price_text",
                )
            },
        ),
        (
            "Content",
            {
                "fields": (
                    "title",
                    "summary",
                    "description",
                    "venue_name",
                    "location_text",
                )
            },
        ),
        (
            "Media",
            {
                "fields": ("featured_media", "attachments", "tags"),
                "classes": ("collapse",),
            },
        ),
        (
            "Metadata",
            {
                "fields": (
                    "slug",
                    "fecha_creacion",
                    "fecha_modificacion",
                    "creado_por",
                    "modificado_por",
                ),
                "classes": ("collapse",),
            },
        ),
    )
