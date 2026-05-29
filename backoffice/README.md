# Gaudeix Backoffice

Dashboard administrativo construido con React, TypeScript, Tailwind CSS v4 y Flowbite React.

## Tecnologías

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS v4** - Styling
- **Flowbite React** - Component library
- **React Router** - Routing
- **React Query** - Data fetching
- **Axios** - HTTP client
- **Vitest** + **React Testing Library** - Testing

## Configuración Inicial

### Variables de Entorno

```bash
# Opción 1: Copiar desde la raíz del proyecto
cp ../.env_backoffice .env.local

# Opción 2: Copiar desde el ejemplo
cp .env.local.example .env.local
```

El archivo `.env.local` debe contener:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_HEALTH_CHECK_URL=http://localhost:8000/api/health/

# Frontend URL
VITE_FRONTEND_URL=http://localhost:5173

# Test credentials (DO NOT USE IN PRODUCTION)
VITE_ADMIN_USER=yampi
VITE_ADMIN_PASSWORD=thos
VITE_SYSTEM_USER=gaudeix
VITE_SYSTEM_PASSWORD=gaudeix@2023
```

**Nota:** Las variables deben empezar con `VITE_` para ser accesibles desde el código.

### Instalación

```bash
npm install
```

## Estructura del Proyecto

```
src/
├── app/                    # Core de la aplicación
│   ├── providers/          # Providers globales (Query, Theme, Auth)
│   ├── routes/             # Configuración de rutas
│   └── App.tsx
├── layouts/                # Layouts reutilizables
│   ├── dashboard/          # Layout del dashboard
│   └── auth/               # Layout de autenticación
├── features/               # Módulos por feature
│   ├── auth/               # Autenticación
│   ├── dashboard/          # Dashboard home
│   ├── users/              # Gestión de usuarios
│   ├── media/              # Gestión de media
│   └── events/             # Gestión de eventos
├── components/
│   └── common/             # Componentes reutilizables
├── lib/                    # Utilidades y configuración
│   ├── api/                # Cliente HTTP
│   ├── config/             # Constantes
│   └── utils/              # Funciones utilitarias
├── hooks/                  # Custom hooks
├── types/                  # TypeScript types
└── tests/                  # Test utilities
```

## Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Tests
npm run test          # Run once
npm run test:watch    # Watch mode
```

## Rutas

- `/` - Landing page con health check del backend
- `/test` - Página de prueba de formularios (pública)
- `/login` - Página de inicio de sesión
- `/dashboard` - Dashboard principal (protegido)
- `/dashboard/users` - Gestión de usuarios (protegido)
- `/dashboard/media` - Gestión de media (protegido)
- `/dashboard/events` - Gestión de eventos (protegido)

## Características Implementadas

### Autenticación

- ✅ Sistema de login funcional conectado al backend Django
- ✅ Autenticación JWT con access y refresh tokens
- ✅ Provider de autenticación con localStorage
- ✅ Rutas protegidas con redirección automática
- ✅ Manejo de errores del servidor
- ✅ Tokens automáticos en headers de API

**Credenciales de Desarrollo:**
Para hacer login, primero crea un superusuario en el backend:

```bash
cd backend
python manage.py createsuperuser
```

Luego usa esas credenciales en el login del backoffice.

### UI/UX

- ✅ Landing page con health check del backend
- ✅ Página de prueba de formularios (`/test`)
- ✅ Dashboard limpio y funcional
- ✅ Diseño responsive con Tailwind CSS v4
- ✅ Componentes Flowbite React integrados

## Componentes Flowbite React

Flowbite React proporciona componentes ya construidos. Para ver la documentación completa:

- **Documentación**: https://flowbite-react.com/
- **Componentes**: https://flowbite-react.com/docs/components/accordion

Ejemplo de uso:

```tsx
import { Button, Table, Modal } from "flowbite-react";
```

## Configuración de API

Crea un archivo `.env.local` con:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Desarrollo

### Añadir una Nueva Feature

1. Crear carpeta en `src/features/[feature-name]/`
2. Añadir páginas en `src/features/[feature-name]/pages/`
3. Registrar rutas en `src/app/routes/index.tsx`
4. Añadir navegación en `src/layouts/dashboard/Sidebar.tsx`

### Añadir un Nuevo Endpoint

1. Crear función en `src/lib/api/` o en el feature correspondiente
2. Usar React Query para data fetching:

```typescript
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await apiClient.get("/users");
      return data;
    },
  });
}
```

## Testing

Los tests usan Vitest y React Testing Library. Usa el helper `render` de `@/tests/test-utils` que incluye todos los providers:

```typescript
import { render, screen } from "@/tests/test-utils";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
```

## Autenticación

La autenticación real contra el backend ya está implementada:

1. **Login**: `src/app/providers/AuthProvider.tsx` usa `authApi.login()` → `POST /api/v1/auth/login/`
2. **Logout**: `authApi.logout()` → `POST /api/v1/auth/logout/`
3. **JWT**: Tokens almacenados en localStorage y adjuntados automáticamente via interceptor axios
4. **Refresh**: Interceptor maneja `401` → `POST /api/v1/auth/token/refresh/` automáticamente
5. **Sesión**: Persiste entre recargas (restaura usuario desde API al montar)
6. **Rutas protegidas**: `ProtectedRoute` redirige a login si no hay sesión válida
7. Configurar tokens en `src/lib/api/client.ts`
8. Implementar refresh token logic si es necesario

## Próximos Pasos

- [ ] Implementar CRUD completo para cada feature
- [ ] Añadir más componentes de Flowbite React según necesidad
- [ ] Implementar manejo de errores global
- [ ] Añadir loading states
- [ ] Implementar paginación
- [ ] Añadir filtros y búsqueda

## Componentes Compartidos con el Frontend

El Backoffice puede reutilizar componentes visuales del `frontend/` directamente, sin duplicar código. Este patrón garantiza **paridad visual 1:1** entre la vista pública y el panel administrativo.

### ¿Cómo funciona?

1. **Alias Vite** (`backoffice/vite.config.ts`): define `@frontend` apuntando a `../frontend/src`.
2. **Alias TypeScript** (`backoffice/tsconfig.app.json`): añade `"@frontend/*": ["../frontend/src/*"]` para resolución de tipos en el IDE.
3. **`include` en tsconfig**: lista explícitamente los archivos del frontend que se compilan junto con el backoffice.

### Componentes actualmente compartidos

| Componente           | Ruta en Frontend                                        | Usado en Backoffice                          |
| -------------------- | ------------------------------------------------------- | -------------------------------------------- |
| `EventDetailContent` | `src/features/agenda/components/EventDetailContent.tsx` | `EventPreview.tsx` — vista previa de eventos |

### Ejemplo de importación

```tsx
// backoffice/src/features/events/components/EventPreview.tsx
import { EventDetailContent } from "@frontend/features/agenda/components/EventDetailContent";
```

### Prop `isPreview`

Todos los componentes compartidos aceptan la prop `isPreview?: boolean`. Cuando es `true`:

- Se ocultan enlaces de navegación (`<Link>` a rutas del frontend).
- Los botones interactivos (Favorito, Check-in, Compartir) muestran feedback de simulación.
- Los hrefs externos (Google Maps, documentos) apuntan a `"#"` en lugar de URLs reales.

### Reglas del patrón

- ✅ **Añadir** archivos del frontend a `tsconfig.app.json > include` cuando se incorpore un nuevo componente compartido.
- ✅ **Mantener** `isPreview` como prop en cualquier componente que contenga interacciones de usuario.
- ❌ **Nunca** modificar el componente del frontend para añadir lógica exclusiva del backoffice — mantener la separación de responsabilidades.
