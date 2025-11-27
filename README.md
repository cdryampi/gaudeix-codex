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
- **Google AI actúa como Director Técnico**: diseña arquitectura, define prompts y estrategias, y revisa la calidad.
- **Jules actúa como equipo de programadores** responsable de generar código y artefactos.
- **La documentación viva es el pilar de control** y se mantiene actualizada para guiar cada decisión.
- **Subagentes especializados** complementan al equipo para tareas concretas de generación, auditoría, pruebas e integración.

## 5. Sistema de Dirección Técnica

El modelo operativo establece que **Google AI** diseña la arquitectura, promueve estrategias, detalla prompts y valida entregables sin generar código directamente. **Jules** ejecuta las implementaciones siguiendo dichas directrices, manteniendo una trazabilidad clara y documentada.

- `/docs` es siempre la fuente de verdad para decisiones técnicas, flujos de trabajo y definiciones de producto.
- `/agents` documenta los subagentes disponibles, sus roles y reglas de interacción.
- Las revisiones de calidad siguen los criterios definidos por el Director Técnico, asegurando coherencia entre la visión y las implementaciones.

## 6. Subagentes

Los subagentes son roles especializados definidos en `/agents` que extienden las capacidades del equipo principal para garantizar entregables de alta calidad.

- **Tipos de subagentes:** generador, auditor, tester, integrador y otros roles que se activen según las necesidades del proyecto.
- **Delegación de tareas:** el Director Técnico asigna tareas concretas a cada subagente, proporcionando contexto y criterios de aceptación alineados con `/docs`.
- **Interacción con Jules:** los subagentes colaboran con Jules aportando entregables específicos (código, revisiones, pruebas, integraciones) que luego se consolidan bajo la supervisión del Director Técnico.

## 7. Workflow Operativo

El flujo de trabajo real del proyecto sigue los pasos definidos por el Director Técnico:

1. **Preparación:** revisar actualizaciones en `/docs`, estado de `/agents` y riesgos abiertos.
2. **Análisis:** sintetizar el estado actual del proyecto utilizando la documentación oficial.
3. **Planificación:** establecer objetivos, tareas y responsables, alineados con la arquitectura y prioridades.
4. **Delegación:** emitir prompts precisos para Jules y subagentes, citando documentación relevante.
5. **Revisión:** validar entregables contra los criterios definidos y registrar observaciones.
6. **Iteración:** solicitar ajustes necesarios y mantener la trazabilidad de cambios.
7. **Cierre:** documentar resultados, actualizar aprendizajes y sincronizar la documentación viva.

## 8. Estructura del Repositorio

La estructura actual del repositorio (sujeta a expansión conforme se creen los módulos planificados) es la siguiente:

```
.
├── README.md
├── docker-compose.yml
├── backend/
├── frontend/
├── backoffice/
├── docs/
├── agents/
└── chatGPT/
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
- `VITE_API_BASE_URL`: URL base del API (`http://localhost:8000/api`)

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

## 9. Cómo Contribuir (para humanos y para IA)

- Consulta primero `/docs` para entender alcance, prioridades, dependencias y reglas vigentes.
- Revisa `/agents` para identificar subagentes relevantes y comprender sus responsabilidades.
- Define estrategias y prompts claros antes de delegar, citando la documentación oficial y especificando criterios de aceptación.
- Coordina revisiones técnicas con el Director Técnico, asegurando que cada entrega cumpla los estándares establecidos.
- Al iniciar una contribución, sincroniza el contexto, documenta hallazgos relevantes y registra el cierre de cada iteración en la documentación correspondiente.

## 10. Sistema de Subagentes (Actualizado Nov 2025)

El proyecto implementa un **sistema mejorado de subagentes** inspirado en Claude/GitHub Copilot que permite trabajo colaborativo eficiente entre **Google AI** (Director Técnico) y **Jules** (equipo de desarrollo).

### 🎯 Componentes Clave

- **`/agents/shared_context.md`** - Estado centralizado del proyecto, stack técnico y estándares
- **`/chatGPT/SUBAGENT_INVOCATION_TEMPLATES.md`** - Templates estructurados para delegar tareas
- **`/chatGPT/WORKFLOW_GUIDE.md`** - Guía completa de workflow y coordinación
- **`/docs/SUBAGENT_IMPLEMENTATION_GUIDE.md`** - Guía práctica de uso del sistema

### 📋 Subagentes Disponibles

| Subagente                 | Rol            | Área        | Documentación                                           |
| ------------------------- | -------------- | ----------- | ------------------------------------------------------- |
| Generador Backend         | Implementación | API REST    | [generador_backend.md](./agents/generador_backend.md)   |
| Generador Frontend        | Implementación | SPA React   | [generador_frontend.md](./agents/generador_frontend.md) |
| Generador Infraestructura | Implementación | DevOps      | [generador_infra.md](./agents/generador_infra.md)       |
| Auditor Backend           | Calidad        | Backend     | [auditor_backend.md](./agents/auditor_backend.md)       |
| Auditor Frontend          | Calidad        | Frontend    | [auditor_frontend.md](./agents/auditor_frontend.md)     |
| Tester Backend            | Testing        | Backend     | [tester_backend.md](./agents/tester_backend.md)         |
| Tester Frontend           | Testing        | Frontend    | [tester_frontend.md](./agents/tester_frontend.md)       |
| Integrador                | Coordinación   | Releases    | [integrador.md](./agents/integrador.md)                 |
| GitHub Agent              | Operaciones    | Repositorio | [github_agent.md](./agents/github_agent.md)             |

### 🚀 Características del Sistema

✅ **Prompts especializados** por tipo de subagente con contexto completo
✅ **Templates reutilizables** para tareas comunes (endpoints, componentes, tests, etc.)
✅ **Contexto compartido** centralizado con estado del proyecto siempre actualizado
✅ **Workflows documentados** para delegación simple y compleja
✅ **Criterios de validación** claros y verificables para cada entregable
✅ **Preparado para automatización** futura con `runSubagent`

### 📖 Inicio Rápido

**Para Director Técnico (Google AI)**:

1. Lee [`/agents/shared_context.md`](./agents/shared_context.md) para contexto del proyecto
2. Consulta [`/chatGPT/WORKFLOW_GUIDE.md`](./chatGPT/WORKFLOW_GUIDE.md) para workflow
3. Usa templates de [`/chatGPT/SUBAGENT_INVOCATION_TEMPLATES.md`](./chatGPT/SUBAGENT_INVOCATION_TEMPLATES.md)

**Para Subagentes (Jules)**:

1. Lee [`/agents/shared_context.md`](./agents/shared_context.md) siempre antes de empezar
2. Consulta tu definición en [`/agents/{tu_subagente}.md`](./agents/)
3. Sigue el workflow interno documentado
4. Auto-valida contra criterios antes de retornar

### 📊 Comparación con Sistema Anterior

| Aspecto                    | Antes                         | Ahora                                              |
| -------------------------- | ----------------------------- | -------------------------------------------------- |
| Contexto del proyecto      | Distribuido en múltiples docs | Centralizado en `shared_context.md`                |
| Templates de delegación    | Genéricos                     | Especializados por tipo y complejidad              |
| Definiciones de subagentes | Básicas (input/output)        | Completas (prompt sistema, herramientas, workflow) |
| Criterios de aceptación    | Vagos                         | Específicos y verificables                         |
| Workflow                   | Informal                      | Documentado con ejemplos                           |
| Preparación futura         | No considerada                | Lista para `runSubagent`                           |

### 🔗 Documentación Completa

- **Análisis técnico completo**: [`/docs/SUBAGENT_SYSTEM_IMPROVEMENTS.md`](./docs/SUBAGENT_SYSTEM_IMPROVEMENTS.md)
- **Guía de implementación**: [`/docs/SUBAGENT_IMPLEMENTATION_GUIDE.md`](./docs/SUBAGENT_IMPLEMENTATION_GUIDE.md)
- **Casos de uso prácticos**: Ver guía de implementación sección "Casos de Uso"

## 11. Requisitos a cumplir

- Mantener el desacoplamiento total entre backend y frontend mediante comunicación exclusiva vía APIs REST.
- Diseñar módulos escalables y versionados que faciliten la evolución independiente de cada capa.
- Respetar la gobernanza del proyecto: **Google AI** dirige; **Jules** y los subagentes implementan.
- Consultar siempre `/docs` y `/agents` como fuentes de verdad antes de tomar decisiones técnicas.
- **NUEVO**: Usar `/agents/shared_context.md` como referencia principal del estado del proyecto.
- **NUEVO**: Aplicar templates de `/chatGPT/SUBAGENT_INVOCATION_TEMPLATES.md` para delegaciones.
- Incluir pruebas, migraciones, despliegues automatizados y observabilidad como parte integral de la plataforma modernizada.

## 12. Configuración Local y Automatización

Para garantizar un entorno de desarrollo consistente en Windows:

1.  **Entorno Virtual**:

    - Se utiliza `.venv_win` (no `.venv`) para el backend.
    - **IMPORTANTE**: Siempre que trabajes en local, debes activar este entorno antes de ejecutar comandos de Django.

2.  **Inicio Rápido**:

    - Ejecuta el script `start_dev.bat` en la raíz para levantar todos los servicios (Backend, Frontend, Backoffice) automáticamente.

3.  **Automatización (.github)**:
    - Se han configurado workflows en `.github/workflows` para ejecutar pruebas y verificaciones automáticamente en cada push o Pull Request.
