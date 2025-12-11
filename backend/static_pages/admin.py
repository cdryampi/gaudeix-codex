from django.contrib import admin
from parler.admin import TranslatableAdmin

from .models import StaticPage


@admin.register(StaticPage)
class StaticPageAdmin(TranslatableAdmin):
    list_display = (
        "slug",
        "template",
        "get_titulo",
        "is_published",
        "featured_media",
        "attachment",
        "fecha_creacion",
    )
    list_filter = ("template", "is_published")
    search_fields = ("slug", "template", "translations__titulo")
    readonly_fields = ("creado_por", "modificado_por", "fecha_creacion", "fecha_modificacion")
    raw_id_fields = ("featured_media", "attachment")

    fieldsets = (
        ("Básico", {"fields": ("slug", "template", "is_published")}),
        ("Contenido", {"fields": ("titulo", "cuerpo")}),
        ("Media", {"fields": ("featured_media", "attachment")}),
        ("SEO", {"fields": ("metatitulo", "metadescripcion"), "classes": ("collapse",)}),
        (
            "Auditoría",
            {
                "fields": ("creado_por", "modificado_por", "fecha_creacion", "fecha_modificacion"),
                "classes": ("collapse",),
            },
        ),
    )

    def get_titulo(self, obj):
        return obj.safe_translation_getter("titulo", any_language=True) or "-"

    get_titulo.short_description = "Título"
