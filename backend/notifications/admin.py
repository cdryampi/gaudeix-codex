"""Admin configuration for notifications models."""

from django.contrib import admin

from .models import DeviceToken, Notification


@admin.register(DeviceToken)
class DeviceTokenAdmin(admin.ModelAdmin):
    list_display = ("user", "platform", "is_active", "last_used")
    list_filter = ("platform", "is_active")
    search_fields = ("user__username", "token")


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("title", "notification_type", "user", "read", "sent_at")
    list_filter = ("notification_type", "read")
    search_fields = ("title", "body", "user__username")
