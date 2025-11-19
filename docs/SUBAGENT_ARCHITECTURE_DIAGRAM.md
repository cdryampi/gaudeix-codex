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
│ ├─ Revisa contra criterios
│ ├─ Verifica evidencias
│ └─ Decide: ¿Aprueba?
│ ├─ SÍ → Continúa
│ └─ NO → Feedback y re-delega
│
└─ 9. CIERRE
├─ Documenta aprendizajes
├─ Actualiza /agents/shared_context.md
└─ Registra en /docs si es necesario

```

## 🎭 Roles y Responsabilidades

```

┌─────────────────────────────────────────────────────────────────┐
│ DIRECTOR TÉCNICO │
├─────────────────────────────────────────────────────────────────┤
│ NO hace: │ SÍ hace: │
│ • Escribir código │ • Diseñar arquitectura │
│ • Implementar features │ • Definir estrategias │
│ • Ejecutar tests │ • Crear prompts │
│ │ • Orquestar pipeline │
│ │ • Validar calidad │
│ │ • Documentar decisiones │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ GENERADORES │
├─────────────────────────────────────────────────────────────────┤
│ Pueden: │ NO pueden: │
│ • Crear/modificar código │ • Decidir arquitectura │
│ • Escribir tests │ • Cambiar infraestructura │
│ • Actualizar docs │ • Modificar fuera de scope │
│ • Ejecutar migraciones │ • Introducir deps sin aprobación │
│ • Optimizar queries │ • Saltarse tests/linting │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ AUDITORES │
├─────────────────────────────────────────────────────────────────┤
│ Pueden: │ NO pueden: │
│ • Leer código │ • Modificar código │
│ • Analizar calidad │ • Implementar correcciones │
│ • Identificar riesgos │ • Tomar decisiones finales │
│ • Recomendar mejoras │ • Aprobar sin evidencias │
│ • Generar reportes │ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ TESTERS │
├─────────────────────────────────────────────────────────────────┤
│ Pueden: │ NO pueden: │
│ • Escribir tests │ • Modificar código de producción │
│ • Ejecutar suites │ • Saltarse validaciones │
│ • Generar reportes coverage │ • Aprobar sin coverage >80% │
│ • Identificar edge cases │ • Modificar tests sin razón │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ INTEGRADOR │
├─────────────────────────────────────────────────────────────────┤
│ Pueden: │ NO pueden: │
│ • Coordinar merges │ • Desarrollar features │
│ • Planificar releases │ • Aprobar sin validaciones │
│ • Gestionar conflictos │ • Deploy sin plan de rollback │
│ • Documentar despliegues │ • Modificar código directamente │
└─────────────────────────────────────────────────────────────────┘

```

## 📊 Patrones de Coordinación

### Patrón 1: Pipeline Secuencial

```

┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Generador │ ──→│ Tester │──→ │ Auditor │
│ Backend │ │ Backend │ │ Backend │
└──────────────┘ └──────────────┘ └──────────────┘
│ │ │
▼ ▼ ▼
API creada Tests OK Aprobado
│ │ │
└────────────────────┴────────────────────┘
│
▼
┌──────────────┐
│ Integrador │
└──────────────┘

```

### Patrón 2: Desarrollo Completo (Backend + Frontend)

```

┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Generador │ ──→│ Tester │──→ │ Auditor │
│ Backend │ │ Backend │ │ Backend │
└──────────────┘ └──────────────┘ └──────────────┘
│
▼ API lista
│
┌──────────────┐ ┌──────────────┐
│ Generador │ ──→│ Tester │
│ Frontend │ │ Frontend │
└──────────────┘ └──────────────┘
│
▼
┌──────────────┐
│ Integrador │
│ │
│ • Merge │
│ • Deploy │
│ • Validación │
└──────────────┘

```

### Patrón 3: Revisión Cruzada

```

┌──────────────┐
│ Generador │
│ Backend │
└──────┬───────┘
│ Código generado
│
├────────────────────────┐
│ │
▼ ▼
┌──────────────┐ ┌──────────────┐
│ Auditor │ │ Tester │
│ Backend │ │ Backend │
└──────┬───────┘ └──────┬───────┘
│ │
│ Reporte calidad │ Reporte tests
│ │
└────────────┬───────────┘
│
▼
┌───────────────────────┐
│ Director Técnico │
│ │
│ Consolida reportes │
│ Decide: aprobar? │
└───────────────────────┘

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

┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ /chatGPT │ │ /agents │ │ Código fuente │
│ │ │ │ │ │
│ (Director) │ │ (Subagentes) │ │ (Implementac.)│
└───────┬───────┘ └───────┬───────┘ └───────────────┘
│ │
│ estrategia │ definiciones
│ │
└────────┬─────────┘
│
▼
┌────────────────┐
│ shared_context │
│ │
│ Estado actual │
│ del proyecto │
└────────────────┘
│
│ consultado por todos
│
┌────────┴────────┐
│ │
▼ ▼
Director Técnico Subagentes

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

Fase 1 (Actual) Fase 2 (Próxima) Fase 3 (Futura)
━━━━━━━━━━━━━━━━ ━━━━━━━━━━━━━━━━ ━━━━━━━━━━━━━━━━
✅ COMPLETADA ⏳ PLANIFICADA 🔮 DISEÑADA

• Contexto compartido • Todos los subagentes • runSubagent nativo
• Templates • Templates expandidos • Ejecución paralela
• Workflow documentado • Casos de éxito • Validación automática
• 1 subagente ejemplo • Métricas medidas • Sistema autónomo
• Guías completas • Optimizaciones • AI orquestador

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
```
