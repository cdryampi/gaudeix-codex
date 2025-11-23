# GitHub Copilot Instructions - Gaudeix Codex

## Project Overview

Gaudeix Codex is a modern, decoupled content management system migrating from a Django monolith to a microservices architecture with:

- **Backend**: Django REST Framework API with JWT auth (`backend/`, port 8000)
- **Frontend**: React + Vite SPA for public site (`frontend/`, port 5173)
- **Backoffice**: React + Tailwind + shadcn/ui admin panel (`backoffice/`, port 5174)
- **Infrastructure**: Docker Compose with PostgreSQL and MinIO, deployed via Dokploy

## Architecture Principles

### Decoupled Architecture

All communication between frontend/backoffice and backend happens **exclusively via REST API**. No shared templates or direct DB access from frontends. Backend serves JSON, frontends are static builds.

### Subdomain Strategy

Production uses subdomains: `api.*` (backend), `www.*` (frontend), `admin.*` (backoffice). CORS is configured accordingly in `backend/config/settings/base.py` via `DJANGO_ALLOWED_CORS_ORIGINS`.

### Django Apps Structure

Backend follows modular Django apps (`users`, `social`, `media_files`, etc.). Each app contains:

- `models.py` - Django ORM models
- `serializers.py` - DRF serializers with validation
- `views.py` - ViewSets (not function-based views)
- `urls.py` - Router registration
- `tests.py` or `tests/` - Pytest suite
- `README.md` - App-specific documentation

## Development Workflows

### Starting Services

Run all services simultaneously using VS Code tasks (auto-start on workspace open):

- Backend: `.venv_win\Scripts\activate; python manage.py runserver`
- Frontend: `npm run dev` in `frontend/`
- Backoffice: `npm run dev` in `backoffice/`

Or use Docker Compose: `docker-compose up --build`

### Backend Development

```bash
cd backend
# Activate venv: .venv_win\Scripts\activate (Windows)
python manage.py migrate                    # Run migrations
python manage.py createsuperuser            # Admin user
python manage.py seed_media_files           # Example seed command
pytest                                      # Run tests (uses SQLite in-memory)
ENVIRONMENT=local python manage.py test     # Django test runner
```

**Environment profiles**: Set `ENVIRONMENT=local` (SQLite), `test` (in-memory), or `production` (PostgreSQL via `DATABASE_URL` or `DB_*` vars). See `backend/config/settings/`.

### Frontend/Backoffice Development

```bash
npm install
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
npm test         # Vitest tests
```

Environment variables **must** start with `VITE_` prefix (e.g., `VITE_API_BASE_URL`). Copy `.env.local.example` to `.env.local` and adjust.

### Testing Standards

- **Backend**: Use pytest, minimum 80% coverage. Test file pattern: `test_*.py` or `tests.py`. Use `APITestCase` for API tests, fixtures in `conftest.py`.
- **Frontend/Backoffice**: Vitest + React Testing Library. Suffix: `.test.ts` or `.test.tsx`.

## Project-Specific Conventions

### Backend API Patterns

- **ViewSets over APIViews**: Use `ModelViewSet` or `GenericViewSet` with mixins, registered in routers
- **Permissions**: Action-based via `get_permissions()`. Example: `users/views.py` - `AllowAny` for registration, `IsAuthenticated() + IsOwnerOrAdmin()` for updates
- **Serializers**: Separate serializers for create/update/detail (e.g., `UserRegistrationSerializer`, `UserDetailSerializer`, `UserUpdateSerializer`)
- **Custom permissions**: See `users/permissions.py` for `IsOwnerOrAdmin`, `IsOwner` patterns
- **JWT Authentication**: `djangorestframework-simplejwt` configured, tokens in Authorization headers

### Frontend/Backoffice Patterns

- **Path aliases**: Use `@/` imports (configured in `tsconfig.json`). Example: `import { Button } from "@/components/ui/button"`
- **Feature-based structure**: Organize by feature in `src/features/[feature-name]/` with `pages/`, `components/`, `api/` subdirectories
- **Icons**: **Only use Lucide React** (`lucide-react`), not FontAwesome/Heroicons. See `backoffice/UI_GUIDELINES.md`
- **Animations**: Use `tailwindcss-animate` for simple animations, Framer Motion for complex ones
- **UI Components**: shadcn/ui components in `src/components/ui/`. Add via `npx shadcn@latest add [component-name]`
- **Routing**: Protected routes wrap with auth providers. Example: `backoffice/src/app/routes/`

### Media Files Handling

Media uploads are handled by `media_files` app with:

- Automatic image variant generation (thumbnail/medium/large) via `utils.py`
- UUID-based filenames to prevent collisions
- Automatic cleanup on delete via signals (`signals.py`)
- REST API endpoints for upload/CRUD

Example: `POST /api/v1/media/images/` with multipart/form-data, returns all variants.

### Database & Migrations

- **Local dev**: PostgreSQL via Docker (`db` service) or SQLite (set `ENVIRONMENT=local`)
- **Migrations**: Always review generated migrations before committing. Use `python manage.py makemigrations --name descriptive_name`
- **Translatable fields**: Use `django-parler` for i18n models (see `social` app)

## Critical References

- **Environment variables**: `/docs/environment.md` - Complete reference for all env vars across modules
- **Deployment**: `/docs/deployment.md` - Docker Compose setup, Dokploy integration
- **Module documentation**: Each app has a `README.md` with API examples, usage patterns
- **Git workflow**: Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`), PRs required for `main`
- **Tasks**: `.vscode/tasks.json` defines auto-start tasks for all services

## Common Operations

**Add a new Django app**:

1. `python manage.py startapp app_name`
2. Add to `INSTALLED_APPS` in `config/settings/base.py`
3. Create `serializers.py`, update `views.py` to use ViewSets
4. Register routes in `urls.py` using DRF router
5. Add tests in `tests.py` or `tests/` directory
6. Document in app-level `README.md`

**Add a new frontend feature**:

1. Create `src/features/[feature-name]/` with `pages/`, `components/`, `api/`
2. Register routes in `src/app/routes/index.tsx`
3. Add navigation in `src/layouts/dashboard/Sidebar.tsx` (backoffice)
4. Use `@/` imports for all internal modules
5. Add Vitest tests in same directory with `.test.tsx` suffix

**Run Docker stack**:

```bash
docker-compose up --build  # All services
# Access: backend (8000), frontend (4173), backoffice (4174), MinIO console (9001)
```

## Anti-Patterns to Avoid

- ❌ Hardcoding secrets in code (use env vars, see `docs/environment.md`)
- ❌ Function-based views in new backend code (use ViewSets)
- ❌ Installing icon libraries other than Lucide React
- ❌ Breaking API changes without versioning and documentation
- ❌ Skipping tests or linting (backend: ruff/black, frontend: ESLint)
- ❌ Direct database access from frontend (always use REST API)
- ❌ Modifying `/chatGPT/` directory without explicit instruction
