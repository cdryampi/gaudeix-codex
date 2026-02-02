# Dependencias del Backend

## Estructura de Archivos

- **requirements.txt**: Dependencias de producción
- **requirements-dev.txt**: Dependencias de desarrollo (testing, linting, type checking)

## Dependencias Principales

### Core Django (Framework Web)

- `Django==5.2.8` - Framework web principal
- `djangorestframework==3.16.1` - API REST
- `drf-spectacular==0.29.0` - Documentación OpenAPI/Swagger

### Autenticación y Seguridad

- `django-allauth==65.13.1` - Sistema de autenticación completo
- `djangorestframework_simplejwt==5.5.1` - Tokens JWT
- `dj-rest-auth==7.0.2` - Endpoints de autenticación REST
- `cryptography==46.0.3` - Criptografía (necesaria para JWT)
- `cffi==2.0.0` - Foreign Function Interface (requerida por cryptography)
- `PyJWT==2.10.1` - JSON Web Tokens

### Base de Datos

- `psycopg==3.2.13` - Adaptador PostgreSQL (versión 3)
- `psycopg-binary==3.2.13` - Versión binaria para Windows

### Internacionalización

- `django-parler==2.3` - Traducciones de modelos
- `django-parler-rest==2.2` - Integración con DRF

### Media y Archivos

- `pillow==12.0.0` - Procesamiento de imágenes

### Firebase

- `firebase-admin==6.8.0` - SDK de Firebase Admin (FCM, Firestore)

### LLM (Large Language Models)

- `openai==1.58.1` - API de OpenAI (GPT-4, etc.)
- `google-generativeai==0.8.3` - API de Google (Gemini)
- `anthropic==0.42.0` - API de Anthropic (Claude)
- `mistralai==1.2.4` - API de Mistral AI
- `groq==0.13.0` - API de Groq

### Utilidades Django

- `django-cors-headers==4.9.0` - CORS para frontend
- `django-simple-history==3.10.1` - Historial de cambios en modelos
- `django-solo==2.4.0` - Singleton models
- `django-environ==0.12.0` - Variables de entorno

### HTTP y Networking

- `requests==2.32.5` - Cliente HTTP síncrono
- `httpx==0.27.2` - Cliente HTTP asíncrono
- `urllib3==2.5.0` - Utilidades HTTP de bajo nivel

## Dependencias de Desarrollo

### Testing

- `pytest==9.0.1` - Framework de testing
- `pytest-django==4.11.1` - Integración Pytest-Django
- `pytest-cov==6.0.0` - Cobertura de código
- `coverage==7.13.1` - Medición de cobertura
- `tomli==2.4.0` - Parser TOML (requerido por pytest/mypy)

### Linting y Type Checking

- `ruff==0.9.1` - Linter y formatter rápido
- `mypy==1.14.1` - Type checker estático
- `mypy_extensions==1.1.0` - Extensiones para mypy

## Problemas Comunes

### Windows: Error de Cryptography/JWT

**Síntoma**: `ImportError: DLL load failed while importing _rust`

**Solución**:

```bash
pip install --force-reinstall cffi
pip install --force-reinstall cryptography==46.0.3
```

### Windows: Error de Pillow

**Síntoma**: `ImportError: cannot import name '_imaging'`

**Solución**:

```bash
pip uninstall pillow
pip install pillow==12.0.0
```

### PostgreSQL: Error de conexión

**Síntoma**: `ModuleNotFoundError: No module named 'psycopg'`

**Solución**:

```bash
pip install psycopg==3.2.13 psycopg-binary==3.2.13
```

## Actualización de Dependencias

### Generar requirements.txt actualizado

```bash
# Desde backend/ con entorno activado
pip freeze > requirements_temp.txt

# Revisar y organizar manualmente en requirements.txt
# Separar dependencias de desarrollo en requirements-dev.txt
```

### Verificar dependencias

```bash
# Verificar que todas las dependencias estén correctamente instaladas
pip check

# Nota: Los warnings sobre "platform" en Windows son normales
```

## Versiones de Python

- **Mínima**: Python 3.10
- **Recomendada**: Python 3.10 o 3.11
- **Probada**: Python 3.10

## Instalación Completa

```bash
# 1. Crear entorno virtual (desde raíz del proyecto)
python -m venv .venv

# 2. Activar entorno
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac

# 3. Instalar dependencias de producción
pip install -r backend/requirements.txt

# 4. Instalar dependencias de desarrollo
pip install -r backend/requirements-dev.txt

# 5. Verificar instalación
pip check
python backend/manage.py check

# 6. Ejecutar migraciones
python backend/manage.py migrate

# 7. Ejecutar servidor
python backend/manage.py runserver
```
