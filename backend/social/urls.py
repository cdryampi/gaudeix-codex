from rest_framework.routers import DefaultRouter
from .views import SocialLinkViewSet

def register_routes(router: DefaultRouter):
    """
    Registers the Social app routes with the provided router.
    
    Args:
        router (DefaultRouter): The main application router.
    """
    router.register(r'social-links', SocialLinkViewSet, basename='sociallink')

# Standalone usage (optional): include social.urls directly.
router = DefaultRouter()
register_routes(router)
urlpatterns = router.urls
