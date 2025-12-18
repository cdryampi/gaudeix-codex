# Events app

Eventos con soporte multidioma (django-parler), relación opcional con media y utilidades para listar y sembrar datos.

## Arquitectura

La app `events` está integrada con la app `core` para reutilizar funcionalidad común:

- **Herencia de `ContentBase`**: El modelo `Event` hereda de `ContentBase` (de `core.models`), que proporciona:
  - Campos de auditoría: `creado_por`, `modificado_por`, `fecha_creacion`, `fecha_modificacion`
  - Campo `slug` único autogenerado
- **Categorización**: Todos los eventos pertenecen a una categoría de `core.Category`:
  - `EventCategorySingleton`: Singleton que mantiene la categoría raíz "Events"
  - Auto-asignación: Si un evento se crea sin categoría, se asigna automáticamente
- **Compatibilidad API**: Mantiene propiedades `created_at` y `updated_at` para compatibilidad con la API existente

## Modelos

### Event

`Event` (TranslatableModel + ContentBase) con campos traducibles `title`, `summary`, `description`.

**Campos propios**:

- `category`: ForeignKey a `core.Category` (auto-asignada al singleton)
- `start_at`, `end_at`: Fechas del evento
- `is_published`: Estado de publicación
- `location_text`: Ubicación en texto libre
- `featured_media`: ForeignKey a `ImageFile`
- `attachments`: ManyToMany a `DocumentFile`
- `venue_name`: Nombre del lugar/organizador (texto libre)
- `is_featured`: Destacado (para home/portada)
- `is_free`: Evento gratuito
- `price_text`: Texto de precio (opcional)
- `tags`: ManyToMany a `core.Tag`

**Campos heredados de ContentBase**:

- `slug`: Autogenerado único
- `creado_por`, `modificado_por`: Auditoría de usuarios
- `fecha_creacion`, `fecha_modificacion`: Timestamps
- `metatitulo`, `metadescripcion`: SEO metadata

**Validación**:

- `end_at` debe ser mayor o igual que `start_at`
- Slug autogenerado basado en título traducido

**Métodos**:

- `__str__`: Retorna título + fecha
- `is_future()`: Verifica si el evento es futuro
- Propiedades `created_at`, `updated_at`: Aliases para compatibilidad API

### EventCategorySingleton

Singleton que mantiene la categoría raíz para todos los eventos.

**Métodos**:

- `get_default_category()`: Retorna la categoría de eventos o None

## API

- ViewSet: `EventViewSet` (`/api/v1/events/`).
- Serializers: `EventSerializer` (lista/creación), `EventDetailSerializer` (detalle).
- Filtros: `is_published`, `start_from`, `start_to`, `upcoming=true` (usa `get_upcoming_events` y acepta `limit`).
- Filtros extra: `category` (id o slug), `tag` (slug), `tags` (csv), `featured=true|false`, `is_free=true|false`, `search`/`q`.
- Escritura: `category_id` y `tag_ids` (write-only). Lectura: `category`, `category_slug`, `category_name`, `tags`, `image_url`.
- Permisos: lectura pública; escritura autenticada.
- **Compatibilidad**: La API mantiene los campos `created_at` y `updated_at` en las respuestas JSON

## Admin

- `EventAdmin`: TranslatableAdmin con búsqueda en `translations__title`, filtros de publicación, fechas y categoría.
- `EventCategorySingletonAdmin`: Admin especial para el singleton (no permite agregar/eliminar).
- Fieldsets organizados: General, Content, Media, Metadata (colapsable).

## Tests

- Ubicación: `events/tests/test_models.py`, `events/tests/test_api.py`.
- Usa ficheros reales en `events/tests/files/` para crear `DocumentFile` e `ImageFile`.
- Fixtures: `events_category`, `events_singleton` (crean categoría y singleton automáticamente).
- Cobertura:
  - **Modelos**: creación, validación, slug único, `is_future()`, adjuntos, singleton, auto-asignación
  - **API**: CRUD completo, permisos, compatibilidad backward (created_at/updated_at)

## Comandos de gestión

### seed_events_category

Este seed tambiИn crea/actualiza subcategorias (p.ej. `cultura`, `infantil`, `esports`, ...) y ajusta `taxonomy=events`.

Seed idempotente para configurar la categoría de eventos.

```bash
python manage.py seed_events_category
```

Datos del seed: `events/seed/events_category.json`.

**Funcionalidad**:

1. Crea o actualiza la categoría "Events" (slug: `events`)
2. Añade traducciones: ca, es, en, fr
3. Crea el `EventCategorySingleton` apuntando a esta categoría
4. Asigna la categoría a todos los eventos que no tengan una

**Idempotencia**: Puede ejecutarse múltiples veces sin efectos secundarios.

### seed_events

Seed de eventos de ejemplo con categorias, tags y campos extra (`summary`, `venue_name`, `is_featured`, `is_free`, `price_text`).

```bash
python manage.py seed_events
```

Datos del seed: `events/seed/events.json` (fechas relativas con `start_offset`/`end_offset`).

## Migraciones

Cambios recientes: migraciӯn `0003_event_fields_and_tags.py` a¤ade `summary`, `venue_name`, `is_featured`, `is_free`, `price_text` y `tags`.

La integración con `core` se realizó en la migración `0002_integrate_with_core.py`:

- Añade campos heredados de `BaseModel` y `MetadataModel`
- Añade campo `category` (nullable para migración suave)
- Elimina campos duplicados `created_at`, `updated_at` (ahora son propiedades)
- Altera `slug` (ahora heredado de `ContentBase`)
- Crea modelo `EventCategorySingleton`

**Importante**: Ejecutar `seed_events_category` después de migrar para configurar la categoría.

## Dependencias

- `core`: Proporciona `ContentBase`, `Category`
- `media_files`: Proporciona `ImageFile`, `DocumentFile`
- `django-parler`: Traducciones
- `django-solo`: Singleton model

```

```
