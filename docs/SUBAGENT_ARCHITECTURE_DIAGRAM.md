# Sistema de Subagentes - Diagrama de Arquitectura

## 🏗️ Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                    DIRECTOR TÉCNICO (ChatGPT)                   │
│                                                                 │
│  Responsabilidades:                                             │
│  • Diseña arquitectura y estrategia                             │
│  • Define prompts usando templates                              │
│  • Orquesta pipeline de subagentes                              │
│  • Valida entregables contra criterios                          │
│  • Documenta decisiones y aprendizajes                          │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        │ Lee contexto
                        ▼
        ┌───────────────────────────────────┐
        │  /agents/shared_context.md        │
        │                                   │
        │  • Estado del proyecto            │
        │  • Stack técnico                  │
        │  • Estándares                     │
        │  • Patrones                       │
        │  • ADRs                           │
        └───────────────────────────────────┘
                        │
                        │ Usa templates
                        ▼
        ┌───────────────────────────────────┐
        │  Templates de Invocación          │
        │                                   │
        │  • Por subagente                  │
        │  • Por complejidad                │
        │  • Por tipo de tarea              │
        └───────────────────────────────────┘
                        │
                        │ Delega a
                        ▼
┌───────────────────────────────────────────────────────────────────┐
│                         SUBAGENTES (Codex)                        │
└───────────────────────────────────────────────────────────────────┘
        │               │               │               │
        ▼               ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  GENERADORES │ │   AUDITORES  │ │   TESTERS    │ │ INTEGRADOR   │
├──────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤
│              │ │              │ │              │ │              │
│ • Backend    │ │ • Backend    │ │ • Backend    │ │ • Releases   │
│ • Frontend   │ │ • Frontend   │ │ • Frontend   │ │ • Merges     │
│ • Infra      │ │              │ │              │ │ • Deploy     │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
        │               │               │               │
        └───────────────┴───────────────┴───────────────┘
                        │
                        │ Consultan
                        ▼
        ┌───────────────────────────────────┐
        │  /agents/{subagente}.md           │
        │                                   │
        │  • Prompt de sistema              │
        │  • Herramientas autorizadas       │
        │  • Workflow interno               │
        │  • Criterios de validación        │
        └───────────────────────────────────┘
                        │
                        │ Usan
                        ▼
        ┌───────────────────────────────────┐
        │  Herramientas (Tools)             │
        │                                   │
        │  • read_file, create_file         │
        │  • replace_string_in_file         │
        │  • run_in_terminal                │
        │  • runTests, get_errors           │
        └───────────────────────────────────┘
                        │
                        │ Retornan
                        ▼
┌───────────────────────────────────────────────────────────────────┐
│                         ENTREGABLES                               │
│                                                                   │
│  • Código implementado                                            │
│  • Tests con coverage >80%                                        │
│  • Documentación actualizada                                      │
│  • Evidencias de validación                                       │
└───────────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Trabajo (Workflow)

```
Director Técnico (ChatGPT)
    │
    ├─ 1. PREPARACIÓN
    │   ├─ Lee /agents/shared_context.md
    │   ├─ Consulta /docs relevantes
    │   └─ Identifica tipo de tarea
    │
    ├─ 2. PLANIFICACIÓN
    │   ├─ Define objetivos claros
    │   ├─ Selecciona subagente(s)
    │   ├─ Identifica dependencias
    │   └─ Define criterios de aceptación
    │
    ├─ 3. DELEGACIÓN
    │   ├─ Selecciona template apropiado
    │   ├─ Personaliza con contexto
    │   ├─ Incluye referencias /docs
    │   └─ Invoca subagente
    │
    ▼
Subagente (Codex)
    │
    ├─ 4. RECEPCIÓN
    │   ├─ Lee prompt completo
    │   ├─ Consulta /agents/shared_context.md
    │   ├─ Lee su definición /agents/{subagente}.md
    │   └─ Verifica herramientas disponibles
    │
    ├─ 5. EJECUCIÓN
    │   ├─ Sigue workflow interno
    │   ├─ Implementa según estándares
    │   ├─ Ejecuta tests/validaciones
    │   └─ Actualiza documentación
    │
    ├─ 6. AUTO-VALIDACIÓN
    │   ├─ Verifica checklist de criterios
    │   ├─ Tests pasan
    │   ├─ Linting OK
    │   └─ Documentación actualizada
    │
    ├─ 7. ENTREGA
    │   ├─ Retorna entregables
    │   ├─ Proporciona evidencias
    │   └─ Documenta decisiones
    │
    ▼
Director Técnico
    │
    ├─ 8. VALIDACIÓN
    │   ├─ Revisa contra criterios
    │   ├─ Verifica evidencias
    │   └─ Decide: ¿Aprueba?
    │       ├─ SÍ → Continúa
    │       └─ NO → Feedback y re-delega
    │
    └─ 9. CIERRE
        ├─ Documenta aprendizajes
        ├─ Actualiza /agents/shared_context.md
        └─ Registra en /docs si es necesario
```

## 🎭 Roles y Responsabilidades

```
┌─────────────────────────────────────────────────────────────────┐
│                     DIRECTOR TÉCNICO                            │
├─────────────────────────────────────────────────────────────────┤
│ NO hace:                    │ SÍ hace:                          │
│ • Escribir código           │ • Diseñar arquitectura            │
│ • Implementar features      │ • Definir estrategias             │
│ • Ejecutar tests            │ • Crear prompts                   │
│                             │ • Orquestar pipeline              │
│                             │ • Validar calidad                 │
│                             │ • Documentar decisiones           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     GENERADORES                                 │
├─────────────────────────────────────────────────────────────────┤
│ Pueden:                     │ NO pueden:                        │
│ • Crear/modificar código    │ • Decidir arquitectura            │
│ • Escribir tests            │ • Cambiar infraestructura         │
│ • Actualizar docs           │ • Modificar fuera de scope        │
│ • Ejecutar migraciones      │ • Introducir deps sin aprobación  │
│ • Optimizar queries         │ • Saltarse tests/linting          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     AUDITORES                                   │
├─────────────────────────────────────────────────────────────────┤
│ Pueden:                     │ NO pueden:                        │
│ • Leer código               │ • Modificar código                │
│ • Analizar calidad          │ • Implementar correcciones        │
│ • Identificar riesgos       │ • Tomar decisiones finales        │
│ • Recomendar mejoras        │ • Aprobar sin evidencias          │
│ • Generar reportes          │                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     TESTERS                                     │
├─────────────────────────────────────────────────────────────────┤
│ Pueden:                     │ NO pueden:                        │
│ • Escribir tests            │ • Modificar código de producción  │
│ • Ejecutar suites           │ • Saltarse validaciones           │
│ • Generar reportes coverage │ • Aprobar sin coverage >80%       │
│ • Identificar edge cases    │ • Modificar tests sin razón       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     INTEGRADOR                                  │
├─────────────────────────────────────────────────────────────────┤
│ Pueden:                     │ NO pueden:                        │
│ • Coordinar merges          │ • Desarrollar features            │
│ • Planificar releases       │ • Aprobar sin validaciones        │
│ • Gestionar conflictos      │ • Deploy sin plan de rollback     │
│ • Documentar despliegues    │ • Modificar código directamente   │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Patrones de Coordinación

### Patrón 1: Pipeline Secuencial

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Generador   │ ──→│   Tester     │──→ │   Auditor    │
│   Backend    │    │   Backend    │    │   Backend    │
└──────────────┘    └──────────────┘    └──────────────┘
      │                    │                    │
      ▼                    ▼                    ▼
  API creada          Tests OK            Aprobado
      │                    │                    │
      └────────────────────┴────────────────────┘
                          │
                          ▼
                  ┌──────────────┐
                  │  Integrador  │
                  └──────────────┘
```

### Patrón 2: Desarrollo Completo (Backend + Frontend)

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Generador   │ ──→│   Tester     │──→ │   Auditor    │
│   Backend    │    │   Backend    │    │   Backend    │
└──────────────┘    └──────────────┘    └──────────────┘
                          │
                          ▼ API lista
                          │
┌──────────────┐    ┌──────────────┐
│  Generador   │ ──→│   Tester     │
│  Frontend    │    │  Frontend    │
└──────────────┘    └──────────────┘
                          │
                          ▼
                  ┌──────────────┐
                  │  Integrador  │
                  │              │
                  │ • Merge      │
                  │ • Deploy     │
                  │ • Validación │
                  └──────────────┘
```

### Patrón 3: Revisión Cruzada

```
┌──────────────┐
│  Generador   │
│   Backend    │
└──────┬───────┘
       │ Código generado
       │
       ├────────────────────────┐
       │                        │
       ▼                        ▼
┌──────────────┐        ┌──────────────┐
│   Auditor    │        │   Tester     │
│   Backend    │        │   Backend    │
└──────┬───────┘        └──────┬───────┘
       │                        │
       │ Reporte calidad        │ Reporte tests
       │                        │
       └────────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  Director Técnico     │
        │                       │
        │  Consolida reportes   │
        │  Decide: aprobar?     │
        └───────────────────────┘
```

## 🗂️ Estructura de Documentación

```
gaudeix-codex/
│
├── /agents/                         ← SUBAGENTES
│   ├── shared_context.md            ← ⭐ LEER SIEMPRE
│   ├── agents.md                    ← Índice
│   ├── generador_backend.md         ← Definición completa
│   ├── generador_frontend.md
│   ├── generador_infra.md
│   ├── auditor_backend.md
│   ├── auditor_frontend.md
│   ├── tester_backend.md
│   ├── tester_frontend.md
│   ├── integrador.md
│   └── github_agent.md
│
├── /chatGPT/                        ← DIRECTOR TÉCNICO
│   ├── WORKFLOW_GUIDE.md            ← Workflow completo
│   ├── SUBAGENT_INVOCATION_TEMPLATES.md  ← ⭐ TEMPLATES
│   ├── CODEX_ORCHESTRATION.md
│   ├── PROJECT_OVERVIEW.md
│   ├── PROJECT_INSTRUCTIONS.md
│   ├── ROLE_DIRECTOR_TECNICO.md
│   └── SUBAGENTS_DEFINITION.md
│
├── /docs/                           ← DOCUMENTACIÓN TÉCNICA
│   ├── QUICK_START_SUBAGENTS.md     ← ⭐ INICIO RÁPIDO
│   ├── SUBAGENT_IMPLEMENTATION_GUIDE.md  ← Guía completa
│   ├── SUBAGENT_SYSTEM_IMPROVEMENTS.md   ← Análisis técnico
│   ├── SUBAGENT_IMPROVEMENTS_SUMMARY.md  ← Resumen
│   ├── AGENTS_OVERVIEW.md
│   ├── deployment.md
│   ├── environment.md
│   ├── GITHUB_LABELS.md
│   └── migration_issues.md
│
└── README.md                        ← ⭐ ENTRADA PRINCIPAL
```

## 🎯 Flujo de Información

```
                    ┌─────────────┐
                    │   /docs     │
                    │  (fuente de │
                    │   verdad)   │
                    └──────┬──────┘
                           │
                           │ contexto técnico
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   /chatGPT    │  │    /agents    │  │ Código fuente │
│               │  │               │  │               │
│ (Director)    │  │ (Subagentes)  │  │ (Implementac.)│
└───────┬───────┘  └───────┬───────┘  └───────────────┘
        │                  │
        │ estrategia       │ definiciones
        │                  │
        └────────┬─────────┘
                 │
                 ▼
        ┌────────────────┐
        │ shared_context │
        │                │
        │ Estado actual  │
        │ del proyecto   │
        └────────────────┘
                 │
                 │ consultado por todos
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
  Director Técnico   Subagentes
```

## 🔑 Claves del Sistema

### 1. Contexto Centralizado

```
/agents/shared_context.md
    ↓
Único punto de verdad sobre:
• Estado del proyecto
• Stack técnico
• Estándares
• Patrones
• ADRs
```

### 2. Templates Reutilizables

```
/chatGPT/SUBAGENT_INVOCATION_TEMPLATES.md
    ↓
Templates por:
• Tipo de subagente (generador, auditor, etc.)
• Complejidad (simple, compleja, pipeline)
• Área (backend, frontend, infra)
```

### 3. Definiciones Completas

```
/agents/{subagente}.md
    ↓
Cada subagente tiene:
• Prompt de sistema
• Herramientas autorizadas
• Workflow interno
• Criterios de validación
• Ejemplos de uso
```

### 4. Workflow Documentado

```
/chatGPT/WORKFLOW_GUIDE.md
    ↓
Proceso completo:
• Preparación → Planificación → Delegación
• Ejecución → Validación → Cierre
• Troubleshooting incluido
```

## 📈 Evolución del Sistema

```
Fase 1 (Actual)          Fase 2 (Próxima)        Fase 3 (Futura)
━━━━━━━━━━━━━━━━         ━━━━━━━━━━━━━━━━        ━━━━━━━━━━━━━━━━
✅ COMPLETADA             ⏳ PLANIFICADA           🔮 DISEÑADA

• Contexto compartido    • Todos los subagentes  • runSubagent nativo
• Templates             • Templates expandidos   • Ejecución paralela
• Workflow documentado  • Casos de éxito        • Validación automática
• 1 subagente ejemplo   • Métricas medidas      • Sistema autónomo
• Guías completas       • Optimizaciones        • AI orquestador
```

## 🎓 Roadmap de Aprendizaje

```
Semana 1: Familiarización
├─ Día 1-2: Leer documentación principal
├─ Día 3-4: Delegar 3 tareas simples
└─ Día 5: Revisar y documentar aprendizajes

Semana 2: Práctica
├─ Usar diferentes templates
├─ Delegar tareas complejas
├─ Validar con criterios estrictos
└─ Refinar prompts según feedback

Semana 3: Dominio
├─ Coordinar pipelines multi-agente
├─ Optimizar templates propios
├─ Contribuir mejoras al sistema
└─ Mentoría a otros (si aplica)

Semana 4+: Maestría
├─ Sistema internalizado
├─ Delegaciones eficientes
├─ Calidad consistente
└─ Evolución continua del sistema
```

---

**Última actualización**: 2025-11-17
**Versión**: 2.0
**Status**: ✅ Sistema operativo

Para más detalles, consulta:

- **Inicio rápido**: `/docs/QUICK_START_SUBAGENTS.md`
- **Guía completa**: `/docs/SUBAGENT_IMPLEMENTATION_GUIDE.md`
- **Templates**: `/chatGPT/SUBAGENT_INVOCATION_TEMPLATES.md`
