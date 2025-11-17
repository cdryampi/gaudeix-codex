"""Script para verificar señales y eliminación de archivos."""
import os
import sys
from pathlib import Path

import django

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BACKEND_DIR))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.db.models import signals
from media_files.models import ImageFile, DocumentFile


def check_signals():
    """Verifica que las señales estén registradas."""
    print("=" * 60)
    print("Verificando señales registradas")
    print("=" * 60)
    
    # Verificar señales post_delete
    post_delete_receivers = [
        (r[0][0], r[1]()) 
        for r in signals.post_delete.receivers 
        if hasattr(r[1](), '__name__')
    ]
    
    print("\nSeñales post_delete:")
    for lookup, receiver in post_delete_receivers:
        print(f"  - {receiver.__name__} para {lookup}")
    
    # Verificar señales pre_save
    pre_save_receivers = [
        (r[0][0], r[1]()) 
        for r in signals.pre_save.receivers 
        if hasattr(r[1](), '__name__')
    ]
    
    print("\nSeñales pre_save:")
    for lookup, receiver in pre_save_receivers:
        print(f"  - {receiver.__name__} para {lookup}")
    
    # Verificar señales post_save
    post_save_receivers = [
        (r[0][0], r[1]()) 
        for r in signals.post_save.receivers 
        if hasattr(r[1](), '__name__')
    ]
    
    print("\nSeñales post_save:")
    for lookup, receiver in post_save_receivers:
        print(f"  - {receiver.__name__} para {lookup}")


def test_image_deletion():
    """Prueba la eliminación de una imagen y sus archivos."""
    from io import BytesIO
    from django.core.files.uploadedfile import SimpleUploadedFile
    from PIL import Image
    
    print("\n" + "=" * 60)
    print("Probando eliminación de ImageFile")
    print("=" * 60)
    
    # Crear imagen de prueba
    img = Image.new("RGB", (100, 100), color="blue")
    buffer = BytesIO()
    img.save(buffer, format="JPEG")
    buffer.seek(0)
    
    test_file = SimpleUploadedFile(
        "test_delete.jpg",
        buffer.read(),
        content_type="image/jpeg",
    )
    
    # Crear registro
    image = ImageFile.objects.create(
        file=test_file,
        original_name="test_delete.jpg",
        mime_type="image/jpeg",
        size_bytes=test_file.size,
    )
    
    print(f"\n✓ Imagen creada con ID: {image.id}")
    print(f"  - Archivo: {image.file.name}")
    print(f"  - Ruta completa: {image.file.path}")
    print(f"  - Existe antes de eliminar: {os.path.exists(image.file.path)}")
    
    # Guardar rutas para verificar después
    file_path = image.file.path
    thumbnail_path = os.path.join(
        os.path.dirname(file_path),
        os.path.basename(image.variant_thumbnail) if image.variant_thumbnail else ""
    )
    
    print(f"\n  - Thumbnail: {image.variant_thumbnail}")
    if image.variant_thumbnail:
        full_thumbnail = os.path.join(BACKEND_DIR, "media", image.variant_thumbnail)
        print(f"  - Thumbnail existe: {os.path.exists(full_thumbnail)}")
    
    # Eliminar el registro
    print("\n🗑️  Eliminando registro...")
    image_id = image.id
    image.delete()
    
    print(f"\n✓ Registro eliminado")
    print(f"  - El archivo original existe después: {os.path.exists(file_path)}")
    
    if image.variant_thumbnail:
        full_thumbnail = os.path.join(BACKEND_DIR, "media", image.variant_thumbnail)
        print(f"  - El thumbnail existe después: {os.path.exists(full_thumbnail)}")
    
    # Verificar en base de datos
    exists_in_db = ImageFile.objects.filter(id=image_id).exists()
    print(f"  - Existe en BD: {exists_in_db}")


def test_document_deletion():
    """Prueba la eliminación de un documento y su archivo."""
    from django.core.files.uploadedfile import SimpleUploadedFile
    
    print("\n" + "=" * 60)
    print("Probando eliminación de DocumentFile")
    print("=" * 60)
    
    # Crear documento de prueba
    content = b"Este es un documento de prueba para eliminar"
    test_file = SimpleUploadedFile(
        "test_delete.txt",
        content,
        content_type="text/plain",
    )
    
    # Crear registro
    doc = DocumentFile.objects.create(
        file=test_file,
        original_name="test_delete.txt",
        mime_type="text/plain",
        size_bytes=len(content),
    )
    
    print(f"\n✓ Documento creado con ID: {doc.id}")
    print(f"  - Archivo: {doc.file.name}")
    print(f"  - Ruta completa: {doc.file.path}")
    print(f"  - Existe antes de eliminar: {os.path.exists(doc.file.path)}")
    
    # Guardar ruta para verificar después
    file_path = doc.file.path
    
    # Eliminar el registro
    print("\n🗑️  Eliminando registro...")
    doc_id = doc.id
    doc.delete()
    
    print(f"\n✓ Registro eliminado")
    print(f"  - El archivo existe después: {os.path.exists(file_path)}")
    
    # Verificar en base de datos
    exists_in_db = DocumentFile.objects.filter(id=doc_id).exists()
    print(f"  - Existe en BD: {exists_in_db}")


if __name__ == "__main__":
    check_signals()
    test_image_deletion()
    test_document_deletion()
    
    print("\n" + "=" * 60)
    print("✓ Pruebas completadas")
    print("=" * 60)
