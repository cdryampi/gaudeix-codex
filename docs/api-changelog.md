# API Changelog - Gaudeix Codex

## [2026-02-24] - Módulo de Programación de Festes (MVP)

### Añadido
- **Nuevos Endpoints de Programación**:
  - `GET /api/v1/programs/`: Listado de programas de fiestas.
  - `GET /api/v1/programs/{slug}/`: Detalle de programa.
  - `GET /api/v1/venues/`: Listado de sedes/ubicaciones.
  - `GET /api/v1/venues/{slug}/`: Detalle de sede.
  - `GET /api/v1/activities/`: Listado de actividades programadas.
  - `GET /api/v1/activities/{slug}/`: Detalle de actividad.
  - `GET /api/v1/activities/{slug}/ical/`: Exportación iCal (.ics) para actividades.

- **Filtros de Actividades**:
  - Soporte para filtrado por rango de fechas (`date_from`, `date_to`).
  - Filtrado por categoría, gratuidad (`is_free`) y ubicación.
  - Búsqueda textual (`search`) en títulos y descripciones.

- **Integraciones**:
  - Disparo de notificaciones push al publicar actividades.
  - Generación de enlaces a mapas (Google/Apple) en detalles de sedes.

### Cambios
- **Festa API**:
  - Añadida acción `POST /api/v1/festes/{slug}/auto_translate/` para traducción masiva de campos mediante LLM.
  - El detalle de Festa ahora incluye el conteo de eventos relacionados (`events_count`).

### Seguridad y Permisos
- Implementada política `IsAdminOrReadOnly` para todos los nuevos recursos.
- Los métodos de escritura (`POST`, `PUT`, `PATCH`, `DELETE`) requieren autenticación y permisos de staff.
- Validación estricta de URLs de tickets para prevenir ataques de redirección.
