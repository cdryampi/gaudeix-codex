"""Signals for media file lifecycle management.

We centralize file deletion and variant generation in signals so that files
never stay orphaned regardless of whether records are edited from the admin,
API, or seeds. This avoids duplicating cleanup logic in multiple entrypoints.

IMPORTANTE: Las señales se registran automáticamente en apps.py mediante:
    def ready(self):
        from . import signals  # noqa: F401

Las señales están conectadas mediante el decorador @receiver que asocia
funciones con eventos de Django (pre_save, post_save, post_delete).
"""

from __future__ import annotations

from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch import receiver

from . import utils
from .models import DocumentFile, ImageFile


# ============================================================================
# SEÑALES PARA IMAGEFILE
# ============================================================================

@receiver(pre_save, sender=ImageFile)
def cleanup_image_on_replace(sender, instance: ImageFile, **kwargs) -> None:
    """
    Limpia archivos anteriores cuando se reemplaza una imagen.
    
    Señal: pre_save (se ejecuta ANTES de guardar en BD)
    
    Flujo:
        1. Si es nueva imagen (pk=None): marca que cambió el archivo
        2. Si se está actualizando: obtiene versión anterior de BD
        3. Si el archivo cambió: elimina archivo anterior + variantes
        4. Marca instancia para que post_save genere nuevas variantes
    
    Atributo especial:
        instance._file_has_changed: Flag temporal para comunicar con post_save
        (no se guarda en BD, solo existe en memoria durante el request)
    
    Elimina:
        - Archivo original anterior
        - Todas las variantes anteriores (thumbnail, medium, large)
        
    Nota:
        - No hace nada si el archivo no cambió (solo metadatos)
        - Previene archivos huérfanos en storage
    """
    # Flag para comunicar con post_save si debe generar variantes
    instance._file_has_changed = False  # type: ignore[attr-defined]
    
    # Si es nueva imagen, marcar que cambió
    if not instance.pk:
        instance._file_has_changed = True  # type: ignore[attr-defined]
        return

    # Obtener versión anterior de BD para comparar
    try:
        previous = sender.objects.get(pk=instance.pk)
    except sender.DoesNotExist:
        # El registro ya no existe (caso raro)
        instance._file_has_changed = True  # type: ignore[attr-defined]
        return

    # Si el archivo cambió, eliminar el anterior y sus variantes
    if previous.file and instance.file and previous.file.name != instance.file.name:
        utils.delete_files_from_storage(
            [
                previous.file.name,           # Archivo original
                previous.variant_thumbnail,   # Variante thumbnail
                previous.variant_medium,      # Variante medium
                previous.variant_large,       # Variante large
            ]
        )
        instance._file_has_changed = True  # type: ignore[attr-defined]


@receiver(post_save, sender=ImageFile)
def generate_image_variants(sender, instance: ImageFile, created: bool, **kwargs) -> None:
    """
    Genera variantes redimensionadas después de guardar la imagen.
    
    Señal: post_save (se ejecuta DESPUÉS de guardar en BD)
    
    Flujo:
        1. Verifica si es nueva o si cambió el archivo
        2. Genera 3 variantes: thumbnail (150px), medium (600px), large (1200px)
        3. Actualiza BD con rutas de variantes
        4. Actualiza instancia en memoria con las rutas
    
    Cuándo se ejecuta:
        - Al crear nueva imagen (created=True)
        - Al actualizar y el archivo cambió (_file_has_changed=True)
        - NO se ejecuta si solo cambian metadatos (para eficiencia)
    
    Actualiza en BD:
        - variant_thumbnail: ruta a miniatura
        - variant_medium: ruta a tamaño medio
        - variant_large: ruta a tamaño grande
        
    Nota:
        - Usa .update() para evitar disparar otra señal post_save
        - También actualiza la instancia en memoria para acceso inmediato
    """
    # Verificar si debe generar variantes
    file_has_changed = getattr(instance, "_file_has_changed", False)
    if not (created or file_has_changed):
        return  # Solo metadatos cambiaron, no regenerar variantes
    
    if not instance.file:
        return  # No hay archivo para procesar

    # Generar variantes usando PIL
    variant_paths = utils.generate_image_variants(instance.file)
    if not variant_paths:
        return  # Error al generar variantes

    # Actualizar BD con rutas de variantes
    # Usa .update() en lugar de .save() para evitar loop infinito de señales
    sender.objects.filter(pk=instance.pk).update(
        variant_thumbnail=variant_paths.get("thumbnail", ""),
        variant_medium=variant_paths.get("medium", ""),
        variant_large=variant_paths.get("large", ""),
    )
    
    # Actualizar instancia en memoria para que tenga las rutas actualizadas
    instance.variant_thumbnail = variant_paths.get("thumbnail", "")
    instance.variant_medium = variant_paths.get("medium", "")
    instance.variant_large = variant_paths.get("large", "")


@receiver(post_delete, sender=ImageFile)
def delete_image_files(sender, instance: ImageFile, **kwargs) -> None:
    """
    Elimina archivos físicos cuando se borra el registro de BD.
    
    Señal: post_delete (se ejecuta DESPUÉS de borrar de BD)
    
    Elimina:
        - Archivo original
        - Todas las variantes (thumbnail, medium, large)
    
    Cuándo se ejecuta:
        - Al hacer .delete() en una instancia
        - Al hacer .delete() en un QuerySet
        - Al borrar desde el admin de Django
        - Al borrar mediante API
        
    Nota:
        - Es seguro si los archivos ya no existen (ignora errores)
        - Previene archivos huérfanos en storage
        - Se ejecuta dentro de la transacción de Django
    """
    utils.delete_files_from_storage(
        [
            instance.file.name if instance.file else "",  # Archivo original
            instance.variant_thumbnail,                    # Variante thumbnail
            instance.variant_medium,                       # Variante medium
            instance.variant_large,                        # Variante large
        ]
    )


# ============================================================================
# SEÑALES PARA DOCUMENTFILE
# ============================================================================

@receiver(pre_save, sender=DocumentFile)
def cleanup_document_on_replace(sender, instance: DocumentFile, **kwargs) -> None:
    """
    Limpia archivo anterior cuando se reemplaza un documento.
    
    Señal: pre_save (se ejecuta ANTES de guardar en BD)
    
    Flujo:
        1. Si es nuevo documento (pk=None): no hace nada
        2. Si se está actualizando: obtiene versión anterior de BD
        3. Si el archivo cambió: elimina archivo anterior
    
    Elimina:
        - Archivo original anterior
        
    Nota:
        - Similar a cleanup_image_on_replace pero sin variantes
        - Los documentos no generan variantes redimensionadas
    """
    # Si es nuevo documento, no hay nada que limpiar
    if not instance.pk:
        return
    
    # Obtener versión anterior de BD para comparar
    try:
        previous = sender.objects.get(pk=instance.pk)
    except sender.DoesNotExist:
        return  # El registro ya no existe

    # Si el archivo cambió, eliminar el anterior
    if previous.file and instance.file and previous.file.name != instance.file.name:
        utils.delete_file_from_storage(previous.file.name)


@receiver(post_delete, sender=DocumentFile)
def delete_document_file(sender, instance: DocumentFile, **kwargs) -> None:
    """
    Elimina archivo físico cuando se borra el registro de BD.
    
    Señal: post_delete (se ejecuta DESPUÉS de borrar de BD)
    
    Elimina:
        - Archivo original
    
    Cuándo se ejecuta:
        - Al hacer .delete() en una instancia
        - Al hacer .delete() en un QuerySet
        - Al borrar desde el admin de Django
        - Al borrar mediante API
        
    Nota:
        - Es seguro si el archivo ya no existe (ignora errores)
        - Similar a delete_image_files pero sin variantes
    """
    utils.delete_file_from_storage(instance.file.name if instance.file else "")
