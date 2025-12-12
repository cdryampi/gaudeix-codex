from __future__ import annotations

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import MenuItem, SiteSettings
from .serializers import MenuItemSerializer, SiteSettingsSerializer


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
        # Always return the singleton
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


class MenuItemViewSet(viewsets.ModelViewSet):
    """CRUD de elementos de menú del header/footer."""

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
        """Devuelve el menú como árbol por ubicación."""
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
                {**MenuItemSerializer(child, context={"request": request}).data, "children": build(child.id)}
                for child in children
            ]

        return Response(build(None))
