# Instrucciones para Agentes AI — App `storytelling`

## Contexto

La app `storytelling` almacena **historias, leyendas y relatos** del municipio de **Cabrera de Mar** (Maresme, Barcelona). El objetivo es construir una **base de datos rica y bien documentada** de contenido narrativo sobre el patrimonio cultural, arqueológico, histórico y natural del pueblo.

---

## Modelo de datos

Cada `Story` tiene estos campos clave:

| Campo               | Tipo                    | Obligatorio          | Descripción                                     |
| ------------------- | ----------------------- | -------------------- | ----------------------------------------------- |
| `slug`              | `SlugField(150)`        | Auto                 | Se genera automáticamente del título en catalán |
| `is_published`      | `BooleanField`          | Sí (default: `True`) | Publicada o borrador                            |
| `historical_period` | `CharField(100)`        | No                   | Período histórico (ver valores abajo)           |
| `reading_time`      | `PositiveIntegerField`  | Sí (default: 5)      | Tiempo de lectura en minutos                    |
| `difficulty`        | `CharField(50)`         | Sí (default: `easy`) | Nivel de dificultad                             |
| `source_url`        | `URLField(500)`         | **Recomendado**      | URL original de la fuente de información        |
| `source_name`       | `CharField(200)`        | **Recomendado**      | Nombre de la fuente (institución, web, autor)   |
| `category`          | `ForeignKey(Category)`  | Auto                 | Se asigna automáticamente si no se especifica   |
| `featured_media`    | `ForeignKey(ImageFile)` | No                   | Imagen destacada (requiere subir a media_files) |
| `attachments`       | `M2M(DocumentFile)`     | No                   | Documentos adjuntos                             |

### Campos traducibles (django-parler)

Cada historia tiene traducciones en **4 idiomas**: `ca`, `es`, `en`, `fr`.

| Campo              | Tipo             | Obligatorio | Descripción                                  |
| ------------------ | ---------------- | ----------- | -------------------------------------------- |
| `title`            | `CharField(200)` | **Sí**      | Título de la historia                        |
| `summary`          | `TextField`      | Recomendado | Resumen corto (2-3 frases)                   |
| `content`          | `TextField`      | Recomendado | Contenido completo en formato texto/markdown |
| `audio_transcript` | `TextField`      | Opcional    | Transcripción para audioguía                 |

> **IMPORTANTE**: El idioma **primario** es `ca` (catalán). Las traducciones a `es`, `en` y `fr` son deseables pero pueden dejarse vacías si no se dispone de traducción fiable. NO inventes traducciones si no hay fuente.

---

## Valores permitidos

### `historical_period`

Usar estos valores en inglés para consistencia:

- `Prehistoric` — Megalítico, Neolítico
- `Iberian` — Civilización ibérica (s. VI-I a.C.)
- `Roman` — Época romana (s. I a.C. - V d.C.)
- `Medieval` — Edad Media (s. V-XV)
- `Modern` — Edad Moderna y Contemporánea (s. XVI-XXI)
- `Legend` — Leyendas y tradiciones orales (sin época definida)
- `Natural` — Patrimonio natural, geología, biodiversidad

### `difficulty`

- `easy` — Lectura ligera, accesible para todos
- `medium` — Contenido con contexto histórico
- `hard` — Contenido académico o especializado

---

## Tarea de recolección de datos

### Objetivo

Investigar, recopilar y estructurar **toda la información posible** sobre Cabrera de Mar para poblar la base de datos de storytelling. Cada historia DEBE incluir:

1. **Fuente verificable** → campo `source_url` con la URL original
2. **Nombre de la fuente** → campo `source_name` (quién publica la info)
3. **Contenido en catalán como mínimo** → traducciones si las hay

### Fuentes principales a consultar

| Fuente                                 | URL                                          | Prioridad |
| -------------------------------------- | -------------------------------------------- | --------- |
| Ajuntament de Cabrera de Mar           | https://www.cabrerademar.cat                 | 🔴 Alta   |
| Museu de Cabrera de Mar                | https://www.museudecabrerademar.cat          | 🔴 Alta   |
| Patrimoni Gencat (Generalitat)         | https://patrimoni.gencat.cat                 | 🔴 Alta   |
| Wikipedia (Cabrera de Mar)             | https://ca.wikipedia.org/wiki/Cabrera_de_Mar | 🟡 Media  |
| ICAC (Institut Català d'Arqueologia)   | https://icac.cat                             | 🟡 Media  |
| MAC (Museu d'Arqueologia de Catalunya) | https://www.mac.cat                          | 🟡 Media  |
| Wikiloc (rutas por la zona)            | https://www.wikiloc.com                      | 🟢 Baja   |
| Maresme Digital / premsa local         | https://www.maresmedigital.cat               | 🟢 Baja   |
| Enciclopèdia Catalana                  | https://www.enciclopedia.cat                 | 🟡 Media  |

### Temas a cubrir

Intenta crear historias sobre **todos estos temas** (si encuentras información verificable):

#### 🏛️ Patrimonio Arqueológico

- [ ] Poblado ibérico de Ilturo (Cadira del Bisbe) ✅ ya existe
- [ ] Santuario romano de Can Modolell ✅ ya existe
- [ ] Termas romanas
- [ ] Villa romana de Can Rodon
- [ ] Yacimiento de Ca l'Arnau (factoría romana)
- [ ] Necrópolis ibéricas
- [ ] Hornos cerámicos ibéricos
- [ ] Taller de ánforas de Can Portell
- [ ] El Mitreo de Can Modolell (culto a Mitra, detalle)

#### 🏰 Patrimonio Medieval y Moderno

- [ ] Castillo de Burriac ✅ ya existe
- [ ] Iglesia parroquial de Sant Feliu
- [ ] Ermita de Sant Crist
- [ ] Torre de defensa costera
- [ ] Masías históricas (Can Feliu, Can Catà, etc.)

#### 📖 Leyendas y Tradiciones

- [ ] La Bruja de Burriac ✅ ya existe
- [ ] La leyenda del tesoro de Burriac
- [ ] Tradiciones de la Festa Major
- [ ] La leyenda del pozo de la torre
- [ ] Procesiones y tradiciones religiosas

#### 🏗️ Patrimonio Modernista y Contemporáneo

- [ ] Torres de veraneo modernistas ✅ ya existe
- [ ] Can Catà (edificio modernista notable)
- [ ] Desarrollo urbanístico del s. XX
- [ ] La llegada del ferrocarril

#### 🌿 Patrimonio Natural

- [ ] El Parc de la Serralada Litoral
- [ ] Ruta al Castell de Burriac (senderismo)
- [ ] Flora y fauna del entorno
- [ ] Les Fonts de Cabrera
- [ ] La playa y el litoral
- [ ] Torrentes y rieras

#### 🍷 Patrimonio Inmaterial

- [ ] Tradición vinícola del Maresme
- [ ] Oficios tradicionales
- [ ] Gastronomía local
- [ ] Fiestas y celebraciones populares

---

## Cómo añadir historias al seeder

El seeder está en `management/commands/seed_storytelling.py`. Cada historia es un diccionario con esta estructura:

```python
{
    "slug": "nombre-descriptivo-en-catalan",
    "historical_period": "Roman",         # Ver valores permitidos arriba
    "reading_time": 5,                    # Minutos estimados
    "difficulty": "easy",                 # easy | medium | hard
    "source_url": "https://www.museudecabrerademar.cat/can-modolell",
    "source_name": "Museu de Cabrera de Mar",
    "translations": {
        "ca": {
            "title": "Título en catalán",
            "summary": "Resumen corto en catalán (2-3 frases)",
            "content": "Contenido largo en catalán...",
            "audio_transcript": "Texto para audioguía en catalán...",
        },
        "es": {
            "title": "Título en español",
            "summary": "Resumen corto en español",
            "content": "Contenido largo en español...",
            "audio_transcript": "Texto para audioguía en español...",
        },
        "en": {
            "title": "English title",
            "summary": "Short English summary",
            "content": "Full English content...",
            "audio_transcript": "Audio guide transcript in English...",
        },
        "fr": {
            "title": "Titre en français",
            "summary": "Résumé court en français",
            "content": "Contenu complet en français...",
            "audio_transcript": "Transcription pour audioguide en français...",
        },
    },
},
```

### Pasos para añadir historias

1. **Añadir el diccionario** a la lista `stories_data` en `seed_storytelling.py`
2. **Actualizar el `Story.objects.create()`** — asegúrate de incluir `source_url` y `source_name`:

```python
story = Story.objects.create(
    slug=data["slug"],
    historical_period=data["historical_period"],
    reading_time=data["reading_time"],
    difficulty=data["difficulty"],
    source_url=data.get("source_url", ""),
    source_name=data.get("source_name", ""),
    category=root_category,
    is_published=True,
)
```

3. **Ejecutar el seeder**:

```bash
docker compose exec -T backend python manage.py seed_storytelling
```

4. **Verificar** que la API devuelve los datos:

```bash
# Desde dentro del contenedor backend
curl http://localhost:8000/api/v1/stories/
```

---

## Reglas CRÍTICAS

### ✅ SÍ hacer

- Citar SIEMPRE la fuente original con URL en `source_url`
- Escribir contenido en catalán como idioma base
- Verificar hechos históricos con múltiples fuentes si es posible
- Usar formato texto plano para `content` (sin HTML)
- Mantener el `summary` conciso (2-3 frases máximo)
- El `audio_transcript` debe sonar natural, como una narración oral

### ❌ NO hacer

- **NO inventar datos históricos** sin fuente
- **NO dejar `source_url` vacío** — si no hay fuente verificable, indicar al menos la fuente general
- **NO borrar historias existentes** del seeder sin motivo
- **NO modificar la estructura del modelo** sin consultar primero
- **NO generar traducciones con IA sin indicarlo** — si las traducciones son generadas, mencionarlo en un comentario

## API REST

### Endpoints públicos (sin autenticación)

```
GET  /api/v1/stories/              → Lista de historias
GET  /api/v1/stories/{slug}/       → Detalle de una historia
```

### Parámetros de filtrado

| Parámetro           | Tipo    | Ejemplo                    |
| ------------------- | ------- | -------------------------- |
| `is_published`      | bool    | `?is_published=true`       |
| `historical_period` | string  | `?historical_period=Roman` |
| `difficulty`        | string  | `?difficulty=easy`         |
| `search` o `q`      | string  | `?search=Burriac`          |
| `category`          | slug/id | `?category=storytelling`   |

### Endpoints protegidos (requieren autenticación JWT)

```
POST   /api/v1/stories/              → Crear historia
PUT    /api/v1/stories/{slug}/       → Actualizar historia
PATCH  /api/v1/stories/{slug}/       → Actualización parcial
DELETE /api/v1/stories/{slug}/       → Eliminar historia
```

---

## Estructura de archivos

```
backend/storytelling/
├── __init__.py
├── apps.py                     # AppConfig
├── models.py                   # Story, StoryCategorySingleton
├── serializers.py              # StorySerializer con traducciones
├── views.py                    # StoryViewSet con filtros y proximidad
├── urls.py                     # Registro de rutas
├── AGENTS.md                   # ← Este archivo
├── migrations/
│   ├── __init__.py
│   ├── 0001_initial.py
│   └── 0002_add_source_fields.py
├── management/
│   ├── __init__.py
│   └── commands/
│       ├── __init__.py
│       └── seed_storytelling.py  # ← ARCHIVO PRINCIPAL PARA AÑADIR DATOS
└── tests/
    ├── __init__.py
    └── test_storytelling.py
```

---

## Checklist de calidad por historia

Antes de dar por buena una historia, verifica:

- [ ] Tiene `source_url` con URL funcional
- [ ] Tiene `source_name` con nombre de la fuente
- [ ] Tiene título y contenido en `ca` (catalán)
- [ ] El `historical_period` usa uno de los valores permitidos
- [ ] El `reading_time` es razonable para la longitud del contenido
- [ ] El `slug` es descriptivo y en catalán/español
- [ ] No contiene información inventada o no verificada
