from django.contrib import admin
from parler.admin import TranslatableAdmin

from .models import Category, Tag


@admin.register(Category)
class CategoryAdmin(TranslatableAdmin):
    """Admin para el modelo Category con soporte de traducciones."""

    list_display = (
        "slug",
        "get_nombre",
        "taxonomy",
        "parent",
        "icon",
        "fecha_creacion",
        "fecha_modificacion",
    )

    search_fields = (
        "slug",
        "translations__nombre",
        "taxonomy",
    )

    list_filter = (
        "taxonomy",
        "parent",
        "is_published",
        "fecha_creacion",
    )

    readonly_fields = (
        "creado_por",
        "modificado_por",
        "fecha_creacion",
        "fecha_modificacion",
    )

    fieldsets = (
        ("Informació bàsica", {"fields": ("slug", "taxonomy", "parent", "icon", "is_published")}),
        ("Contingut traduïble", {"fields": ("nombre", "descripcion")}),
        ("Media", {"fields": ("featured_media", "attachments"), "classes": ("collapse",)}),
        ("Metadades SEO", {"fields": ("metatitulo", "metadescripcion"), "classes": ("collapse",)}),
        (
            "Auditoria",
            {
                "fields": ("creado_por", "modificado_por", "fecha_creacion", "fecha_modificacion"),
                "classes": ("collapse",),
            },
        ),
    )

    def get_nombre(self, obj):
        """Obtiene el nombre en cualquier idioma disponible."""
        return obj.safe_translation_getter("nombre", any_language=True) or "-"

    get_nombre.short_description = "Nom"


@admin.register(Tag)
class TagAdmin(TranslatableAdmin):
    """Admin para el modelo Tag con soporte de traducciones."""

    list_display = (
        "slug",
        "get_nombre",
        "fecha_creacion",
        "fecha_modificacion",
    )

    search_fields = (
        "slug",
        "translations__nombre",
    )

    list_filter = ("fecha_creacion",)

    readonly_fields = (
        "creado_por",
        "modificado_por",
        "fecha_creacion",
        "fecha_modificacion",
    )

    fieldsets = (
        ("Informació bàsica", {"fields": ("slug",)}),
        ("Contingut traduïble", {"fields": ("nombre",)}),
        (
            "Auditoria",
            {
                "fields": ("creado_por", "modificado_por", "fecha_creacion", "fecha_modificacion"),
                "classes": ("collapse",),
            },
        ),
    )

    def get_nombre(self, obj):
        """Obtiene el nombre en cualquier idioma disponible."""
        return obj.safe_translation_getter("nombre", any_language=True) or "-"

    get_nombre.short_description = "Nom"
