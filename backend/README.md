# Gaudeix Backend

Configuración base de Django para el proyecto **gaudeix_backend**.

## Instalación de Dependencias

### Producción
```bash
# Desde la raíz del proyecto
.venv\Scripts\python.exe -m pip install -r backend/requirements.txt

# O desde backend/ con entorno activado
cd backend
..\\.venv\Scripts\activate
pip install -r requirements.txt
```

### Desarrollo (incluye testing y linting)
```bash
# Instalar dependencias de desarrollo adicionales
pip install -r requirements-dev.txt
```

### Notas Importantes
- **Pillow**: Requiere instalación correcta para procesamiento de imágenes
- **Cryptography**: Necesaria para JWT/autenticación. En Windows, asegúrate de que `cffi` esté instalado
- **PostgreSQL**: Requiere `psycopg` y `psycopg-binary` para la conexión a la base de datos

Si tienes problemas con `cryptography` en Windows:
```bash
pip install --force-reinstall cffi
pip install --force-reinstall cryptography==46.0.3
```

## Entorno rápido (CLI Codex / Windows)

```bash
# Activar desde la raíz del proyecto:
cd ..
.\.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac
cd backend

# O usar directamente sin activar (desde raíz):
.venv\Scripts\python.exe backend/manage.py migrate
.venv\Scripts\python.exe -m pytest backend/
```

## Variables de entorno

```bash
# Copia rápida desde raíz
cp ../.env_backend backend/.env
# o desde el ejemplo
cp backend/.env.example backend/.env
```

Valores principales (PostgreSQL):
```
DATABASE_URL=postgresql://postgres:thos@localhost:5432/migration
DJANGO_SECRET_KEY=dev-secret-key-change-in-production-123456789
ALLOWED_HOSTS=localhost,127.0.0.1
DJANGO_ALLOWED_CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:4173,http://localhost:4174
```

## Migraciones

```bash
# Windows
python manage.py migrate
# Linux/Mac
python manage.py migrate
```

## Seeds obligatorios (usuarios, eventos, lugares)

Ejecuta estos comandos tras migrar para evitar errores en admin/API:

```bash
# Windows
python manage.py seed_users
python manage.py seed_events_category
python manage.py seed_places_category
python manage.py seed_places

# Linux/Mac
python manage.py seed_users
python manage.py seed_events_category
python manage.py seed_places_category
python manage.py seed_places
```

Seed general (secuencial):

```bash
# Seeds en orden (usuarios, media, pages, settings, social, places, events...)
python manage.py seed_all

# Hard reset (PELIGROSO): flush + migrate + seed_all
python manage.py seed_all --hard-reset --noinput
```

`seed_places` usa las imágenes incluidas en `places/management/commands/images/` y crea datos de ejemplo con media y traducciones.
Los datos de seeds están separados en JSON por app (p.ej. `places/seed/places.json`, `events/seed/events.json`, `core/seed/tags.json`).

Usuarios creados:
- **Admin**: `ADMIN_USER` / `ADMIN_PASSWORD` (defaults: `admin` / `admin123`)
- **System**: `SYSTEM_USER` / `SYSTEM_PASSWORD` (defaults: `system` / `system123`)

## Pruebas

```bash
ENVIRONMENT=test backend/.venv_win/Scripts/python.exe -m pytest
```

## Notas

- Usa siempre `.venv` de la raíz del proyecto como intérprete en el IDE.
- Para desarrollo rápido con SQLite: `ENVIRONMENT=local python manage.py migrate`.
