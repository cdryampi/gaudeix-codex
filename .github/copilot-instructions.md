# GitHub Copilot Instructions - Gaudeix Codex

## Project Overview

Gaudeix Codex is a modern, decoupled CMS for a municipal content platform, migrating from a Django monolith to a microservices architecture with:

- **Backend**: Django REST Framework API with JWT auth (`backend/`, port 8000)
- **Frontend**: React + Vite SPA for public site (`frontend/`, port 5173)
- **Backoffice**: React 18 + Vite + TypeScript + Tailwind + shadcn/ui admin panel (`backoffice/`, port 5174)
- **Infrastructure**: Docker Compose with PostgreSQL and MinIO for object storage, deployed via Dokploy

**Key Design Principle**: Complete decoupling - frontend/backoffice communicate with backend exclusively via REST API. No shared templates or direct DB access.

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

**VS Code Tasks** (auto-start on workspace open via `.vscode/tasks.json`):
- All services start automatically when opening workspace
- Task IDs: `shell: Start Backend (Django)`, `shell: Start Frontend (Vite)`, `shell: Start Backoffice (Vite)`
- Backend uses `.venv_win\Scripts\python.exe` (Windows-specific virtual environment)
- Access: Backend (http://localhost:8000), Frontend (http://localhost:5173), Backoffice (http://localhost:5174)

**Manual start**:
```bash
# From project root
start_dev.bat  # Windows batch file to start all services

# Or individually
cd backend && .venv_win\Scripts\activate && python manage.py runserver 0.0.0.0:8000
cd frontend && npm run dev
cd backoffice && npm run dev
```

**Docker Compose**:
```bash
docker-compose up --build
# Access: backend (8000), frontend (4173), backoffice (4174), MinIO console (9001)
```

### Backend Development

```bash
cd backend
# Activate venv: .venv_win\Scripts\activate (Windows)
python manage.py migrate                    # Run migrations
python manage.py createsuperuser            # Admin user
python manage.py seed_users                 # Seed admin/system users from env vars
python manage.py seed_media_files           # Example seed command for media_files app
pytest                                      # Run tests (uses SQLite in-memory)
ENVIRONMENT=local python manage.py test     # Django test runner
```

**Environment profiles**: Set `ENVIRONMENT=local` (SQLite), `test` (in-memory), or `production` (PostgreSQL via `DATABASE_URL` or `DB_*` vars). See `backend/config/settings/`.

**Default seed users** (from `seed_users` command):
- Admin: Ver variables de entorno `ADMIN_USER` / `ADMIN_PASSWORD`
- System: Ver variables de entorno `SYSTEM_USER` / `SYSTEM_PASSWORD`
- Otros usuarios: Consultar con el equipo o verificar en `.env` local

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

- **ViewSets over APIViews**: Use `ModelViewSet` or `GenericViewSet` with mixins, registered in routers. Example: `users/views.py` uses `UserViewSet` with `get_serializer_class()` and `get_permissions()` methods
- **Permissions**: Action-based via `get_permissions()`. Example: `users/views.py` - `AllowAny` for registration, `IsAuthenticated` + `IsOwnerOrAdmin` for updates/deletes
- **Serializers**: Separate serializers for create/update/detail (e.g., `UserRegistrationSerializer`, `UserDetailSerializer`, `UserUpdateSerializer`)
- **Custom permissions**: See `users/permissions.py` for `IsOwnerOrAdmin`, `IsOwner` patterns
- **JWT Authentication**: `djangorestframework-simplejwt` configured, tokens in Authorization headers. Auth endpoints: `/api/v1/auth/login/`, `/api/v1/auth/logout/`, `/api/v1/auth/token/refresh/`, `/api/v1/auth/token/verify/`
- **API versioning**: All endpoints prefixed with `/api/v1/`
- **Health check**: Public endpoint at `GET /api/health/` for backend status verification

### Frontend/Backoffice Patterns

- **Path aliases**: Use `@/` imports (configured in `tsconfig.json`). Example: `import { Button } from "@/components/ui/button"`
- **Feature-based structure**: Organize by feature in `src/features/[feature-name]/` with `pages/`, `components/`, `api/` subdirectories
- **Icons**: **Only use Lucide React** (`lucide-react`), not FontAwesome/Heroicons. See `backoffice/UI_GUIDELINES.md`
- **Animations**: Use `tailwindcss-animate` for simple animations, Framer Motion for complex ones
- **UI Components**: shadcn/ui components in `src/components/ui/`. Add via `npx shadcn@latest add [component-name]`
- **Routing**: Protected routes wrap with auth providers. Example: `backoffice/src/app/routes/`

### Media Files Handling

Media uploads are handled by `media_files` app with:

- Automatic image variant generation (thumbnail/medium/large) via `utils.py` - variants defined: thumbnail (150px), medium (600px), large (1200px)
- UUID-based filenames to prevent collisions
- Automatic cleanup on delete via signals (`signals.py`)
- File size validation: Max 10MB (configurable via `MAX_FILE_SIZE_MB` in `media_files/utils.py`)
- Allowed extensions: Images (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`), Documents (`.pdf`, `.ics`, `.txt`, `.docx`, `.xlsx`)
- REST API endpoints for upload/CRUD

Example: `POST /api/v1/media/images/` with multipart/form-data, returns all variants. Storage: MinIO (Docker) or local filesystem (development).

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
- **LLM Translations**: Backend includes `llm_translations` app supporting OpenAI, Google Gemini, Anthropic, Mistral, Groq. API keys configured via env vars (`LLM_OPENAI_API_KEY`, etc.)

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
