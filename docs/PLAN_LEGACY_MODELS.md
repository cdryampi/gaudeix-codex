# Plan: Modelos Legacy - Routes y Festes

## Contexto

El proyecto legacy de Gaudeix tenía modelos especializados con plantillas propias que necesitan migrarse a la nueva arquitectura desacoplada.

## Estado Actual

### Taxonomías Existentes (TaxonomyChoices)

| Valor      | Label     | Uso actual                                                           |
| ---------- | --------- | -------------------------------------------------------------------- |
| `events`   | Eventos   | Subcategorías de eventos (cultura, esports, festes...)               |
| `places`   | Lugares   | Categoría raíz de lugares                                            |
| `template` | Plantilla | Define plantilla frontend (accommodations, restaurants, heritage...) |
| `theme`    | Tema      | Clasificación temática                                               |
| `audience` | Audiencia | Público objetivo                                                     |
| `season`   | Temporada | Épocas del año                                                       |
| `news`     | Noticias  | Categorías de noticias                                               |
| `other`    | Otro      | Catch-all                                                            |

### Templates Existentes (taxonomy=template)

| Slug             | Nombre      | Plantilla Frontend        |
| ---------------- | ----------- | ------------------------- |
| `accommodations` | On dormir   | `/places/accommodations/` |
| `restaurants`    | Restaurants | `/places/restaurants/`    |
| `heritage`       | Patrimoni   | `/places/heritage/`       |
| `beaches`        | Platges     | `/places/beaches/`        |
| `culture`        | Cultura     | `/places/culture/`        |
| `nature`         | Natura      | `/places/nature/`         |
| `shopping`       | Compres     | `/places/shopping/`       |

---

## Plan de Implementación

### Fase 1: Ampliar Taxonomías

**Archivo:** `backend/core/models.py`

```python
class TaxonomyChoices(models.TextChoices):
    # Existentes
    EVENTS = "events", "Eventos"
    PLACES = "places", "Lugares"
    TEMPLATE = "template", "Plantilla"
    THEME = "theme", "Tema"
    AUDIENCE = "audience", "Audiencia"
    SEASON = "season", "Temporada"
    NEWS = "news", "Noticias"
    OTHER = "other", "Otro"

    # NUEVAS
    ROUTES = "routes", "Rutas"           # Para categorías de rutas
    FESTES = "festes", "Festes Majors"   # Para fiestas mayores
```

**Nuevos templates a añadir (taxonomy=template):**

| Slug          | Nombre        | Plantilla Frontend |
| ------------- | ------------- | ------------------ |
| `walking`     | Rutes a peu   | `/routes/walking/` |
| `cycling`     | Rutes en bici | `/routes/cycling/` |
| `guided`      | Rutes guiades | `/routes/guided/`  |
| `festa-major` | Festa Major   | `/festes/{slug}/`  |

---

### Fase 2: Modelo Route (Nueva App)

**App:** `backend/routes/`

**Modelo Principal:** `Route`

```python
# backend/routes/models.py

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from parler.models import TranslatableModel, TranslatedFields
from core.models import ContentBase, Category, Tag

class Route(TranslatableModel, ContentBase):
    """
    Ruta/itinerario con soporte para tracks GPS.
    Hereda: slug, auditoría (creado_por, fecha_creacion...), SEO (metatitulo...)
    """

    class DifficultyChoices(models.TextChoices):
        EASY = "easy", "Fàcil"
        MODERATE = "moderate", "Moderada"
        DIFFICULT = "difficult", "Difícil"
        EXPERT = "expert", "Expert"

    class RouteTypeChoices(models.TextChoices):
        WALKING = "walking", "A peu"
        CYCLING = "cycling", "Bicicleta"
        GUIDED = "guided", "Guiada"
        MIXED = "mixed", "Mixta"

    translations = TranslatedFields(
        title=models.CharField(max_length=200, verbose_name="Títol"),
        summary=models.TextField(blank=True, verbose_name="Resum"),
        description=models.TextField(blank=True, verbose_name="Descripció"),
        instructions=models.TextField(blank=True, verbose_name="Instruccions"),
    )

    # Clasificación
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="routes",
        verbose_name="Categoria",
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name="routes")
    route_type = models.CharField(
        max_length=20,
        choices=RouteTypeChoices.choices,
        default=RouteTypeChoices.WALKING,
    )

    # Características técnicas
    difficulty = models.CharField(
        max_length=20,
        choices=DifficultyChoices.choices,
        default=DifficultyChoices.MODERATE,
    )
    distance_km = models.DecimalField(
        max_digits=6, decimal_places=2,
        null=True, blank=True,
        verbose_name="Distància (km)",
    )
    duration_minutes = models.PositiveIntegerField(
        null=True, blank=True,
        verbose_name="Duració (minuts)",
    )
    elevation_gain = models.PositiveIntegerField(
        null=True, blank=True,
        verbose_name="Desnivell positiu (m)",
    )
    elevation_loss = models.PositiveIntegerField(
        null=True, blank=True,
        verbose_name="Desnivell negatiu (m)",
    )

    # Geolocalización
    start_latitude = models.DecimalField(
        max_digits=9, decimal_places=6,
        null=True, blank=True,
        validators=[MinValueValidator(-90), MaxValueValidator(90)],
    )
    start_longitude = models.DecimalField(
        max_digits=9, decimal_places=6,
        null=True, blank=True,
        validators=[MinValueValidator(-180), MaxValueValidator(180)],
    )
    end_latitude = models.DecimalField(
        max_digits=9, decimal_places=6,
        null=True, blank=True,
    )
    end_longitude = models.DecimalField(
        max_digits=9, decimal_places=6,
        null=True, blank=True,
    )
    is_circular = models.BooleanField(default=False, verbose_name="Ruta circular")

    # Track GPS (archivo GPX/KML)
    gpx_file = models.ForeignKey(
        "media_files.DocumentFile",
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name="routes_gpx",
        verbose_name="Arxiu GPX/KML",
    )

    # Puntos de la ruta (GeoJSON simplificado)
    track_geojson = models.JSONField(
        null=True, blank=True,
        verbose_name="Track GeoJSON",
        help_text="LineString o MultiLineString en format GeoJSON",
    )

    # Media
    featured_media = models.ForeignKey(
        "media_files.ImageFile",
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name="featured_in_routes",
    )
    attachments = models.ManyToManyField(
        "media_files.DocumentFile",
        blank=True,
        related_name="attached_to_routes",
    )
    gallery = models.ManyToManyField(
        "media_files.ImageFile",
        blank=True,
        related_name="in_route_galleries",
    )

    # Estado
    is_published = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False, verbose_name="Destacada")

    # Relaciones con Places (puntos de interés en la ruta)
    waypoints = models.ManyToManyField(
        "places.Place",
        through="RouteWaypoint",
        related_name="on_routes",
    )

    class Meta:
        verbose_name = "Ruta"
        verbose_name_plural = "Rutes"
        ordering = ("-fecha_creacion",)


class RouteWaypoint(models.Model):
    """Punto intermedio de una ruta (relaciona Route con Place)."""

    route = models.ForeignKey(Route, on_delete=models.CASCADE)
    place = models.ForeignKey("places.Place", on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)

    # Instrucciones específicas para llegar a este punto
    instructions = models.TextField(blank=True)
    distance_from_previous_km = models.DecimalField(
        max_digits=5, decimal_places=2,
        null=True, blank=True,
    )

    class Meta:
        ordering = ("order",)
        unique_together = ("route", "order")
```

**Singleton para categoría por defecto:**

```python
class RouteCategorySingleton(models.Model):
    """Singleton para la categoría raíz de rutas."""
    category = models.OneToOneField(Category, on_delete=models.PROTECT)

    class Meta:
        verbose_name = "Route Category Singleton"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)
```

---

### Fase 3: Modelo Festa (Nueva App)

**App:** `backend/festes/`

**Modelo Principal:** `Festa`

```python
# backend/festes/models.py

from django.db import models
from parler.models import TranslatableModel, TranslatedFields
from core.models import ContentBase, Category, Tag

class Festa(TranslatableModel, ContentBase):
    """
    Festa Major o evento especial que agrupa múltiples eventos.
    Ejemplo: "Festa Major de Cabrera 2025" con conciertos, actos, etc.
    """

    translations = TranslatedFields(
        title=models.CharField(max_length=200, verbose_name="Títol"),
        subtitle=models.CharField(max_length=300, blank=True, verbose_name="Subtítol"),
        summary=models.TextField(blank=True, verbose_name="Resum"),
        description=models.TextField(blank=True, verbose_name="Descripció"),
        program_text=models.TextField(blank=True, verbose_name="Programa (text)"),
    )

    # Fechas de la fiesta (rango)
    start_date = models.DateField(verbose_name="Data inici")
    end_date = models.DateField(verbose_name="Data fi")
    year = models.PositiveIntegerField(verbose_name="Any")

    # Clasificación
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="festes",
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name="festes")

    # Media
    featured_media = models.ForeignKey(
        "media_files.ImageFile",
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name="featured_in_festes",
        verbose_name="Cartell / Imatge destacada",
    )
    poster = models.ForeignKey(
        "media_files.ImageFile",
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name="posters_festes",
        verbose_name="Cartell oficial",
    )
    program_pdf = models.ForeignKey(
        "media_files.DocumentFile",
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name="programs_festes",
        verbose_name="Programa PDF",
    )
    gallery = models.ManyToManyField(
        "media_files.ImageFile",
        blank=True,
        related_name="in_festa_galleries",
    )

    # Relación con eventos
    events = models.ManyToManyField(
        "events.Event",
        blank=True,
        related_name="part_of_festa",
        verbose_name="Esdeveniments",
    )

    # Estado
    is_published = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    is_current = models.BooleanField(
        default=False,
        verbose_name="És la festa actual",
        help_text="Marca la festa que es mostra per defecte",
    )

    class Meta:
        verbose_name = "Festa"
        verbose_name_plural = "Festes"
        ordering = ("-year", "-start_date")
        # Solo una festa puede ser "current" a la vez
        constraints = [
            models.UniqueConstraint(
                fields=["is_current"],
                condition=models.Q(is_current=True),
                name="unique_current_festa",
            )
        ]


class Sponsor(models.Model):
    """Patrocinador de una festa."""

    class TierChoices(models.TextChoices):
        PLATINUM = "platinum", "Platí"
        GOLD = "gold", "Or"
        SILVER = "silver", "Plata"
        BRONZE = "bronze", "Bronze"
        COLLABORATOR = "collaborator", "Col·laborador"

    festa = models.ForeignKey(
        Festa,
        on_delete=models.CASCADE,
        related_name="sponsors",
    )
    name = models.CharField(max_length=200)
    logo = models.ForeignKey(
        "media_files.ImageFile",
        null=True, blank=True,
        on_delete=models.SET_NULL,
    )
    website = models.URLField(blank=True)
    tier = models.CharField(
        max_length=20,
        choices=TierChoices.choices,
        default=TierChoices.COLLABORATOR,
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("tier", "order")
```

---

### Fase 4: API Endpoints

**Routes:**

```
GET    /api/v1/routes/                    # Lista pública
GET    /api/v1/routes/{slug}/             # Detalle por slug
POST   /api/v1/routes/                    # Crear (auth)
PATCH  /api/v1/routes/{slug}/             # Actualizar (auth)
DELETE /api/v1/routes/{slug}/             # Eliminar (auth)
POST   /api/v1/routes/{slug}/auto_translate/  # Traducción LLM
```

**Filtros Routes:**

- `route_type=walking|cycling|guided`
- `difficulty=easy|moderate|difficult|expert`
- `category=<slug>`
- `is_circular=true|false`
- `is_featured=true`

**Festes:**

```
GET    /api/v1/festes/                    # Lista pública
GET    /api/v1/festes/{slug}/             # Detalle por slug
GET    /api/v1/festes/current/            # Festa actual
POST   /api/v1/festes/                    # Crear (auth)
PATCH  /api/v1/festes/{slug}/             # Actualizar (auth)
DELETE /api/v1/festes/{slug}/             # Eliminar (auth)
```

**Filtros Festes:**

- `year=2025`
- `is_current=true`
- `is_featured=true`

---

### Fase 5: Frontend Templates

**Estructura de rutas:**

```
frontend/src/features/routes/
├── pages/
│   ├── RoutesListPage.tsx       # /routes
│   ├── RouteDetailPage.tsx      # /routes/{slug}
│   ├── WalkingRoutesPage.tsx    # /routes/walking (filtrado)
│   └── CyclingRoutesPage.tsx    # /routes/cycling (filtrado)
├── components/
│   ├── RouteCard.tsx
│   ├── RouteMap.tsx             # Mapa con track GPS
│   ├── RouteElevation.tsx       # Perfil de elevación
│   ├── RouteWaypoints.tsx       # Lista de waypoints
│   └── RouteDifficultyBadge.tsx
└── api/
    └── routes.ts
```

**Estructura de festes:**

```
frontend/src/features/festes/
├── pages/
│   ├── FestesListPage.tsx       # /festes
│   ├── FestaDetailPage.tsx      # /festes/{slug}
│   └── FestaCurrentPage.tsx     # /festa-major (redirect a current)
├── components/
│   ├── FestaHero.tsx            # Banner con cartel
│   ├── FestaProgram.tsx         # Programa de actos
│   ├── FestaEventsList.tsx      # Eventos de la festa
│   ├── FestaSponsorGrid.tsx     # Patrocinadores
│   └── FestaCountdown.tsx       # Cuenta atrás
└── api/
    └── festes.ts
```

---

## Orden de Implementación Recomendado

1. **TaxonomyChoices** - Ampliar enum (5 min)
2. **Seeds categories** - Añadir templates walking/cycling (10 min)
3. **App routes** - Modelo + migraciones + API (2-3 horas)
4. **App festes** - Modelo + migraciones + API (2-3 horas)
5. **Backoffice** - CRUD para routes y festes (2-3 horas)
6. **Frontend routes** - Páginas + mapa (4-6 horas)
7. **Frontend festes** - Páginas + programa (4-6 horas)
8. **Seeds demo** - Datos de ejemplo (1 hora)
9. **Tests** - Cobertura >80% (2-3 horas)

**Total estimado:** 20-30 horas de desarrollo

---

## Decisiones Técnicas

### ¿Por qué modelos separados en vez de extender Place/Event?

1. **Routes** tienen campos muy específicos (GPS, elevación, waypoints) que no aplican a Places
2. **Festes** agrupan eventos, no son eventos individuales
3. Evita "god models" con demasiados campos opcionales
4. Permite evolución independiente de cada dominio
5. APIs más limpias y específicas

### ¿Por qué ManyToMany para Festa→Events?

- Una festa puede tener 50+ eventos
- Un evento puede pertenecer a múltiples festes (raro, pero posible)
- Permite filtrar eventos por festa en la API
- Frontend puede mostrar timeline de eventos dentro de la festa

### ¿GPX como archivo o GeoJSON en DB?

**Ambos:**

- `gpx_file` → Archivo original para descarga
- `track_geojson` → Datos parseados para renderizar en mapa (Leaflet/Mapbox)

El seed puede parsear el GPX y generar el GeoJSON automáticamente.

---

## Próximos Pasos

Cuando decidas implementar, ejecuta:

```bash
# 1. Ampliar TaxonomyChoices
# 2. Crear apps
python manage.py startapp routes
python manage.py startapp festes

# 3. Registrar en INSTALLED_APPS
# 4. Crear modelos
# 5. Migraciones
python manage.py makemigrations routes festes
python manage.py migrate

# 6. Seeds
python manage.py seed_routes
python manage.py seed_festes
```

---

_Documento creado: 2026-02-03_
_Estado: PLANIFICACIÓN_
