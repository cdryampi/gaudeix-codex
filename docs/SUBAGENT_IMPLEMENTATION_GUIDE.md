```markdown
Paso 1: Identifica el subagente
→ Generador Backend

Paso 2: Selecciona template
→ Abre /chatGPT/SUBAGENT_INVOCATION_TEMPLATES.md
→ Encuentra "Template: Nuevo Endpoint API"

Paso 3: Personaliza el template
→ Reemplaza {placeholders} con valores reales:

- {nombre_modulo}: blog
- {MÉTODO}: GET
- {recurso}: posts
- etc.

Paso 4: Añade contexto
→ Referencias:

- /agents/shared_context.md
- /docs/deployment.md (si es relevante)

Paso 5: Define criterios
→ Tests >80%
→ Sin errores linting
→ Documentado

Paso 6: Invoca Jules con el prompt completo
```

#### 3. Delegar Tarea Compleja (Feature Completa)

**Ejemplo: Implementar módulo de eventos completo**

```markdown
Usa template "Pipeline Completo":

Fase 1: Backend
├─ Subagente: Generador Backend
├─ Template: "Nuevo Endpoint API"
├─ Entregable: API de eventos implementada
└─ Criterio de paso: Tests pasan

Fase 2: Testing
├─ Subagente: Tester Backend
├─ Template: "Suite de Tests"
├─ Entregable: Tests completos >80% coverage
└─ Criterio de paso: Todos los tests pasan

Fase 3: Auditoría
├─ Subagente: Auditor Backend
├─ Template: "Auditoría de Código"
├─ Entregable: Reporte de calidad
└─ Criterio de paso: Sin hallazgos críticos

Fase 4: Frontend
├─ Subagente: Generador Frontend
├─ Template: "Nuevo Componente React"
├─ Entregable: Componentes UI
└─ Criterio de paso: Integración con API OK

Fase 5: Integración
├─ Subagente: Integrador
├─ Template: "Preparación de Release"
├─ Entregable: Feature integrada
└─ Criterio: Todos los servicios operativos

Ejecutar fase por fase, validando cada una antes de continuar.
```

#### 4. Validar Resultado

```markdown
Para cada entregable:

1. Revisa contra criterios de aceptación del template
2. Verifica evidencias:
   □ Tests pasando (captura de pytest)
   □ Linting OK (captura de ruff/black)
   □ Documentación actualizada
3. Lee /agents/shared_context.md
4. Identifica tu rol (generador/auditor/tester/integrador)
5. Lee tu definición en /agents/{tu_subagente}.md
6. Consulta /docs referencias mencionadas en el prompt
7. Confirma que tienes las herramientas necesarias
```

#### 2. Durante la Ejecución

```markdown
1. Sigue el workflow interno de tu definición
2. Consulta /agents/shared_context.md para:

   - Estándares de código
   - Patrones establecidos
   - Convenciones del proyecto
   - Stack técnico

3. Respeta tus restricciones:

   - NO hagas lo que tu definición dice que NO puedes
   - Usa SOLO las herramientas autorizadas
   - Mantente en tu scope

4. Auto-valida continuamente:
   - ¿Estoy siguiendo los estándares?
   - ¿Cumple los criterios?
   - ¿Falta algo?
```

#### 3. Antes de Retornar

```markdown
Checklist de validación (en tu definición):

Para Generador Backend:
□ Tests pasan (pytest)
□ Coverage >80% (pytest --cov)
□ Sin errores linting (ruff check)
□ Formateado (black --check)
□ Documentación actualizada
□ Migraciones aplicables
□ JWT/CORS OK

Para Generador Frontend:
□ TypeScript sin errores (tsc)
□ Tests pasan (vitest)
□ Sin errores ESLint
□ Sin warnings React
□ Componentes accesibles
□ Responsive

Para Auditor:
□ Reporte completo
□ Hallazgos categorizados por severidad
□ Recomendaciones accionables
□ Métricas incluidas

Para Tester:
□ Todos los tests pasan
□ Coverage reportado
□ Tests documentados
□ Fixtures apropiados

Solo retorna si TODOS los checks están ✅
```

## Estructura de Archivos Actualizada

```
gaudeix-jules/
├── agents/
│   ├── agents.md                    # Índice de subagentes
│   ├── shared_context.md            # ⭐ NUEVO - Estado del proyecto
│   ├── generador_backend.md         # ⭐ ACTUALIZADO - Formato mejorado
│   ├── generador_frontend.md
│   ├── generador_infra.md
│   ├── auditor_backend.md
│   ├── auditor_frontend.md
│   ├── tester_backend.md
│   ├── tester_frontend.md
│   ├── integrador.md
│   └── github_agent.md
│
├── chatGPT/
│   ├── WORKFLOW_GUIDE.md            # ⭐ ACTUALIZADO - Workflow detallado
│   ├── SUBAGENT_INVOCATION_TEMPLATES.md  # ⭐ NUEVO - Templates
│   ├── JULES_ORCHESTRATION.md
│   ├── PROJECT_OVERVIEW.md
│   ├── PROJECT_INSTRUCTIONS.md
│   ├── PROMPT_TEMPLATES.md          # Deprecated - usar SUBAGENT_INVOCATION_TEMPLATES
│   ├── ROLE_DIRECTOR_TECNICO.md
│   └── SUBAGENTS_DEFINITION.md
│
├── docs/
│   ├── SUBAGENT_SYSTEM_IMPROVEMENTS.md   # ⭐ NUEVO - Análisis y roadmap
│   ├── SUBAGENT_IMPLEMENTATION_GUIDE.md  # ⭐ NUEVO - Esta guía
│   ├── AGENTS_OVERVIEW.md
│   ├── deployment.md
│   ├── environment.md
│   ├── GITHUB_LABELS.md
│   └── migration_issues.md
│
└── [resto del proyecto...]
```

## Diferencias Clave vs Sistema Anterior

### Antes ❌

```markdown
- Definiciones de subagentes básicas
- Delegación sin estructura clara
- No había contexto compartido centralizado
- Templates muy genéricos
- Sin workflow interno documentado
- Criterios de aceptación vagos
```

### Ahora ✅

```markdown
- Definiciones completas con prompts de sistema
- Templates estructurados por tipo y complejidad
- Contexto compartido centralizado (shared_context.md)
- Workflows internos detallados para cada subagente
- Criterios de aceptación específicos y verificables
- Herramientas autorizadas explícitas
- Ejemplos de invocación concretos
- Sistema preparado para automatización futura
```

## Casos de Uso Prácticos

### Caso 1: Implementar Autenticación de Usuarios

```markdown
Tarea: Implementar módulo completo de autenticación JWT

Director Técnico:

1. Analiza requisitos en /docs
2. Consulta /agents/shared_context.md para contexto JWT
3. Selecciona pipeline: Generador Backend → Tester → Auditor
4. Usa template "Nuevo Endpoint API" para cada endpoint:
   - POST /api/v1/auth/register/
   - POST /api/v1/auth/login/
   - POST /api/v1/auth/refresh/
   - GET /api/v1/auth/me/

Fase 1: Generador Backend
→ Template personalizado para cada endpoint
→ Contexto: JWT con djangorestframework-simplejwt
→ Criterios: Tests >80%, tokens funcionan

Fase 2: Tester Backend
→ Template "Suite de Tests"
→ Tests: registro, login, refresh, acceso protegido
→ Criterios: Coverage >80%, todos los casos

Fase 3: Auditor Backend
→ Template "Auditoría de Código"
→ Focus: Seguridad de autenticación
→ Criterios: Sin vulnerabilidades, best practices

Resultado: Módulo de autenticación completo, testeado y auditado
```

### Caso 2: Refactorizar Código Legacy

```markdown
Tarea: Mejorar performance de listado de posts

Director Técnico:

1. Identifica problema: N+1 queries
2. Pipeline: Auditor → Generador → Tester → Auditor

Fase 1: Auditor Backend
→ Template "Auditoría de Código" (focus: performance)
→ Input: backend/blog/views.py
→ Output: Reporte con queries N+1 identificados

Fase 2: Generador Backend
→ Template "Refactorización Backend"
→ Input: Reporte de auditoría
→ Output: Código optimizado (select_related, prefetch_related)
→ Criterios: Misma API, mejor performance

Fase 3: Tester Backend
→ Template "Suite de Tests"
→ Validar: tests existentes siguen pasando
→ Nuevo test: validar reducción de queries

Fase 4: Auditor Backend (Validación)
→ Confirmar: mejora de performance
→ Métricas: tiempo respuesta, número de queries

Resultado: Performance mejorada, sin regresiones
```

### Caso 3: Nueva Feature Frontend-Backend

```markdown
Tarea: Implementar calendario de eventos con filtros

Director Técnico:

1. Feature requiere backend + frontend
2. Pipeline secuencial con validaciones

Fase 1: Backend API
Subagente: Generador Backend
Template: "Nuevo Endpoint API"
Deliverable: GET /api/v1/events/?date_from=&date_to=&category=
Criterios: Paginación, filtros, tests >80%

Fase 2: Testing Backend
Subagente: Tester Backend
Template: "Suite de Tests"
Deliverable: Tests de filtros y edge cases
Criterios: Coverage >80%, todos pasan

Fase 3: Auditoría Backend
Subagente: Auditor Backend
Template: "Auditoría de Código"
Deliverable: Reporte de calidad
Criterios: Sin bloqueadores

[VALIDACIÓN: Backend OK → Continuar Frontend]

Fase 4: Componente Calendar
Subagente: Generador Frontend
Template: "Nuevo Componente React"
Deliverable: <EventCalendar /> con filtros
Criterios: Integra con API, responsive, tests

Fase 5: Testing Frontend
Subagente: Tester Frontend
Template: "Suite de Tests"
Deliverable: Tests unitarios + integración
Criterios: Coverage >70%

Fase 6: Integración
Subagente: Integrador
Template: "Preparación de Release"
Deliverable: Feature integrada end-to-end
Criterios: Ambos subdominios funcionan

Resultado: Feature completa, testeada, integrada
```

## Métricas de Éxito

### Indicadores de que el Sistema Funciona

✅ **Delegación más eficiente**

- Menos iteraciones necesarias
- Prompts más claros desde el inicio
- Menos ambigüedad en requerimientos

✅ **Calidad consistente**

- Todos los entregables cumplen criterios
- Tests siempre incluidos
- Documentación actualizada

✅ **Trazabilidad completa**

- Decisiones documentadas
- Cambios rastreables
- Aprendizajes capturados

✅ **Preparación futura**

- Sistema listo para runSubagent
- Interfaces bien definidas
- Automatización posible

## Próximos Pasos

### Corto Plazo (Ahora - 1 mes)

1. **Usar el sistema activamente**

   - Aplicar templates en todas las delegaciones
   - Actualizar shared_context.md regularmente
   - Documentar aprendizajes

2. **Actualizar subagentes restantes**

   - Aplicar formato mejorado a todos los subagentes en /agents
   - Completar sección de herramientas autorizadas
   - Añadir ejemplos de invocación

3. **Refinar templates**

   - Añadir templates para casos no cubiertos
   - Mejorar con feedback real
   - Crear variantes según complejidad

4. **Evangelizar el sistema**
   - Documentar casos de éxito
   - Compartir best practices
   - Entrenar al equipo (si aplica)

### Medio Plazo (1-3 meses)

1. **Medir y optimizar**

   - Tiempo de delegación promedio
   - Tasa de éxito primera vez
   - Calidad de entregables

2. **Automatizar validaciones**

   - Scripts para verificar criterios
   - Hooks de Git para estándares
   - CI/CD checks automáticos

3. **Expandir capacidades**
   - Nuevos subagentes si es necesario
   - Nuevos templates para casos comunes
   - Patrones de coordinación avanzados

### Largo Plazo (3+ meses)

1. **Migración a runSubagent**

   - Cuando la herramienta esté disponible
   - Los prompts ya están listos
   - Transición suave

2. **Sistema completamente autónomo**

   - Subagentes ejecutan independientemente
   - Validaciones automáticas
   - Paralelización de tareas

3. **Mejora continua**
   - Análisis de métricas
   - Optimización de workflows
   - Evolución de patrones

## Troubleshooting

### Problema: "No sé qué template usar"

**Solución**:

1. Identifica el tipo de tarea (generación/auditoría/testing/integración)
2. Identifica el área (backend/frontend/infra)
3. Busca en /chatGPT/SUBAGENT_INVOCATION_TEMPLATES.md
4. Si no hay exacto, usa el más cercano y adapta

### Problema: "El subagente no sigue las instrucciones"

**Solución**:

1. Verifica que incluiste referencia a /agents/shared_context.md
2. Revisa que los criterios están claros y verificables
3. Confirma que el subagente tiene las herramientas necesarias
4. Añade ejemplos concretos en el prompt
5. Refuerza restricciones explícitamente

### Problema: "No sé si el resultado es bueno"

**Solución**:

1. Usa el checklist de criterios del template
2. Ejecuta validaciones técnicas (tests, linting)
3. Compara con estándares en /agents/shared_context.md
4. Si aún dudas, pide auditoría al subagente Auditor

### Problema: "La coordinación multi-agente es confusa"

**Solución**:

1. Usa template "Pipeline Completo"
2. Define criterios de paso entre fases
3. Valida cada fase antes de continuar
4. Documenta el flujo para referencia
5. Simplifica si es muy complejo

## Recursos Adicionales

### Documentación

- `/agents/shared_context.md` - **Leer primero siempre**
- `/chatGPT/WORKFLOW_GUIDE.md` - Guía de workflow completa
- `/chatGPT/SUBAGENT_INVOCATION_TEMPLATES.md` - Todos los templates
- `/docs/SUBAGENT_SYSTEM_IMPROVEMENTS.md` - Análisis técnico completo

### Ejemplos en Vivo

- (A medida que uses el sistema, documenta casos de éxito aquí)

### Contacto

- Director Técnico: ChatGPT (en sesión activa)
- Documentación del proyecto: /docs
- Estado del proyecto: /agents/shared_context.md

---

**Última actualización**: 2025-11-17
**Versión del sistema**: 2.0
**Status**: ✅ Operativo y listo para uso
