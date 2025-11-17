"""Script para probar la subida de archivos."""
import os
import sys
from io import BytesIO
from pathlib import Path

import django

# Configurar Django - navegar al directorio raíz del backend
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BACKEND_DIR))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image

from media_files.models import DocumentFile, ImageFile


def create_test_image():
    """Crea una imagen de prueba en memoria con patrón de colores."""
    # Crear imagen con gradiente en lugar de color sólido
    img = Image.new("RGB", (800, 600))
    pixels = img.load()
    
    # Crear un patrón de gradiente
    for i in range(800):
        for j in range(600):
            # Gradiente de rojo a azul
            r = int(255 * (1 - i / 800))
            g = int(128 * (j / 600))
            b = int(255 * (i / 800))
            pixels[i, j] = (r, g, b)
    
    buffer = BytesIO()
    img.save(buffer, format="JPEG")
    buffer.seek(0)
    return SimpleUploadedFile(
        "test_image.jpg",
        buffer.read(),
        content_type="image/jpeg",
    )


def create_test_document():
    """Crea un documento de prueba en memoria."""
    content = b"Este es un documento de prueba.\nLinea 2\nLinea 3"
    return SimpleUploadedFile(
        "test_document.txt",
        content,
        content_type="text/plain",
    )


def test_image_upload():
    """Prueba subir una imagen."""
    print("=" * 60)
    print("Probando subida de imagen...")
    print("=" * 60)

    # Crear imagen de prueba
    test_file = create_test_image()

    # Crear ImageFile
    image_file = ImageFile.objects.create(
        file=test_file,
        original_name="test_image.jpg",
        mime_type="image/jpeg",
        size_bytes=test_file.size,
    )

    print(f"✓ Imagen creada con ID: {image_file.id}")
    print(f"  - Ruta del archivo: {image_file.file.name}")
    print(f"  - Ruta completa: {image_file.file.path}")
    print(f"  - URL: {image_file.file.url}")
    print(f"  - Tamaño: {image_file.size_bytes} bytes")
    print(f"  - Existe físicamente: {os.path.exists(image_file.file.path)}")

    if image_file.variant_thumbnail:
        print(f"  - Miniatura: {image_file.variant_thumbnail}")
    if image_file.variant_medium:
        print(f"  - Mediana: {image_file.variant_medium}")
    if image_file.variant_large:
        print(f"  - Grande: {image_file.variant_large}")

    return image_file


def test_document_upload():
    """Prueba subir un documento."""
    print("\n" + "=" * 60)
    print("Probando subida de documento...")
    print("=" * 60)

    # Crear documento de prueba
    test_file = create_test_document()

    # Crear DocumentFile
    doc_file = DocumentFile.objects.create(
        file=test_file,
        original_name="test_document.txt",
        mime_type="text/plain",
        size_bytes=test_file.size,
    )

    print(f"✓ Documento creado con ID: {doc_file.id}")
    print(f"  - Ruta del archivo: {doc_file.file.name}")
    print(f"  - Ruta completa: {doc_file.file.path}")
    print(f"  - URL: {doc_file.file.url}")
    print(f"  - Tamaño: {doc_file.size_bytes} bytes")
    print(f"  - Existe físicamente: {os.path.exists(doc_file.file.path)}")

    return doc_file


def list_uploaded_files():
    """Lista todos los archivos subidos."""
    print("\n" + "=" * 60)
    print("Archivos en la base de datos:")
    print("=" * 60)

    images = ImageFile.objects.all()
    documents = DocumentFile.objects.all()

    print(f"\nImágenes: {images.count()}")
    for img in images:
        print(f"  - ID {img.id}: {img.original_name} ({img.file.name})")

    print(f"\nDocumentos: {documents.count()}")
    for doc in documents:
        print(f"  - ID {doc.id}: {doc.original_name} ({doc.file.name})")


def check_media_structure():
    """Verifica la estructura de carpetas de media."""
    print("\n" + "=" * 60)
    print("Verificando estructura de carpetas...")
    print("=" * 60)

    from django.conf import settings

    media_root = settings.MEDIA_ROOT
    print(f"MEDIA_ROOT: {media_root}")
    print(f"MEDIA_URL: {settings.MEDIA_URL}")

    folders = [
        media_root,
        os.path.join(media_root, "uploads"),
        os.path.join(media_root, "uploads", "images"),
        os.path.join(media_root, "uploads", "documents"),
    ]

    for folder in folders:
        exists = os.path.exists(folder)
        status = "✓" if exists else "✗"
        print(f"{status} {folder}")


if __name__ == "__main__":
    check_media_structure()
    list_uploaded_files()

    # Subir archivos de prueba
    img = test_image_upload()
    doc = test_document_upload()

    # Listar de nuevo
    list_uploaded_files()

    print("\n" + "=" * 60)
    print("Prueba completada correctamente!")
    print("=" * 60)
