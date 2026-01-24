from rest_framework.routers import DefaultRouter

def register_routes(router: DefaultRouter):
    from .views import NewsViewSet
    router.register(r"news", NewsViewSet, basename="news")
