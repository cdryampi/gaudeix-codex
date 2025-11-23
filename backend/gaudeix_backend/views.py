from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db import connection

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint to verify backend status and database connectivity.
    """
    try:
        # Check database connectivity
        connection.ensure_connection()
        db_status = "ok"
    except Exception:
        db_status = "error"

    return Response({
        "status": "online",
        "database": db_status,
        "service": "Gaudeix Backend"
    })
