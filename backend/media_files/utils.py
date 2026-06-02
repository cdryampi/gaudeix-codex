from __future__ import annotations

import os
import uuid
from io import BytesIO
from typing import Iterable

from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from PIL import Image

# CONFIGURACIÓN GLOBAL
# Ajusta estos valores según necesidad del proyecto
MAX_FILE_SIZE_MB = 10  # Tamaño máximo de archivo en megabytes

# Extensiones permitidas para imágenes
IMAGE_EXTENSIONS: set[str] = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

# Extensiones permitidas para documentos
DOCUMENT_EXTENSIONS: set[str] = {
    ".pdf",
    ".ics",
    ".txt",
    ".docx",
    ".xlsx",
    ".gpx",
    ".kml",
    ".mp3",
    ".wav",
    ".m4a",
    ".ogg",
}

# Extensiones permitidas para videos
VIDEO_EXTENSIONS: set[str] = {".mp4", ".webm", ".mov"}

# Especificaciones de variantes de imagen (nombre: ancho_máximo_en_pixels)
# Las variantes mantienen aspect ratio original
IMAGE_VARIANT_SPECS = {
    "thumbnail": 150,   # Miniatura para listados
    "medium": 600,      # Tamaño medio para vistas de detalle
    "large": 1200,      # Tamaño grande para vista completa
}


# ============================================================================
# VALIDADORES DE ARCHIVOS
# ============================================================================

def validate_max_file_size(file_obj, max_mb: int = MAX_FILE_SIZE_MB) -> None:
    """
    Valida que un archivo no exceda el tamaño máximo permitido.
    
    Args:
        file_obj: Archivo a validar (UploadedFile)
        max_mb: Tamaño máximo en megabytes (default: MAX_FILE_SIZE_MB)
    
    Raises:
        ValidationError: Si el archivo excede el tamaño máximo
        
    Uso en modelos:
        validators=[validate_max_file_size]
    """
    max_bytes = max_mb * 1024 * 1024
    if file_obj.size > max_bytes:
        raise ValidationError(f"El archivo supera el límite permitido de {max_mb}MB.")


def validate_extension(file_obj, allowed_extensions: Iterable[str]) -> None:
    """
    Valida que la extensión del archivo esté en la lista permitida.
    
    Args:
        file_obj: Archivo a validar (UploadedFile)
        allowed_extensions: Set de extensiones permitidas (ej: {'.jpg', '.png'})
    
    Raises:
        ValidationError: Si la extensión no está permitida
        
    Nota:
        - La validación es case-insensitive
        - Las extensiones deben incluir el punto (ej: '.jpg' no 'jpg')
    """
    _, ext = os.path.splitext(file_obj.name or "")
    ext = ext.lower()
    if ext not in allowed_extensions:
        allowed = ", ".join(sorted(allowed_extensions))
        raise ValidationError(f"Extensión no permitida. Extensiones válidas: {allowed}")


def validate_image_extension(file_obj) -> None:
    """
    Valida que el archivo tenga una extensión de imagen válida.
    
    Extensiones permitidas: .jpg, .jpeg, .png, .webp, .gif
    
    Args:
        file_obj: Archivo a validar (UploadedFile)
        
    Raises:
        ValidationError: Si la extensión no es una imagen válida
    """
    validate_extension(file_obj, IMAGE_EXTENSIONS)


def validate_document_extension(file_obj) -> None:
    """
    Valida que el archivo tenga una extensión de documento válida.
    
    Extensiones permitidas: .pdf, .ics, .txt, .docx, .xlsx
    
    Args:
        file_obj: Archivo a validar (UploadedFile)
        
    Raises:
        ValidationError: Si la extensión no es un documento válido
    """
    validate_extension(file_obj, DOCUMENT_EXTENSIONS)


# ============================================================================
# GENERADORES DE RUTAS
# ============================================================================

def _build_upload_path(prefix: str, filename: str) -> str:
    """
    Genera una ruta de subida con UUID para evitar colisiones.
    
    Args:
        prefix: Prefijo del path (ej: "uploads/images")
        filename: Nombre original del archivo
        
    Returns:
        Ruta completa con UUID (ej: "uploads/images/abc123.jpg")
        
    Nota:
        - Usa UUID hex (32 caracteres sin guiones)
        - Preserva la extensión original en minúsculas
    """
    _, ext = os.path.splitext(filename or "")
    return os.path.join(prefix, f"{uuid.uuid4().hex}{ext.lower()}")


def get_image_upload_path(instance, filename: str) -> str:
    """
    Genera la ruta de subida para imágenes.
    
    Usado en: ImageFile.file.upload_to
    
    Args:
        instance: Instancia del modelo (no se usa pero requerido por Django)
        filename: Nombre original del archivo
        
    Returns:
        Ruta con UUID (ej: "uploads/images/abc123.jpg")
    """
    return _build_upload_path("uploads/images", filename)


def get_document_upload_path(instance, filename: str) -> str:
    """
    Genera la ruta de subida para documentos.
    
    Usado en: DocumentFile.file.upload_to
    
    Args:
        instance: Instancia del modelo (no se usa pero requerido por Django)
        filename: Nombre original del archivo
        
    Returns:
        Ruta con UUID (ej: "uploads/documents/xyz789.pdf")
    """
    return _build_upload_path("uploads/documents", filename)


# Videos

def validate_video_extension(file_obj) -> None:
    """
    Valida que el archivo tenga una extensi¢n de video v·lida.
    
    Extensiones permitidas: .mp4, .webm, .mov
    """
    validate_extension(file_obj, VIDEO_EXTENSIONS)


def get_video_upload_path(instance, filename: str) -> str:
    """
    Genera la ruta de subida para videos.
    
    Usado en: VideoFile.file.upload_to
    """
    return _build_upload_path("uploads/videos", filename)


def build_variant_path(original_path: str, suffix: str) -> str:
    """
    Construye la ruta de storage para una variante de imagen.
    
    Args:
        original_path: Ruta del archivo original (ej: "uploads/images/abc123.jpg")
        suffix: Sufijo de la variante (ej: "thumbnail", "medium", "large")
        
    Returns:
        Ruta de la variante (ej: "uploads/images/abc123__thumbnail.jpg")
        
    Nota:
        - Usa doble guión bajo (__) como separador
        - Preserva la extensión original
    """
    base, ext = os.path.splitext(original_path or "")
    return f"{base}__{suffix}{ext}"


# ============================================================================
# PROCESAMIENTO DE IMÁGENES
# ============================================================================

def _resize_image(image: Image.Image, max_width: int) -> Image.Image:
    """
    Redimensiona una imagen manteniendo el aspect ratio.
    
    Args:
        image: Imagen PIL a redimensionar
        max_width: Ancho máximo en pixels
        
    Returns:
        Imagen redimensionada (copia del original)
        
    Nota:
        - Si la imagen ya es más pequeña, se devuelve una copia sin cambios
        - Usa Lanczos para mejor calidad
        - Mantiene el aspect ratio original
    """
    resized = image.copy()
    if resized.width <= max_width:
        return resized
    
    # Calcular nuevo tamaño manteniendo aspect ratio
    ratio = max_width / float(resized.width)
    new_size = (max_width, int(resized.height * ratio))
    
    return resized.resize(new_size, Image.Resampling.LANCZOS)


def generate_image_variants(file_field) -> dict[str, str]:
    """
    Genera variantes redimensionadas de una imagen.
    
    Crea 3 versiones: thumbnail (150px), medium (600px), large (1200px)
    
    Args:
        file_field: Campo FileField/ImageField con la imagen original
        
    Returns:
        Dict con rutas de variantes: {"thumbnail": "path", "medium": "path", "large": "path"}
        Dict vacío si hay error o el archivo no existe
        
    Nota:
        - Preserva el formato original (JPEG, PNG, etc)
        - Calidad JPEG: 85 con optimización
        - Convierte RGBA a RGB para JPEGs
        - Elimina variante anterior si existe (para evitar archivos huérfanos)
        
    Llamado por:
        - Señal post_save en signals.py (automático al crear/actualizar)
    """
    if not file_field or not file_field.name:
        return {}
    
    original_path = file_field.name
    if not default_storage.exists(original_path):
        return {}

    with default_storage.open(original_path, "rb") as source:
        with Image.open(source) as image:
            # Preservar formato original (JPEG, PNG, etc)
            image_format = image.format or "JPEG"
            image.load()  # Cargar imagen en memoria antes de cerrar el archivo

            variant_paths: dict[str, str] = {}
            
            # Generar cada variante según IMAGE_VARIANT_SPECS
            for suffix, max_width in IMAGE_VARIANT_SPECS.items():
                # Redimensionar imagen
                resized = _resize_image(image, max_width)
                
                # Preparar para guardar
                buffer = BytesIO()
                save_image = resized
                
                # Convertir RGBA a RGB para JPEGs (no soportan transparencia)
                if image_format.upper() in {"JPEG", "JPG"} and resized.mode not in {"RGB", "L"}:
                    save_image = resized.convert("RGB")
                
                # Guardar en buffer con optimización
                save_image.save(buffer, format=image_format, optimize=True, quality=85)
                
                # Construir ruta y guardar en storage
                variant_path = build_variant_path(original_path, suffix)
                buffer.seek(0)
                
                # Eliminar variante anterior si existe (evita archivos huérfanos)
                default_storage.delete(variant_path)
                
                # Guardar nueva variante
                default_storage.save(variant_path, ContentFile(buffer.read()))
                variant_paths[suffix] = variant_path

    return variant_paths


# ============================================================================
# LIMPIEZA DE ARCHIVOS
# ============================================================================

def delete_file_from_storage(path: str) -> None:
    """
    Elimina un archivo del storage de forma segura.
    
    Args:
        path: Ruta del archivo a eliminar
        
    Nota:
        - Ignora si el archivo no existe (no lanza error)
        - Ignora si path es vacío/None
        - Usado por señales de eliminación en signals.py
    """
    if not path:
        return
    if default_storage.exists(path):
        default_storage.delete(path)


def delete_files_from_storage(paths: Iterable[str]) -> None:
    """
    Elimina múltiples archivos del storage.
    
    Args:
        paths: Iterable de rutas a eliminar
        
    Nota:
        - Llama a delete_file_from_storage para cada path
        - Útil para eliminar archivo original + todas sus variantes
        
    Ejemplo:
        delete_files_from_storage([
            "uploads/images/abc.jpg",
            "uploads/images/abc__thumbnail.jpg",
            "uploads/images/abc__medium.jpg",
            "uploads/images/abc__large.jpg",
        ])
    """
    for path in paths:
        delete_file_from_storage(path)
