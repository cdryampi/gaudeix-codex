from __future__ import annotations

from rest_framework.routers import DefaultRouter

from .views import DocumentFileViewSet, ImageFileViewSet


def register_routes(router: DefaultRouter) -> None:
    """
    Registra las rutas de la app media_files en el router de DRF.
    
    Esta función se llama desde gaudeix_backend/urls.py:
        from media_files.urls import register_routes as register_media_routes
        router = DefaultRouter()
        register_media_routes(router)
    
    Rutas generadas (con prefijo /api/v1/):
    
    Imágenes:
        - GET    /api/v1/media/images/       → Listar todas
        - POST   /api/v1/media/images/       → Subir nueva
        - GET    /api/v1/media/images/{id}/  → Obtener una
        - DELETE /api/v1/media/images/{id}/  → Eliminar
    
    Documentos:
        - GET    /api/v1/media/documents/       → Listar todos
        - POST   /api/v1/media/documents/       → Subir nuevo
        - GET    /api/v1/media/documents/{id}/  → Obtener uno
        - DELETE /api/v1/media/documents/{id}/  → Eliminar
    
    Basenames:
        - media-images: Para reversa de URLs de imágenes
        - media-documents: Para reversa de URLs de documentos
        
    Ejemplo de uso:
        from django.urls import reverse
        url = reverse('media-images-list')  # /api/v1/media/images/
        url = reverse('media-images-detail', kwargs={'pk': 1})  # /api/v1/media/images/1/
    """
    
    # Registrar ViewSet de imágenes
    # Prefijo: media/images (se combina con prefijo del router principal)
    # Basename: media-images (para reverse URLs)
    router.register("media/images", ImageFileViewSet, basename="media-images")
    
    # Registrar ViewSet de documentos
    # Prefijo: media/documents (se combina con prefijo del router principal)
    # Basename: media-documents (para reverse URLs)
    router.register("media/documents", DocumentFileViewSet, basename="media-documents")
