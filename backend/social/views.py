from rest_framework import viewsets
from .models import SocialLink
from .serializers import SocialLinkSerializer

class SocialLinkViewSet(viewsets.ModelViewSet):
    """
    ViewSet for the SocialLink model.
    
    Provides CRUD operations for SocialLink.
    Inherits from ModelViewSet to include list, create, retrieve, update, and destroy actions.
    """
    
    queryset = SocialLink.objects.all()
    serializer_class = SocialLinkSerializer
    
    def get_queryset(self):
        """
        Custom queryset retrieval.
        
        Returns:
            QuerySet: All SocialLink objects, ordered by 'order'.
        """
        return SocialLink.objects.all().order_by('order')
