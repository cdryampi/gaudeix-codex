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

## Seeds (flujo estandarizado)

Comando recomendado (local o CI):

```bash
python manage.py seed_all
```

Opciones estandar:

```bash
# reset completo + migraciones + seed
python manage.py seed_all --reset --noinput

# ejecucion reproducible (determinista para seeds con aleatoriedad)
python manage.py seed_all --seed 42

# ejecutar solo dominios concretos
python manage.py seed_all --only users,events

# simular sin escribir en base de datos
python manage.py seed_all --dry-run --only users,events
```

Compatibilidad legacy:

- `--hard-reset` se mantiene como alias deprecado de `--reset`.
- `nuclear_cleanup.py` se mantiene por compatibilidad, pero el flujo recomendado es `seed_all`.

Notas de orden/dependencias:

- `seed_all` orquesta el orden de comandos para evitar dependencias frágiles.
- Los datos de seeds están separados por app (p.ej. `places/seed/places.json`, `events/seed/events.json`, `core/seed/tags.json`).

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
