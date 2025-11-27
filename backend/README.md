# Gaudeix Backend

Este directorio contiene la configuración base de Django para el proyecto **gaudeix_backend**.

## Requisitos

1. Crear y activar un entorno virtual.
2. Instalar dependencias:

   ```bash
   pip install -r requirements.txt
   ```

### Entorno virtual usado por Codex

El CLI de Codex ya tiene un entorno preparado en `backend/.venv_win`. Úsalo así:

```bash
# Activar (opcional) en bash:
source backend/.venv_win/Scripts/activate

# O ejecutar comandos directamente:
backend/.venv_win/Scripts/python.exe manage.py migrate
backend/.venv_win/Scripts/python.exe -m pytest
```

## Variables de entorno

### Configuración Rápida

```bash
# Opción 1: Copiar desde la raíz del proyecto
cp ../.env_backend .env

# Opción 2: Copiar desde el ejemplo
cp .env.example .env
```

### Variables Principales

El archivo `.env` debe contener:

**Base de Datos (PostgreSQL local):**
```bash
DATABASE_URL=postgresql://postgres:thos@localhost:5432/migration
DB_NAME=migration
DB_USER=postgres
DB_PASSWORD=thos
DB_HOST=localhost
DB_PORT=5432
```

**Usuarios Seed (para comando `seed_users`):**
```bash
ADMIN_USER=yampi
ADMIN_PASSWORD=thos
SYSTEM_USER=gaudeix
SYSTEM_PASSWORD=gaudeix@2023
```

**Django:**
```bash
DJANGO_SECRET_KEY=dev-secret-key-change-in-production-123456789
ENVIRONMENT=local
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DJANGO_ALLOWED_CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:4173,http://localhost:4174
```

### Perfiles de Entorno

- `ENVIRONMENT=local`: SQLite (desarrollo rápido sin PostgreSQL)
- `ENVIRONMENT=test`: SQLite en memoria (para tests)
- `ENVIRONMENT=production`: PostgreSQL con todas las variables configuradas

Para desarrollo local puede dejar `ENVIRONMENT=local` si no tiene PostgreSQL, o usar la configuración completa con PostgreSQL como se muestra arriba.

## Migraciones

### Con PostgreSQL (recomendado)

```bash
# Windows
.\.venv_win\Scripts\python.exe manage.py migrate

# Linux/Mac
python manage.py migrate
```

### Con SQLite (desarrollo rápido)

```bash
ENVIRONMENT=local python manage.py migrate
```

## Crear Usuarios Iniciales

Después de las migraciones, ejecute el comando de seed para crear los usuarios admin y system:

```bash
# Windows
.\.venv_win\Scripts\python.exe manage.py seed_users

# Linux/Mac
python manage.py seed_users
```

Esto creará:
- **Admin**: `yampi` / `thos` (superusuario con acceso a Django Admin)
- **System**: `gaudeix` / `gaudeix@2023` (usuario estándar)

## Pruebas

Puede ejecutar las pruebas integradas de Django con la base de datos SQLite en memoria:

```bash
ENVIRONMENT=test python manage.py test
```

Si prefiere utilizar `pytest`, asegúrese de exportar `ENVIRONMENT=test` antes de ejecutarlo para que la configuración cargue la base de datos temporal.

## Ejecutar con Codex/VS Code (evitar problemas de entorno)

Si lanzas comandos desde el IDE o la terminal integrada, usa siempre el entorno `backend/.venv_win` para evitar errores y reintentos:

```bash
# Activar entorno (opcional):
source backend/.venv_win/Scripts/activate

# O ejecutar directo sin activar:
backend/.venv_win/Scripts/python.exe manage.py migrate          # migraciones
ENVIRONMENT=test backend/.venv_win/Scripts/python.exe -m pytest  # tests
```

Recomendación: configura en VS Code la opción de terminal por defecto a `backend/.venv_win/Scripts/python.exe` para que cualquier tarea o debug use ese intérprete automáticamente.
