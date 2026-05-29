# gaudeix-jules

## 1. Resumen del Proyecto

Este repositorio impulsa la reconstrucción completa, moderna y modular de un sistema legado originalmente desarrollado como un monolito Django. El objetivo es evolucionarlo hacia una plataforma totalmente desacoplada donde cada capa (backend, frontend, backoffice e infraestructura) se diseñe desde cero para alinearse con la visión arquitectónica actualizada.

- **Backend moderno con Django REST Framework, JWT, PostgreSQL y módulos desacoplados.**
- **Frontend SPA con React + Vite integrado vía API REST.**
- **Backoffice con React Admin o solución equivalente.**
- **Infraestructura con Docker, despliegues automatizados en Dokploy y CI/CD con GitHub Actions.**

## 2. Objetivo General del Proyecto

Reconstruir el sistema desde cero siguiendo una arquitectura desacoplada, escalable, versionada y basada en REST, garantizando la migración de datos desde el sistema antiguo hacia la nueva plataforma modular.

## 3. Arquitectura

La arquitectura definida maximiza el desacoplamiento y la escalabilidad, permitiendo que cada módulo evolucione de forma independiente sin comprometer la cohesión global.

### Backend

- API REST con Django y Django REST Framework.
- Autenticación JWT, endpoints versionados y documentados.
- PostgreSQL como base de datos, gestión de media persistente y pruebas unitarias e integraciones automatizadas.
- Módulos clave: Usuarios & Autenticación, Blog/Noticias, Agenda/Eventos, Lugares, Media Manager, Configuración general y Traducciones.

### Frontend

- SPA desacoplada con React + Vite, routing avanzado y soporte multilenguaje.
- Consumo directo de la API REST con manejo robusto de estados y caching.
- Módulos clave: Home, Noticias, Detalle de noticia, Agenda, Detalle de evento, Mapa/Lugares, About, Selector de idioma y Layout (Header/Footer).

#### Frontend (sitio público) - contexto rápido

- Ruta: `frontend/`
- Stack: React 18 + Vite + TypeScript + Tailwind CSS (v4) + Flowbite/Flowbite React
- Puerto dev: `http://localhost:5173`
- Alias imports: `@/` -> `frontend/src`
- Config API: `VITE_API_BASE_URL` (si apuntas a `http://localhost:8000/api` se normaliza automáticamente a `/api/v1`; fallback por defecto: `http://localhost:8000/api/v1`)

Comandos:

```bash
cd frontend
npm install
npm run dev
```

### Backoffice

- Panel administrativo en React Admin u otra solución React equivalente, autenticado mediante JWT contra la misma API.
- Módulos clave: Autenticación administrativa, Posts, Eventos, Lugares, Usuarios, Configuración, Media y Auditoría básica.

### Infraestructura

- Contenedores Docker y orquestación con Docker Compose.
- Despliegues automatizados en Dokploy y pipelines CI/CD en GitHub Actions.
- Observabilidad mínima con logs centralizados y métricas básicas.

Esta arquitectura fue elegida para facilitar la escalabilidad horizontal, acelerar la entrega continua, permitir reemplazos tecnológicos por capas y reducir dependencias entre equipos, asegurando una plataforma resiliente y preparada para iteraciones rápidas.

## 4. Filosofía de Desarrollo

- **Desacoplamiento total entre backend y frontend**: la interacción ocurre exclusivamente mediante APIs REST.
- **La documentación viva es el pilar de control** y se mantiene actualizada para guiar cada decisión.
- **`/docs` es la fuente de verdad** para decisiones técnicas, flujos de trabajo y definiciones de producto.
- **Las instrucciones activas para agentes** viven en `AGENTS.md`, `AGENTS_CLOUD.md` y `.agents/skills/modern-web-guidance/SKILL.md`.

## 5. Estructura del Repositorio

La estructura actual del repositorio (sujeta a expansión conforme se creen los módulos planificados) es la siguiente:

```
.
├── README.md
├── docker-compose.yml
├── backend/
├── frontend/
├── backoffice/
├── mobile/
├── docs/
└── .agents/
```

El `docker-compose.yml` orquesta backend, frontend, backoffice, PostgreSQL y almacenamiento de objetos para desarrollo y pruebas locales. Revisa `docs/deployment.md` para detalles de ejecución y configuración.

## Variables de Entorno

El proyecto utiliza archivos `.env` separados para cada módulo, facilitando la configuración y el despliegue independiente.

### 📁 Archivos `.env` en Raíz del Proyecto

Para facilitar la configuración inicial, se han creado archivos `.env` centralizados en la raíz:

- **`.env_backend`**: Variables de Django, PostgreSQL y usuarios seed
- **`.env_backoffice`**: Variables de Vite para el panel administrativo
- **`.env_frontend`**: Variables de Vite para el sitio público

### 🔧 Configuración por Módulo

#### Backend (Django)

```bash
# Copiar desde raíz o usar directamente
cp .env_backend backend/.env
# O usar el existente: backend/.env
```

**Variables principales:**

- `DATABASE_URL`: Conexión PostgreSQL
- `DJANGO_SECRET_KEY`: Clave secreta de Django
- `ADMIN_USER` / `ADMIN_PASSWORD`: Credenciales del superusuario (yampi/thos)
- `SYSTEM_USER` / `SYSTEM_PASSWORD`: Credenciales del usuario sistema (gaudeix/gaudeix@2023)

#### Backoffice (React Admin)

```bash
# Copiar desde raíz o usar directamente
cp .env_backoffice backoffice/.env.local
# O usar el existente: backoffice/.env.local
```

**Variables principales:**

- `VITE_API_BASE_URL`: URL base del API (`http://localhost:8000/api/v1`)
- `VITE_ADMIN_USER` / `VITE_ADMIN_PASSWORD`: Credenciales de test

#### Frontend (React Public)

```bash
# Copiar desde raíz o usar directamente
cp .env_frontend frontend/.env.local
# O usar el existente: frontend/.env.local
```

**Variables principales:**

- `VITE_API_BASE_URL`: URL base del API (`http://localhost:8000/api/v1` o `http://localhost:8000/api`)

Más detalle: `frontend/README.md`

### 🗄️ Base de Datos Local

```bash
Host: localhost
Port: 5432
Database: migration
User: postgres
Password: thos
```

### 👤 Usuarios Seed

El comando `python manage.py seed_users` creará automáticamente:

- **Admin (Superusuario)**:
  - Username: `yampi`
  - Password: `thos`
  - Permisos: Staff + Superuser

- **System (Usuario normal)**:
  - Username: `gaudeix`
  - Password: `gaudeix@2023`
  - Permisos: Usuario estándar

### 📚 Documentación Detallada

Consulta la [guía de variables de entorno](docs/environment.md) para conocer los archivos `.env` requeridos, los valores obligatorios/opcionales por módulo y las recomendaciones de sincronización con GitHub Actions y Dokploy.

## Backlog de migración y labels

- Los issues listos para migrar el proceso de publicación están descritos en [`docs/migration_issues.md`](docs/migration_issues.md), con títulos, cuerpos y combinaciones de labels sugeridas.
- Crea o sincroniza las labels del repositorio con la guía de [`docs/GITHUB_LABELS.md`](docs/GITHUB_LABELS.md) antes de registrar los issues.

## 6. Cómo Contribuir (para humanos y para IA)

### Checklist mínima de validación pre-merge

Antes de solicitar un merge, ejecuta estos comandos en la raíz del repositorio según el stack modificado para evitar regresiones:

- **Frontend** (type-check + tests):
  ```bash
  pnpm --filter frontend type-check && pnpm --filter frontend test -- --run
  ```
- **Backoffice** (type-check + tests + clean:js):
  ```bash
  pnpm --filter backoffice type-check && pnpm --filter backoffice test && pnpm --filter backoffice clean:js
  ```
- **Backend** (tests + lint/format):

  ```bash
  cd backend && python3 -m pytest && ruff check . && ruff format --check .
  ```

- Consulta primero `/docs` y `AGENTS.md` para entender alcance, prioridades, dependencias y reglas vigentes.
- Usa la ruta Docker-first documentada en `AGENTS.md` cuando el ticket dependa de backend, datos, colas, automatizaciones o media.
- Ejecuta la validación adecuada al stack modificado antes de solicitar merge.
- Al iniciar una contribución, sincroniza el contexto, documenta hallazgos relevantes y registra el cierre cuando cambie documentación operativa.

## 7. Requisitos a cumplir

- Mantener el desacoplamiento total entre backend y frontend mediante comunicación exclusiva vía APIs REST.
- Diseñar módulos escalables y versionados que faciliten la evolución independiente de cada capa.
- Consultar siempre `/docs`, `AGENTS.md` y `AGENTS_CLOUD.md` como fuentes de verdad antes de tomar decisiones técnicas.
- Incluir pruebas, migraciones, despliegues automatizados y observabilidad como parte integral de la plataforma modernizada.

## 8. Configuración Local y Automatización

Para garantizar un entorno de desarrollo consistente en Windows:

1.  **Entorno Virtual**:
    - Se utiliza `.venv_win` (no `.venv`) para el backend.
    - **IMPORTANTE**: Siempre que trabajes en local, debes activar este entorno antes de ejecutar comandos de Django.

2.  **Inicio Rápido**:
    - Inicia primero Docker Desktop en Windows.
    - Desde la raíz del repo, ejecuta `docker compose up --build -d`.
    - Si la base está vacía o has recreado volúmenes, ejecuta además:

      ```bash
      docker compose exec -T backend python manage.py migrate
      docker compose exec -T backend python manage.py seed_all --noinput
      ```

    - Si usas VS Code, la tarea recomendada es `Docker: Bootstrap Canonical Local`.

3.  **Automatización (.github)**:
    - Se han configurado workflows en `.github/workflows` para ejecutar pruebas y verificaciones automáticamente en cada push o Pull Request.
