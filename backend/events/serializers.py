from __future__ import annotations

from django.conf import settings
from django.utils import timezone
from rest_framework import serializers
from parler_rest.serializers import TranslatableModelSerializer, TranslatedFieldsField

from core.models import Category, Tag
from site_settings.models_weather import MunicipalityWeather
from core.serializers import TagSerializer
from media_files.models import DocumentFile, ImageFile
from media_files.serializers import DocumentFileSerializer, ImageFileSerializer

from .models import Event, EventDate


class EventTranslationSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    summary = serializers.CharField(required=False, allow_blank=True, max_length=280)
    description = serializers.CharField(required=False, allow_blank=True)


class EventDateSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)  # Allow passing ID for updates

    class Meta:
        model = EventDate
        fields = ["id", "start_at", "end_at"]


class EventSerializer(TranslatableModelSerializer):
    translations = TranslatedFieldsField(
        shared_model=Event,
        serializer_class=EventTranslationSerializer,
        required=False,
    )
    dates = EventDateSerializer(many=True, required=False)
    category = serializers.PrimaryKeyRelatedField(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        allow_null=True,
        required=False,
        write_only=True,
    )
    category_slug = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        many=True,
        required=False,
        write_only=True,
    )
    featured_media = ImageFileSerializer(read_only=True)
    featured_media_id = serializers.PrimaryKeyRelatedField(
        queryset=ImageFile.objects.all(),
        allow_null=True,
        required=False,
        write_only=True,
    )
    attachments = DocumentFileSerializer(many=True, read_only=True)
    attachments_ids = serializers.PrimaryKeyRelatedField(
        queryset=DocumentFile.objects.all(),
        many=True,
        required=False,
        write_only=True,
    )
    is_future = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    favorites_count = serializers.IntegerField(read_only=True)
    occurrences_count = serializers.IntegerField(read_only=True)
    event_status = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    weather_forecast = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id",
            "slug",
            "category",
            "category_id",
            "category_slug",
            "category_name",
            "title",
            "summary",
            "description",
            "start_at",
            "end_at",
            "is_published",
            "points_value",
            "venue_name",
            "location_text",
            "is_outdoor",
            "is_featured",
            "is_free",
            "price",
            "price_text",
            "tags",
            "tag_ids",
            "featured_media",
            "featured_media_id",
            "attachments",
            "attachments_ids",
            "created_at",
            "updated_at",
            "is_future",
            "is_favorited",
            "favorites_count",
            "occurrences_count",
            "event_status",
            "image_url",
            "weather_forecast",
            "translations",
            "dates",
        ]
        read_only_fields = [
            "id",
            "slug",
            "category",
            "category_slug",
            "category_name",
            "tags",
            "created_at",
            "updated_at",
            "is_future",
            "is_favorited",
            "favorites_count",
            "occurrences_count",
            "featured_media",
            "attachments",
            "image_url",
            "weather_forecast",
        ]

    def get_is_future(self, obj: Event) -> bool:
        return obj.is_future()

    def get_event_status(self, obj: Event) -> str:
        """
        Returns the status of the event based on its sessions.
        - upcoming: has future sessions.
        - ongoing: has a session currently happening.
        - finished: all sessions are in the past.
        """
        now = timezone.now()
        dates = obj.dates.all()

        if not dates:
            return "upcoming"

        has_future = any(d.start_at > now for d in dates)
        if has_future:
            return "upcoming"

        has_ongoing = any(
            d.start_at <= now and (d.end_at is None or d.end_at >= now) for d in dates
        )
        if has_ongoing:
            return "ongoing"

        return "finished"

    def get_weather_forecast(self, obj: Event):
        """
        Returns the weather forecast for the event's start date
        if it's an outdoor event and within 7-10 days.
        """
        if not obj.is_outdoor or not obj.start_at:
            return None

        if not hasattr(self, "_cached_weather"):
            self._cached_weather = MunicipalityWeather.objects.order_by("-updated_at").first()

        weather = self._cached_weather
        if not weather:
            return None

        event_date_str = obj.start_at.strftime("%Y-%m-%d")
        days = weather.forecast_data.get("days", [])

        # Find matching day in forecast
        for day in days:
            if day.get("datetime") == event_date_str:
                return day

        return None

    def get_is_favorited(self, obj: Event) -> bool:
        if hasattr(obj, "is_favorited"):
            return bool(obj.is_favorited)
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False

    def get_category_slug(self, obj: Event) -> str:
        if not obj.category_id:
            return ""
        return obj.category.slug

    def get_category_name(self, obj: Event) -> str:
        if not obj.category_id:
            return ""
        return (
            obj.category.safe_translation_getter("nombre", any_language=True)
            or obj.category.slug
        )

    def get_image_url(self, obj: Event) -> str:
        if not obj.featured_media_id:
            return ""
        try:
            data = ImageFileSerializer(obj.featured_media, context=self.context).data
            return (
                data.get("variant_large")
                or data.get("variant_medium")
                or data.get("file")
                or data.get("thumbnail_url")
                or data.get("variant_thumbnail")
                or ""
            )
        except Exception:
            return ""

    def save(self, **kwargs):
        translated_data = self._pop_translated_data()
        base_language = settings.LANGUAGE_CODE
        base_values = {}
        if "title" in self.initial_data:
            base_values["title"] = self.initial_data.get("title")
        if "summary" in self.initial_data:
            base_values["summary"] = self.initial_data.get("summary")
        if "description" in self.initial_data:
            base_values["description"] = self.initial_data.get("description")
        if base_values:
            translations = translated_data.get("translations") or {}
            translations[base_language] = {
                **translations.get(base_language, {}),
                **base_values,
            }
            translated_data["translations"] = translations

        instance = serializers.ModelSerializer.save(self, **kwargs)
        self.save_translations(instance, translated_data)
        return instance

    def validate(self, data):
        """
        Validate that the event has at least one date.
        """
        # For updates, we check if dates are provided or already exist
        # For creation, dates must be provided
        dates = data.get("dates")

        if self.instance:
            # Update: if dates is provided, it must not be empty
            # If not provided, the existing ones stay, so it's fine.
            if dates is not None and len(dates) == 0:
                raise serializers.ValidationError(
                    {"dates": "El evento debe tener al menos una fecha."}
                )
        else:
            # Creation: dates must be provided and not empty
            if not dates or len(dates) == 0:
                raise serializers.ValidationError(
                    {"dates": "Debes añadir al menos una fecha para crear el evento."}
                )

        return data

    def create(self, validated_data):
        dates_data = validated_data.pop("dates", [])
        attachments = validated_data.pop("attachments_ids", [])
        tags = validated_data.pop("tag_ids", [])
        translations_data = validated_data.pop("translations", None)
        category = validated_data.pop("category_id", None)
        base_language = settings.LANGUAGE_CODE
        title = validated_data.pop("title", None) or self.initial_data.get("title")
        summary = validated_data.pop("summary", None) or self.initial_data.get(
            "summary"
        )
        description = validated_data.pop("description", None) or self.initial_data.get(
            "description"
        )
        featured_media = validated_data.pop("featured_media_id", None)

        if featured_media is None and self.initial_data.get("featured_media"):
            featured_media = ImageFile.objects.filter(
                pk=self.initial_data.get("featured_media")
            ).first()
        if not attachments and self.initial_data.get("attachments"):
            attachments = list(
                DocumentFile.objects.filter(pk__in=self.initial_data.get("attachments"))
            )

        instance = Event()
        instance.set_current_language(base_language)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if category is not None:
            instance.category = category
        if title is not None:
            instance.title = title
        if summary is not None:
            instance.summary = summary
        if description is not None:
            instance.description = description

        # Use the first date as the default start_at if provided
        if dates_data:
            first_date = dates_data[0]
            instance.start_at = first_date.get("start_at")
            instance.end_at = first_date.get("end_at")
        elif "start_at" not in validated_data and self.initial_data.get("start_at"):
            # Fallback if start_at was passed directly but not dates
            pass

        instance.save()

        if featured_media is not None:
            instance.featured_media = featured_media
            instance.save()

        if translations_data:
            self._apply_translations(
                instance, translations_data, skip_language=base_language
            )
            instance.set_current_language(base_language)
        if title is not None or summary is not None or description is not None:
            if title is not None:
                instance.title = title
            if summary is not None:
                instance.summary = summary
            if description is not None:
                instance.description = description
            instance.save()
        if attachments:
            instance.attachments.set(attachments)
        if tags:
            instance.tags.set(tags)

        # Create dates
        for date_data in dates_data:
            EventDate.objects.create(event=instance, **date_data)

        # Trigger update of cached fields in case they changed
        instance.update_cached_dates()

        return instance

    def update(self, instance, validated_data):
        dates_data = validated_data.pop("dates", None)
        attachments = validated_data.pop("attachments_ids", None)
        tags = validated_data.pop("tag_ids", None)
        translations_data = validated_data.pop("translations", None)
        category = validated_data.pop("category_id", None)
        base_language = settings.LANGUAGE_CODE
        title = validated_data.pop("title", None) or self.initial_data.get("title")
        summary = validated_data.pop("summary", None) or self.initial_data.get(
            "summary"
        )
        description = validated_data.pop("description", None) or self.initial_data.get(
            "description"
        )
        featured_media = validated_data.pop("featured_media_id", None)
        if featured_media is None and self.initial_data.get("featured_media"):
            featured_media = ImageFile.objects.filter(
                pk=self.initial_data.get("featured_media")
            ).first()
        if attachments is None and self.initial_data.get("attachments"):
            attachments = list(
                DocumentFile.objects.filter(pk__in=self.initial_data.get("attachments"))
            )
        instance.set_current_language(base_language)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if category is not None:
            instance.category = category
        if title is not None:
            instance.title = title
        if summary is not None:
            instance.summary = summary
        if description is not None:
            instance.description = description

        instance.save()
        if featured_media is not None:
            instance.featured_media = featured_media
            instance.save()
        if translations_data:
            self._apply_translations(
                instance, translations_data, skip_language=base_language
            )
            instance.set_current_language(base_language)
        if title is not None or summary is not None or description is not None:
            if title is not None:
                instance.title = title
            if summary is not None:
                instance.summary = summary
            if description is not None:
                instance.description = description
            instance.save()
        if attachments is not None:
            instance.attachments.set(attachments)
        if tags is not None:
            instance.tags.set(tags)

        if dates_data is not None:
            # Sync dates: delete missing, update existing, create new
            current_ids = [d["id"] for d in dates_data if "id" in d]
            instance.dates.exclude(id__in=current_ids).delete()

            for date_data in dates_data:
                if "id" in date_data:
                    date_obj = EventDate.objects.get(id=date_data["id"], event=instance)
                    date_obj.start_at = date_data.get("start_at", date_obj.start_at)
                    date_obj.end_at = date_data.get("end_at", date_obj.end_at)
                    date_obj.save()
                else:
                    EventDate.objects.create(event=instance, **date_data)

            instance.update_cached_dates()

        return instance

    def _apply_translations(
        self, instance: Event, translations: dict, skip_language: str | None = None
    ) -> None:
        for language_code, values in translations.items():
            if skip_language and language_code == skip_language:
                continue
            instance.set_current_language(language_code)
            for field, value in values.items():
                setattr(instance, field, value)
            instance.save()


class EventDetailSerializer(EventSerializer):
    featured_media = ImageFileSerializer(read_only=True)
    attachments = DocumentFileSerializer(many=True, read_only=True)

    class Meta(EventSerializer.Meta):
        fields = EventSerializer.Meta.fields
