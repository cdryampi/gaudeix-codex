"""ViewSets for gamification ranking endpoints."""

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .serializers import BasicUserSerializer
from .utils import get_monthly_rankings, get_total_rankings

User = get_user_model()


class RankingViewSet(viewsets.ViewSet):
    """Public ranking endpoints for user points."""

    permission_classes = [AllowAny]

    def list(self, request):
        limit = request.query_params.get("limit")
        limit_value = int(limit) if limit and limit.isdigit() else 10
        rankings = get_total_rankings(limit=limit_value)
        response = []
        for item in rankings:
            response.append(
                {
                    "rank": item["rank"],
                    "user": BasicUserSerializer(item["user"]).data,
                    "total_points": item["total_points"],
                    "level": item["level"],
                }
            )
        return Response(response)

    @action(detail=False, methods=["get"], url_path="monthly")
    def monthly(self, request):
        limit = request.query_params.get("limit")
        limit_value = int(limit) if limit and limit.isdigit() else 10
        rankings = get_monthly_rankings(limit=limit_value)
        user_ids = [item["user_id"] for item in rankings]
        users = User.objects.filter(id__in=user_ids)
        user_map = {user.id: user for user in users}
        response = []
        for item in rankings:
            user = user_map.get(item["user_id"])
            response.append(
                {
                    "rank": item["rank"],
                    "user": BasicUserSerializer(user).data if user else None,
                    "total_points": item["total_points"],
                    "month": timezone.now().strftime("%Y-%m"),
                }
            )
        return Response(response)
