# Festes App - Módulo de Programación (MVP)

Este módulo gestiona la programación estructurada de las Festes Majors y eventos especiales, permitiendo organizar actividades en programas y ubicarlas en sedes (venues).

## Arquitectura de Datos

El módulo se basa en tres entidades principales que complementan al modelo `Festa` original:

1.  **Venue**: Sedes físicas con geolocalización y datos de accesibilidad.
2.  **Program**: Agrupaciones lógicas de actividades dentro de una fiesta (ej: "Programa Infantil", "Actes Oficials").
3.  **Activity**: Actividades individuales programadas con horario, precio y ubicación.

### Relaciones
- `Festa` 1:N `Program`
- `Program` 1:N `Activity`
- `Venue` 1:N `Activity`

## API Endpoints

Todos los endpoints están versionados bajo `/api/v1/`.

### Festes
- `GET /api/v1/festes/`: Listado de fiestas.
- `GET /api/v1/festes/{slug}/`: Detalle de una fiesta.
- `GET /api/v1/festes/current/`: Obtiene la fiesta marcada como actual.
- `POST /api/v1/festes/{slug}/auto_translate/`: Traducción automática vía LLM (Admin).

### Programas
- `GET /api/v1/programs/`: Listado paginado de programas.
  - Filtros: `festa` (slug o ID), `status` (draft/published), `search`.
- `GET /api/v1/programs/{slug}/`: Detalle de un programa.

### Venues (Sedes)
- `GET /api/v1/venues/`: Listado paginado de sedes.
  - Filtros: `is_published`, `is_accessible`, `city`, `search`.
- `GET /api/v1/venues/{slug}/`: Detalle de una sede.

### Actividades
- `GET /api/v1/activities/`: Listado paginado de actividades.
  - Filtros: `program`, `festa`, `category`, `is_free`, `date_from`, `date_to`, `location`, `search`.
  - Ordenación: `start_at`, `title`, `created_at` (y sus inversos).
- `GET /api/v1/activities/{slug}/`: Detalle de una actividad.
- `GET /api/v1/activities/{slug}/ical/`: Exportación en formato iCalendar (.ics).

## Contratos de Datos (JSON)

### Activity (Lectura Pública)
```json
{
  "id": 203,
  "slug": "concert-jove-2026-07-12-2200",
  "festa_slug": "festa-major-2026",
  "program_slug": "programa-principal",
  "venue_slug": "placa-major",
  "venue_name": "Plaça Major",
  "title": "Concert jove",
  "summary": "Concert de nit amb grups locals",
  "category": "music",
  "location": "Plaça Major, Cabrera de Mar",
  "start_at": "2026-07-12T22:00:00Z",
  "end_at": "2026-07-12T23:59:00Z",
  "is_free": true,
  "price": null,
  "status": "published",
  "is_published": true
}
```

## Reglas de Negocio y Guardas

### Publicación de Actividades
Para que una actividad pueda marcarse como `published`, debe cumplir:
1. Tener una sede (`venue`) asignada.
2. La sede asignada debe estar publicada (`is_published=true`).
3. Tener definidas fechas de inicio (`start_at`) y fin (`end_at`).
4. La fecha de fin no puede ser anterior a la de inicio.

### Precios
- Si `is_free` es `true`, el campo `price` debe ser `null` o `0`.
- Si `is_free` es `false`, el campo `price` es obligatorio y debe ser mayor que `0`.

## Integraciones y Adaptadores

El módulo utiliza un patrón de adaptadores (`adapters.py`) para desacoplar integraciones externas:

- **iCalendar**: Generación de archivos `.ics` para actividades.
- **Notificaciones**: Disparo automático de notificaciones push cuando una actividad pasa a estado `published`.
- **Validación de Tickets**: Verificación de seguridad en URLs de venta de entradas.
- **Mapas**: Generación de enlaces dinámicos a Google Maps/Apple Maps basados en coordenadas.

## Permisos

- **Lectura**: Pública (`AllowAny`) para todos los endpoints de listado y detalle.
- **Escritura**: Restringida a administradores (`IsAdminOrReadOnly`). Requiere autenticación JWT y atributo `is_staff=true`.

## Desarrollo y Tests

### Ejecutar Tests
```bash
python manage.py test festes.tests.test_programming_api
```

### Seeds
Para poblar datos de prueba:
```bash
python manage.py seed_festes
```
