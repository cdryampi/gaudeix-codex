# Media Files - Tests

Este directorio contiene la suite completa de tests para la app `media_files`.

## Tests de Pytest (Integración)

Tests de integración que usan pytest y fixtures de Django/DRF.

### Ejecutar todos los tests

```bash
# Desde el directorio backend
pytest media_files/tests/ -v
```

### Ejecutar tests específicos

```bash
# Tests de API
pytest media_files/tests/test_api.py -v

# Tests de modelos
pytest media_files/tests/test_models.py -v

# Tests de utilidades
pytest media_files/tests/test_utils.py -v

# Tests de limpieza
pytest media_files/tests/test_cleanup.py -v
```

### Tests con cobertura

```bash
pytest media_files/tests/ --cov=media_files --cov-report=html
```

## Scripts de Prueba Manual

Scripts independientes para pruebas manuales y verificación del sistema.

### test_upload.py

Prueba la creación de archivos programáticamente y verifica la generación de variantes.

**Ejecutar:**

```bash
cd media_files/tests
python test_upload.py
```

**Qué verifica:**

- ✓ Estructura de carpetas media
- ✓ Creación de ImageFile con variantes
- ✓ Creación de DocumentFile
- ✓ Archivos físicos en disco
- ✓ Metadatos en base de datos

### test_api_access.py

Prueba el acceso HTTP a archivos a través del servidor de desarrollo.

**Requisitos previos:**

```bash
# Terminal 1: Iniciar servidor
python manage.py runserver
```

**Ejecutar:**

```bash
# Terminal 2
cd media_files/tests
python test_api_access.py
```

**Qué verifica:**

- ✓ GET /api/v1/media/images/
- ✓ GET /api/v1/media/documents/
- ✓ Acceso HTTP a archivos originales
- ✓ Acceso HTTP a variantes de imagen

## Fixtures (conftest.py)

El archivo `conftest.py` proporciona fixtures compartidas:

- `api_client`: Cliente de API REST configurado
- `media_storage`: Storage temporal para tests
- `make_test_image()`: Función para crear imágenes de prueba
- `make_test_document()`: Función para crear documentos de prueba

## Ejecutar Tests en CI/CD

```bash
# Con coverage y output en formato CI
pytest media_files/tests/ \
  --cov=media_files \
  --cov-report=xml \
  --cov-report=term \
  --junitxml=junit.xml \
  -v
```

## Notas

- Los tests de pytest usan base de datos temporal
- Los archivos de media se crean en storage temporal durante tests
- Los scripts manuales usan la base de datos real (¡cuidado en producción!)
- Se recomienda ejecutar scripts manuales solo en desarrollo
