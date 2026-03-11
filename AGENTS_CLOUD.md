# AGENTS_CLOUD.md - Guia operativa para nube

Este documento complementa `AGENTS.md` para Codex Cloud, Jules y runners Linux.

## Objetivo

Evitar que un agente replique el entorno local de forma incorrecta. En cloud se prioriza:

- validacion por modulo
- tests reproducibles
- backend en modo de test, no un entorno SQLite "local" paralelo

## Reglas de entorno

- Shell Linux (`bash`)
- Sin `start_dev.bat`
- Sin rutas Windows
- Puede no haber Docker disponible
- Si Docker no esta disponible, no inventes un flujo alternativo con `ENVIRONMENT=local`

## Setup recomendado

```bash
pnpm install --frozen-lockfile

python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt
pip install -r backend/requirements-dev.txt
```

## Backend en cloud

### Para tests

Usa siempre el perfil de test del backend:

```bash
source .venv/bin/activate
cd backend
python manage.py check --settings=config.settings.test
pytest -q
```

`config.settings.test` ya usa SQLite en memoria y Celery eager. Ese es el camino correcto para CI y para agentes cloud.

### Para codigo backend

- No recomiendes `ENVIRONMENT=local`
- No montes un `.env` con SQLite ad hoc salvo que el ticket lo exija de forma explicita
- Si necesitas documentar variables, apunta al flujo Docker local o al perfil de test

## Frontend publico

```bash
pnpm --filter frontend type-check
pnpm --filter frontend test -- --run
pnpm --filter frontend build
```

## Backoffice

```bash
pnpm --filter backoffice type-check
pnpm --filter backoffice test -- --run
pnpm --filter backoffice build
```

Muy importante:

```bash
pnpm --filter backoffice clean:js
```

No dejes `.js` compilados dentro de `backoffice/src/`.

## Reglas operativas

- Trabaja por alcance del ticket
- Si falla algo no relacionado, reportalo y no intentes arreglar medio monorepo
- En backend nuevo codigo: ViewSets + permisos por accion
- En frontend/backoffice: alias `@/`
- No hardcodees secretos

## Tests selectivos utiles

```bash
pnpm --filter frontend exec vitest run src/features/algo/mi.test.tsx
pnpm --filter backoffice exec vitest run src/features/algo/mi.test.tsx
cd backend && pytest mi_app/tests/test_views.py -q
```

## Checklist de cierre

1. Implementacion coherente con la arquitectura del repo
2. Tests y type-check relevantes ejecutados
3. Sin artefactos temporales
4. `git status` sin ruido
5. Resumen final con validaciones y riesgos

## Si el entorno cloud falla

- Reporta el error tecnico exacto
- Valida la logica por lectura de codigo y tests unitarios
- No asumas exito si no pudiste ejecutar una parte importante
