# Implementar funcionalidad de Places en Frontend

## 📋 Descripción

Implementar las páginas y componentes necesarios para mostrar los lugares (places) en el sitio web público del frontend, consumiendo la API REST ya existente del backend.

## 🎯 Contexto

El backend ya tiene completamente implementada la funcionalidad de places:
- ✅ API REST en `/api/v1/places/` con endpoints CRUD
- ✅ 8 lugares de ejemplo con traducciones en CA, ES, EN, FR
- ✅ Soporte para filtros: búsqueda, categoría, geolocalización
- ✅ Auto-traducción con LLM integrada
- ✅ Modelos especializados: Restaurant, Accommodation
- ✅ Tests pasando al 100%

El backoffice también tiene places completamente funcional.

**Falta:** Implementar la visualización pública en el frontend.

## 📦 Tareas a Realizar

### 1. Tipos TypeScript
- [ ] Crear `frontend/src/features/places/types/index.ts`
- [ ] Definir tipo `Place` con todos los campos del API
- [ ] Definir tipo `PlaceCategory` si es necesario

### 2. API Client
- [ ] Crear `frontend/src/features/places/api/index.ts`
- [ ] Implementar funciones:
  - `getAll(params)` - Obtener todos los lugares publicados
  - `getById(id)` - Obtener lugar por ID
  - `getBySlug(slug)` - Obtener lugar por slug
  - `getByCategory(categorySlug)` - Filtrar por categoría
  - `getNearby(lat, lng, radius)` - Lugares cercanos (opcional)

### 3. Componentes

#### PlaceCard
- [ ] Crear `frontend/src/features/places/components/PlaceCard.tsx`
- [ ] Mostrar imagen destacada (featured_media)
- [ ] Título del lugar
- [ ] Descripción corta (2 líneas con clamp)
- [ ] Ubicación (location_text)
- [ ] Iconos: teléfono, web (opcional)
- [ ] Diseño consistente con EventCard y NewsCard (Flowbite + Lucide icons)

### 4. Páginas

#### PlacesPage (Listado)
- [ ] Crear `frontend/src/features/places/pages/PlacesPage.tsx`
- [ ] Título: "Lugares"
- [ ] Descripción: "Descubre los mejores lugares de la zona"
- [ ] Input de búsqueda (TextInput de Flowbite con icono Search)
- [ ] Grid responsivo de PlaceCard (1 col móvil, 2 tablet, 3 desktop)
- [ ] Estados: loading (Spinner), error, vacío
- [ ] Contador de resultados

#### PlaceDetailPage (Detalle)
- [ ] Crear `frontend/src/features/places/pages/PlaceDetailPage.tsx`
- [ ] Imagen hero (aspect-video)
- [ ] Título grande
- [ ] Descripción completa
- [ ] Sección de contacto con iconos:
  - 📍 Dirección (location_text)
  - 📞 Teléfono (con link `tel:`)
  - 📧 Email (con link `mailto:`)
  - 🌐 Sitio web (con link externo)
  - 🔗 Booking URL (botón CTA si existe)
- [ ] Placeholder para mapa si hay coordenadas (latitude, longitude)
- [ ] Botón "Volver a lugares" con icono ArrowLeft

### 5. Routing
- [ ] Añadir rutas en `frontend/src/App.tsx`:
  - `/places` → PlacesPage
  - `/places/:slug` → PlaceDetailPage

## 🎨 Diseño y UX

### Consistencia Visual
- **Iconos**: Solo usar Lucide React (`lucide-react`)
- **Componentes UI**: Flowbite React components
- **Colores**: Usar variables de Tailwind CSS existentes
- **Tipografía**: Mantener jerarquía con `text-4xl`, `text-xl`, etc.

### Responsive
- Grid adaptativo: 1 columna móvil, 2 tablet, 3 desktop
- Imágenes con `aspect-video` o `aspect-square`
- Padding/spacing consistente: `container mx-auto px-4 py-8`

### Estados
- **Loading**: Mostrar Spinner de Flowbite centrado
- **Error**: Alert rojo con mensaje descriptivo
- **Vacío**: Mensaje "No se encontraron lugares" en card gris

## 🔗 API Endpoints a Consumir

```typescript
// GET /api/v1/places/
// Parámetros:
//   - is_published: boolean (default: true)
//   - search: string (opcional)
//   - category: string | number (opcional)
//   - near: "lat,lng" (opcional)
//   - radius_km: number (opcional)

// Respuesta:
[
  {
    id: number,
    slug: string,
    title: string,
    description: string,
    location_text: string,
    latitude: number | null,
    longitude: number | null,
    phone: string,
    email: string,
    website: string,
    booking_url: string,
    is_published: boolean,
    category: number | null,
    template_key: string | null,
    featured_media: {
      id: number,
      file: string,
      thumbnail: string,
      medium: string,
      large: string
    } | null,
    created_at: string,
    updated_at: string
  }
]
```

## 📝 Notas Técnicas

### Uso de API Client
El frontend usa `apiGet` desde `@/lib/api` (no axios):

```typescript
import { apiGet } from "@/lib/api";

const places = await apiGet<Place[]>("/places/?is_published=true");
```

### Manejo de Imágenes
Las variantes de imagen disponibles:
- `featured_media.thumbnail` - 150px (listados)
- `featured_media.medium` - 600px (cards)
- `featured_media.large` - 1200px (detalle)
- `featured_media.file` - Original (fallback)

### Navegación
```typescript
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();
navigate(`/places/${place.slug}`); // Por slug
navigate("/places"); // Volver a listado
```

## ✅ Criterios de Aceptación

- [ ] Build del frontend sin errores TypeScript
- [ ] Rutas `/places` y `/places/:slug` funcionando
- [ ] Listado muestra todos los lugares publicados
- [ ] Búsqueda filtra en tiempo real
- [ ] Detalle muestra toda la información del lugar
- [ ] Diseño responsive (mobile, tablet, desktop)
- [ ] Estados de loading y error manejados
- [ ] Enlaces externos abren en nueva pestaña
- [ ] Consistencia visual con resto del sitio

## 🔗 Referencias

- **Backend README**: `/backend/places/README.md`
- **API Docs**: `http://localhost:8000/api/schema/swagger-ui/` (endpoint places)
- **Backoffice Places**: `/backoffice/src/features/places/` (para inspiración de estructura)
- **Ejemplo EventCard**: `/frontend/src/features/agenda/components/EventCard.tsx`
- **Ejemplo NewsCard**: `/frontend/src/features/news/components/NewsCard.tsx`

## 🏷️ Labels Sugeridas

- `frontend` - Desarrollo frontend
- `feature` - Nueva funcionalidad
- `enhancement` - Mejora del sitio
- `good first issue` - Tarea bien definida y acotada

## 📌 Prioridad

**Media** - No es bloqueante pero es funcionalidad core del CMS.

---

**Nota:** El backend y backoffice ya están 100% funcionales. Solo falta la visualización pública en el frontend.
