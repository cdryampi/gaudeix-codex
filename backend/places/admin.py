from django.contrib import admin
from parler.admin import TranslatableAdmin
from solo.admin import SingletonModelAdmin

from .models import Place, PlaceCategorySingleton


@admin.register(PlaceCategorySingleton)
class PlaceCategorySingletonAdmin(SingletonModelAdmin):
    """Admin for the Places Category singleton."""

    fields = ("category",)

    def has_add_permission(self, request):
        """Only one instance allowed."""
        return not PlaceCategorySingleton.objects.exists()

    def has_delete_permission(self, request, obj=None):
        """Cannot delete the singleton."""
        return False


@admin.register(Place)
class PlaceAdmin(TranslatableAdmin):
    list_display = ("__str__", "category", "is_published", "latitude", "longitude")
    list_filter = ("is_published", "category")
    search_fields = ("translations__title", "slug")
    readonly_fields = ("slug", "fecha_creacion", "fecha_modificacion", "creado_por", "modificado_por")

    fieldsets = (
        (None, {"fields": ("category", "is_published")}),
        ("Location", {"fields": ("location_text", "latitude", "longitude")}),
        ("Content", {"fields": ("title", "description")}),
        (
            "Contact",
            {"fields": ("phone", "email", "website", "booking_url"), "classes": ("collapse",)},
        ),
        ("Media", {"fields": ("featured_media", "attachments"), "classes": ("collapse",)}),
        (
            "Metadata",
            {
                "fields": ("slug", "fecha_creacion", "fecha_modificacion", "creado_por", "modificado_por"),
                "classes": ("collapse",),
            },
        ),
    )
