from django.contrib import admin
from parler.admin import TranslatableAdmin
from solo.admin import SingletonModelAdmin

from .models import Event, EventCategorySingleton


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


@admin.register(Event)
class EventAdmin(TranslatableAdmin):
    list_display = ("__str__", "category", "start_at", "end_at", "is_published")
    list_filter = ("is_published", "start_at", "category")
    search_fields = ("translations__title", "slug")
    readonly_fields = ("slug", "fecha_creacion", "fecha_modificacion", "creado_por", "modificado_por")
    
    fieldsets = (
        (None, {
            "fields": ("category", "start_at", "end_at", "is_published")
        }),
        ("Content", {
            "fields": ("title", "description", "location_text")
        }),
        ("Media", {
            "fields": ("featured_media", "attachments"),
            "classes": ("collapse",)
        }),
        ("Metadata", {
            "fields": ("slug", "fecha_creacion", "fecha_modificacion", "creado_por", "modificado_por"),
            "classes": ("collapse",)
        }),
    )
