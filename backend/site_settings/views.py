from __future__ import annotations

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import FooterBadge, FooterLink, FooterSettings, MenuItem, SiteSettings
from .serializers import (
    FooterBadgeSerializer,
    FooterLinkSerializer,
    FooterPublicSerializer,
    FooterSettingsSerializer,
    MenuItemSerializer,
    SiteSettingsSerializer,
)


class SiteSettingsViewSet(viewsets.ModelViewSet):
    serializer_class = SiteSettingsSerializer
    queryset = SiteSettings.objects.all()

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_object(self):
        return SiteSettings.get_solo()

    def list(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=False, methods=["post"], url_path="publish")
    def publish(self, request):
        from .models import BuildJob
        from .serializers import BuildJobSerializer
        from .tasks import trigger_frontend_build_task

        instance = self.get_object()
        job = BuildJob.objects.create(
            status="pending",
            theme_config=instance.theme_config or {}
        )

        # Trigger the Celery task
        trigger_frontend_build_task.delay(job.id)

        serializer = BuildJobSerializer(job, context={"request": request})
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="builds")
    def builds(self, request):
        from .models import BuildJob
        from .serializers import BuildJobSerializer

        queryset = BuildJob.objects.all().order_by("-created_at")[:50]
        serializer = BuildJobSerializer(queryset, many=True, context={"request": request})
        return Response(serializer.data)


class MenuItemViewSet(viewsets.ModelViewSet):
    serializer_class = MenuItemSerializer
    queryset = MenuItem.objects.all()

    def get_permissions(self):
        if self.action in ["list", "retrieve", "tree"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        settings_obj = SiteSettings.get_solo()
        qs = (
            MenuItem.objects.filter(settings=settings_obj)
            .select_related("category", "static_page", "parent")
            .order_by("order", "id")
        )
        params = self.request.query_params
        location = params.get("location")
        if location:
            qs = qs.filter(location=location)
        parent = params.get("parent")
        if parent is not None:
            if parent == "":
                qs = qs.filter(parent__isnull=True)
            else:
                qs = qs.filter(parent_id=parent)
        return qs

    def perform_create(self, serializer):
        serializer.save(settings=SiteSettings.get_solo())

    @action(detail=False, methods=["get"])
    def tree(self, request):
        location = request.query_params.get("location", MenuItem.LocationChoices.HEADER)
        items = list(self.get_queryset().filter(location=location))
        by_parent: dict[int | None, list[MenuItem]] = {}
        for item in items:
            by_parent.setdefault(item.parent_id, []).append(item)
        for siblings in by_parent.values():
            siblings.sort(key=lambda i: (i.order, i.id))

        def build(parent_id: int | None):
            children = by_parent.get(parent_id, [])
            return [
                {
                    **MenuItemSerializer(child, context={"request": request}).data,
                    "children": build(child.id),
                }
                for child in children
            ]

        return Response(build(None))


class FooterSettingsViewSet(viewsets.ModelViewSet):
    serializer_class = FooterSettingsSerializer
    queryset = FooterSettings.objects.all()

    def get_permissions(self):
        if self.action in ["list", "retrieve", "public"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        return FooterSettings.objects.select_related(
            "site_settings",
            "site_settings__logo",
            "site_settings__logo_dark",
            "site_settings__favicon",
            "site_settings__privacy_page",
            "site_settings__cookies_page",
            "site_settings__legal_page",
            "site_settings__inclusion_page",
        ).prefetch_related("links__category", "links__static_page", "badges__image")

    def get_object(self):
        site_settings = SiteSettings.get_solo()
        footer_settings = FooterSettings.for_site_settings(site_settings)
        return self.get_queryset().get(pk=footer_settings.pk)

    def list(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def public(self, request):
        instance = self.get_object()
        serializer = FooterPublicSerializer(instance, context={"request": request})
        return Response(serializer.data)


class FooterLinkViewSet(viewsets.ModelViewSet):
    serializer_class = FooterLinkSerializer
    queryset = FooterLink.objects.all()

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        footer_settings = FooterSettings.for_site_settings(SiteSettings.get_solo())
        qs = (
            FooterLink.objects.filter(footer_settings=footer_settings)
            .select_related("footer_settings", "category", "static_page")
            .order_by("section", "order", "id")
        )
        section = self.request.query_params.get("section")
        if section:
            qs = qs.filter(section=section)
        is_active = self.request.query_params.get("is_active")
        if is_active in {"true", "false"}:
            qs = qs.filter(is_active=is_active == "true")
        return qs

    def perform_create(self, serializer):
        serializer.save(footer_settings=FooterSettings.for_site_settings())


class FooterBadgeViewSet(viewsets.ModelViewSet):
    serializer_class = FooterBadgeSerializer
    queryset = FooterBadge.objects.all()

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        footer_settings = FooterSettings.for_site_settings(SiteSettings.get_solo())
        qs = (
            FooterBadge.objects.filter(footer_settings=footer_settings)
            .select_related("footer_settings", "image")
            .order_by("order", "id")
        )
        is_active = self.request.query_params.get("is_active")
        if is_active in {"true", "false"}:
            qs = qs.filter(is_active=is_active == "true")
        return qs

    def perform_create(self, serializer):
        serializer.save(footer_settings=FooterSettings.for_site_settings())
