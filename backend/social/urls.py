from rest_framework.routers import DefaultRouter
from .views import SocialLinkViewSet

def register_routes(router: DefaultRouter):
    """
    Registers the Social app routes with the provided router.
    
    Args:
        router (DefaultRouter): The main application router.
    """
    router.register(r'social-links', SocialLinkViewSet, basename='sociallink')

# We can keep urlpatterns for standalone usage if needed, but for now we focus on router integration.
# If standalone is needed:
# router = DefaultRouter()
# register_routes(router)
# urlpatterns = [path('', include(router.urls))]
