from django.contrib import admin

from .models import AutomationJob, AutomationRun


@admin.register(AutomationJob)
class AutomationJobAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "template_slug",
        "status",
        "interval_hours",
        "next_run_at",
        "last_run_status",
    )
    list_filter = ("status", "template_slug", "last_run_status")
    search_fields = ("name", "template_slug")


@admin.register(AutomationRun)
class AutomationRunAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "automation",
        "trigger",
        "status",
        "started_at",
        "finished_at",
    )
    list_filter = ("trigger", "status", "automation__template_slug")
    search_fields = ("automation__name", "automation__template_slug", "summary", "error_message")
