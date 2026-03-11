from __future__ import annotations

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response

from django.conf import settings

from automations.models import AutomationRun
from automations.services import get_default_job_for_template, run_automation_now

from .models import (
    BeachSafetyProposal,
    BeachSafetyStatus,
)
from .serializers import (
    BeachSafetyAutomationRunSerializer,
    BeachSafetyProposalReviewSerializer,
    BeachSafetyProposalSerializer,
    BeachSafetyStatusSerializer,
)
from .services import approve_proposal, reject_proposal


class BeachSafetyStatusViewSet(viewsets.GenericViewSet):
    serializer_class = BeachSafetyStatusSerializer
    queryset = BeachSafetyStatus.objects.all()

    def get_permissions(self):
        if self.action in ["list", "retrieve", "current"]:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_object(self):
        return BeachSafetyStatus.get_solo()

    def list(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object())
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    @action(detail=False, methods=["get"])
    def current(self, request):
        return self.list(request)

    @action(detail=False, methods=["post"], url_path="run-check")
    def run_check(self, request):
        job = get_default_job_for_template("beach_safety.evaluate_red_flag_proposal")
        if job is None:
            return Response(
                {"detail": "No automation job configured for beach safety."},
                status=status.HTTP_409_CONFLICT,
            )

        result = run_automation_now(job)
        run_id = result.get() if settings.CELERY_TASK_ALWAYS_EAGER else None
        payload = {"task_id": result.id, "queued": True}
        if run_id is not None:
            payload["run_id"] = run_id
        return Response(payload, status=status.HTTP_202_ACCEPTED)


class BeachSafetyProposalViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BeachSafetyProposal.objects.all().select_related("reviewed_by", "source_run")
    serializer_class = BeachSafetyProposalSerializer
    permission_classes = [IsAdminUser]

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        proposal = self.get_object()
        serializer = BeachSafetyProposalReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        proposal = approve_proposal(
            proposal,
            reviewer=request.user,
            review_notes=serializer.validated_data.get("review_notes", ""),
        )
        return Response(self.get_serializer(proposal).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        proposal = self.get_object()
        serializer = BeachSafetyProposalReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        proposal = reject_proposal(
            proposal,
            reviewer=request.user,
            review_notes=serializer.validated_data.get("review_notes", ""),
        )
        return Response(self.get_serializer(proposal).data, status=status.HTTP_200_OK)


class BeachSafetyAutomationRunViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AutomationRun.objects.filter(
        automation__template_slug="beach_safety.evaluate_red_flag_proposal"
    )
    serializer_class = BeachSafetyAutomationRunSerializer
    permission_classes = [IsAdminUser]
