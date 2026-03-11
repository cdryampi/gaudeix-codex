from __future__ import annotations

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from django.conf import settings

from .models import AutomationJob
from .serializers import (
    AutomationJobSerializer,
    AutomationJobWriteSerializer,
    AutomationRunSerializer,
)
from .services import run_automation_now, serialize_template_definitions


class AutomationTemplateViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]

    def list(self, request):
        return Response(serialize_template_definitions())


class AutomationJobViewSet(viewsets.ModelViewSet):
    queryset = AutomationJob.objects.all()
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):
        if self.action in {"create", "partial_update", "update"}:
            return AutomationJobWriteSerializer
        return AutomationJobSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        job = serializer.save()
        return Response(AutomationJobSerializer(job).data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        job = self.get_object()
        serializer = self.get_serializer(job, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        job = serializer.save()
        return Response(AutomationJobSerializer(job).data)

    @action(detail=True, methods=["post"], url_path="run-now")
    def run_now(self, request, pk=None):
        job = self.get_object()
        result = run_automation_now(job)
        run_id = result.get() if settings.CELERY_TASK_ALWAYS_EAGER else None
        payload = {"task_id": result.id, "queued": True}
        if run_id is not None:
            payload["run_id"] = run_id
        return Response(payload, status=status.HTTP_202_ACCEPTED)

    @action(detail=True, methods=["get"])
    def runs(self, request, pk=None):
        job = self.get_object()
        serializer = AutomationRunSerializer(job.runs.order_by("-started_at", "-id"), many=True)
        return Response(serializer.data)
