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

### Deep Seed (Nuclear Cleanup & Sync)

Para resolver inconsistencias y realizar un reset completo y limpio con datos estéticos sincronizados entre Backend y Frontend (incluyendo imágenes AI premium e iconos de Lucide):

```bash
# Limpiar TODO (Categorías, Places, Events, Media) y volver a sembrar con fechas de HOY
python nuclear_cleanup.py

# Limpiar y sembrar con eventos desplazados 10 días al futuro (útil para pruebas de agenda)
python nuclear_cleanup.py --days 10

# Solo limpiar (sin volver a sembrar)
python nuclear_cleanup.py --no-seed
```

`nuclear_cleanup.py` orquesta la eliminación nuclear de registros protegidos y lanza los comandos de seed en el orden correcto (`places_category`, `events_category`, `tags`, `places`, `events`).

`seed_places` usa las imágenes incluidas en `seed/images/` y crea datos de ejemplo con media y traducciones.
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

## Convención unificada de seed assets (media)

A partir de ahora, los archivos estáticos para seeds deben vivir bajo una convención única:

```text
backend/seed_assets/<dominio>/images/
backend/seed_assets/<dominio>/documents/
backend/seed_assets/<dominio>/videos/
```

Dominios con consumo actual de media: `media_files`, `events`, `places`, `routes`, `festes`, `site_settings`.

Compatibilidad temporal:

- Los comandos de seed buscan primero la ruta nueva en `backend/seed_assets/...`.
- Si no existe, hacen fallback automático a rutas legacy dentro de `management/commands/...` (o `media_files/seed_assets`) y muestran warning deprecado.

### Checklist de migración de assets

1. Crear carpeta destino en `backend/seed_assets/<dominio>/`.
2. Mover archivos legacy a `images/`, `documents/` o `videos/` según tipo.
3. Ejecutar el comando seed del dominio y verificar que **no** aparece warning `DEPRECATED seed assets path in use`.
4. Validar creación de `ImageFile`, `DocumentFile` o `VideoFile` en admin/API.
5. Cuando todos los entornos estén migrados, eliminar assets legacy de `management/commands/...`.
