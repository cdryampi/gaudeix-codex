"""Admin configuration for the routes app."""

from django.contrib import admin
from parler.admin import TranslatableAdmin
from solo.admin import SingletonModelAdmin

from .models import Route, RouteCategorySingleton, RouteWaypoint


@admin.register(RouteCategorySingleton)
class RouteCategorySingletonAdmin(SingletonModelAdmin):
    """Admin for the Routes Category singleton."""

    fields = ("category",)

    def has_add_permission(self, request):
        """Only one instance allowed."""
        return not RouteCategorySingleton.objects.exists()

    def has_delete_permission(self, request, obj=None):
        """Cannot delete the singleton."""
        return False


class RouteWaypointInline(admin.TabularInline):
    """Inline admin for route waypoints."""

    model = RouteWaypoint
    extra = 1
    fields = ("order", "place", "instructions", "distance_from_previous_km")
    ordering = ("order",)
    autocomplete_fields = ["place"]


@admin.register(Route)
class RouteAdmin(TranslatableAdmin):
    """Admin for Route model."""

    list_display = (
        "__str__",
        "category",
        "route_type",
        "difficulty",
        "distance_km",
        "duration_minutes",
        "is_published",
        "is_featured",
    )
    list_filter = (
        "is_published",
        "is_featured",
        "route_type",
        "difficulty",
        "is_circular",
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
    inlines = [RouteWaypointInline]
    filter_horizontal = ("tags", "attachments", "gallery")

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "category",
                    "route_type",
                    "difficulty",
                    "is_published",
                    "is_featured",
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
                    "instructions",
                )
            },
        ),
        (
            "Technical Details",
            {
                "fields": (
                    "distance_km",
                    "duration_minutes",
                    "elevation_gain",
                    "elevation_loss",
                    "is_circular",
                )
            },
        ),
        (
            "Geolocation",
            {
                "fields": (
                    ("start_latitude", "start_longitude"),
                    ("end_latitude", "end_longitude"),
                ),
                "classes": ("collapse",),
            },
        ),
        (
            "GPS Track",
            {
                "fields": ("gpx_file", "track_geojson"),
                "classes": ("collapse",),
            },
        ),
        (
            "Media",
            {
                "fields": ("featured_media", "gallery", "attachments", "tags"),
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
