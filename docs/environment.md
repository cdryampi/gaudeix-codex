# Guia de variables de entorno

Esta guia centraliza las variables de entorno del proyecto y deja clara una regla importante:

- **desarrollo local canonico**: backend e infraestructura por `docker compose`
- **tests backend**: `config.settings.test`
- **no usar `ENVIRONMENT=local` como flujo recomendado**

## Convenciones generales

- Cada modulo mantiene su configuracion:
  - `backend/.env`
  - `frontend/.env.local`
  - `backoffice/.env.local`
- Los `.env` no deben versionarse
- Si una variable cambia y la usa CI o despliegue, sincronizala con los secrets correspondientes

## Backend (Django)

Variables importantes:

| Variable                      | Obligatoria             | Descripcion                  |
| ----------------------------- | ----------------------- | ---------------------------- |
| `DJANGO_SECRET_KEY`           | Si                      | Clave secreta de Django      |
| `DATABASE_URL`                | Si en Docker/despliegue | Conexion a PostgreSQL        |
| `DB_ENGINE`                   | Opcional                | Backend de BD                |
| `DB_NAME`                     | Opcional                | Nombre de BD                 |
| `DB_USER`                     | Opcional                | Usuario de BD                |
| `DB_PASSWORD`                 | Opcional                | Password de BD               |
| `DB_HOST`                     | Opcional                | Host de BD                   |
| `DB_PORT`                     | Opcional                | Puerto de BD                 |
| `ALLOWED_HOSTS`               | Si                      | Hosts permitidos             |
| `DEBUG`                       | Si                      | Modo debug                   |
| `DJANGO_ALLOWED_CORS_ORIGINS` | Opcional                | Origenes CORS                |
| `REDIS_URL`                   | Opcional                | Conexion Redis               |
| `CELERY_BROKER_URL`           | Opcional                | Broker Celery                |
| `CELERY_RESULT_BACKEND`       | Opcional                | Backend de resultados Celery |

## Frontend y backoffice

Todas las variables publicas deben empezar por `VITE_`.

| Variable            | Obligatoria | Descripcion          |
| ------------------- | ----------- | -------------------- |
| `VITE_API_BASE_URL` | Si          | URL base del backend |

## Mobile

| Variable                   | Obligatoria | Descripcion          |
| -------------------------- | ----------- | -------------------- |
| `EXPO_PUBLIC_API_BASE_URL` | Si          | URL base del backend |

## Perfiles recomendados

### Docker local

Es la opcion canonica para desarrollo y QA local.

Backend:

```env
ENVIRONMENT=production
DATABASE_URL=postgresql://postgres:thos@db:5432/migration
DB_ENGINE=django.db.backends.postgresql
DB_NAME=migration
DB_USER=postgres
DB_PASSWORD=thos
DB_HOST=db
DB_PORT=5432
ALLOWED_HOSTS=backend,localhost,127.0.0.1
DEBUG=true
DJANGO_ALLOWED_CORS_ORIGINS=http://localhost:4173,http://localhost:4174,http://localhost:5173,http://localhost:5174,http://127.0.0.1:4173,http://127.0.0.1:4174,http://127.0.0.1:5173,http://127.0.0.1:5174
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/1
```

Frontend / backoffice:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Tests backend

No hace falta `.env` especial. Usa:

```bash
cd backend
python manage.py check --settings=config.settings.test
pytest
```

`config.settings.test` ya configura SQLite en memoria y Celery eager.

### Staging / produccion

- Backend con `DATABASE_URL` a PostgreSQL gestionado
- `DEBUG=false`
- `ALLOWED_HOSTS` con dominios publicos
- `DJANGO_ALLOWED_CORS_ORIGINS` con frontend/backoffice desplegados
- Frontend y backoffice con `VITE_API_BASE_URL` apuntando al backend publico

## Reglas para agentes

- No documentes ni recomiendes `ENVIRONMENT=local`
- No montes un backend "rapido" fuera de Docker como flujo normal
- Si el ticket requiere backend local sin Docker, dejalo explicitamente justificado y separado del flujo canonico

## Sincronizacion con GitHub Actions

1. Mantener los secrets necesarios para despliegues o jobs especiales
2. Para tests backend de CI, preferir `config.settings.test` en vez de secretos de entorno local
3. Para frontend/backoffice, solo exponer las variables `VITE_*` necesarias al build si el workflow lo requiere
