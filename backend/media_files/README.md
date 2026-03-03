# Media Files App

App de Django para la gestión de archivos multimedia (imágenes y documentos) con soporte para variantes de imagen, validación de archivos y API REST.

## Descripción

`media_files` es una aplicación Django que proporciona:

- 📸 **Gestión de imágenes** con generación automática de variantes (thumbnail, medium, large)
- 📄 **Gestión de documentos** con validación de tipo y tamaño
- 🔒 **Validación de archivos** por extensión y tamaño
- 🌐 **API REST completa** para operaciones CRUD
- 🗑️ **Limpieza automática** de archivos físicos al eliminar registros
- 🔑 **Nombres únicos** con UUID para evitar colisiones

## Estructura del Proyecto

```
media_files/
├── __init__.py
├── apps.py                 # Configuración de la app
├── models.py              # Modelos ImageFile y DocumentFile
├── serializers.py         # Serializers para API REST
├── views.py               # ViewSets para API
├── urls.py                # Registro de rutas en router
├── utils.py               # Utilidades (validación, redimensionado)
├── signals.py             # Señales para limpieza de archivos
├── admin.py               # Configuración del admin de Django
├── management/
│   └── commands/
│       └── seed_media_files.py  # Comando para poblar datos demo
├── migrations/            # Migraciones de base de datos
├── seed_assets/          # Archivos de semilla para desarrollo
│   ├── images/
│   └── documents/
├── tests/                # Suite de tests
│   ├── __init__.py
│   ├── conftest.py       # Fixtures de pytest
│   ├── test_api.py       # Tests de API REST
│   ├── test_upload.py    # Tests de subida programática
│   └── test_api_access.py # Tests de acceso HTTP
└── README.md             # Este archivo
```

## Modelos

### BaseUploadedFile (Abstracto)

Modelo base abstracto que proporciona campos comunes:

- `file`: Campo de archivo (FileField)
- `original_name`: Nombre original del archivo
- `mime_type`: Tipo MIME del archivo
- `size_bytes`: Tamaño en bytes
- `created_at`: Fecha de creación
- `updated_at`: Fecha de actualización

### ImageFile

Extiende `BaseUploadedFile` para imágenes:

- `file`: ImageField con validación de extensiones de imagen
- `variant_thumbnail`: Ruta a variante thumbnail (150px)
- `variant_medium`: Ruta a variante medium (600px)
- `variant_large`: Ruta a variante large (1200px)

**Extensiones permitidas:** `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`

### DocumentFile

Extiende `BaseUploadedFile` para documentos:

- `file`: FileField con validación de extensiones de documento

**Extensiones permitidas:** `.pdf`, `.ics`, `.txt`, `.docx`, `.xlsx`

### Configuración

**Tamaño máximo de archivo:** 10MB (configurable en `utils.py`)

## API REST

### Endpoints de Imágenes

#### Listar todas las imágenes

```http
GET /api/v1/media/images/
```

#### Crear nueva imagen

```http
POST /api/v1/media/images/
Content-Type: multipart/form-data

file: [archivo de imagen]
```

#### Obtener imagen específica

```http
GET /api/v1/media/images/{id}/
```

#### Eliminar imagen

```http
DELETE /api/v1/media/images/{id}/
```

### Endpoints de Documentos

#### Listar todos los documentos

```http
GET /api/v1/media/documents/
```

#### Crear nuevo documento

```http
POST /api/v1/media/documents/
Content-Type: multipart/form-data

file: [archivo de documento]
```

#### Obtener documento específico

```http
GET /api/v1/media/documents/{id}/
```

#### Eliminar documento

```http
DELETE /api/v1/media/documents/{id}/
```

### Respuestas de la API

#### Ejemplo: ImageFile

```json
{
  "id": 1,
  "file": "http://127.0.0.1:8000/media/uploads/images/9cdd8bcce4b8428f92d030a908e454ad.jpg",
  "original_name": "foto.jpg",
  "mime_type": "image/jpeg",
  "size_bytes": 8229,
  "variant_thumbnail": "uploads/images/9cdd8bcce4b8428f92d030a908e454ad__thumbnail.jpg",
  "variant_medium": "uploads/images/9cdd8bcce4b8428f92d030a908e454ad__medium.jpg",
  "variant_large": "uploads/images/9cdd8bcce4b8428f92d030a908e454ad__large.jpg",
  "created_at": "2025-11-17T18:03:00Z",
  "updated_at": "2025-11-17T18:03:00Z"
}
```

#### Ejemplo: DocumentFile

```json
{
  "id": 1,
  "file": "http://127.0.0.1:8000/media/uploads/documents/8eaaf02bf41b4a6e914fd0255b31f0c2.pdf",
  "original_name": "documento.pdf",
  "mime_type": "application/pdf",
  "size_bytes": 15420,
  "created_at": "2025-11-17T18:03:00Z",
  "updated_at": "2025-11-17T18:03:00Z"
}
```

## Utilidades (utils.py)

### Funciones de Validación

- `validate_max_file_size(file_obj, max_mb=10)`: Valida tamaño máximo de archivo
- `validate_image_extension(file_obj)`: Valida extensiones de imagen
- `validate_document_extension(file_obj)`: Valida extensiones de documento

### Funciones de Ruta

- `get_image_upload_path(instance, filename)`: Genera ruta para imágenes
- `get_document_upload_path(instance, filename)`: Genera ruta para documentos
- `build_variant_path(original_path, suffix)`: Construye ruta para variantes

### Procesamiento de Imágenes

- `generate_image_variants(file_field)`: Genera las 3 variantes de una imagen
- `_resize_image(image, max_width)`: Redimensiona imagen manteniendo aspecto

### Limpieza de Archivos

- `delete_file_from_storage(path)`: Elimina un archivo del storage
- `delete_files_from_storage(paths)`: Elimina múltiples archivos

## Señales (signals.py)

La app utiliza señales de Django para gestión automática:

### pre_delete en ImageFile

- Elimina el archivo original
- Elimina todas las variantes (thumbnail, medium, large)

### pre_delete en DocumentFile

- Elimina el archivo del storage

## Tests

La suite de tests está ubicada en `media_files/tests/`:

### tests/test_api.py

Tests de integración para la API REST usando pytest y Django REST Framework.

**Ejecución:**

```bash
pytest media_files/tests/test_api.py -v
```

### tests/test_upload.py

Script para probar subida programática de archivos y verificar creación de variantes.

**Ejecución:**

```bash
python media_files/tests/test_upload.py
```

**Incluye:**

- Verificación de estructura de carpetas
- Creación de imágenes con variantes
- Creación de documentos
- Verificación de archivos físicos

### tests/test_api_access.py

Script para probar acceso HTTP a archivos a través del servidor.

**Requisitos:** Servidor de desarrollo ejecutándose

**Ejecución:**

```bash
# Terminal 1: Iniciar servidor
python manage.py runserver

# Terminal 2: Ejecutar tests
python media_files/tests/test_api_access.py
```

**Incluye:**

- Test de endpoints de API
- Test de acceso a archivos originales
- Test de acceso a variantes de imagen

## Comandos de Management

### seed_media_files

Puebla la base de datos con archivos de prueba desde `seed_assets/`, leyendo el manifiesto `media_files/seed/media_files.json`.

**Uso:**

```bash
python manage.py seed_media_files
```

**Funcionalidad:**

- Limpia registros existentes (`ImageFile`/`DocumentFile`)
- Carga los assets listados en `media_files/seed/media_files.json` (paths relativos a `seed_assets/`)
- Genera automáticamente variantes de imágenes

## Instalación y Configuración

### 1. Agregar a INSTALLED_APPS

```python
# config/settings/base.py
INSTALLED_APPS = [
    # ...
    "media_files.apps.MediaFilesConfig",
]
```

### 2. Configurar MEDIA

```python
# config/settings/base.py
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
```

### 3. Configurar URLs para desarrollo

```python
# gaudeix_backend/urls.py
from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

### 4. Registrar rutas de API

```python
# gaudeix_backend/urls.py
from rest_framework.routers import DefaultRouter
from media_files.urls import register_routes as register_media_routes

router = DefaultRouter()
register_media_routes(router)

urlpatterns = [
    path("api/v1/", include(router.urls)),
]
```

### 5. Ejecutar migraciones

```bash
python manage.py migrate
```

### 6. Crear estructura de carpetas

```bash
# Las carpetas se crean automáticamente al subir el primer archivo
# O manualmente:
mkdir -p media/uploads/images
mkdir -p media/uploads/documents
```

## Notas de Producción

### Desarrollo vs Producción

- **Desarrollo:** Django sirve archivos media automáticamente cuando `DEBUG=True`
- **Producción:** Configurar servidor web (nginx/Apache) o usar CDN/Object Storage

### Seguridad

- ✅ Validación de extensiones de archivo
- ✅ Validación de tamaño máximo
- ✅ Nombres generados con UUID (evita colisiones y exposición de nombres)
- ✅ Archivos almacenados fuera del código fuente

### Almacenamiento

- **Por defecto:** Sistema de archivos local (`FileSystemStorage`)
- **Recomendado para producción:** S3, Google Cloud Storage, Azure Blob
- **Configuración:** Usar `django-storages` para backends cloud

### Limpieza Automática

- Al eliminar un `ImageFile` o `DocumentFile`, los archivos físicos se eliminan automáticamente
- Las variantes de imagen también se eliminan
- Implementado mediante señales `pre_delete`

## Troubleshooting

### Las imágenes aparecen en rojo/color sólido

**Causa:** Estás usando el script `test_upload.py` que genera imágenes de prueba programáticamente.

**Solución:** Para ver imágenes reales:

```bash
# Asegúrate de tener archivos en seed_assets/
python manage.py seed_media_files
```

### Los archivos no se eliminan del disco

**Verificación:** El sistema SÍ elimina archivos automáticamente mediante señales.

**Prueba:**

```bash
cd media_files/tests
python test_signal_deletion.py
```

**Si no funciona, verificar:**

1. Las señales están registradas en `apps.py`:
   ```python
   def ready(self):
       from . import signals  # noqa: F401
   ```
2. La app está en `INSTALLED_APPS` como `media_files.apps.MediaFilesConfig`

### Las variantes de imagen no se generan

**Causa:** La señal `post_save` no se está ejecutando.

**Verificación:**

1. Revisar que Pillow esté instalado: `pip list | grep -i pillow`
2. Verificar permisos de escritura en `MEDIA_ROOT`
3. Comprobar logs del servidor para errores

### Error al subir archivos grandes

**Causa:** Límite de tamaño configurado en `utils.py`.

**Solución:** Ajustar `MAX_FILE_SIZE_MB` en `media_files/utils.py`:

```python
MAX_FILE_SIZE_MB = 50  # Aumentar según necesidad
```

### Estructura de seed_assets incorrecta

Los archivos deben estar organizados en subdirectorios:

```
seed_assets/
├── images/
│   └── imagen1.png
└── documents/
    └── documento1.pdf
```

No en la raíz de `seed_assets/`.

## Licencia

Este módulo es parte del proyecto Gaudeix Jules.

## Seed assets (convención unificada)

El comando `seed_media_files` prioriza la ruta nueva:

- `backend/seed_assets/media_files/images/`
- `backend/seed_assets/media_files/documents/`

Fallback temporal (deprecated):

- `backend/media_files/seed_assets/images/`
- `backend/media_files/seed_assets/documents/`

Si se usa fallback, el comando imprime warning para facilitar la migración de entornos existentes.
