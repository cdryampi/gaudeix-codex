# Instrucciones para Agentes AI - Gaudeix Codex

## 🎯 Contexto del Proyecto

**Gaudeix Codex** es una plataforma municipal de gestión de contenidos (CMS) que está en **migración activa** de un monolito Django a arquitectura de microservicios desacoplados:

- **Backend**: Django REST Framework (puerto 8000) - API JSON con autenticación JWT
- **Frontend público**: React + Vite (puerto 5173) - Sitio web municipal
- **Backoffice**: React 18 + TypeScript + Tailwind + shadcn/ui (puerto 5174) - Panel administrativo
- **Mobile**: React Native + Expo (puerto N/A) - App móvil iOS/Android
- **Infraestructura**: PostgreSQL + MinIO (almacenamiento de objetos) vía Docker Compose

**Principio arquitectónico crítico**: Frontends se comunican con backend **exclusivamente vía API REST**. No hay templates compartidos ni acceso directo a base de datos.

## 🚀 Inicio Rápido

### Arrancar Servicios de Desarrollo

**Windows (recomendado)**:
```bash
start_dev.bat  # Arranca backend, frontend y backoffice automáticamente
```

**Manual**:
```bash
# Terminal 1 - Backend
cd backend
.venv_win\Scripts\activate  # Windows
python manage.py runserver 0.0.0.0:8000

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Backoffice
cd backoffice
npm run dev
```

**URLs de acceso**:
- Backend API: http://localhost:8000
- Frontend: http://localhost:5173
- Backoffice: http://localhost:5174
- API Docs: http://localhost:8000/api/schema/swagger-ui/

### Usuarios por Defecto

Después de `python manage.py seed_users`:
- **Admin**: Ver variables de entorno `ADMIN_USER` / `ADMIN_PASSWORD`
- **Sistema**: Ver variables de entorno `SYSTEM_USER` / `SYSTEM_PASSWORD`
- **Otros usuarios**: Consultar con el equipo o verificar en `.env` local

## 🏗️ Arquitectura Específica de Codex

### Estructura de Apps Django

Cada app en `backend/` sigue este patrón modular:

```
backend/
├── users/           # Gestión de usuarios y autenticación JWT
├── social/          # Contenido social (noticias, eventos) con i18n
├── media_files/     # Gestión de archivos con variantes automáticas
├── llm_translations/# Traducciones automáticas con OpenAI/Gemini/Anthropic
├── places/          # Puntos de interés con geolocalización
├── events/          # Gestión de eventos con calendario
└── config/          # Configuración Django (settings/, urls.py)
```

**Patrón de archivos por app**:
- `models.py` - Modelos Django ORM
- `serializers.py` - DRF serializers (separados por acción: create/update/detail)
- `views.py` - **Solo ViewSets**, no vistas basadas en funciones
- `permissions.py` - Permisos personalizados (ej: `IsOwnerOrAdmin`)
- `urls.py` - Registro de rutas con DRF router
- `tests/` o `tests.py` - Suite pytest con cobertura >80%
- `README.md` - Documentación de la app

### Sistema de Permisos por Acción

Codex usa permisos granulares por acción en ViewSets:

```python
# Ejemplo real de backend/users/views.py
def get_permissions(self):
    if self.action in ['create']:  # Registro público
        return [AllowAny()]
    elif self.action in ['update', 'partial_update', 'destroy']:
        return [IsAuthenticated(), IsOwnerOrAdmin()]  # Solo dueño o admin
    return [IsAuthenticated()]  # Por defecto: autenticado
```

### Gestión de Media Files

El app `media_files` es crítico para el CMS:

**Características únicas**:
- Generación automática de **3 variantes** de imágenes al subir:
  - `thumbnail`: 150px (miniatura)
  - `medium`: 600px (vista previa)
  - `large`: 1200px (resolución completa)
- Nombres UUID para prevenir colisiones
- Eliminación automática de archivos físicos vía signals
- Validación: Max 10MB, formatos permitidos: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.pdf`, `.ics`, `.txt`, `.docx`, `.xlsx`

**Endpoints**:
```
POST   /api/v1/media/images/       # Upload con auto-generación de variantes
GET    /api/v1/media/images/{id}/  # Detalle con URLs de todas las variantes
DELETE /api/v1/media/images/{id}/  # Elimina archivo + variantes
```

### Traducciones con LLMs

El app `llm_translations` permite traducciones automáticas vía múltiples proveedores:

**Proveedores soportados**:
- OpenAI (`LLM_OPENAI_API_KEY`)
- Google Gemini (`LLM_GEMINI_API_KEY`)
- Anthropic (`LLM_ANTHROPIC_API_KEY`)
- Mistral (`LLM_MISTRAL_API_KEY`)
- Groq (`LLM_GROQ_API_KEY`)

**Uso**: Campos traducibles en modelos usan `django-parler` (ver app `social`).

## 💻 Convenciones de Código de Codex

### Backend Django

✅ **Hacer**:
- Usar `ModelViewSet` o `GenericViewSet` con mixins
- Separar serializers por acción (create/update/detail)
- Implementar `get_permissions()` para control granular
- JWT en header: `Authorization: Bearer {token}`
- Versionado de API: `/api/v1/`
- Tests con pytest y fixtures en `conftest.py`

❌ **Evitar**:
- Vistas basadas en funciones (usar ViewSets)
- Permisos globales (usar por acción)
- Hardcodear secrets (usar env vars)

### Frontend/Backoffice React

✅ **Hacer**:
- Importaciones con alias: `@/` (configurado en tsconfig)
- Estructura por features: `src/features/[feature]/pages|components|api`
- **Solo Lucide React** para iconos (ver `backoffice/UI_GUIDELINES.md`)
- shadcn/ui para componentes UI
- Variables de entorno con prefijo `VITE_`

❌ **Evitar**:
- Otras librerías de iconos (FontAwesome, Heroicons, etc.)
- Acceso directo a backend (siempre usar API)
- Importaciones relativas largas (usar `@/`)

### Mobile (React Native + Expo)

✅ **Hacer**:
- Importaciones con alias: `@/` para `src/` (configurado en tsconfig)
- Estructura por features: `src/features/[feature]/pages|components|api`
- NativeWind (Tailwind CSS) para estilos: `className="flex-1 bg-primary"`
- Variables de entorno con prefijo `EXPO_PUBLIC_`
- Zustand para state management global
- React Query para data fetching y caching
- Expo Secure Store para tokens/credenciales sensibles

❌ **Evitar**:
- StyleSheet de React Native (usar NativeWind)
- Acceso directo a backend (usar API client centralizado)
- Hardcodear API URLs (usar env vars)
- Importaciones relativas largas (usar `@/`)

### Comandos Esenciales

**Backend**:
```bash
python manage.py migrate              # Aplicar migraciones
python manage.py makemigrations --name descripcion  # Crear migración
python manage.py seed_users           # Usuarios por defecto
python manage.py seed_media_files     # Datos de ejemplo
pytest --cov=. --cov-report=html      # Tests con cobertura
ruff check . --fix                    # Linting
black .                               # Formateo
```

**Frontend/Backoffice**:
```bash
npm run dev                           # Servidor desarrollo
npm run build                         # Build producción
npm test                              # Tests Vitest
npm run lint                          # ESLint
npx shadcn@latest add [componente]    # Agregar componente UI
```

**Mobile**:
```bash
cd mobile
npm start                             # Iniciar Expo dev server
npm run android                       # Android Emulator
npm run ios                           # iOS Simulator (solo macOS)
npm run lint                          # ESLint
npm run format                        # Prettier
npm run type-check                    # TypeScript check
```

## 🔧 Entornos y Configuración

### Perfiles de Entorno Backend

Variable `ENVIRONMENT` controla el profile:

- `local` - SQLite para desarrollo sin Docker
- `test` - SQLite en memoria para tests
- `production` - PostgreSQL vía `DATABASE_URL` o variables `DB_*`

**Configuración en**: `backend/config/settings/`

### Variables de Entorno Críticas

Ver documentación completa en `/docs/environment.md`. Las más importantes:

**Backend**:
```bash
ENVIRONMENT=local
DJANGO_SECRET_KEY=django-insecure-...
DATABASE_URL=postgresql://...  # Solo en producción
DJANGO_ALLOWED_CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

**Frontend/Backoffice** (prefijo `VITE_` obligatorio):
```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

**Mobile** (prefijo `EXPO_PUBLIC_` obligatorio):
```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

## 📦 Flujos de Trabajo Comunes

### Crear Nueva App Django

```bash
# 1. Crear app
python manage.py startapp nombre_app

# 2. Registrar en INSTALLED_APPS (config/settings/base.py)
INSTALLED_APPS = [
    ...
    'nombre_app',
]

# 3. Estructura recomendada
nombre_app/
├── models.py          # Modelo con campos
├── serializers.py     # Serializers separados por acción
├── views.py           # ViewSet con get_permissions()
├── permissions.py     # Permisos personalizados (opcional)
├── urls.py            # Router DRF
├── tests/             # Tests pytest
│   ├── conftest.py
│   └── test_views.py
└── README.md          # Documentación

# 4. Registrar rutas en config/urls.py
from nombre_app.urls import router as nombre_app_router
router.registry.extend(nombre_app_router.registry)
```

### Agregar Nueva Feature Frontend

```bash
# 1. Crear estructura
mkdir -p src/features/mi-feature/{pages,components,api}

# 2. Crear archivos base
# src/features/mi-feature/pages/MiFeaturePage.tsx
# src/features/mi-feature/api/index.ts
# src/features/mi-feature/components/MiComponente.tsx

# 3. Registrar ruta en src/app/routes/index.tsx
# 4. Agregar al sidebar (backoffice): src/layouts/dashboard/Sidebar.tsx
# 5. Usar importaciones con @/ para todo
```

### Subir Archivo con Variantes

```bash
# Endpoint: POST /api/v1/media/images/
# Content-Type: multipart/form-data

# Respuesta incluye:
{
  "id": "uuid",
  "file": "url-original",
  "thumbnail": "url-150px",
  "medium": "url-600px",
  "large": "url-1200px",
  "file_size": 1234567,
  "file_type": "image/jpeg"
}
```

## 🐳 Docker y Despliegue

### Stack Completo con Docker

```bash
docker-compose up --build

# Servicios:
# - backend:8000
# - frontend:4173
# - backoffice:4174
# - db (PostgreSQL)
# - minio:9000 (API), 9001 (Console)
```

### Despliegue en Dokploy

Ver documentación completa en `/docs/deployment.md`:

1. **Subdomains**: `api.*` (backend), `www.*` (frontend), `admin.*` (backoffice)
2. **CORS**: Configurado en `backend/config/settings/base.py`
3. **Build**: Cada servicio tiene Dockerfile optimizado
4. **Variables**: Configurar en Dokploy según `/docs/environment.md`

## 📚 Documentación de Referencia

**Archivos clave**:
- `/docs/environment.md` - Variables de entorno completas
- `/docs/deployment.md` - Guía de despliegue Docker/Dokploy
- `/backend/[app]/README.md` - Documentación por app
- `/backoffice/UI_GUIDELINES.md` - Guías de UI específicas
- `.vscode/tasks.json` - Tareas VS Code para auto-start
- `.github/copilot-instructions.md` - Instrucciones detalladas para GitHub Copilot

## ⚠️ Anti-Patrones Específicos de Codex

❌ **NO hacer**:
1. Usar vistas basadas en funciones en nuevo código backend (solo ViewSets)
2. Instalar librerías de iconos que no sean Lucide React
3. Acceder a base de datos directamente desde frontend
4. Hardcodear credenciales (usar env vars)
5. Modificar directorio `/chatGPT/` sin instrucción explícita
6. Hacer cambios breaking en API sin versionado
7. Saltarse tests (mínimo 80% cobertura backend)

## 🎨 Casos de Uso Comunes

### 1. Endpoint Protegido con Permisos Personalizados

```python
# backend/mi_app/permissions.py
from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user

# backend/mi_app/views.py
class MiViewSet(viewsets.ModelViewSet):
    queryset = MiModelo.objects.all()
    serializer_class = MiSerializer
    
    def get_permissions(self):
        if self.action == 'list':
            return [permissions.AllowAny()]
        elif self.action in ['update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]
        return [permissions.IsAuthenticated()]
```

### 2. Upload de Imagen con Validación

```typescript
// backoffice/src/features/media/api/uploadImage.ts
import axios from 'axios';

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', file.name);
  
  const response = await axios.post(
    '/api/v1/media/images/',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
  );
  
  // Respuesta incluye: thumbnail, medium, large URLs
  return response.data;
};
```

### 3. Componente con shadcn/ui y Lucide Icons

```tsx
// backoffice/src/features/dashboard/components/StatsCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";  // ✅ Solo Lucide

export function StatsCard({ title, value, trend }: {
  title: string;
  value: string;
  trend: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{trend}</p>
      </CardContent>
    </Card>
  );
}
```

## 🔍 Recursos Adicionales

- **Swagger API**: http://localhost:8000/api/schema/swagger-ui/
- **ReDoc**: http://localhost:8000/api/schema/redoc/
- **MinIO Console**: http://localhost:9001 (credenciales en `.env` o `docker-compose.yml`)
- **VS Code**: Workspace auto-inicia servicios al abrir

---

**Última actualización**: Enero 2025  
**Versión**: Django 5.2 + React 18 + React Native 0.81 + PostgreSQL 16
