"""Admin configuration for gamification models."""

from django.contrib import admin

from .models import EventCheckin, PointTransaction, UserPoints


@admin.register(UserPoints)
class UserPointsAdmin(admin.ModelAdmin):
    list_display = ("user", "total_points", "level", "events_completed")
    search_fields = ("user__username", "user__email")


@admin.register(PointTransaction)
class PointTransactionAdmin(admin.ModelAdmin):
    list_display = ("user", "points", "transaction_type", "event", "created_at")
    list_filter = ("transaction_type",)
    search_fields = ("user__username", "user__email", "description")


@admin.register(EventCheckin)
class EventCheckinAdmin(admin.ModelAdmin):
    list_display = ("user", "event", "points_awarded", "checked_in_at")
    search_fields = ("user__username", "user__email", "event__slug")
