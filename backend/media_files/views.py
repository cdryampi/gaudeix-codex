from __future__ import annotations

from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import DocumentFile, ImageFile
from .serializers import DocumentFileSerializer, ImageFileSerializer


class ImageFileViewSet(
    mixins.ListModelMixin,      # GET /media/images/ - Listar todas
    mixins.RetrieveModelMixin,  # GET /media/images/{id}/ - Obtener una
    mixins.CreateModelMixin,    # POST /media/images/ - Crear nueva
    mixins.UpdateModelMixin,    # PATCH /media/images/{id}/ - Actualizar (renombrar)
    mixins.DestroyModelMixin,   # DELETE /media/images/{id}/ - Eliminar
    viewsets.GenericViewSet,
):
    """
    ViewSet para gestión de imágenes mediante API REST.
    
    Endpoints generados (prefijo: /api/v1/):
        - GET    /media/images/       - Listar todas las imágenes
        - POST   /media/images/       - Subir nueva imagen
        - GET    /media/images/{id}/  - Obtener imagen específica
        - DELETE /media/images/{id}/  - Eliminar imagen
    
    Operaciones NO disponibles:
        - PUT/PATCH: No se permite actualizar imágenes existentes
                     (se debe eliminar y crear nueva)
    
    Ordenamiento:
        - Por defecto: más recientes primero (-created_at)
    
    Ejemplo de uso (subir imagen):
        POST /api/v1/media/images/
        Content-Type: multipart/form-data
        
        file: [archivo de imagen]
    
    Respuesta incluye:
        - file: URL completa del archivo
        - variant_thumbnail: Ruta a miniatura (150px)
        - variant_medium: Ruta a tamaño medio (600px)
        - variant_large: Ruta a tamaño grande (1200px)
    """
    
    # Queryset ordenado por más recientes primero
    queryset = ImageFile.objects.order_by("-created_at")
    serializer_class = ImageFileSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]


class DocumentFileViewSet(
    mixins.ListModelMixin,      # GET /media/documents/ - Listar todos
    mixins.RetrieveModelMixin,  # GET /media/documents/{id}/ - Obtener uno
    mixins.CreateModelMixin,    # POST /media/documents/ - Crear nuevo
    mixins.UpdateModelMixin,    # PATCH /media/documents/{id}/ - Actualizar (renombrar)
    mixins.DestroyModelMixin,   # DELETE /media/documents/{id}/ - Eliminar
    viewsets.GenericViewSet,
):
    """
    ViewSet para gestión de documentos mediante API REST.
    
    Endpoints generados (prefijo: /api/v1/):
        - GET    /media/documents/       - Listar todos los documentos
        - POST   /media/documents/       - Subir nuevo documento
        - GET    /media/documents/{id}/  - Obtener documento específico
        - DELETE /media/documents/{id}/  - Eliminar documento
    
    Operaciones NO disponibles:
        - PUT/PATCH: No se permite actualizar documentos existentes
                     (se debe eliminar y crear nuevo)
    
    Ordenamiento:
        - Por defecto: más recientes primero (-created_at)
    
    Ejemplo de uso (subir documento):
        POST /api/v1/media/documents/
        Content-Type: multipart/form-data
        
        file: [archivo de documento]
    
    Respuesta incluye:
        - file: URL completa del archivo
        - original_name: Nombre original del archivo
        - mime_type: Tipo MIME del documento
        - size_bytes: Tamaño en bytes
    """
    
    # Queryset ordenado por más recientes primero
    queryset = DocumentFile.objects.order_by("-created_at")
    serializer_class = DocumentFileSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]
