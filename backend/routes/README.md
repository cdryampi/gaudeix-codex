# Routes API

## Itinerary endpoint

### `GET /api/v1/routes/{slug}/itinerary/`

Devuelve la estructura completa para renderizar mapa e itinerario en frontend.

### Visibilidad

- Rutas publicadas: acceso público (anónimo permitido).
- Rutas no publicadas:
  - anónimo => `404`
  - usuario staff/admin autenticado => permitido

### Ejemplo de respuesta

```json
{
  "route": {
    "id": 12,
    "slug": "coastal-loop",
    "title": "Coastal Loop",
    "route_type": "walking",
    "difficulty": "moderate",
    "is_circular": true
  },
  "start": { "lat": 41.6205, "lng": 2.6878 },
  "end": { "lat": 41.64, "lng": 2.705 },
  "bounds": {
    "south": 41.6205,
    "west": 2.6878,
    "north": 41.64,
    "east": 2.705
  },
  "track_geojson": {
    "type": "LineString",
    "coordinates": [
      [2.6878, 41.6205],
      [2.696, 41.629],
      [2.705, 41.64]
    ]
  },
  "waypoints": [
    {
      "id": 1,
      "order": 1,
      "place_id": 33,
      "place_slug": "mirador",
      "place_title": "Mirador",
      "lat": 41.6222,
      "lng": 2.6899,
      "instructions": "Take the old path",
      "distance_from_previous_km": null
    },
    {
      "id": 2,
      "order": 2,
      "place_id": 34,
      "place_slug": "font",
      "place_title": "Font",
      "lat": 41.6333,
      "lng": 2.7001,
      "instructions": "Turn right at the pine",
      "distance_from_previous_km": 3.25
    }
  ],
  "segments": [
    {
      "from_order": 1,
      "to_order": 2,
      "distance_km": 3.25,
      "duration_minutes": null
    }
  ],
  "summary": {
    "distance_km": 12.4,
    "duration_minutes": 215,
    "elevation_gain": 430,
    "elevation_loss": 420,
    "waypoints_count": 2
  }
}
```

## Reglas de fallback y nulls

- `track_geojson` inválido o ausente -> `track_geojson: null`.
- `bounds` se calcula con prioridad:
  1. coordenadas de `track_geojson` válido (`LineString` o `MultiLineString`)
  2. coordenadas disponibles de `start`, `end` y `waypoints`
- Si no hay coordenadas válidas, `bounds: null`.
- `start`/`end` requieren ambos valores (`lat` y `lng`), si no `null`.
- Nunca se lanza error por datos parciales: los campos faltantes retornan `null`.
