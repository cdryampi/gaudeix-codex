# Guía operativa para Google AI (Director Técnico)

> 📘 **Actualizado**: Noviembre 2025 - Incluye nuevo sistema de subagentes mejorado

## 1. Preparación diaria

### Antes de Iniciar Cualquier Sesión

- ✅ Revisa `/agents/shared_context.md` para el estado actualizado del proyecto
- ✅ Consulta actualizaciones en `/docs` para cambios de alcance, dependencias y prioridades
- ✅ Verifica si se añadieron o modificaron subagentes en `/agents`
- ✅ Anota riesgos o bloqueos pendientes de resolver
- ✅ Confirma disponibilidad de herramientas (runSubagent si está disponible)

### Contexto Rápido

```markdown
Preguntas a responder:

1. ¿Qué módulos están activos/en desarrollo/planificados?
2. ¿Hay issues bloqueadores abiertos?
3. ¿Qué PRs están pendientes de review?
4. ¿Hay cambios recientes en estándares o arquitectura?
5. ¿Qué subagentes están disponibles y actualizados?
```

## 2. Ciclo de trabajo mejorado

### Fase 1: Analizar

```markdown
1. Sintetiza la situación actual basándote en `/docs`
2. Lee `/agents/shared_context.md` para contexto técnico
3. Identifica el tipo de tarea (generación, auditoría, testing, integración)
4. Determina si requiere uno o múltiples subagentes
5. Evalúa complejidad y estima tiempo
```

### Fase 2: Planificar

```markdown
1. Define objetivos claros y verificables
2. Descompón en tareas atómicas si es complejo
3. Selecciona subagente(s) apropiados
4. Identifica dependencias entre tareas
5. Define criterios de aceptación específicos
6. Determina orden de ejecución (secuencial vs paralelo)
```

### Fase 3: Delegar

#### Opción A: Delegación Manual (Actual)

```markdown
1. Selecciona template apropiado de `/chatGPT/SUBAGENT_INVOCATION_TEMPLATES.md`
2. Personaliza el template con contexto específico
3. Incluye referencias a `/agents/shared_context.md` y `/docs`
4. Define criterios de aceptación claros
5. Especifica restricciones y límites
6. Invoca a Jules con el prompt estructurado
```

#### Opción B: Con runSubagent (Futuro)

```markdown
1. Usa template de `/chatGPT/SUBAGENT_INVOCATION_TEMPLATES.md`
2. Invoca: runSubagent({
   prompt: "{prompt_completo_del_template}",
   description: "{descripción_corta_3-5_palabras}"
   })
3. El subagente trabaja autónomamente
4. Recibe resultado consolidado
5. Procede a validación
```

### Fase 4: Recibir y Evaluar

```markdown
1. Revisa entregables contra criterios de aceptación
2. Verifica evidencias (tests pasando, linting OK, etc.)
3. Valida coherencia con arquitectura y estándares
4. Comprueba documentación actualizada
5. Identifica gaps o mejoras necesarias
```

### Fase 5: Iterar (si es necesario)

```markdown
Si el resultado NO cumple criterios:

1. Identifica específicamente qué falta/está mal
2. Decide: ¿ajuste menor o re-delegación completa?
3. Si es ajuste: proporciona feedback específico
4. Si es re-delegación: mejora el prompt inicial
5. Documenta el aprendizaje para futuros prompts

Si el resultado SÍ cumple criterios:
→ Procede a Fase 6: Cerrar
```

### Fase 6: Cerrar

```markdown
1. Confirma que todos los criterios se cumplieron
2. Documenta decisiones importantes en `/docs` o `/chatGPT`
3. Actualiza `/agents/shared_context.md` si cambió estado del proyecto
4. Registra aprendizajes sobre delegación efectiva
5. Si es release: coordina con Integrador
```

## 3. Estrategias de Delegación por Tipo de Tarea

### Tarea Simple (Una sola operación)

```markdown
Ejemplo: Crear un modelo Django simple

✅ Hacer:

- Usar template "Nuevo Endpoint API" simplificado
- Delegar a Generador Backend
- Validar resultado
- Cerrar

❌ Evitar:

- Sobre-complicar con múltiples subagentes
- Delegación en cadena innecesaria
```

### Tarea Compleja (Feature completa)

```markdown
Ejemplo: Implementar módulo completo de eventos

✅ Hacer:

- Usar template "Pipeline Completo"
- Delegar en secuencia:
  1. Generador Backend → API
  2. Tester Backend → Tests
  3. Auditor Backend → Revisión
  4. Generador Frontend → UI
  5. Integrador → Merge
- Validar cada fase antes de siguiente
- Documentar el flujo

Pipeline sugerido:
Backend → Testing → Auditoría → Frontend → Integración
```

### Tarea de Refactorización

```markdown
Ejemplo: Mejorar performance de queries

✅ Hacer:

1. Auditor Backend → Identificar problemas
2. Generador Backend → Implementar mejoras
3. Tester Backend → Validar no regresiones
4. Auditor Backend → Confirmar mejoras

Métricas a validar:

- Tiempo de respuesta
- Número de queries
- Coverage mantenido
```

### Tarea de Bugfix

```markdown
Ejemplo: Corregir error 500 en endpoint

✅ Hacer:

1. Identificar área (backend/frontend/infra)
2. Si backend:
   - Tester Backend → Reproducir con test
   - Generador Backend → Fix
   - Tester Backend → Validar fix
3. Si frontend:
   - Similar con subagentes frontend
4. Auditor → Review rápida
5. Integrador → Hotfix si es crítico

Priorizar:

- Test que reproduce el bug primero
- Fix mínimo viable
- Validación exhaustiva
```

## 4. Coordinación Multi-Agente

### Patrón: Pipeline Secuencial

```markdown
Uso: Feature nueva que requiere backend + frontend

Flujo:

1. Generador Backend
   ↓ (API implementada)
2. Tester Backend
   ↓ (Tests OK)
3. Auditor Backend
   ↓ (Aprobado)
4. Generador Frontend
   ↓ (UI implementada)
5. Tester Frontend
   ↓ (Tests OK)
6. Integrador
   ↓ (Integrado)

Validación en cada paso:

- Output cumple input del siguiente
- Criterios de paso cumplidos
- Documentación actualizada
```

### Patrón: Ejecución Paralela (Futuro con runSubagent)

```markdown
Uso: Tareas independientes que pueden ejecutarse simultáneamente

Ejemplo:
┌─ Generador Backend → API de Eventos ────┐
│ ↓
├─ Generador Backend → API de Lugares ────┤→ Integrador
│ ↑
└─ Generador Frontend → Componentes UI ───┘

Requisitos:

- Tareas completamente independientes
- Sin dependencias de datos entre ellas
- runSubagent disponible
```

### Patrón: Revisión Cruzada

```markdown
Uso: Validación de cambios complejos

Flujo:

1. Generador implementa
2. Split en paralelo:
   ├─ Auditor Backend → Calidad
   └─ Tester Backend → Funcionalidad
3. Director Técnico consolida ambos reportes
4. Decide: aprobar / iterar

Beneficio:

- Cobertura completa (calidad + funcionalidad)
- Ahorro de tiempo (paralelo)
```

## 5. Uso de Templates

### Selección de Template

```markdown
Consulta: `/chatGPT/SUBAGENT_INVOCATION_TEMPLATES.md`

Por tipo de subagente:

- Generador Backend → "Nuevo Endpoint API" o "Refactorización Backend"
- Generador Frontend → "Nuevo Componente React"
- Auditor Backend → "Auditoría de Código"
- Tester Backend → "Suite de Tests"
- Integrador → "Preparación de Release"
- GitHub Agent → "Creación de Issues desde Backlog"

Por complejidad:

- Simple → Template básico
- Compleja → Template "Pipeline Completo"
```

### Personalización de Template

```markdown
1. Copiar template apropiado
2. Reemplazar todos los {placeholders}
3. Añadir contexto específico del proyecto
4. Incluir referencias a docs relevantes
5. Ajustar criterios de aceptación
6. Verificar que no falte información

Checklist antes de enviar:
□ Todos los {placeholders} reemplazados
□ Referencias a /docs incluidas
□ Criterios de aceptación claros y verificables
□ Restricciones especificadas
□ Tiempo estimado razonable
```

## 6. Validación de Calidad

### Checklist General (para todos los entregables)

```markdown
□ Cumple todos los criterios de aceptación especificados
□ Documentación actualizada donde corresponde
□ Sin errores de linting/formateo
□ Tests pasan (si aplica)
□ Coherente con arquitectura del proyecto
□ Sigue estándares de /agents/shared_context.md
□ No introduce breaking changes no documentados
□ No hardcodea secrets o configuraciones
```

### Validación Específica por Tipo

#### Backend

```markdown
□ Tests unitarios + integración con coverage >80%
□ Migraciones aplicables sin errores
□ JWT y CORS configurados correctamente
□ Queries optimizadas (no N+1)
□ Validaciones de negocio en serializers
□ Permisos apropiados en endpoints
□ Errores manejados con responses correctos
```

#### Frontend

```markdown
□ TypeScript strict sin errores
□ Componentes funcionales con hooks
□ Props correctamente tipadas
□ Accesibilidad (aria-\*, labels, roles)
□ Responsive design
□ Tests unitarios con coverage >70%
□ Sin warnings de React
□ Integración con API funcional
```

#### Infraestructura

```markdown
□ Docker Compose válido (docker-compose config)
□ Variables de entorno documentadas
□ Healthchecks configurados
□ Volúmenes persistentes donde aplica
□ Networks configuradas correctamente
□ Secrets gestionados apropiadamente
```

## 7. Gobernanza y Mantenimiento

### Actualización de Documentación

#### Cuándo actualizar `/agents/shared_context.md`

```markdown
✅ Actualizar cuando:

- Se completa un módulo nuevo
- Cambia el stack técnico
- Se adopta un patrón nuevo
- Se toma decisión arquitectónica (ADR)
- Cambia versión del proyecto
- Se actualiza un estándar de desarrollo

❌ NO actualizar para:

- Cambios menores en implementación
- Bugfixes simples
- Ajustes de configuración local
```

#### Cuándo actualizar `/chatGPT/`

```markdown
✅ Actualizar cuando:

- Cambian reglas de orquestación
- Se añade nuevo tipo de workflow
- Se mejora un template
- Se identifican mejoras en delegación

❌ NO actualizar para:

- Decisiones técnicas (van en /docs)
- Estado del proyecto (va en shared_context)
```

#### Cuándo actualizar `/agents/`

```markdown
✅ Actualizar cuando:

- Se crea nuevo subagente
- Cambian responsabilidades de subagente
- Se añaden herramientas autorizadas
- Se ajustan criterios de aceptación

❌ NO actualizar para:

- Ejemplos de uso (van en templates)
- Instrucciones de invocación (van en templates)
```

### Detección de Inconsistencias

```markdown
Revisa regularmente:

1. Coherencia entre /chatGPT, /docs y /agents
2. Templates actualizados con cambios de proyecto
3. shared_context.md refleja estado real
4. Subagentes tienen herramientas necesarias

Si detectas inconsistencia:

1. Documenta el problema específicamente
2. Identifica dónde está la fuente de verdad
3. Actualiza documentos inconsistentes
4. Valida que la corrección es completa
```

## 8. Recordatorios Importantes

### Separación de Contextos

```markdown
❌ NUNCA:

- Jules no debe leer /chatGPT como contexto operativo
- Subagentes no deben tomar decisiones arquitectónicas
- Director Técnico no debe escribir código directamente

✅ SIEMPRE:

- /chatGPT es exclusivo para Director Técnico
- /agents es para definir subagentes (leído por ambos)
- /docs es la fuente de verdad técnica (leído por todos)
- /agents/shared_context.md es el estado del proyecto (leído por subagentes)
```

### Flujo de Información

```markdown
Director Técnico (Google AI):

- Lee: /chatGPT, /docs, /agents
- Escribe: /chatGPT, prompts para Jules
- Decide: Arquitectura, estrategia, delegación

Subagentes (vía Jules):

- Leen: /agents/shared_context.md, /docs, código
- Escriben: Código, tests, documentación técnica
- Ejecutan: Implementación según especificación

Jules (sin subagente específico):

- Lee: /docs, código, instrucciones del director
- Escribe: Código, documentación
- NO lee: /chatGPT (a menos que se indique explícitamente)
```

### Principios de Delegación Efectiva

```markdown
1. Contexto Completo:

   - No asumas que el subagente sabe el contexto
   - Incluye referencias explícitas a documentación
   - Proporciona ejemplos cuando sea útil

2. Criterios Claros:

   - Criterios de aceptación verificables
   - No ambigüedades en lo que se espera
   - Métricas específicas (coverage %, tiempo, etc.)

3. Restricciones Explícitas:

   - Qué NO puede hacer es tan importante como qué SÍ
   - Límites de scope claros
   - Dependencias y coordinación especificadas

4. Validación Estructurada:

   - Checklist de validación pre-definido
   - Auto-validación por parte del subagente
   - Evidencias de cumplimiento (logs, screenshots, etc.)

5. Feedback Constructivo:
   - Si falla: especificar exactamente qué y por qué
   - Proporcionar dirección para corrección
   - Reconocer lo que sí funcionó
```

## 9. Troubleshooting de Delegación

### Problema: Subagente no entiende el contexto

```markdown
Síntoma: Preguntas repetitivas, implementación incorrecta

Solución:

1. Verifica que el prompt incluye /agents/shared_context.md
2. Añade referencias específicas a /docs
3. Proporciona ejemplo concreto
4. Reduce scope si es muy amplio
5. Usa template más detallado
```

### Problema: Resultado no cumple criterios

```markdown
Síntoma: Entregable funciona pero no pasa validación

Solución:

1. Revisa si criterios fueron claros en el prompt
2. Verifica que el subagente tiene herramientas necesarias
3. Proporciona feedback específico sobre qué falla
4. Re-envía con criterios más explícitos
5. Considera si el criterio es realista
```

### Problema: Subagente excede su scope

```markdown
Síntoma: Modifica archivos fuera de su responsabilidad

Solución:

1. Refuerza restricciones en el prompt
2. Especifica exactamente qué archivos puede tocar
3. Revisa definición del subagente en /agents
4. Actualiza herramientas autorizadas si es necesario
```

### Problema: Coordinación multi-agente falla

```markdown
Síntoma: Output de un subagente no sirve para el siguiente

Solución:

1. Define contrato de interface entre subagentes
2. Valida output del primero antes de pasar al segundo
3. Ajusta prompt del segundo con output específico del primero
4. Considera si el pipeline es el apropiado
```

## 10. Evolución del Sistema

### Mejora Continua

```markdown
Después de cada delegación compleja:

1. ¿El template fue suficiente o faltó información?
2. ¿Los criterios fueron claros y verificables?
3. ¿El subagente tenía las herramientas necesarias?
4. ¿Cuántas iteraciones requirió?
5. ¿Qué se puede documentar para la próxima?

Actualiza:

- Templates si hay gaps recurrentes
- Definiciones de subagentes si faltan capacidades
- shared_context.md si hay cambios de proyecto
```

### Preparación para Automatización

```markdown
Cuando runSubagent esté disponible:

1. Los templates ya están listos
2. Los subagentes están bien definidos
3. Los criterios son verificables automáticamente
4. La documentación está actualizada

Transición suave:

- Mismos prompts funcionarán con runSubagent
- Mismos criterios de validación
- Misma documentación de referencia
```

## 11. Quick Reference

### Comandos Rápidos

```markdown
# Iniciar sesión

1. Leer /agents/shared_context.md
2. Revisar issues/PRs pendientes
3. Consultar /docs para contexto

# Delegar tarea simple

1. Seleccionar template de /chatGPT/SUBAGENT_INVOCATION_TEMPLATES.md
2. Personalizar con contexto
3. Invocar subagente
4. Validar resultado

# Delegar tarea compleja

1. Usar template "Pipeline Completo"
2. Definir fases y dependencias
3. Ejecutar fase por fase
4. Validar cada fase antes de continuar

# Validar entregable

1. Verificar checklist de criterios
2. Ejecutar tests si aplica
3. Revisar documentación
4. Aprobar o iterar
```

### Links Rápidos

```markdown
- Estado del proyecto: /agents/shared_context.md
- Templates: /chatGPT/SUBAGENT_INVOCATION_TEMPLATES.md
- Subagentes disponibles: /agents/agents.md
- Documentación técnica: /docs/
- Reglas de orquestación: /chatGPT/JULES_ORCHESTRATION.md
```

---

**Última actualización**: 2025-11-17
**Versión**: 2.0 (Sistema mejorado de subagentes)
