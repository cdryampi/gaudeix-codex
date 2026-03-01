# AGENTS_CLOUD.md - Guia Operativa para Agentes en Nube

Este documento complementa `AGENTS.md` y esta pensado para ejecucion en entornos cloud/Linux (Codex Web/Cloud, Jules, runners CI), donde no existe el contexto local de Windows.

## 1. Objetivo

Evitar bloqueos por diferencias de entorno y dar un flujo reproducible para trabajar por ticket sin levantar toda la plataforma local.

## 2. Supuestos de Entorno Cloud

- Shell Linux (`bash`), no PowerShell.
- Sin uso de `start_dev.bat` ni rutas Windows (`.venv_win\\...`).
- Puede no haber Docker disponible.
- Se prioriza validacion por modulo (backend o frontend o backoffice), no full stack salvo que el ticket lo exija.

## 3. Setup Rapido Recomendado

Desde la raiz del repo:

```bash
# Node / monorepo
pnpm install --frozen-lockfile

# Python backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt
pip install -r backend/requirements-dev.txt
```

## 4. Variables de Entorno Minimas (Cloud-Friendly)

No dependas de Postgres local para tareas de codigo/tests rapidos. Usa SQLite temporal:

```bash
cp .env_backend backend/.env
cp .env_frontend frontend/.env.local
cp .env_backoffice backoffice/.env.local
```

Luego ajusta `backend/.env`:

```env
ENVIRONMENT=local
DEBUG=True
DATABASE_URL=sqlite:////tmp/gaudeix_codex.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
DJANGO_ALLOWED_CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

Notas:

- Si el ticket usa traducciones con Groq, define `LLM_GROQ_API_KEY`.
- Si no se usa LLM local, deja `LLM_LOCAL_API_URL` vacio.
- Para tests backend, usa `ENVIRONMENT=test` al ejecutar pytest.

## 5. Flujo por Tipo de Ticket

### Backend

```bash
source .venv/bin/activate
python backend/manage.py migrate
ENVIRONMENT=test pytest backend -q
```

Validaciones minimas antes de cerrar:

```bash
source .venv/bin/activate
ruff check backend
ENVIRONMENT=test pytest backend -q
```

### Frontend Publico (`frontend/`)

```bash
pnpm --filter frontend type-check
pnpm --filter frontend test -- --run
pnpm --filter frontend build
```

### Backoffice (`backoffice/`)

```bash
pnpm --filter backoffice type-check
pnpm --filter backoffice test
pnpm --filter backoffice build
```

Muy importante en este repo:

```bash
pnpm --filter backoffice clean:js
```

No dejes `.js` compilados dentro de `backoffice/src/`, porque Vite puede priorizarlos sobre `.tsx`.

## 6. Reglas Operativas para Agentes Cloud

- Trabaja siempre por alcance de ticket (no arregles el monorepo entero si falla lint global).
- Si hay errores no relacionados, reportalos y enfoca la validacion en archivos tocados.
- No hagas cambios en `chatGPT/` salvo instruccion explicita.
- No hardcodees secretos; usa variables de entorno.
- En frontend/backoffice usa imports con alias `@/`.
- En backend nuevo codigo: ViewSets + permisos por accion (`get_permissions`).

## 7. Comandos de Test Selectivo Utiles

```bash
# Test frontend concreto
npm test --prefix frontend -- src/features/algo/mi.test.tsx

# Test backoffice concreto
npm test --prefix backoffice -- src/features/algo/mi.test.tsx

# Test backend concreto
ENVIRONMENT=test pytest backend/mi_app/tests/test_views.py -q
```

## 8. Checklist de Cierre (DoD)

Antes de entregar una tarea:

1. Codigo implementado y consistente con la arquitectura del repo.
2. Type-check y tests relevantes ejecutados.
3. Sin artefactos temporales (`*.log`, `tmp*`, `*.tmp`, outputs manuales).
4. `git status` limpio de ruido no relacionado.
5. Resumen final con:
   - archivos tocados,
   - que se valido,
   - riesgos o pendientes.

## 9. Si el Entorno Cloud Falla

Si no se puede ejecutar una parte (por ejemplo, falta servicio externo), no asumas exito:

- Reporta el error tecnico exacto.
- Valida la logica por lectura de codigo y pruebas unitarias disponibles.
- Deja claro que quedo pendiente por limitacion del entorno.
