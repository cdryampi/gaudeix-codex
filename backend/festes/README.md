# Festes App - Programacion MVP

Este modulo gestiona Festes Majors y eventos especiales sobre un modelo simple:
`Festa` como contenedor, `Program` para bloques editoriales, `Venue` para recintos,
`Sponsor` para patrocinadores y vinculos directos `FestaEvent` con `events.Event`.

## Arquitectura de datos

Entidades principales:

1. `Festa`: evento marco (fechas, contenido, media, estado y relaciones).
2. `Program`: secciones del programa dentro de una festa.
3. `Venue`: sedes fisicas con direccion, accesibilidad y coordenadas.
4. `Sponsor`: patrocinadores por festa.
5. `FestaEvent`: tabla intermedia ordenada entre `Festa` y `events.Event`.

Relaciones:

- `Festa` 1:N `Program`
- `Festa` 1:N `Sponsor`
- `Festa` N:M `Event` (via `FestaEvent`)

## API endpoints

Todos los endpoints estan versionados bajo `/api/v1/`.

### Festes

- `GET /api/v1/festes/`: listado de festes.
- `GET /api/v1/festes/{slug}/`: detalle de festa.
- `GET /api/v1/festes/current/`: festa marcada como actual y publicada.
- `POST /api/v1/festes/{slug}/auto_translate/`: traduccion automatica (admin).

### Programas

- `GET /api/v1/programs/`: listado paginado.
  - Filtros: `festa` (slug o id), `status`, `is_published`, `search`, `ordering`.
- `GET /api/v1/programs/{slug}/`: detalle.

### Venues

- `GET /api/v1/venues/`: listado paginado.
  - Filtros: `is_published`, `is_accessible`, `city`, `search`.
- `GET /api/v1/venues/{slug}/`: detalle.

### Sponsors

- `GET /api/v1/sponsors/`: listado.
  - Filtros: `festa` (slug o id), `tier`.
- `GET /api/v1/sponsors/{id}/`: detalle.

## Permisos

- Lectura (`list`, `retrieve`): publica (`AllowAny`).
- Escritura (`create`, `update`, `destroy`): solo administracion (`IsAdminOrReadOnly`).

## Integraciones

`adapters.py` mantiene utilidades desacopladas para:

- formateo iCal,
- enlaces de mapas,
- validacion basica de URLs,
- gateway de notificaciones.

## Desarrollo y tests

Ejecutar tests de la app:

```bash
python manage.py test festes.tests
```

Cargar datos de ejemplo:

```bash
python manage.py seed_festes
```

## Seed assets (convención unificada)

Los comandos de seed del dominio `festes` buscan primero:

- `backend/seed_assets/festes/images/`
- `backend/seed_assets/festes/documents/`

Fallback temporal (deprecated): `backend/festes/management/commands/images/ y documents/`.

Si se usa fallback legacy, el comando muestra warning deprecado para completar la migración sin romper entornos antiguos.
