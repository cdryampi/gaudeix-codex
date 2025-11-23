# Agent Context - Gaudeix Codex Backoffice

## Información del Proyecto

**Proyecto**: Gaudeix Codex - Sistema de gestión de contenido para municipio  
**Backoffice URL**: http://localhost:5174  
**Backend API**: http://localhost:8000/api/v1  
**Frontend público**: http://localhost:5173

---

## Estructura del Proyecto

### Backend (Django + DRF)

- **Ubicación**: `backend/`
- **Puerto**: 8000
- **Base de datos**: PostgreSQL
- **Autenticación**: JWT (djangorestframework-simplejwt)
- **Apps principales**:
  - `users` - Gestión de usuarios y autenticación
  - `social` - Posts/Blog y eventos
  - `media_files` - Gestor de archivos multimedia
  - `places` - Puntos de interés (pendiente)

### Backoffice (React + Vite + TypeScript)

- **Ubicación**: `backoffice/`
- **Puerto**: 5174
- **Framework**: React 18 + TypeScript
- **Routing**: React Router v6
- **UI**: Tailwind CSS + shadcn/ui
- **Estado**: Zustand
- **API Client**: Axios

### Frontend Público (Next.js)

- **Ubicación**: `frontend/`
- **Puerto**: 5173
- **Framework**: Next.js (pendiente de implementación completa)

---

## Módulos Implementados en Backoffice

### ✅ Completados

1. **Landing Page** (`/`)

   - Logo personalizado (logo-cabrera-white.png)
   - Health check del backend
   - Estados visuales (Frontend/Backend)
   - Navegación al login
   - Diseño minimalista con Tailwind + shadcn/ui

2. **Autenticación** (`/login`)

   - Login con JWT
   - Endpoint: `POST /api/v1/auth/login/`
   - Respuesta: `{ user, access, refresh }`
   - Usuarios seed: yampi/thos, gaudeix/Gaudeix@2023

3. **Gestión de Usuarios** (`/dashboard/users`)

   - CRUD completo
   - Tabla con búsqueda y filtros
   - Dialog para crear/editar
   - Integración con API real
   - Tests: 7/7 passed

4. **Health Check**
   - Endpoint: `GET /api/health/`
   - Verifica backend y base de datos
   - Público (sin autenticación)

### 🚧 En Desarrollo

- **Posts/Blog** (`/dashboard/posts`) - Pendiente
- **Eventos** (`/dashboard/events`) - Estructura básica
- **Media Manager** (`/dashboard/media`) - Estructura básica
- **Lugares** - Pendiente
- **Configuración** - Pendiente

---

## Rutas del Backoffice

```typescript
/ → Landing Page (pública)
/login → Login (pública)
/register → Registro (pública)
/reset-password → Recuperar contraseña (pública)
/dashboard → Home del dashboard (protegida)
/dashboard/users → Gestión de usuarios (protegida)
/dashboard/media → Gestor de archivos (protegida)
/dashboard/events → Gestión de eventos (protegida)
```

---

## API Endpoints Principales

### Autenticación

- `POST /api/v1/auth/login/` - Login con JWT
- `POST /api/v1/auth/registration/` - Registro
- `POST /api/v1/auth/logout/` - Logout

### Usuarios

- `GET /api/v1/users/` - Listar usuarios (admin)
- `POST /api/v1/users/` - Crear usuario
- `GET /api/v1/users/{id}/` - Detalle de usuario
- `PATCH /api/v1/users/{id}/` - Actualizar usuario
- `DELETE /api/v1/users/{id}/` - Eliminar usuario

### Health Check

- `GET /api/health/` - Estado del backend

---

## Variables de Entorno

### Backend (`.env`)

```env
ADMIN_USER=yampi
ADMIN_PASSWORD=thos
SYSTEM_USER=gaudeix
SYSTEM_PASSWORD=Gaudeix@2023
```

### Backoffice (`.env.local`)

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_ADMIN_USER=yampi
VITE_ADMIN_PASSWORD=thos
VITE_SYSTEM_USER=gaudeix
VITE_SYSTEM_PASSWORD=Gaudeix@2023
```

---

## Comandos Útiles

### Backend

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_users  # Crear usuarios iniciales
python manage.py runserver
```

### Backoffice

```bash
cd backoffice
npm install
npm run dev  # Puerto 5174
npm test     # Ejecutar tests
```

---

## Próximos Pasos

1. **Posts/Blog Management**

   - Crear componentes para CRUD de posts
   - Editor de contenido (markdown o rich text)
   - Categorías y tags
   - Imágenes destacadas

2. **Eventos**

   - Formulario completo de eventos
   - Calendario de eventos
   - Gestión de ubicaciones

3. **Media Manager**

   - Upload de archivos
   - Galería de imágenes
   - Organización por carpetas
   - Integración con posts y eventos

4. **Lugares/Points of Interest**

   - CRUD de lugares
   - Integración con mapas
   - Categorías de lugares

5. **Configuración General**
   - Ajustes del sitio
   - Traducciones
   - SEO settings

---

## Notas Técnicas

- **Autenticación**: El backoffice usa JWT tokens. El access token se envía en el header `Authorization: Bearer {token}`
- **Tipos**: Los tipos de TypeScript están sincronizados con los serializers de Django
- **Tests**: Usar `pytest` para backend, `vitest` para frontend
- **Diseño**: Seguir los patrones de shadcn/ui y Tailwind CSS
- **Responsive**: Todos los componentes deben ser mobile-first

---

## Contacto y Recursos

- **Documentación API**: http://localhost:8000/api/schema/swagger-ui/
- **ReDoc**: http://localhost:8000/api/schema/redoc/
