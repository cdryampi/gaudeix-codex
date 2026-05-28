# Production runbook

Production splits the stack into GitHub Pages for static frontends and Dokploy
for Django, Celery worker, and Celery beat.

## Public URLs

- Frontend: `https://cdryampi.github.io/gaudeix-codex/`
- Backoffice: `https://cdryampi.github.io/gaudeix-codex/backoffice/`
- Backend health: `https://gaudeix.yampi.eu/api/health/`
- Backend API: `https://gaudeix.yampi.eu/api/v1`

## GitHub Actions

Required Actions variable:

```env
VITE_API_BASE_URL=https://gaudeix.yampi.eu/api/v1
```

Required Actions secrets:

```env
DOKPLOY_URL=http://46.202.171.172:3000
DOKPLOY_API_KEY=<dokploy-api-key>
```

GitHub Pages must use `build_type=workflow`. The Pages workflow builds:

- `frontend` with `VITE_BASE_PATH=/gaudeix-codex/`
- `backoffice` with `VITE_BASE_PATH=/gaudeix-codex/backoffice/`

It publishes a single `.pages-dist` artifact where the backoffice is nested
under `backoffice/`.

## Dokploy

Dokploy project: `gaudeix-codex`

Compose app: `gaudeix backend`

Compose file: `docker-compose.dokploy.yml`

Domain:

```text
gaudeix.yampi.eu -> compose service backend:8000
```

The compose app uses the shared VPS services on `dokploy-network`:

- `app-postgres`
- `app-redis`

Required Dokploy env:

```env
DJANGO_SECRET_KEY=<secret>
DATABASE_URL=postgresql://gaudeix_codex_user:<url-encoded-password>@app-postgres:5432/gaudeix_codex_db
ADMIN_USER=<admin-user>
ADMIN_PASSWORD=<admin-password>
SYSTEM_USER=<system-user>
SYSTEM_PASSWORD=<system-password>
LLM_OPENROUTER_API_KEY=<openrouter-api-key>
LLM_GEMINI_API_KEY=<gemini-api-key-if-used>
```

Do not commit real secrets. Keep them in Dokploy and GitHub Actions only.

## First production bootstrap

After the first successful backend deployment:

```bash
docker exec -it <backend-container> python manage.py seed_all --noinput
```

Then verify:

```bash
curl -fsS https://gaudeix.yampi.eu/api/health/
curl -fsS https://gaudeix.yampi.eu/api/v1/categories/
curl -fsS "https://gaudeix.yampi.eu/api/v1/places/?is_published=true&limit=100"
curl -fsS "https://gaudeix.yampi.eu/api/v1/events/?is_published=true&limit=10&upcoming=true"
```

Also verify browser CORS from:

```text
https://cdryampi.github.io
```
