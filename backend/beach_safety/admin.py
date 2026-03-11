from django.contrib import admin
from solo.admin import SingletonModelAdmin

from .models import BeachSafetyProposal, BeachSafetyStatus


@admin.register(BeachSafetyStatus)
class BeachSafetyStatusAdmin(SingletonModelAdmin):
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "published_status",
                    "published_notes",
                    "published_at",
                    "published_by",
                )
            },
        ),
    )
    readonly_fields = ("published_at",)


@admin.register(BeachSafetyProposal)
class BeachSafetyProposalAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "recommended_status",
        "review_status",
        "proposed_at",
        "reviewed_at",
        "reviewed_by",
    )
    list_filter = ("recommended_status", "review_status")
    search_fields = ("review_notes",)
    readonly_fields = ("proposed_at", "reviewed_at")
