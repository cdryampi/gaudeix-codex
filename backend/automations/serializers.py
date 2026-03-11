from __future__ import annotations

from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import AutomationJob, AutomationRun
from .registry import get_template_definition
from .services import create_or_update_job, validate_schedule_fields


class AutomationTemplateSerializer(serializers.Serializer):
    slug = serializers.CharField()
    name = serializers.CharField()
    description = serializers.CharField()
    category = serializers.CharField()
    default_interval_hours = serializers.IntegerField()
    supports_season_window = serializers.BooleanField()
    config_fields = serializers.ListField()
    editor_flow = serializers.DictField(allow_null=True)


class AutomationRunSerializer(serializers.ModelSerializer):
    step_results = serializers.SerializerMethodField()

    class Meta:
        model = AutomationRun
        fields = [
            "id",
            "automation",
            "trigger",
            "status",
            "started_at",
            "finished_at",
            "summary",
            "error_message",
            "payload_snapshot",
            "step_results",
            "window_key",
        ]

    def get_step_results(self, obj):
        return obj.payload_snapshot.get("step_results", [])


class AutomationJobSerializer(serializers.ModelSerializer):
    template = serializers.SerializerMethodField()
    latest_run = serializers.SerializerMethodField()

    class Meta:
        model = AutomationJob
        fields = [
            "id",
            "template_slug",
            "template",
            "name",
            "status",
            "interval_hours",
            "season_start_month",
            "season_end_month",
            "config",
            "last_run_at",
            "next_run_at",
            "last_run_status",
            "latest_run",
            "fecha_creacion",
            "fecha_modificacion",
        ]

    def get_template(self, obj):
        return get_template_definition(obj.template_slug).serialize()

    def get_latest_run(self, obj):
        run = obj.runs.order_by("-started_at", "-id").first()
        if not run:
            return None
        return AutomationRunSerializer(run).data


class AutomationJobWriteSerializer(serializers.Serializer):
    template_slug = serializers.CharField()
    name = serializers.CharField(required=False, allow_blank=True)
    status = serializers.ChoiceField(
        choices=AutomationJob.Status.choices,
        required=False,
        default=AutomationJob.Status.ACTIVE,
    )
    interval_hours = serializers.IntegerField(required=False)
    season_start_month = serializers.IntegerField(required=False, allow_null=True)
    season_end_month = serializers.IntegerField(required=False, allow_null=True)
    config = serializers.JSONField(required=False, default=dict)

    def validate(self, attrs):
        instance = getattr(self, "instance", None)
        template_slug = attrs.get("template_slug") or getattr(instance, "template_slug", None)
        definition = get_template_definition(template_slug)

        interval_hours = attrs.get("interval_hours")
        if interval_hours is None:
            if instance is not None:
                interval_hours = instance.interval_hours
            else:
                interval_hours = definition.default_interval_hours

        season_start_month = attrs.get(
            "season_start_month",
            instance.season_start_month if instance is not None else None,
        )
        season_end_month = attrs.get(
            "season_end_month",
            instance.season_end_month if instance is not None else None,
        )
        config = attrs.get("config", instance.config if instance is not None else {})
        name = attrs.get("name")
        if not name:
            name = instance.name if instance is not None else definition.name

        attrs["template_slug"] = template_slug
        attrs["name"] = name
        attrs["interval_hours"] = interval_hours
        attrs["season_start_month"] = season_start_month
        attrs["season_end_month"] = season_end_month
        try:
            attrs["config"] = validate_schedule_fields(
                template_slug=template_slug,
                interval_hours=interval_hours,
                season_start_month=season_start_month,
                season_end_month=season_end_month,
                config=config,
            )
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.message_dict or exc.messages) from exc
        return attrs

    def create(self, validated_data):
        return create_or_update_job(
            template_slug=validated_data["template_slug"],
            name=validated_data["name"],
            status=validated_data["status"],
            interval_hours=validated_data["interval_hours"],
            season_start_month=validated_data.get("season_start_month"),
            season_end_month=validated_data.get("season_end_month"),
            config=validated_data.get("config"),
        )

    def update(self, instance, validated_data):
        return create_or_update_job(
            job=instance,
            template_slug=validated_data["template_slug"],
            name=validated_data["name"],
            status=validated_data.get("status", instance.status),
            interval_hours=validated_data["interval_hours"],
            season_start_month=validated_data.get("season_start_month"),
            season_end_month=validated_data.get("season_end_month"),
            config=validated_data.get("config"),
        )
