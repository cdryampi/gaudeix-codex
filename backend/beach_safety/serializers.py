from __future__ import annotations

from rest_framework import serializers

from automations.models import AutomationRun

from .models import (
    BeachSafetyProposal,
    BeachSafetyStatus,
)


class UserSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    name = serializers.CharField(allow_blank=True)


class BeachSafetyProposalSerializer(serializers.ModelSerializer):
    reviewed_by = serializers.SerializerMethodField()

    class Meta:
        model = BeachSafetyProposal
        fields = [
            "id",
            "recommended_status",
            "review_status",
            "reasons",
            "weather_snapshot",
            "weather_source_updated_at",
            "recommendation_window_start",
            "recommendation_window_end",
            "proposed_at",
            "reviewed_at",
            "reviewed_by",
            "review_notes",
            "source_run",
        ]

    def get_reviewed_by(self, obj):
        if not obj.reviewed_by:
            return None
        return {
            "id": obj.reviewed_by.id,
            "username": obj.reviewed_by.username,
            "name": obj.reviewed_by.name,
        }


class BeachSafetyAutomationRunSerializer(serializers.ModelSerializer):
    weather_snapshot = serializers.SerializerMethodField()

    class Meta:
        model = AutomationRun
        fields = [
            "id",
            "trigger",
            "status",
            "window_key",
            "started_at",
            "finished_at",
            "summary",
            "error_message",
            "weather_snapshot",
        ]

    def get_weather_snapshot(self, obj):
        return obj.payload_snapshot or {}


class BeachSafetyStatusSerializer(serializers.ModelSerializer):
    published_by = serializers.SerializerMethodField()
    latest_pending_proposal = serializers.SerializerMethodField()
    latest_run = serializers.SerializerMethodField()

    class Meta:
        model = BeachSafetyStatus
        fields = [
            "id",
            "published_status",
            "published_notes",
            "published_at",
            "published_by",
            "latest_pending_proposal",
            "latest_run",
            "fecha_creacion",
            "fecha_modificacion",
        ]

    def get_published_by(self, obj):
        if not obj.published_by:
            return None
        return {
            "id": obj.published_by.id,
            "username": obj.published_by.username,
            "name": obj.published_by.name,
        }

    def get_latest_pending_proposal(self, obj):
        proposal = BeachSafetyProposal.objects.filter(
            review_status=BeachSafetyProposal.ReviewStatus.PENDING
        ).order_by("-proposed_at", "-id").first()
        if not proposal:
            return None
        return BeachSafetyProposalSerializer(proposal).data

    def get_latest_run(self, obj):
        run = (
            AutomationRun.objects.filter(
                automation__template_slug="beach_safety.evaluate_red_flag_proposal"
            )
            .order_by("-started_at", "-id")
            .first()
        )
        if not run:
            return None
        return BeachSafetyAutomationRunSerializer(run).data


class BeachSafetyProposalReviewSerializer(serializers.Serializer):
    review_notes = serializers.CharField(required=False, allow_blank=True, default="")
