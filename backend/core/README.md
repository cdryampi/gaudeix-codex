# Core App

App Django que contiene los modelos base reutilizables del dominio Gaudeix.

## Modelos Base Abstractos

### `BaseModel`

Modelo abstracto que proporciona campos de auditoría:

- `creado_por` - Usuario que creó el registro
- `modificado_por` - Último usuario que modificó el registro
- `fecha_creacion` - Fecha de creación
- `fecha_modificacion` - Fecha de última modificación

**Uso:**

```python
class MiModelo(BaseModel):
    # tus campos aquí
    pass
```

### `MetadataModel`

Modelo abstracto para metadatos SEO:

- `metatitulo` - Metatítulo para SEO
- `metadescripcion` - Metadescripción para SEO

**Uso:**

```python
class MiModelo(MetadataModel):
    # tus campos aquí
    pass
```

### `ContentBase`

Modelo abstracto que combina `BaseModel` y `MetadataModel`, añadiendo:

- `slug` - SlugField único para URLs

**IMPORTANTE:** Este modelo NO incluye `TranslatableModel` ni `TranslatedFields` porque los modelos abstractos de django-parler no pueden tener campos traducibles.

**Uso correcto en modelos concretos:**

```python
from parler.models import TranslatableModel, TranslatedFields
from core.models import ContentBase

class BlogPost(TranslatableModel, ContentBase):
    translations = TranslatedFields(
        titulo=models.CharField(max_length=200),
        contenido=models.TextField()
    )
    # otros campos no traducibles
```

## Modelos Concretos

### `Category`

Categoría genérica traducible para clasificar contenido.

**Campos:**

- `slug` - Identificador único
- `nombre` (traducible) - Nombre de la categoría
- `descripcion` (traducible) - Descripción
- `taxonomy` - Tipo de taxonomía (theme, audience, season, etc.)
- Hereda campos de `BaseModel` y `MetadataModel`

**Ejemplo de uso:**

```python
# Crear categoría
cat = Category.objects.create(slug='aventura')
cat.set_current_language('ca')
cat.nombre = 'Aventura'
cat.descripcion = 'Activitats d\'aventura'
cat.taxonomy = 'theme'
cat.save()

# Usar en otro modelo
class Route(TranslatableModel, ContentBase):
    categories = models.ManyToManyField('core.Category')

# Nota: la jerarquía de categorías está limitada a 3 niveles (raíz > hijo > nieto) y se bloquean ciclos en parent.
```

### `Tag`

Etiqueta genérica traducible para etiquetar contenido.

**Campos:**

- `slug` - Identificador único
- `nombre` (traducible) - Nombre de la etiqueta
- Hereda campos de `BaseModel`

**Ejemplo de uso:**

```python
# Crear tag
tag = Tag.objects.create(slug='familia')
tag.set_current_language('ca')
tag.nombre = 'Família'
tag.save()

# Usar en otro modelo
class Event(TranslatableModel, ContentBase):
    tags = models.ManyToManyField('core.Tag')
```

## Admin

Ambos modelos están registrados en el admin de Django con soporte completo de traducciones (TranslatableAdmin):

- **CategoryAdmin**: List display, búsqueda, filtros por taxonomy
- **TagAdmin**: List display, búsqueda, filtros por fecha

Los fieldsets están organizados en:

1. Información básica
2. Contenido traducible
3. Metadatos SEO (colapsado)
4. Auditoría (colapsado)

## Idiomas Soportados

Configurados en `settings.py` mediante django-parler:

- Catalán (ca)
- Español (es)
- Inglés (en)
- Francés (fr)

## Migraciones

Para crear/ejecutar migraciones:

```bash
.venv_win\Scripts\python.exe manage.py makemigrations core
.venv_win\Scripts\python.exe manage.py migrate core
```

## API

Endpoints principales (prefijo `/api/v1/`):

- `GET /categories/` (pذblico) + CRUD autenticado
- `GET /tags/` (pذblico) + CRUD autenticado

Filtros comunes:

- `slug=<slug>`
- `search=<texto>` / `q=<texto>`
- En categories: `taxonomy`, `parent` (y `parent=` para root)

## Seeds

Seed de tags (idempotente):

```bash
python manage.py seed_tags
```

Los datos del seed viven en `core/seed/tags.json`.
