# Events app

Eventos con soporte multidioma (django-parler), relación opcional con media y utilidades para listar y sembrar datos.

## Modelo
- `Event` (TranslatableModel) con campos traducibles `title`, `description`.
- Campos base: `slug`, `start_at`, `end_at`, `is_published`, `location_text`, `featured_media` (`ImageFile`), `attachments` (`DocumentFile`), timestamps.
- Validación: `end_at` debe ser mayor o igual que `start_at`; slug autogenerado único.
- Métodos: `__str__`, `is_future()`.

## API
- ViewSet: `EventViewSet` (`/api/v1/events/`).
- Serializers: `EventSerializer` (lista/creación), `EventDetailSerializer` (detalle).
- Filtros: `is_published`, `start_from`, `start_to`, `upcoming=true` (usa `get_upcoming_events` y acepta `limit`).
- Permisos: lectura pública; escritura autenticada.

## Admin
- `EventAdmin` con `TranslatableAdmin`, búsqueda en `translations__title`, filtros de publicación y fechas.

## Tests
- Ubicación: `events/tests/`.
- Usa ficheros reales en `events/tests/files/` para crear `DocumentFile` e `ImageFile`.
- Cobertura: creación básica, validación de fechas, slug único, `is_future`, adjuntos, API CRUD y permisos.

## Seed
- Comando: `python manage.py seed_events`.
- Limpia eventos previos y crea ~10 ejemplos con traducciones (`ca`, `es`).
- Si no hay media en BD, genera `ImageFile`/`DocumentFile` a partir de `events/tests/files/sample.png|sample.pdf`.
- Revisa IDs de media/lugares antes de ejecutar en entornos reales.
