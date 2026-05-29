# Instrucciones para Agentes AI - Gaudeix Codex

## Modern Web Guidance

This project uses **Modern Web Guidance** for web best practices. The skill is located at `.agents/skills/modern-web-guidance/SKILL.md`.

**Baseline target**: Baseline 2024 (widely available across modern browsers)

When implementing UI features, consult the skill for:

- Performance optimization (image priority, task breaking, content visibility)
- Accessibility patterns (form validation, error announcements)
- Modern CSS (text-wrap balance, accent-color, container queries)
- UX patterns (native dialogs, animations, dark mode)

## Entorno Cloud/Linux

Si trabajas en Codex Web/Cloud, Jules o runners Linux, lee primero `AGENTS_CLOUD.md`.

## Contexto del proyecto

**Gaudeix Codex** es una plataforma municipal en migracion a frontends desacoplados:

- **Backend**: Django REST Framework en `http://localhost:8000`
- **Frontend publico**: React + Vite
- **Backoffice**: React 18 + TypeScript + Tailwind + shadcn/ui
- **Mobile**: React Native + Expo
- **Infraestructura local canonica**: Docker Compose con PostgreSQL, MinIO, Redis, Celery worker y Celery beat

Principio critico: los frontends hablan con backend solo via API REST.

## Inicio rapido

### Ruta canonica de desarrollo

La forma correcta de arrancar el backend y la infraestructura local es:

```bash
docker compose up --build
```

Si el agente necesita backend, PostgreSQL, Redis, Celery o almacenamiento local y no estan levantados, debe arrancar Docker Compose antes de seguir con el ticket. No debe asumir que existe un backend local fuera de Docker.

Eso levanta:

- `backend`
- `worker`
- `beat`
- `db`
- `redis`
- `storage`
- `frontend` en `http://localhost:4173`
- `backoffice` en `http://localhost:4174`

### UI local opcional

Si necesitas iterar mas rapido en UI, puedes usar Vite local contra el backend Docker:

```bash
cd frontend
npm run dev

cd backoffice
npm run dev
```

URLs utiles:

- Backend API: `http://localhost:8000`
- Frontend Docker: `http://localhost:4173`
- Backoffice Docker: `http://localhost:4174`
- Frontend Vite local: `http://localhost:5173`
- Backoffice Vite local: `http://localhost:5174`
- Swagger: `http://localhost:8000/api/schema/swagger-ui/`

### Regla importante de entorno

No uses `start_dev.bat`, `ENVIRONMENT=local` ni `python manage.py runserver` como flujo principal del repo. Ese camino puede dejar al agente trabajando contra una base distinta, sin Redis/Celery o con un backend diferente al que usa Docker.

Cuando el ticket dependa de API, base de datos, colas, automatizaciones o media, el agente debe comprobar primero si Docker esta levantado y, si no lo esta, ejecutar el stack necesario antes de diagnosticar errores de aplicacion.

### Regla obligatoria de bootstrap de datos

Si se recrea la base de datos, se crea un volumen Docker nuevo, se hace `flush`, se ejecuta un reset destructivo o el frontend/backoffice aparece vacio tras levantar Docker, **no asumas que la API esta rota**. Primero repuebla los datos base del entorno local.

Flujo canonico despues de una DB vacia o reiniciada:

```bash
docker compose up --build -d
docker compose exec -T backend python manage.py migrate
docker compose exec -T backend python manage.py seed_all --noinput
```

`seed_all` ya incluye el bootstrap de automatizaciones y la sincronizacion segura de media demo. No encadenes despues `bootstrap_automations` ni `seed_media_files` salvo que el ticket pida depurar especificamente esos comandos.

Comprobaciones minimas antes de seguir depurando frontend:

- `GET /api/v1/categories/` debe devolver contenido
- `GET /api/v1/places/?is_published=true&limit=100` debe devolver contenido
- `GET /api/v1/events/?is_published=true&limit=10&upcoming=true` debe devolver contenido

Si esos endpoints estan vacios, el problema prioritario es de bootstrap/seed, no de UI.

## Usuarios por defecto

Despues de `python manage.py seed_users`:

- **Admin**: ver `ADMIN_USER` / `ADMIN_PASSWORD`
- **Sistema**: ver `SYSTEM_USER` / `SYSTEM_PASSWORD`

## Arquitectura backend

Cada app Django en `backend/` sigue este patron:

- `models.py`
- `serializers.py`
- `views.py` con **ViewSets**
- `permissions.py`
- `urls.py`
- `tests/`
- `README.md`

### Reglas backend

Haz:

- Usar `ModelViewSet` o `GenericViewSet`
- Separar serializers por accion cuando haga falta
- Implementar `get_permissions()` por accion
- Versionar la API en `/api/v1/`
- Escribir tests con pytest

Evita:

- Vistas basadas en funciones
- Permisos globales sin granularidad
- Secrets hardcodeados

### Celery y automatizaciones

Cuando un ticket toque automatizaciones:

- Celery es orquestacion; la logica de negocio vive en servicios de dominio
- El estado real, auditoria y propuestas vive en PostgreSQL
- Redis es broker, no fuente de verdad
- Las tareas deben ser idempotentes
- Backoffice solo puede activar plantillas whitelistadas en backend
- No disenes tareas cuya unica validacion sea "arranca el worker y mira si pasa"
- En GitHub Actions, por defecto usa tests con `config.settings.test` y Celery eager

## Frontend y backoffice

Haz:

- Importaciones con alias `@/`
- Estructura por features
- Solo **Lucide React** para iconos
- shadcn/ui para componentes
- Variables `VITE_*`
- Usar `fetchPriority="high"` en imágenes LCP
- Usar `content-visibility: auto` en listas largas
- Usar `text-wrap: balance` en headings
- Usar `:user-invalid` para validación de formularios
- Usar `<dialog closedby>` para modales nativos
- Usar `scheduler.yield()` para tareas largas

Evita:

- Acceso directo a DB
- Importaciones relativas largas
- Dejar `.js` compilados dentro de `src/`
- JavaScript innecesario para funcionalidad nativa del navegador
- Animaciones que bloqueen el hilo principal

## Mobile

Haz:

- Alias `@/`
- Estructura por features
- Variables `EXPO_PUBLIC_*`
- Zustand + React Query

Evita:

- Hardcodear URLs
- Imports relativos largos

## Comandos esenciales

### Backend

```bash
python manage.py migrate
python manage.py makemigrations --name descripcion
python manage.py seed_users
python manage.py seed_media_files
python manage.py bootstrap_automations
pytest --cov=. --cov-report=html
ruff check .
black .
```

### Frontend / backoffice

```bash
npm run dev
npm run build
npm test
npm run lint
```

### Mobile

```bash
cd mobile
npm start
npm run lint
npm run type-check
```

## Entornos y configuracion

### Backend

Perfiles relevantes:

- `ENVIRONMENT=production` en Docker local y despliegues
- `ENVIRONMENT=test` para pytest

No uses `ENVIRONMENT=local` como recomendacion operativa del repo.

Variables criticas:

```bash
ENVIRONMENT=production
DJANGO_SECRET_KEY=django-insecure-...
DATABASE_URL=postgresql://...
DJANGO_ALLOWED_CORS_ORIGINS=http://localhost:5173,http://localhost:5174
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/1
CELERY_TASK_ALWAYS_EAGER=false
CELERY_TASK_EAGER_PROPAGATES=true
```

### Frontend / backoffice

```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Mobile

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

## Flujos comunes

### Crear una nueva app Django

1. `python manage.py startapp nombre_app`
2. Registrar en `INSTALLED_APPS`
3. Crear `models.py`, `serializers.py`, `views.py`, `urls.py`, `tests/`
4. Registrar rutas en `config/urls.py`

### Agregar una feature en frontend/backoffice

1. Crear `src/features/mi-feature/{pages,components,api}`
2. Registrar la ruta
3. Conectar API y navegación

## Docker y despliegue

### Stack local

```bash
docker compose up --build
```

### Regla de trabajo con Docker

- El backend canonico local corre en Docker Compose
- PostgreSQL y Redis locales del proyecto tambien corren en Docker Compose
- Si necesitas validar scheduling, colas o runs reales, usa `worker` y `beat` del compose
- No mezcles backend Docker con otro backend local salvo para debug puntual y consciente
- Si levantas una DB nueva o se pierde el volumen, ejecuta el bootstrap de datos antes de validar frontend o backoffice
- Antes de depurar un backend "caido", verifica `docker compose ps` y levanta al menos `db`, `redis`, `backend`, `worker` y `beat` si faltan

## Reglas de supervivencia en Windows

1. Usa comillas dobles en rutas con espacios
2. Prefiere `workdir` a `cd ... && ...`
3. Para Vitest desde raiz, usa siempre el workspace correcto
4. Si una QA falla por entorno, reporta el error y valida la logica con codigo/tests
5. Antes de cerrar, revisa `git status`
6. No dejes archivos temporales o logs en el repo
7. Si los cambios en `.tsx` no se reflejan, limpia `.js` generados en `src/`

## Anti-patrones del repo

No hacer:

1. Vistas basadas en funciones en backend nuevo
2. Librerias de iconos que no sean Lucide
3. Acceso directo a base de datos desde frontend
4. Hardcodear credenciales
5. Cambios breaking de API sin versionado
6. Saltarse tests
7. Dejar `.js` compilados junto a `.tsx`
8. Diseñar automatizaciones que dependan solo de procesos vivos para poder probarse
9. Permitir tareas o cron arbitrarios desde backoffice sin whitelist fuerte

## Recursos

- `docs/environment.md`
- `docs/deployment.md`
- `backend/[app]/README.md`
- `backoffice/UI_GUIDELINES.md`
- `.github/copilot-instructions.md`
