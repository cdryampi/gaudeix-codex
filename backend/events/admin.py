from django.contrib import admin
from parler.admin import TranslatableAdmin

from .models import Event


@admin.register(Event)
class EventAdmin(TranslatableAdmin):
    list_display = ("__str__", "start_at", "end_at", "is_published")
    list_filter = ("is_published", "start_at")
    search_fields = ("translations__title", "slug")
    readonly_fields = ("created_at", "updated_at")
