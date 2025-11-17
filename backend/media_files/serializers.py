from __future__ import annotations

from rest_framework import serializers

from .models import DocumentFile, ImageFile
from . import utils


class ImageFileSerializer(serializers.ModelSerializer):
    """
    Serializer para ImageFile con validación y extracción de metadatos.
    
    Campos expuestos en API:
        - file: Campo de subida (lectura/escritura)
        - original_name: Extraído automáticamente del archivo (solo lectura)
        - mime_type: Extraído automáticamente (solo lectura)
        - size_bytes: Extraído automáticamente (solo lectura)
        - variant_*: Generadas por señal post_save (solo lectura)
    
    Flujo de creación:
        1. Usuario sube 'file' mediante POST multipart/form-data
        2. validate_file() valida tamaño y extensión
        3. create() extrae metadatos del archivo
        4. super().create() guarda en BD
        5. Señal post_save genera variantes automáticamente
    """
    
    class Meta:
        model = ImageFile
        fields = [
            "id",
            "file",                # Campo de subida (URL completa en respuesta)
            "original_name",       # Nombre original del archivo
            "mime_type",          # Tipo MIME (ej: image/jpeg)
            "size_bytes",         # Tamaño en bytes
            "variant_thumbnail",  # Ruta a thumbnail (150px)
            "variant_medium",     # Ruta a medium (600px)
            "variant_large",      # Ruta a large (1200px)
            "created_at",         # Timestamp de creación
            "updated_at",         # Timestamp de actualización
        ]
        # Campos que no pueden ser escritos directamente
        # Se generan/extraen automáticamente
        read_only_fields = [
            "id",
            "original_name",      # Extraído de file.name
            "mime_type",          # Extraído de file.content_type
            "size_bytes",         # Extraído de file.size
            "variant_thumbnail",  # Generado por señal
            "variant_medium",     # Generado por señal
            "variant_large",      # Generado por señal
            "created_at",         # auto_now_add=True
            "updated_at",         # auto_now=True
        ]

    def validate_file(self, value):
        """
        Valida el archivo subido antes de guardarlo.
        
        Validaciones:
            - Tamaño máximo: 10MB (configurable en utils.MAX_FILE_SIZE_MB)
            - Extensiones: .jpg, .jpeg, .png, .webp, .gif
        
        Raises:
            ValidationError: Si falla alguna validación
        """
        utils.validate_max_file_size(value)
        utils.validate_image_extension(value)
        return value

    def create(self, validated_data):
        """
        Crea registro extrayendo metadatos automáticamente del archivo.
        
        Extrae:
            - original_name: Del nombre del archivo subido
            - mime_type: Del content_type del archivo
            - size_bytes: Del tamaño del archivo
        
        Nota:
            Las variantes se generan después mediante señal post_save
        """
        file = validated_data.get("file")
        if file:
            validated_data["original_name"] = file.name
            validated_data["mime_type"] = getattr(file, "content_type", "") or ""
            validated_data["size_bytes"] = file.size
        return super().create(validated_data)


class DocumentFileSerializer(serializers.ModelSerializer):
    """
    Serializer para DocumentFile con validación y extracción de metadatos.
    
    Similar a ImageFileSerializer pero sin variantes (los documentos no se redimensionan).
    
    Campos expuestos en API:
        - file: Campo de subida (lectura/escritura)
        - original_name: Extraído automáticamente del archivo (solo lectura)
        - mime_type: Extraído automáticamente (solo lectura)
        - size_bytes: Extraído automáticamente (solo lectura)
    
    Flujo de creación:
        1. Usuario sube 'file' mediante POST multipart/form-data
        2. validate_file() valida tamaño y extensión
        3. create() extrae metadatos del archivo
        4. super().create() guarda en BD
    """
    
    class Meta:
        model = DocumentFile
        fields = [
            "id",
            "file",            # Campo de subida (URL completa en respuesta)
            "original_name",   # Nombre original del archivo
            "mime_type",      # Tipo MIME (ej: application/pdf)
            "size_bytes",     # Tamaño en bytes
            "created_at",     # Timestamp de creación
            "updated_at",     # Timestamp de actualización
        ]
        # Campos que no pueden ser escritos directamente
        read_only_fields = [
            "id",
            "original_name",  # Extraído de file.name
            "mime_type",      # Extraído de file.content_type
            "size_bytes",     # Extraído de file.size
            "created_at",     # auto_now_add=True
            "updated_at",     # auto_now=True
        ]

    def validate_file(self, value):
        """
        Valida el archivo subido antes de guardarlo.
        
        Validaciones:
            - Tamaño máximo: 10MB (configurable en utils.MAX_FILE_SIZE_MB)
            - Extensiones: .pdf, .ics, .txt, .docx, .xlsx
        
        Raises:
            ValidationError: Si falla alguna validación
        """
        utils.validate_max_file_size(value)
        utils.validate_document_extension(value)
        return value

    def create(self, validated_data):
        """
        Crea registro extrayendo metadatos automáticamente del archivo.
        
        Extrae:
            - original_name: Del nombre del archivo subido
            - mime_type: Del content_type del archivo
            - size_bytes: Del tamaño del archivo
        """
        file = validated_data.get("file")
        if file:
            validated_data["original_name"] = file.name
            validated_data["mime_type"] = getattr(file, "content_type", "") or ""
            validated_data["size_bytes"] = file.size
        return super().create(validated_data)
