# Places app

Lugares con soporte multidioma (django-parler), relaci\u00f3n opcional con media y utilidades para listar y sembrar datos siguiendo el nivel de calidad del app `events`.

## Arquitectura

- **Herencia de `ContentBase`**: El modelo `Place` hereda de `ContentBase` (de `core.models`), que proporciona:
  - Campos de auditor\u00eda: `creado_por`, `modificado_por`, `fecha_creacion`, `fecha_modificacion`
  - Campo `slug` \u00fanico autogenerado
- **Categorizaci\u00f3n**: Todos los lugares pueden pertenecer a una categor\u00eda de `core.Category`:
  - `PlaceCategorySingleton`: Singleton que mantiene la categor\u00eda ra\u00edz "Places"
  - Auto-asignaci\u00f3n: Si un lugar se crea sin categor\u00eda, se asigna autom\u00e1ticamente
- **Compatibilidad API**: Mantiene propiedades `created_at` y `updated_at` para compatibilidad con la API existente

## Modelos

### Place

`Place` (TranslatableModel + ContentBase) con campos traducibles `title`, `description`.

**Campos propios**:

- `category`: ForeignKey a `core.Category` (auto-asignada al singleton)
- `is_published`: Estado de publicaci\u00f3n
- `latitude`, `longitude`: Coordenadas decimales (validadas)
- `location_text`: Direcci\u00f3n o texto libre de ubicaci\u00f3n
- Datos de contacto: `phone`, `email`, `website`, `booking_url`
- `featured_media`: ForeignKey a `ImageFile`
- `attachments`: ManyToMany a `DocumentFile`
- Propiedad `template_key`: expone el `slug` de la categor\u00eda para elegir plantilla de frontend

**Campos heredados de ContentBase**:

- `slug`: Autogenerado \u00fanico
- `creado_por`, `modificado_por`: Auditor\u00eda de usuarios
- `fecha_creacion`, `fecha_modificacion`: Timestamps
- `metatitulo`, `metadescripcion`: SEO metadata

**Validaci\u00f3n**:

- Latitud en [-90, 90], Longitud en [-180, 180]
- Latitud y longitud se deben informar juntas
- Slug autogenerado basado en t\u00edtulo traducido

### PlaceCategorySingleton

Singleton que mantiene la categor\u00eda ra\u00edz para todos los lugares.

**M\u00e9todos**:

- `get_default_category()`: Retorna la categor\u00eda de lugares o None

## API

- ViewSet: `PlaceViewSet` (`/api/v1/places/`).
- Serializers: `PlaceSerializer` (lista/creaci\u00f3n), `PlaceDetailSerializer` (detalle).
- Filtros: `is_published`, `category` (id o slug), b\u00fasqueda textual (`title/description/location_text`), bounding box (`lat_min/lat_max/lng_min/lng_max`), `near=lat,lng` con `radius_km`.
- Acci\u00f3n: `auto_translate` (usa `llm_translations.utils`) para traducir a los idiomas configurados.
- Permisos: lectura p\u00fablica; escritura autenticada.
- **Compatibilidad**: La API mantiene los campos `created_at` y `updated_at` en las respuestas JSON.

## Admin

- `PlaceAdmin`: TranslatableAdmin con b\u00fasqueda en `translations__title`, filtros de publicaci\u00f3n y categor\u00eda. Fieldsets organizados (general, localizaci\u00f3n, contenido, contacto, media, metadata).
- `PlaceCategorySingletonAdmin`: Admin especial para el singleton (no permite agregar/eliminar).

## Tests

- Ubicaci\u00f3n: `places/tests/test_models.py`, `places/tests/test_api.py`.
- Fixtures: `places_category`, `places_singleton` (crean categor\u00eda y singleton autom\u00e1ticamente), media de `places/tests/files/`.
- Cobertura:
  - **Modelos**: creaci\u00f3n, validaci\u00f3n de coordenadas, slug \u00fanico, `template_key`, adjuntos, singleton, auto-asignaci\u00f3n.
  - **API**: CRUD completo, filtros, compatibilidad backward (created_at/updated_at), auto_translate.
  - **Seeds**: comandos idempotentes.

## Comandos de gesti\u00f3n

### seed_places_category

Seed idempotente para configurar la categor\u00eda de lugares y subcategor\u00edas de plantilla.

```bash
python manage.py seed_places_category
```

Datos del seed: `places/seed/places_category.json`.

### seed_places

Seed de datos de ejemplo (requiere categor\u00eda creada).

```bash
python manage.py seed_places
```

Datos del seed: `places/seed/places.json`.

## Migraciones

Ejecutar las migraciones del app:

```bash
.\.venv_win\Scripts\python.exe manage.py makemigrations places
.\.venv_win\Scripts\python.exe manage.py migrate
```

## Seed assets (convención unificada)

Los comandos de seed del dominio `places` buscan primero:

- `backend/seed_assets/places/images/`
- `backend/seed_assets/places/documents/`

Fallback temporal (deprecated): `backend/places/management/commands/images/ y tests/files`.

Si se usa fallback legacy, el comando muestra warning deprecado para completar la migración sin romper entornos antiguos.
