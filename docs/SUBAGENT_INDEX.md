# 📚 Índice Maestro - Sistema de Subagentes 2.0

> **Propósito**: Navegación rápida a toda la documentación del sistema mejorado de subagentes

## 🎯 Inicio Rápido

### ¿Primera vez aquí?

1. **Lee primero**: [`QUICK_START_SUBAGENTS.md`](./QUICK_START_SUBAGENTS.md) (5-10 min)
2. **Luego**: [`/agents/shared_context.md`](../agents/shared_context.md) (15-20 min)
3. **Practica**: Delega una tarea simple usando templates

### ¿Ya usas el sistema?

- **Contexto del proyecto**: [`/agents/shared_context.md`](../agents/shared_context.md)
- **Templates**: [`/chatGPT/SUBAGENT_INVOCATION_TEMPLATES.md`](../chatGPT/SUBAGENT_INVOCATION_TEMPLATES.md)
- **Troubleshooting**: [`WORKFLOW_GUIDE.md`](../chatGPT/WORKFLOW_GUIDE.md#9-troubleshooting-de-delegación)

---

## 📖 Documentación Principal

### 1. Documentos de Entrada

| Documento                                                                | Propósito                                | Audiencia                    | Tiempo Lectura |
| ------------------------------------------------------------------------ | ---------------------------------------- | ---------------------------- | -------------- |
| [`README.md`](../README.md)                                              | Visión general del proyecto completo     | Todos                        | 10-15 min      |
| [`QUICK_START_SUBAGENTS.md`](./QUICK_START_SUBAGENTS.md)                 | Empezar a usar el sistema inmediatamente | Director Técnico, Subagentes | 5-10 min       |
| [`SUBAGENT_ARCHITECTURE_DIAGRAM.md`](./SUBAGENT_ARCHITECTURE_DIAGRAM.md) | Arquitectura visual del sistema          | Todos                        | 10 min         |

### 2. Guías de Uso

| Documento                                                                                  | Propósito                             | Audiencia        | Tiempo Lectura |
| ------------------------------------------------------------------------------------------ | ------------------------------------- | ---------------- | -------------- |
| [`SUBAGENT_IMPLEMENTATION_GUIDE.md`](./SUBAGENT_IMPLEMENTATION_GUIDE.md)                   | Guía completa de implementación y uso | Director Técnico | 30-45 min      |
| [`/chatGPT/WORKFLOW_GUIDE.md`](../chatGPT/WORKFLOW_GUIDE.md)                               | Workflow detallado paso a paso        | Director Técnico | 30 min         |
| [`/chatGPT/SUBAGENT_INVOCATION_TEMPLATES.md`](../chatGPT/SUBAGENT_INVOCATION_TEMPLATES.md) | Templates para delegar tareas         | Director Técnico | Referencia     |

### 3. Contexto y Estado

| Documento                                                  | Propósito                              | Audiencia          | Frecuencia Actualización |
| ---------------------------------------------------------- | -------------------------------------- | ------------------ | ------------------------ |
| [`/agents/shared_context.md`](../agents/shared_context.md) | Estado del proyecto, stack, estándares | Todos              | Semanal o al cambio      |
| [`/docs/environment.md`](./environment.md)                 | Variables de entorno                   | Generadores, Infra | Al añadir vars           |
| [`/docs/deployment.md`](./deployment.md)                   | Guía de despliegue                     | Integrador, Infra  | Al cambiar proceso       |

### 4. Análisis y Mejoras

| Documento                                                                | Propósito                             | Audiencia | Tipo       |
| ------------------------------------------------------------------------ | ------------------------------------- | --------- | ---------- |
| [`SUBAGENT_SYSTEM_IMPROVEMENTS.md`](./SUBAGENT_SYSTEM_IMPROVEMENTS.md)   | Análisis técnico completo del sistema | Técnica   | Referencia |
| [`SUBAGENT_IMPROVEMENTS_SUMMARY.md`](./SUBAGENT_IMPROVEMENTS_SUMMARY.md) | Resumen de mejoras implementadas      | Ejecutiva | Informe    |
| [`SUBAGENT_INDEX.md`](./SUBAGENT_INDEX.md)                               | Este documento - Navegación           | Todos     | Índice     |

---

## 🎭 Definiciones de Subagentes

### Por Tipo

#### Generadores (Implementación)

- [`generador_backend.md`](../agents/generador_backend.md) - API REST, Django, DRF ⭐ Formato mejorado
- [`generador_frontend.md`](../agents/generador_frontend.md) - SPA React, componentes UI
- [`generador_infra.md`](../agents/generador_infra.md) - Docker, CI/CD, infraestructura

#### Auditores (Calidad)

- [`auditor_backend.md`](../agents/auditor_backend.md) - Revisar calidad backend
- [`auditor_frontend.md`](../agents/auditor_frontend.md) - Revisar calidad frontend

#### Testers (Validación)

- [`tester_backend.md`](../agents/tester_backend.md) - Tests backend, pytest
- [`tester_frontend.md`](../agents/tester_frontend.md) - Tests frontend, vitest

#### Coordinación

- [`integrador.md`](../agents/integrador.md) - Merges, releases, despliegues
- [`github_agent.md`](../agents/github_agent.md) - Issues, PRs, labels

### Índice General

- [`/agents/agents.md`](../agents/agents.md) - Índice maestro de todos los subagentes

---

## 🛠️ Templates y Herramientas

### Templates de Invocación

**Por Subagente**:

- Template: Nuevo Endpoint API (Generador Backend)
- Template: Refactorización Backend (Generador Backend)
- Template: Nuevo Componente React (Generador Frontend)
- Template: Auditoría de Código (Auditor Backend)
- Template: Suite de Tests (Tester Backend)
- Template: Preparación de Release (Integrador)
- Template: Creación de Issues (GitHub Agent)

**Por Complejidad**:

- Template: Tarea Simple
- Template: Tarea Compleja
- Template: Pipeline Completo (Multi-agente)

**Ubicación**: [`/chatGPT/SUBAGENT_INVOCATION_TEMPLATES.md`](../chatGPT/SUBAGENT_INVOCATION_TEMPLATES.md)

### Herramientas por Subagente

Ver sección "Herramientas Autorizadas" en cada definición de subagente.

---

## 📋 Workflows y Procesos

### Ciclo de Trabajo Completo

1. **Preparación** → [`WORKFLOW_GUIDE.md#1-preparación-diaria`](../chatGPT/WORKFLOW_GUIDE.md#1-preparación-diaria)
2. **Análisis** → [`WORKFLOW_GUIDE.md#fase-1-analizar`](../chatGPT/WORKFLOW_GUIDE.md#fase-1-analizar)
3. **Planificación** → [`WORKFLOW_GUIDE.md#fase-2-planificar`](../chatGPT/WORKFLOW_GUIDE.md#fase-2-planificar)
4. **Delegación** → [`WORKFLOW_GUIDE.md#fase-3-delegar`](../chatGPT/WORKFLOW_GUIDE.md#fase-3-delegar)
5. **Ejecución** → Ver workflow interno en definición de cada subagente
6. **Validación** → [`WORKFLOW_GUIDE.md#fase-4-recibir-y-evaluar`](../chatGPT/WORKFLOW_GUIDE.md#fase-4-recibir-y-evaluar)
7. **Cierre** → [`WORKFLOW_GUIDE.md#fase-6-cerrar`](../chatGPT/WORKFLOW_GUIDE.md#fase-6-cerrar)

### Patrones de Coordinación

- **Pipeline Secuencial** → [`WORKFLOW_GUIDE.md#patrón-pipeline-secuencial`](../chatGPT/WORKFLOW_GUIDE.md#patrón-pipeline-secuencial)
- **Ejecución Paralela** → [`WORKFLOW_GUIDE.md#patrón-ejecución-paralela-futuro-con-runsubagent`](../chatGPT/WORKFLOW_GUIDE.md#patrón-ejecución-paralela-futuro-con-runsubagent)
- **Revisión Cruzada** → [`WORKFLOW_GUIDE.md#patrón-revisión-cruzada`](../chatGPT/WORKFLOW_GUIDE.md#patrón-revisión-cruzada)

### Estrategias por Tipo de Tarea

- **Tarea Simple** → [`WORKFLOW_GUIDE.md#tarea-simple-una-sola-operación`](../chatGPT/WORKFLOW_GUIDE.md#tarea-simple-una-sola-operación)
- **Tarea Compleja** → [`WORKFLOW_GUIDE.md#tarea-compleja-feature-completa`](../chatGPT/WORKFLOW_GUIDE.md#tarea-compleja-feature-completa)
- **Refactorización** → [`WORKFLOW_GUIDE.md#tarea-de-refactorización`](../chatGPT/WORKFLOW_GUIDE.md#tarea-de-refactorización)
- **Bugfix** → [`WORKFLOW_GUIDE.md#tarea-de-bugfix`](../chatGPT/WORKFLOW_GUIDE.md#tarea-de-bugfix)

---

## 💡 Casos de Uso Prácticos

### Casos Documentados

1. **Implementar Autenticación de Usuarios** → [`SUBAGENT_IMPLEMENTATION_GUIDE.md#caso-1-implementar-autenticación-de-usuarios`](./SUBAGENT_IMPLEMENTATION_GUIDE.md#caso-1-implementar-autenticación-de-usuarios)
2. **Refactorizar Código Legacy** → [`SUBAGENT_IMPLEMENTATION_GUIDE.md#caso-2-refactorizar-código-legacy`](./SUBAGENT_IMPLEMENTATION_GUIDE.md#caso-2-refactorizar-código-legacy)
3. **Nueva Feature Frontend-Backend** → [`SUBAGENT_IMPLEMENTATION_GUIDE.md#caso-3-nueva-feature-frontend-backend`](./SUBAGENT_IMPLEMENTATION_GUIDE.md#caso-3-nueva-feature-frontend-backend)

### Ejemplos Rápidos

- **Endpoint Simple** → [`QUICK_START_SUBAGENTS.md#ejemplo-práctico-10-minutos`](./QUICK_START_SUBAGENTS.md#ejemplo-práctico-10-minutos)
- **Tarea Media** → [`QUICK_START_SUBAGENTS.md#caso-2-tarea-media-30-45-min`](./QUICK_START_SUBAGENTS.md#caso-2-tarea-media-30-45-min)
- **Feature Completa** → [`QUICK_START_SUBAGENTS.md#caso-3-feature-completa-2-3-horas`](./QUICK_START_SUBAGENTS.md#caso-3-feature-completa-2-3-horas)

---

## 🆘 Troubleshooting y Ayuda

### Problemas Comunes

| Problema                        | Solución              | Documento                                                                                                                                 |
| ------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| No sé qué template usar         | Guía de selección     | [`QUICK_START_SUBAGENTS.md#error-no-sé-qué-template-usar`](./QUICK_START_SUBAGENTS.md#error-no-sé-qué-template-usar)                      |
| Subagente no entiende contexto  | Verificar referencias | [`WORKFLOW_GUIDE.md#problema-subagente-no-entiende-el-contexto`](../chatGPT/WORKFLOW_GUIDE.md#problema-subagente-no-entiende-el-contexto) |
| Resultado no cumple criterios   | Feedback específico   | [`WORKFLOW_GUIDE.md#problema-resultado-no-cumple-criterios`](../chatGPT/WORKFLOW_GUIDE.md#problema-resultado-no-cumple-criterios)         |
| Coordinación multi-agente falla | Interfaces claras     | [`WORKFLOW_GUIDE.md#problema-coordinación-multi-agente-falla`](../chatGPT/WORKFLOW_GUIDE.md#problema-coordinación-multi-agente-falla)     |

### Checklists de Validación

- **General** → [`WORKFLOW_GUIDE.md#checklist-general-para-todos-los-entregables`](../chatGPT/WORKFLOW_GUIDE.md#checklist-general-para-todos-los-entregables)
- **Backend** → [`WORKFLOW_GUIDE.md#backend`](../chatGPT/WORKFLOW_GUIDE.md#backend)
- **Frontend** → [`WORKFLOW_GUIDE.md#frontend`](../chatGPT/WORKFLOW_GUIDE.md#frontend)
- **Infraestructura** → [`WORKFLOW_GUIDE.md#infraestructura`](../chatGPT/WORKFLOW_GUIDE.md#infraestructura)

---

## 📊 Documentación Técnica

### Arquitectura y Análisis

- **Análisis Completo** → [`SUBAGENT_SYSTEM_IMPROVEMENTS.md`](./SUBAGENT_SYSTEM_IMPROVEMENTS.md)

  - Comparación con Claude
  - Propuestas de mejora
  - Plan de implementación
  - Roadmap de evolución

- **Arquitectura Visual** → [`SUBAGENT_ARCHITECTURE_DIAGRAM.md`](./SUBAGENT_ARCHITECTURE_DIAGRAM.md)
  - Diagramas de flujo
  - Roles y responsabilidades
  - Patrones de coordinación
  - Estructura de documentación

### Stack Técnico

- **Backend**: Django 5.x + DRF + PostgreSQL + JWT
- **Frontend**: React 18 + Vite + TypeScript
- **Backoffice**: React Admin
- **Infraestructura**: Docker + Dokploy + GitHub Actions

Detalles completos en: [`/agents/shared_context.md#stack-técnico`](../agents/shared_context.md#stack-técnico)

---

## 🎓 Recursos de Aprendizaje

### Roadmap de Adopción

**Semana 1: Familiarización**

- Leer documentación principal
- Delegar 3 tareas simples
- Documentar aprendizajes

**Semana 2: Práctica**

- Usar diferentes templates
- Tareas complejas
- Validación estricta

**Semana 3: Dominio**

- Pipelines multi-agente
- Optimizar templates
- Contribuir mejoras

**Semana 4+: Maestría**

- Sistema internalizado
- Delegaciones eficientes
- Evolución continua

Detalles: [`SUBAGENT_ARCHITECTURE_DIAGRAM.md#roadmap-de-aprendizaje`](./SUBAGENT_ARCHITECTURE_DIAGRAM.md#roadmap-de-aprendizaje)

### Métricas de Éxito

- **Iteraciones por tarea**: Objetivo 1-2 (vs 3-5 antes)
- **Tiempo de delegación**: Objetivo 5-7 min (vs 10-15 antes)
- **Cumplimiento primera vez**: Objetivo 80-90% (vs 40-60% antes)
- **Coverage**: >80% consistente
- **Documentación**: 95% actualizada

Ver: [`SUBAGENT_IMPROVEMENTS_SUMMARY.md#métricas-de-éxito-esperadas`](./SUBAGENT_IMPROVEMENTS_SUMMARY.md#métricas-de-éxito-esperadas)

---

## 🚀 Evolución del Sistema

### Estado Actual (Fase 1) ✅ Completada

- Contexto compartido centralizado
- Templates de invocación estructurados
- Definiciones mejoradas (1 ejemplo)
- Workflow documentado
- Guías completas

### Próximos Pasos (Fase 2) ⏳ Planificada

- Actualizar todos los subagentes al nuevo formato
- Expandir templates según necesidades
- Documentar casos de éxito reales
- Medir y optimizar métricas

### Futuro (Fase 3) 🔮 Diseñada

- Migración a `runSubagent` (cuando esté disponible)
- Automatización de validaciones
- Ejecución paralela
- Sistema completamente autónomo

Roadmap completo: [`SUBAGENT_SYSTEM_IMPROVEMENTS.md#implementación-técnica`](./SUBAGENT_SYSTEM_IMPROVEMENTS.md#implementación-técnica)

---

## 📝 Cómo Actualizar este Índice

Actualiza este documento cuando:

- Se añade nueva documentación
- Se reorganiza la estructura
- Se actualizan links
- Se completan nuevas fases
- Se crean nuevos templates o subagentes

**Responsable**: Director Técnico (Google AI)

---

## 🔗 Links Rápidos por Rol

### Para Director Técnico (Google AI)

**Lectura Diaria**:

- [`/agents/shared_context.md`](../agents/shared_context.md) - Estado del proyecto

**Uso Frecuente**:

- [`/chatGPT/SUBAGENT_INVOCATION_TEMPLATES.md`](../chatGPT/SUBAGENT_INVOCATION_TEMPLATES.md) - Templates
- [`/chatGPT/WORKFLOW_GUIDE.md`](../chatGPT/WORKFLOW_GUIDE.md) - Workflow

**Referencia**:

- [`SUBAGENT_IMPLEMENTATION_GUIDE.md`](./SUBAGENT_IMPLEMENTATION_GUIDE.md) - Guía completa
- [`SUBAGENT_ARCHITECTURE_DIAGRAM.md`](./SUBAGENT_ARCHITECTURE_DIAGRAM.md) - Diagramas

### Para Subagentes (Jules)

**Lectura Obligatoria**:

- [`/agents/shared_context.md`](../agents/shared_context.md) - Contexto del proyecto
- `/agents/{tu_subagente}.md` - Tu definición

**Referencia Técnica**:

- [`/docs/environment.md`](./environment.md) - Variables de entorno
- [`/docs/deployment.md`](./deployment.md) - Despliegue

**Última actualización**: 2025-11-17
**Versión del sistema**: 2.0
**Status**: ✅ Sistema operativo

**Navegación**:

- [↑ Inicio](#-índice-maestro---sistema-de-subagentes-20)
- [→ Quick Start](./QUICK_START_SUBAGENTS.md)
- [→ Guía Completa](./SUBAGENT_IMPLEMENTATION_GUIDE.md)
- [→ Contexto del Proyecto](../agents/shared_context.md)
