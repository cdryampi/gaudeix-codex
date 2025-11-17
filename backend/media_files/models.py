from __future__ import annotations

from django.db import models

from . import utils


class BaseUploadedFile(models.Model):
    """
    Modelo abstracto base para archivos subidos.
    
    Proporciona campos comunes para todos los tipos de archivos:
    - Metadatos del archivo (nombre, tipo MIME, tamaño)
    - Timestamps de creación y actualización
    
    No se pueden crear instancias directas de este modelo.
    Debe heredarse en modelos concretos como ImageFile o DocumentFile.
    """
    
    # Campo de archivo - se sobrescribe en modelos hijos
    file = models.FileField(upload_to="uploads/")
    
    # Metadatos del archivo
    original_name = models.CharField(
        max_length=255,
        help_text="Nombre original del archivo al momento de subirlo"
    )
    mime_type = models.CharField(
        max_length=255,
        help_text="Tipo MIME del archivo (ej: image/jpeg, application/pdf)"
    )
    size_bytes = models.PositiveBigIntegerField(
        help_text="Tamaño del archivo en bytes"
    )
    
    # Timestamps automáticos
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Fecha y hora de creación del registro"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Fecha y hora de última actualización"
    )

    class Meta:
        abstract = True


class ImageFile(BaseUploadedFile):
    """
    Modelo para archivos de imagen.
    
    Características:
    - Genera automáticamente 3 variantes redimensionadas (thumbnail, medium, large)
    - Valida extensión (.jpg, .jpeg, .png, .webp, .gif)
    - Valida tamaño máximo (10MB por defecto)
    - Los archivos se guardan con UUID para evitar colisiones
    - Al eliminar el registro, borra archivo original + variantes
    
    Las variantes se generan mediante señal post_save en signals.py.
    La eliminación se maneja mediante señal post_delete en signals.py.
    """
    
    # Campo de imagen con validadores
    # upload_to: función que genera ruta con UUID (ej: uploads/images/abc123.jpg)
    file = models.ImageField(
        upload_to=utils.get_image_upload_path,
        validators=[
            utils.validate_max_file_size,      # Tamaño máximo 10MB
            utils.validate_image_extension,    # Extensiones permitidas
        ],
    )
    
    # Rutas a variantes redimensionadas (se generan automáticamente)
    # IMPORTANTE: Son rutas relativas, no URLs completas
    # Ejemplo: "uploads/images/abc123__thumbnail.jpg"
    variant_thumbnail = models.CharField(
        max_length=500,
        blank=True,
        help_text="Ruta a variante thumbnail (150px ancho)"
    )
    variant_medium = models.CharField(
        max_length=500,
        blank=True,
        help_text="Ruta a variante medium (600px ancho)"
    )
    variant_large = models.CharField(
        max_length=500,
        blank=True,
        help_text="Ruta a variante large (1200px ancho)"
    )


class DocumentFile(BaseUploadedFile):
    """
    Modelo para archivos de documento.
    
    Características:
    - Valida extensión (.pdf, .ics, .txt, .docx, .xlsx)
    - Valida tamaño máximo (10MB por defecto)
    - Los archivos se guardan con UUID para evitar colisiones
    - Al eliminar el registro, borra el archivo físico
    
    La eliminación se maneja mediante señal post_delete en signals.py.
    """
    
    # Campo de archivo con validadores
    # upload_to: función que genera ruta con UUID (ej: uploads/documents/xyz789.pdf)
    file = models.FileField(
        upload_to=utils.get_document_upload_path,
        validators=[
            utils.validate_max_file_size,         # Tamaño máximo 10MB
            utils.validate_document_extension,    # Extensiones permitidas
        ],
    )
