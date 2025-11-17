"""Script para verificar el acceso a los archivos a través de la API."""
import requests

BASE_URL = "http://127.0.0.1:8000"


def test_api_list_images():
    """Prueba listar imágenes a través de la API."""
    print("=" * 60)
    print("Probando GET /api/v1/media/images/")
    print("=" * 60)

    response = requests.get(f"{BASE_URL}/api/v1/media/images/")
    print(f"Status: {response.status_code}")

    if response.status_code == 200:
        data = response.json()
        print(f"Total imágenes: {len(data)}")
        for img in data:
            print(f"\nImagen ID {img['id']}:")
            print(f"  - Original: {img['original_name']}")
            print(f"  - URL: {img['file']}")
            print(f"  - Thumbnail: {img.get('variant_thumbnail', 'N/A')}")
            print(f"  - Medium: {img.get('variant_medium', 'N/A')}")
            print(f"  - Large: {img.get('variant_large', 'N/A')}")
    else:
        print(f"Error: {response.text}")


def test_api_list_documents():
    """Prueba listar documentos a través de la API."""
    print("\n" + "=" * 60)
    print("Probando GET /api/v1/media/documents/")
    print("=" * 60)

    response = requests.get(f"{BASE_URL}/api/v1/media/documents/")
    print(f"Status: {response.status_code}")

    if response.status_code == 200:
        data = response.json()
        print(f"Total documentos: {len(data)}")
        for doc in data:
            print(f"\nDocumento ID {doc['id']}:")
            print(f"  - Original: {doc['original_name']}")
            print(f"  - URL: {doc['file']}")
            print(f"  - Tamaño: {doc['size_bytes']} bytes")
    else:
        print(f"Error: {response.text}")


def test_file_access(url):
    """Prueba acceder a un archivo específico."""
    print(f"\nProbando acceso a: {url}")
    # Si la URL ya es completa, usarla directamente
    if url.startswith("http"):
        full_url = url
    else:
        # Agregar /media/ si no está presente
        if not url.startswith("/"):
            url = f"/media/{url}"
        full_url = f"{BASE_URL}{url}"
    response = requests.get(full_url)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"✓ Archivo accesible ({len(response.content)} bytes)")
    else:
        print(f"✗ Error al acceder al archivo")
    return response.status_code == 200


if __name__ == "__main__":
    try:
        # Listar imágenes
        test_api_list_images()

        # Listar documentos
        test_api_list_documents()

        # Probar acceso a archivos
        print("\n" + "=" * 60)
        print("Probando acceso directo a archivos...")
        print("=" * 60)

        # Obtener URLs de la API
        images = requests.get(f"{BASE_URL}/api/v1/media/images/").json()
        documents = requests.get(f"{BASE_URL}/api/v1/media/documents/").json()

        if images:
            img = images[0]
            test_file_access(img["file"])
            if img.get("variant_thumbnail"):
                test_file_access(img["variant_thumbnail"])

        if documents:
            doc = documents[0]
            test_file_access(doc["file"])

        print("\n" + "=" * 60)
        print("✓ Pruebas completadas!")
        print("=" * 60)

    except requests.exceptions.ConnectionError:
        print("\n✗ Error: No se pudo conectar al servidor.")
        print("Asegúrate de que el servidor esté funcionando en http://127.0.0.1:8000")
    except Exception as e:
        print(f"\n✗ Error inesperado: {e}")
