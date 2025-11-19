#### Frontend/Backoffice

```bash
# Ejecutar tests
npm test

# Con coverage
npm run test:coverage

# E2E (cuando se implemente)
npm run test:e2e
```

### Git Workflow

- **Branch principal**: `main`
- **Branches de trabajo**: `feature/{nombre}`, `fix/{nombre}`, `refactor/{nombre}`
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, etc.)
- **Pull Requests**: Requeridos para merge a main
- **Reviews**: Director Técnico + Auditor correspondiente

### Variables de Entorno

Consultar `/docs/environment.md` para:

- Variables requeridas por módulo
- Valores de desarrollo vs producción
- Sincronización con GitHub Actions/Dokploy

## Módulos del Sistema

### Backend API

#### Implementados

- ✅ Configuración base (settings, urls, wsgi/asgi)
- ✅ Estructura de proyecto

#### En Desarrollo

- 🚧 Ninguno actualmente

#### Planificados

- ⏳ **users**: Autenticación, registro, perfiles
- ⏳ **blog**: Posts/noticias con categorías
- ⏳ **events**: Agenda de eventos
- ⏳ **places**: Lugares/ubicaciones
- ⏳ **media**: Gestión de archivos
- ⏳ **config**: Configuración general
- ⏳ **i18n**: Traducciones

### Frontend SPA

#### Implementados

- ✅ Configuración base (Vite, React)
- ✅ Estructura de proyecto

#### Planificados

- ⏳ Home
- ⏳ Noticias (listado + detalle)
- ⏳ Agenda (listado + detalle)
- ⏳ Mapa/Lugares
- ⏳ About
- ⏳ Layout (Header/Footer)
- ⏳ Selector de idioma

### Backoffice

#### Implementados

- ✅ Configuración base (Vite, React)
- ✅ Estructura de proyecto

#### Planificados

- ⏳ Autenticación administrativa
- ⏳ CRUD Posts
- ⏳ CRUD Eventos
- ⏳ CRUD Lugares
- ⏳ Gestión de usuarios
- ⏳ Gestión de media
- ⏳ Configuración
- ⏳ Auditoría básica

## Patrones y Buenas Prácticas

### Backend

#### Modelos

```python
# Usar AbstractBaseModel para timestamps
class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

# Heredar de BaseModel
class Post(BaseModel):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    # ...
```

#### Serializers

```python
# Usar ModelSerializer
class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'title', 'slug', 'content', 'created_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
```

#### Views

```python
# Preferir ViewSets
class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Filtros, búsqueda, etc.
        return super().get_queryset()
```

#### URLs

```python
# Usar routers de DRF
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')

urlpatterns = router.urls
```

### Frontend

#### API Calls

```typescript
// Centralizar en services/
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

export const postsService = {
  getAll: () => axios.get(`${API_BASE_URL}/posts/`),
  getById: (id: string) => axios.get(`${API_BASE_URL}/posts/${id}/`),
  create: (data: PostCreate) => axios.post(`${API_BASE_URL}/posts/`, data),
  // ...
};
```

#### Componentes

```typescript
// Componentes funcionales con TypeScript
interface PostCardProps {
  post: Post;
  onClick?: (id: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {
  return (
    <article onClick={() => onClick?.(post.id)}>
      <h2>{post.title}</h2>
      {/* ... */}
    </article>
  );
};
```

## Seguridad

### Autenticación JWT

- Token de acceso: 5 minutos
- Token de refresh: 7 días
- Headers: `Authorization: Bearer {token}`
- Refresh endpoint: `/api/v1/auth/token/refresh/`

### CORS

- Orígenes permitidos: subdominios configurados
- Métodos: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Headers: Content-Type, Authorization
- Credentials: true

### Validaciones

- Backend: Serializers DRF + validadores Django
- Frontend: Validación en formularios + sanitización
- SQL Injection: ORM Django (previene automáticamente)
- XSS: React (escapa automáticamente) + DOMPurify si hay HTML

## Documentación de Referencia

### Interna

- `/docs/deployment.md` - Guía de despliegue
- `/docs/environment.md` - Variables de entorno
- `/docs/migration_issues.md` - Backlog de migración
- `/docs/GITHUB_LABELS.md` - Sistema de etiquetas
- `/docs/AGENTS_OVERVIEW.md` - Visión general de agentes

### Externa

- [Django Docs](https://docs.djangoproject.com/)
- [DRF Docs](https://www.django-rest-framework.org/)
- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [React Admin Docs](https://marmelab.com/react-admin/)

## Decisiones Arquitectónicas

### ADR-001: Django REST Framework para API

- **Fecha**: 2025-11-17
- **Estado**: Aceptada
- **Razón**: Ecosistema maduro, documentación excelente, integración nativa con Django

### ADR-002: JWT en lugar de sesiones

- **Fecha**: 2025-11-17
- **Estado**: Aceptada
- **Razón**: Stateless, escalable, compatible con SPA y subdominios

### ADR-003: React + Vite para frontend

- **Fecha**: 2025-11-17
- **Estado**: Aceptada
- **Razón**: Desarrollo rápido, HMR excelente, ecosistema moderno

### ADR-004: Docker Compose unificado

- **Fecha**: 2025-11-17
- **Estado**: Aceptada
- **Razón**: Simplifica desarrollo local, coherencia con producción

## Notas para Subagentes

### Antes de Ejecutar Cualquier Tarea

1. ✅ Leer este documento completo
2. ✅ Revisar `/docs` para contexto específico
3. ✅ Consultar el subagente correspondiente en `/agents`
4. ✅ Verificar que tienes las herramientas necesarias
5. ✅ Entender los criterios de aceptación

### Durante la Ejecución

1. Seguir los estándares definidos aquí
2. Consultar documentación de referencia cuando sea necesario
3. Validar contra criterios de calidad
4. Documentar decisiones importantes

### Antes de Retornar Resultado

1. ✅ Auto-validar contra checklist de calidad
2. ✅ Verificar que no hay errores de linting
3. ✅ Confirmar que tests pasan
4. ✅ Actualizar documentación si es necesario

## Actualización de este Documento

Este documento debe actualizarse cuando:

- Se añade un nuevo módulo al proyecto
- Cambia el stack técnico
- Se adopta un nuevo estándar o patrón
- Se toma una decisión arquitectónica importante
- Se actualiza la versión del proyecto

**Responsable**: Director Técnico (Google AI) con apoyo del Integrador
