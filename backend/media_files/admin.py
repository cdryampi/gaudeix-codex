from django.contrib import admin

from .models import DocumentFile, ImageFile


@admin.register(ImageFile)
class ImageFileAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "original_name",
        "mime_type",
        "size_bytes",
        "created_at",
    )
    search_fields = ("original_name", "mime_type")
    readonly_fields = ("created_at", "updated_at")


@admin.register(DocumentFile)
class DocumentFileAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "original_name",
        "mime_type",
        "size_bytes",
        "created_at",
    )
    search_fields = ("original_name", "mime_type")
    readonly_fields = ("created_at", "updated_at")
