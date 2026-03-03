"""Serializers for the routes app."""

from __future__ import annotations

from decimal import Decimal

from django.conf import settings
from rest_framework import serializers
from parler_rest.serializers import TranslatableModelSerializer, TranslatedFieldsField

from core.models import Category, Tag
from core.serializers import TagSerializer
from media_files.models import DocumentFile, ImageFile
from media_files.serializers import DocumentFileSerializer, ImageFileSerializer

from .models import Route, RouteWaypoint, RouteCheckpoint


class RouteTranslationSerializer(serializers.Serializer):
    """Serializer for Route translated fields."""

    title = serializers.CharField(max_length=200)
    summary = serializers.CharField(required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    instructions = serializers.CharField(required=False, allow_blank=True)


class RouteWaypointSerializer(serializers.ModelSerializer):
    """Serializer for RouteWaypoint through model."""

    place_id = serializers.IntegerField(source="place.id", read_only=True)
    place_slug = serializers.CharField(source="place.slug", read_only=True)
    place_title = serializers.SerializerMethodField()

    class Meta:
        model = RouteWaypoint
        fields = [
            "id",
            "place_id",
            "place_slug",
            "place_title",
            "order",
            "instructions",
            "distance_from_previous_km",
        ]

    def get_place_title(self, obj) -> str:
        return obj.place.safe_translation_getter("title", any_language=True) or ""


class RouteCheckpointSerializer(serializers.ModelSerializer):
    """Serializer for RouteCheckpoint model (Roadmap)."""

    lat = serializers.SerializerMethodField()
    lng = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = RouteCheckpoint
        fields = [
            "id",
            "order",
            "title",
            "description",
            "image_url",
            "lat",
            "lng",
            "is_active",
        ]

    def get_lat(self, obj):
        if obj.latitude is not None:
            return float(obj.latitude)
        return None

    def get_lng(self, obj):
        if obj.longitude is not None:
            return float(obj.longitude)
        return None

    def get_image_url(self, obj) -> str:
        if obj.image and obj.image.file:
            request = self.context.get('request')
            url = obj.image.file.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return ""


class RouteSerializer(TranslatableModelSerializer):
    """Serializer for Route list and create operations."""

    translations = TranslatedFieldsField(
        shared_model=Route,
        serializer_class=RouteTranslationSerializer,
        required=False,
    )

    # Category
    category = serializers.PrimaryKeyRelatedField(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        allow_null=True,
        required=False,
        write_only=True,
    )
    category_slug = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()

    # Tags
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        many=True,
        required=False,
        write_only=True,
    )

    # Featured media
    featured_media = ImageFileSerializer(read_only=True)
    featured_media_id = serializers.PrimaryKeyRelatedField(
        queryset=ImageFile.objects.all(),
        allow_null=True,
        required=False,
        write_only=True,
    )

    # GPX file
    gpx_file = DocumentFileSerializer(read_only=True)
    gpx_file_id = serializers.PrimaryKeyRelatedField(
        queryset=DocumentFile.objects.all(),
        allow_null=True,
        required=False,
        write_only=True,
    )

    # Attachments
    attachments = DocumentFileSerializer(many=True, read_only=True)
    attachments_ids = serializers.PrimaryKeyRelatedField(
        queryset=DocumentFile.objects.all(),
        many=True,
        required=False,
        write_only=True,
    )

    # Gallery
    gallery = ImageFileSerializer(many=True, read_only=True)
    gallery_ids = serializers.PrimaryKeyRelatedField(
        queryset=ImageFile.objects.all(),
        many=True,
        required=False,
        write_only=True,
    )

    # Computed fields
    image_url = serializers.SerializerMethodField()
    duration_formatted = serializers.SerializerMethodField()
    waypoints_list = RouteWaypointSerializer(
        source="route_waypoints", many=True, read_only=True
    )
    waypoints_input = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        write_only=True
    )
    checkpoints_list = RouteCheckpointSerializer(
        source="route_checkpoints", many=True, read_only=True
    )
    checkpoints_input = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        write_only=True
    )

    class Meta:
        model = Route
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
            "instructions",
            "route_type",
            "difficulty",
            "distance_km",
            "duration_minutes",
            "duration_formatted",
            "elevation_gain",
            "elevation_loss",
            "start_latitude",
            "start_longitude",
            "end_latitude",
            "end_longitude",
            "is_circular",
            "is_published",
            "is_featured",
            "ios_app_url",
            "android_app_url",
            "tags",
            "tag_ids",
            "featured_media",
            "featured_media_id",
            "gpx_file",
            "gpx_file_id",
            "track_geojson",
            "attachments",
            "attachments_ids",
            "gallery",
            "gallery_ids",
            "image_url",
            "waypoints_list",
            "waypoints_input",
            "checkpoints_list",
            "checkpoints_input",
            "created_at",
            "updated_at",
            "translations",
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]

    def get_category_slug(self, obj) -> str:
        return obj.category.slug if obj.category else ""

    def get_category_name(self, obj) -> str:
        if obj.category:
            return (
                obj.category.safe_translation_getter("nombre", any_language=True) or ""
            )
        return ""

    def get_image_url(self, obj) -> str:
        if obj.featured_media and obj.featured_media.file:
            request = self.context.get('request')
            url = obj.featured_media.file.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return ""

    def get_duration_formatted(self, obj) -> str:
        return obj.duration_formatted

    def create(self, validated_data):
        """Handle M2M fields on create."""
        tag_ids = validated_data.pop("tag_ids", [])
        attachments_ids = validated_data.pop("attachments_ids", [])
        gallery_ids = validated_data.pop("gallery_ids", [])
        waypoints_input = validated_data.pop("waypoints_input", None)
        checkpoints_input = validated_data.pop("checkpoints_input", None)

        # Handle write-only FK fields
        if "category_id" in validated_data:
            validated_data["category"] = validated_data.pop("category_id")
        if "featured_media_id" in validated_data:
            validated_data["featured_media"] = validated_data.pop("featured_media_id")
        if "gpx_file_id" in validated_data:
            validated_data["gpx_file"] = validated_data.pop("gpx_file_id")

        route = super().create(validated_data)

        if tag_ids:
            route.tags.set(tag_ids)
        if attachments_ids:
            route.attachments.set(attachments_ids)
        if gallery_ids:
            route.gallery.set(gallery_ids)

        if waypoints_input is not None:
            self._save_waypoints(route, waypoints_input)
        if checkpoints_input is not None:
            self._save_checkpoints(route, checkpoints_input)

        return route

    def update(self, instance, validated_data):
        """Handle M2M fields on update."""
        tag_ids = validated_data.pop("tag_ids", None)
        attachments_ids = validated_data.pop("attachments_ids", None)
        gallery_ids = validated_data.pop("gallery_ids", None)
        waypoints_input = validated_data.pop("waypoints_input", None)
        checkpoints_input = validated_data.pop("checkpoints_input", None)

        # Handle write-only FK fields
        if "category_id" in validated_data:
            validated_data["category"] = validated_data.pop("category_id")
        if "featured_media_id" in validated_data:
            validated_data["featured_media"] = validated_data.pop("featured_media_id")
        if "gpx_file_id" in validated_data:
            validated_data["gpx_file"] = validated_data.pop("gpx_file_id")

        instance = super().update(instance, validated_data)

        if tag_ids is not None:
            instance.tags.set(tag_ids)
        if attachments_ids is not None:
            instance.attachments.set(attachments_ids)
        if gallery_ids is not None:
            instance.gallery.set(gallery_ids)

        if waypoints_input is not None:
            self._save_waypoints(instance, waypoints_input)
        if checkpoints_input is not None:
            self._save_checkpoints(instance, checkpoints_input)

        return instance

    def _save_waypoints(self, route, waypoints_data):
        # Clear existing waypoints completely to overwrite
        RouteWaypoint.objects.filter(route=route).delete()
        
        objects_to_create = []
        for index, item in enumerate(waypoints_data):
            # Parse distance gracefully, or null
            distance = item.get("distance_from_previous_km")
            
            # Create waypoint logic
            objects_to_create.append(
                RouteWaypoint(
                    route=route,
                    place_id=item["place_id"],
                    order=item.get("order", index + 1),
                    instructions=item.get("instructions", ""),
                    distance_from_previous_km=distance,
                )
            )
            
        RouteWaypoint.objects.bulk_create(objects_to_create)

    def _save_checkpoints(self, route, checkpoints_data):
        """Clear and re-create route checkpoints."""
        RouteCheckpoint.objects.filter(route=route).delete()
        objects_to_create = []
        for index, item in enumerate(checkpoints_data):
            lat = item.get("latitude") or item.get("lat")
            lng = item.get("longitude") or item.get("lng")
            objects_to_create.append(
                RouteCheckpoint(
                    route=route,
                    order=item.get("order", index + 1),
                    title=item.get("title", ""),
                    description=item.get("description", ""),
                    latitude=lat,
                    longitude=lng,
                    is_active=item.get("is_active", True),
                )
            )
        RouteCheckpoint.objects.bulk_create(objects_to_create)



class RouteDetailSerializer(RouteSerializer):
    """Serializer for Route detail view with additional fields."""

    pass


class RouteItineraryWaypointSerializer(serializers.ModelSerializer):
    """Waypoint payload used by route itinerary endpoint."""

    place_id = serializers.IntegerField(source="place.id", read_only=True)
    place_slug = serializers.CharField(source="place.slug", read_only=True)
    place_title = serializers.SerializerMethodField()
    lat = serializers.SerializerMethodField()
    lng = serializers.SerializerMethodField()
    distance_from_previous_km = serializers.SerializerMethodField()

    class Meta:
        model = RouteWaypoint
        fields = [
            "id",
            "order",
            "place_id",
            "place_slug",
            "place_title",
            "lat",
            "lng",
            "instructions",
            "distance_from_previous_km",
        ]

    def get_place_title(self, obj) -> str:
        return obj.place.safe_translation_getter("title", any_language=True) or ""

    def get_lat(self, obj):
        if obj.place and obj.place.latitude is not None:
            return float(obj.place.latitude)
        return None

    def get_lng(self, obj):
        if obj.place and obj.place.longitude is not None:
            return float(obj.place.longitude)
        return None

    def get_distance_from_previous_km(self, obj):
        if obj.distance_from_previous_km is None:
            return None
        return float(obj.distance_from_previous_km)

class RouteItinerarySerializer(serializers.Serializer):
    """Stable itinerary response consumed by map/itinerary frontends."""

    route = serializers.SerializerMethodField()
    start = serializers.SerializerMethodField()
    end = serializers.SerializerMethodField()
    bounds = serializers.SerializerMethodField()
    track_geojson = serializers.SerializerMethodField()
    waypoints = serializers.SerializerMethodField()
    checkpoints = serializers.SerializerMethodField()
    segments = serializers.SerializerMethodField()
    summary = serializers.SerializerMethodField()

    def get_route(self, obj):
        return {
            "id": obj.id,
            "slug": obj.slug,
            "title": obj.safe_translation_getter("title", any_language=True) or "",
            "route_type": obj.route_type,
            "difficulty": obj.difficulty,
            "is_circular": obj.is_circular,
        }

    def get_start(self, obj):
        return self._point(obj.start_latitude, obj.start_longitude)

    def get_end(self, obj):
        return self._point(obj.end_latitude, obj.end_longitude)

    def get_track_geojson(self, obj):
        if isinstance(obj.track_geojson, dict):
            return obj.track_geojson
        return None

    def get_waypoints(self, obj):
        waypoints = obj.route_waypoints.select_related("place").order_by("order")
        return RouteItineraryWaypointSerializer(waypoints, many=True, context=self.context).data

    def get_checkpoints(self, obj):
        checkpoints = obj.route_checkpoints.filter(is_active=True).order_by("order")
        return RouteCheckpointSerializer(checkpoints, many=True, context=self.context).data

    def get_segments(self, obj):
        waypoints = list(obj.route_waypoints.order_by("order"))
        segments = []
        for index in range(1, len(waypoints)):
            waypoint = waypoints[index]
            segments.append(
                {
                    "from_order": waypoints[index - 1].order,
                    "to_order": waypoint.order,
                    "distance_km": self._to_float(waypoint.distance_from_previous_km),
                    "duration_minutes": None,
                }
            )
        return segments

    def get_summary(self, obj):
        # Calculate distance between checkpoints if route distance_km is not set
        # But per issue, summary distance_km should fallback to None if not trivial, 
        # so we will use the route distance_km directly
        
        return {
            "distance_km": self._to_float(obj.distance_km),
            "duration_minutes": obj.duration_minutes,
            "elevation_gain": obj.elevation_gain,
            "elevation_loss": obj.elevation_loss,
            "waypoints_count": obj.route_waypoints.count(),
            "checkpoints_count": obj.route_checkpoints.filter(is_active=True).count(),
        }

    def get_bounds(self, obj):
        coordinates = self._track_coordinates(obj.track_geojson)
        if not coordinates:
            coordinates = self._fallback_coordinates(obj)

        if not coordinates:
            return None

        lats = [lat for lat, _ in coordinates]
        lngs = [lng for _, lng in coordinates]
        return {
            "south": min(lats),
            "west": min(lngs),
            "north": max(lats),
            "east": max(lngs),
        }

    def _fallback_coordinates(self, obj):
        coordinates: list[tuple[float, float]] = []

        for lat, lng in [
            (obj.start_latitude, obj.start_longitude),
            (obj.end_latitude, obj.end_longitude),
        ]:
            point = self._lat_lng_tuple(lat, lng)
            if point:
                coordinates.append(point)

        for waypoint in obj.route_waypoints.select_related("place"):
            place = waypoint.place
            point = self._lat_lng_tuple(place.latitude, place.longitude)
            if point:
                coordinates.append(point)

        for checkpoint in obj.route_checkpoints.filter(is_active=True):
            point = self._lat_lng_tuple(checkpoint.latitude, checkpoint.longitude)
            if point:
                coordinates.append(point)

        return coordinates

    def _track_coordinates(self, track_geojson):
        if not isinstance(track_geojson, dict):
            return []

        geometry_type = track_geojson.get("type")
        coordinates = track_geojson.get("coordinates")

        if geometry_type == "LineString" and isinstance(coordinates, list):
            return self._extract_line_coordinates(coordinates)

        if geometry_type == "MultiLineString" and isinstance(coordinates, list):
            points: list[tuple[float, float]] = []
            for line in coordinates:
                if isinstance(line, list):
                    points.extend(self._extract_line_coordinates(line))
            return points

        return []

    def _extract_line_coordinates(self, coordinates):
        points: list[tuple[float, float]] = []
        for coordinate in coordinates:
            if not isinstance(coordinate, list) or len(coordinate) < 2:
                continue
            lng = self._safe_float(coordinate[0])
            lat = self._safe_float(coordinate[1])
            if lat is not None and lng is not None:
                points.append((lat, lng))
        return points

    def _point(self, lat, lng):
        point = self._lat_lng_tuple(lat, lng)
        if not point:
            return None
        return {"lat": point[0], "lng": point[1]}

    def _lat_lng_tuple(self, lat, lng):
        lat_value = self._safe_float(lat)
        lng_value = self._safe_float(lng)
        if lat_value is None or lng_value is None:
            return None
        return lat_value, lng_value

    def _to_float(self, value):
        if isinstance(value, Decimal):
            return float(value)
        return value

    def _safe_float(self, value):
        try:
            if value is None:
                return None
            return float(value)
        except (TypeError, ValueError):
            return None
