# Backlog inicial de migración (heredado de proceso de publicación del proyecto origen)

Este backlog replica el proceso de publicación usado en el repositorio de referencia y lo adapta al stack unificado (backend, frontend y backoffice en un mismo `docker-compose` con subdominios y despliegue en Dokploy). Cada ítem está listo para crearse como issue en GitHub, con labels sugeridas y criterios de aceptación.

## Cómo usar este backlog

1. Verifica que las labels existan (usa la guía de [`docs/GITHUB_LABELS.md`](./GITHUB_LABELS.md) para crearlas si faltan).
2. Crea cada issue con el título y el cuerpo indicados; aplica las labels sugeridas.
3. Ajusta tamaños (`size/*`) y estados (`status/*`) según el contexto real.

## Issues propuestos

### 1) Compose unificado con subdominios

- **Título**: "Infra: Compose unificado backend/frontend/backoffice con subdominios"
- **Labels sugeridas**: `type/feature`, `area/infra`, `priority/P1-high`, `size/M`, `status/ready`
- **Cuerpo sugerido**:
  - **Objetivo**: Definir un `docker-compose` único que ejecute backend, frontend y backoffice con sus subdominios (ej. `api.example.com`, `app.example.com`, `admin.example.com`) y certificados listos para Dokploy.
  - **Tareas**:
    - Contenerización de backend con variables JWT, base de datos y media persistente.
    - Contenerización de frontend y backoffice apuntando al backend por subdominio y con CORS alineado.
    - Definir volúmenes, redes y healthchecks.
  - **Criterios de aceptación**:
    - Compose validado localmente (arranca los tres servicios).
    - Subdominios documentados en `/docs` y variables mapeadas.
    - Servicios listos para Dokploy (puertos, certificados y dependencia entre servicios).

### 2) Variables de entorno extendidas (incluyendo backoffice)

- **Título**: "Docs: Variables de entorno para backend/frontend/backoffice con subdominios"
- **Labels sugeridas**: `type/docs`, `area/docs`, `priority/P1-high`, `size/S`, `status/ready`
- **Cuerpo sugerido**:
  - **Objetivo**: Completar la guía de `.env` para los tres servicios, incluyendo URLs por subdominio y ajustes de CORS.
  - **Tareas**:
    - Añadir secciones específicas de backoffice (JWT, API base, orígenes permitidos).
    - Ejemplos de valores para dev/staging/prod usando los subdominios del compose.
    - Sincronización de secrets para GitHub Actions y Dokploy.
  - **Criterios de aceptación**:
    - Documento `/docs/environment.md` actualizado con tablas de variables y ejemplos.
    - Referencia cruzada desde README y/o notas de despliegue.

### 3) Pipeline de publicación en Dokploy

- **Título**: "Infra: Pipeline de despliegue en Dokploy para stack unificado"
- **Labels sugeridas**: `type/feature`, `area/infra`, `priority/P1-high`, `size/M`, `status/ready`
- **Cuerpo sugerido**:
  - **Objetivo**: Replicar el proceso de publicación del proyecto origen en Dokploy usando el compose unificado.
  - **Tareas**:
    - Definir secretos y variables necesarios en Dokploy (JWT, DB, hosts, certificados).
    - Configurar pasos de build/pull y arranque de servicios, incluyendo healthchecks.
    - Documentar rollback y validaciones post-deploy.
  - **Criterios de aceptación**:
    - Documentación de pipeline en `/docs` con comandos y orden de ejecución.
    - Checklist de verificación tras el despliegue (endpoints y front/backoffice accesibles por subdominio).

### 4) CI básica para el stack

- **Título**: "DevOps: CI mínima para backend, frontend y backoffice"
- **Labels sugeridas**: `type/chore`, `area/devops`, `priority/P2-medium`, `size/M`, `status/ready`
- **Cuerpo sugerido**:
  - **Objetivo**: Configurar workflows que ejecuten lint/tests para las tres apps y builden imágenes cuando proceda.
  - **Tareas**:
    - Pipeline de backend (lint, tests, migrations check, build opcional).
    - Pipeline de frontend y backoffice (lint/build) con variables de API base por entorno.
    - Publicación de artefactos o imágenes en el registro usado por Dokploy.
  - **Criterios de aceptación**:
    - Workflows en `.github/workflows` validados en CI.
    - Matriz de estados visible en PRs.

### 5) Auditoría de CORS y subdominios

- **Título**: "Backend: Auditoría de CORS/JWT para subdominios del stack"
- **Labels sugeridas**: `type/spike`, `area/backend`, `priority/P1-high`, `size/S`, `status/ready`
- **Cuerpo sugerido**:
  - **Objetivo**: Validar requisitos de CORS, JWT y seguridad para servir a frontend y backoffice desde subdominios separados.
  - **Tareas**:
    - Revisar configuración de CORS/CSRF en backend.
    - Proponer ajustes de claims/expiraciones JWT si aplica a backoffice.
    - Documentar riesgos y plan de mitigación.
  - **Criterios de aceptación**:
    - Informe breve adjunto al issue con recomendaciones aplicables al compose.
