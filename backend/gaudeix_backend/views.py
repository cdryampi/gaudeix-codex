from django.db import connection
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


def landing(request):
    return render(request, "core/landing.html")


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint to verify backend status and database connectivity.
    """
    try:
        connection.ensure_connection()
        db_status = "ok"
    except Exception:
        db_status = "error"

    return Response(
        {
            "status": "online",
            "database": db_status,
            "service": "Gaudeix Backend",
        }
    )
