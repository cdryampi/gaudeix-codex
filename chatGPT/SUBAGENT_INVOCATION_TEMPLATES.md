# Templates de Invocación de Subagentes

> 📋 **Propósito**: Este documento proporciona plantillas estructuradas para invocar subagentes de manera consistente y eficiente, maximizando la calidad de los resultados.

## Cómo Usar estos Templates

1. **Selecciona el template** apropiado según el tipo de tarea
2. **Rellena todos los campos** marcados con `{placeholder}`
3. **Incluye referencias** a `/docs` y `/agents/shared_context.md`
4. **Define criterios** de aceptación claros y verificables
5. **Invoca usando** `runSubagent` (cuando esté disponible) o delegación manual

## Templates por Tipo de Subagente

### 1. Generador Backend

#### Template: Nuevo Endpoint API

````markdown
**Contexto del Proyecto**:

- Proyecto: gaudeix-codex
- Stack: Django 5.x + DRF + PostgreSQL + JWT
- Módulo: {nombre_modulo} (ej: blog, events, users)
- Versión API: v1

**Contexto Compartido**:

- Consultar: `/agents/shared_context.md` para estándares y patrones
- Stack técnico: Django REST Framework con JWT
- Patrones: ViewSets, ModelSerializers, Router

**Tarea Específica**:
Implementar endpoint {MÉTODO} `/api/v1/{recurso}/` con las siguientes características:

**Especificación del Endpoint**:

```
Método: {GET|POST|PUT|PATCH|DELETE}
URL: /api/v1/{recurso}/{id?}/
Autenticación: {JWT requerido|Opcional|Público}
Permisos: {IsAuthenticated|IsAuthenticatedOrReadOnly|Custom}

Request Body (si aplica):
{
  "campo1": "tipo y descripción",
  "campo2": "tipo y descripción"
}

Response Body:
{
  "id": "integer",
  "campo1": "string",
  "created_at": "datetime"
}

Validaciones:
- {validación_1}
- {validación_2}

Casos de error:
- 400: {descripción}
- 401: No autenticado
- 403: Sin permisos
- 404: Recurso no encontrado
```

**Modelos de Datos**:

```python
# Si el modelo ya existe, indicar nombre y ubicación
# Si es nuevo, proporcionar especificación

class {ModelName}(BaseModel):
    campo1 = models.CharField(max_length=200)
    campo2 = models.TextField()
    # ... definir campos requeridos
```

**Referencias de Documentación**:

- `/docs/{documento_relevante}.md`
- `/agents/shared_context.md` - Sección "Backend" y "Patrones"
- Documentación DRF: https://www.django-rest-framework.org/

**Entregables Esperados**:

1. Modelo en `backend/{módulo}/models.py` (si es nuevo)
2. Serializer en `backend/{módulo}/serializers.py`
3. ViewSet/APIView en `backend/{módulo}/views.py`
4. URLs en `backend/{módulo}/urls.py`
5. Tests en `backend/{módulo}/tests/test_views.py`
6. Migración de base de datos (si aplica)
7. Actualización de `README.md` del módulo con documentación del endpoint

**Criterios de Aceptación**:

- [ ] Modelo define todos los campos especificados con tipos correctos
- [ ] Serializer incluye validaciones requeridas
- [ ] ViewSet implementa el método HTTP solicitado
- [ ] URLs están correctamente registradas en el router
- [ ] Tests cubren casos exitosos y de error (mínimo 80% coverage)
- [ ] Migración se ejecuta sin errores
- [ ] Endpoint responde correctamente según especificación
- [ ] Autenticación JWT funciona correctamente
- [ ] CORS permite acceso desde subdominios frontend/backoffice
- [ ] Sin errores de linting (ruff/black)
- [ ] Documentación actualizada

**Restricciones**:

- No modificar configuración de CORS sin consultar
- No cambiar estructura de autenticación JWT
- Seguir convenciones de naming del proyecto
- Mantener compatibilidad con PostgreSQL
- No introducir dependencias nuevas sin aprobación

**Tiempo Estimado**: {15-45 minutos}
**Prioridad**: {P0-blocker|P1-high|P2-medium|P3-low}
````

#### Template: Refactorización Backend

````markdown
**Contexto del Proyecto**:

- Proyecto: gaudeix-codex
- Stack: Django 5.x + DRF + PostgreSQL
- Componente a refactorizar: {nombre_componente}
- Ubicación: `backend/{módulo}/{archivo}.py`

**Contexto Compartido**:

- Consultar: `/agents/shared_context.md`

**Motivación de la Refactorización**:
{Describir por qué es necesaria: performance, mantenibilidad, complejidad, etc.}

**Código Actual**:

```python
# Ubicación: backend/{módulo}/{archivo}.py
# Líneas: {start}-{end}

{pegar código actual a refactorizar}
```

**Problemas Identificados**:

- {problema_1}
- {problema_2}
- {problema_3}

**Mejoras Esperadas**:

- {mejora_1}
- {mejora_2}
- {mejora_3}

**Restricciones**:

- Mantener misma interfaz pública (no breaking changes)
- No afectar tests existentes (deben seguir pasando)
- Mantener compatibilidad con resto del sistema

**Entregables Esperados**:

1. Código refactorizado con mejoras implementadas
2. Tests actualizados si es necesario (manteniendo coverage)
3. Documentación actualizada si cambia comportamiento
4. Comentarios en código para cambios significativos

**Criterios de Aceptación**:

- [ ] Código más legible y mantenible
- [ ] Todos los tests existentes pasan
- [ ] Coverage se mantiene o mejora (>80%)
- [ ] Sin errores de linting
- [ ] Performance igual o mejor
- [ ] Sin breaking changes en API pública

**Tiempo Estimado**: {30-60 minutos}
````

### 2. Generador Frontend

#### Template: Nuevo Componente React

````markdown
**Contexto del Proyecto**:

- Proyecto: gaudeix-codex
- Stack: React 18 + TypeScript + Vite
- Aplicación: {frontend|backoffice}
- Módulo/Feature: {nombre_feature}

**Contexto Compartido**:

- Consultar: `/agents/shared_context.md` - Sección "Frontend"

**Tarea Específica**:
Crear componente React `{ComponentName}` con las siguientes características:

**Especificación del Componente**:

```typescript
// Propósito
{Descripción del componente y su responsabilidad}

// Props
interface {ComponentName}Props {
  prop1: string;          // {descripción}
  prop2: number;          // {descripción}
  onAction?: () => void;  // {descripción}
}

// Comportamiento
- {comportamiento_1}
- {comportamiento_2}

// Estados internos (si aplica)
- {estado_1}: {tipo} - {descripción}
```

**Diseño/UI**:
{Descripción visual, wireframe, o referencia a diseño}

**Integración con API**:

```typescript
// Si el componente consume datos de la API
import { {serviceName} } from '@/services/{service}';

// Endpoint: {método} {url}
// Response: {estructura}
```

**Dependencias UI**:

- Librería de componentes: {Material-UI|Tailwind|ninguna}
- Íconos: {react-icons|heroicons|ninguno}
- Estilos: {CSS Modules|Styled Components|Tailwind}

**Referencias**:

- `/docs/{documento_relevante}.md`
- `/agents/shared_context.md`

**Entregables Esperados**:

1. Componente en `src/components/{ComponentName}/index.tsx`
2. Types en `src/components/{ComponentName}/types.ts`
3. Estilos en `src/components/{ComponentName}/styles.module.css`
4. Tests en `src/components/{ComponentName}/{ComponentName}.test.tsx`
5. Storybook story (si aplica)
6. Actualización de exports en `src/components/index.ts`

**Criterios de Aceptación**:

- [ ] Componente funcional con TypeScript strict
- [ ] Props correctamente tipadas
- [ ] Manejo adecuado de estados y efectos
- [ ] Accesibilidad: labels, aria-\*, roles apropiados
- [ ] Responsive design
- [ ] Tests unitarios (>70% coverage)
- [ ] Sin errores de ESLint
- [ ] Sin warnings de React
- [ ] Documentación JSDoc en componente

**Restricciones**:

- No usar any en TypeScript
- Seguir convenciones de naming del proyecto
- No introducir dependencias sin aprobación
- Optimizar re-renders (React.memo si es necesario)

**Tiempo Estimado**: {20-45 minutos}
````

### 3. Auditor Backend

#### Template: Auditoría de Código

````markdown
**Contexto de Auditoría**:

- Proyecto: gaudeix-codex
- Componente: {nombre_componente}
- Tipo de auditoría: {Código|Arquitectura|Seguridad|Performance}
- Alcance: {módulo|endpoint|feature completa}

**Contexto Compartido**:

- Consultar: `/agents/shared_context.md`

**Archivos a Auditar**:

```
backend/{módulo}/models.py
backend/{módulo}/serializers.py
backend/{módulo}/views.py
backend/{módulo}/tests/test_*.py
{otros archivos relevantes}
```

**Cambios Recientes** (contexto):
{Descripción de qué se implementó recientemente y por qué se requiere auditoría}

**Checklist de Revisión**:

**1. Cumplimiento de Estándares**:

- [ ] Sigue convenciones de naming (PEP 8)
- [ ] Usa type hints apropiadamente
- [ ] Docstrings presentes y completos
- [ ] Sin violaciones de linting (ruff/black)
- [ ] Estructura de archivos coherente con proyecto

**2. Seguridad**:

- [ ] Validación de inputs en serializers
- [ ] Autenticación JWT correctamente implementada
- [ ] Permisos adecuados en ViewSets
- [ ] Sin queries vulnerables a SQL injection (usar ORM)
- [ ] CORS configurado correctamente
- [ ] Secrets no hardcodeados
- [ ] Sanitización de datos de usuario

**3. Performance**:

- [ ] Queries optimizadas (select_related, prefetch_related)
- [ ] Paginación implementada donde corresponde
- [ ] Índices de BD apropiados
- [ ] Sin N+1 queries
- [ ] Caching implementado si es necesario

**4. Mantenibilidad**:

- [ ] Código DRY (sin duplicación)
- [ ] Funciones/métodos con responsabilidad única
- [ ] Complejidad ciclomática aceptable
- [ ] Fácil de entender y modificar
- [ ] Comentarios solo donde sean necesarios

**5. Testing**:

- [ ] Coverage >80%
- [ ] Tests unitarios para lógica de negocio
- [ ] Tests de integración para endpoints
- [ ] Casos edge cubiertos
- [ ] Tests de validaciones y errores

**6. Arquitectura**:

- [ ] Separación de responsabilidades clara
- [ ] Modelos bien diseñados
- [ ] Serializers apropiados para casos de uso
- [ ] ViewSets/APIViews según complejidad
- [ ] Coherente con patrones del proyecto

**Referencias**:

- `/docs/{estándares}.md`
- `/agents/shared_context.md` - Secciones de estándares y seguridad

**Resultado Esperado**:
Reporte detallado con la siguiente estructura:

```markdown
# Reporte de Auditoría: {Componente}

## Resumen Ejecutivo

- Estado general: {🟢 Aprobado | 🟡 Aprobado con observaciones | 🔴 Rechazado}
- Hallazgos críticos: {número}
- Hallazgos menores: {número}
- Recomendaciones: {número}

## Hallazgos por Severidad

### 🔴 Críticos (Bloquean aprobación)

1. **{Título del hallazgo}**
   - Ubicación: {archivo}:{línea}
   - Descripción: {qué está mal}
   - Impacto: {consecuencias}
   - Recomendación: {cómo corregir}

### 🟡 Advertencias (Mejoras recomendadas)

1. **{Título}**
   - Ubicación: {archivo}:{línea}
   - Descripción: {qué podría mejorar}
   - Beneficio: {por qué mejorarlo}
   - Sugerencia: {cómo mejorar}

### ℹ️ Informativo (Opcional)

1. **{Título}**
   - Descripción: {observación}
   - Sugerencia: {mejora opcional}

## Análisis Detallado

### Seguridad

{Evaluación de aspectos de seguridad}

### Performance

{Evaluación de performance}

### Mantenibilidad

{Evaluación de mantenibilidad}

### Testing

{Evaluación de cobertura y calidad de tests}

## Métricas

- Cobertura de tests: {porcentaje}%
- Complejidad ciclomática: {promedio}
- Líneas de código: {número}
- Archivos revisados: {número}

## Recomendaciones Priorizadas

1. {Recomendación P0}
2. {Recomendación P1}
3. {Recomendación P2}

## Conclusión

{Resumen y decisión final sobre aprobación}
```

**Tiempo Estimado**: {30-60 minutos}
````

### 4. Tester Backend

#### Template: Suite de Tests

````markdown
**Contexto de Testing**:

- Proyecto: gaudeix-codex
- Componente: {nombre_componente}
- Tipo de tests: {Unitarios|Integración|Performance|E2E}
- Alcance: {módulo|endpoint|feature}

**Contexto Compartido**:

- Consultar: `/agents/shared_context.md`

**Código a Testear**:

```
backend/{módulo}/{archivos}
```

**Especificación de Tests Requeridos**:

**1. Tests Unitarios** (modelos, serializers, utilidades):

```python
# Tests para: {componente}

Casos a cubrir:
- ✅ Caso feliz: {descripción}
- ✅ Validación exitosa: {descripción}
- ❌ Validación fallida: {descripción}
- ❌ Edge case: {descripción}
```

**2. Tests de Integración** (endpoints API):

```python
# Tests para: {endpoint}

Escenarios:
- GET/POST/PUT/DELETE exitosos
- Autenticación requerida (401)
- Permisos insuficientes (403)
- Recurso no encontrado (404)
- Validación de datos (400)
- Paginación y filtros
```

**3. Tests de Performance** (si aplica):

```python
# Validar:
- Tiempo de respuesta < {threshold} ms
- Sin N+1 queries
- Memoria utilizada
```

**Fixtures y Setup**:

```python
# Datos de prueba requeridos
{descripción de fixtures necesarios}
```

**Referencias**:

- `/agents/shared_context.md` - Sección "Testing"
- Documentación pytest: https://docs.pytest.org/

**Entregables Esperados**:

1. Tests en `backend/{módulo}/tests/test_{componente}.py`
2. Fixtures en `backend/{módulo}/tests/conftest.py` (si es necesario)
3. Reporte de coverage
4. Documentación de cómo ejecutar los tests

**Criterios de Aceptación**:

- [ ] Todos los tests pasan exitosamente
- [ ] Coverage del código testeado >80%
- [ ] Tests son independientes (no dependen de orden)
- [ ] Tests son repetibles (idempotentes)
- [ ] Fixtures apropiados y reutilizables
- [ ] Nombres descriptivos de tests
- [ ] Sin warnings de pytest
- [ ] Documentación clara de qué testea cada caso

**Ejecución y Validación**:

```bash
# Comandos a ejecutar
pytest backend/{módulo}/tests/ -v
pytest backend/{módulo}/tests/ --cov=backend/{módulo} --cov-report=html

# Resultado esperado
- Todos los tests pasan
- Coverage >80%
- Sin errores ni warnings
```

**Tiempo Estimado**: {30-60 minutos}
````

### 5. Integrador

#### Template: Preparación de Release

````markdown
**Contexto de Integración**:

- Proyecto: gaudeix-codex
- Tipo: {Release|Hotfix|Feature merge}
- Versión: {X.Y.Z}
- Branch origen: {feature-branch}
- Branch destino: {main|develop}

**Contexto Compartido**:

- Consultar: `/agents/shared_context.md`

**Cambios Incluidos**:

```markdown
# PRs a Integrar:

- PR #{número}: {título} - {área afectada}
- PR #{número}: {título} - {área afectada}

# Commits directos (si aplica):

- {hash}: {mensaje}
```

**Checklist Pre-Integración**:

**1. Validaciones Técnicas**:

- [ ] Todos los tests pasan en CI/CD
- [ ] Auditorías completadas y aprobadas
- [ ] Sin conflictos de merge
- [ ] Migrations aplicables sin errores
- [ ] Sin breaking changes no documentados

**2. Documentación**:

- [ ] CHANGELOG.md actualizado
- [ ] README.md actualizado si aplica
- [ ] Documentación de API actualizada
- [ ] Variables de entorno documentadas

**3. Seguridad**:

- [ ] Sin secrets expuestos
- [ ] Dependencias sin vulnerabilidades críticas
- [ ] CORS y autenticación correctas

**4. Despliegue**:

- [ ] Variables de entorno en Dokploy configuradas
- [ ] Docker Compose validado
- [ ] Plan de rollback preparado
- [ ] Healthchecks definidos

**Referencias**:

- `/docs/deployment.md`
- `/agents/shared_context.md`

**Plan de Integración**:

```markdown
1. **Preparación** (T-24h):

   - Merge de {branch} a {target}
   - Ejecutar suite completa de tests
   - Build de imágenes Docker
   - Tag de versión: v{X.Y.Z}

2. **Despliegue Staging** (T-4h):

   - Deploy a staging environment
   - Smoke tests
   - Validación de subdominios

3. **Despliegue Producción** (T):

   - Backup de base de datos
   - Deploy a producción vía Dokploy
   - Validación de healthchecks
   - Monitoreo activo 2h

4. **Post-Despliegue** (T+2h):
   - Verificación de logs
   - Métricas de performance
   - Confirmación de todos los servicios
   - Comunicación a stakeholders
```

**Rollback Plan**:

```markdown
Si falla el despliegue:

1. Revertir a imagen Docker anterior
2. Restaurar backup de BD (si hubo migrations)
3. Verificar servicios
4. Comunicar incidente
5. Post-mortem
```

**Comunicación**:

```markdown
# Notificación Pre-Deploy

- A: {equipo}
- Cuándo: T-24h
- Contenido: Cambios, horario, impacto esperado

# Notificación Post-Deploy

- A: {equipo}
- Cuándo: T+2h
- Contenido: Estado, métricas, issues conocidos
```

**Entregables Esperados**:

1. Branch integrado exitosamente
2. Tag de versión creado
3. CHANGELOG actualizado
4. Reporte post-deploy con métricas
5. Documentación de issues encontrados

**Criterios de Aceptación**:

- [ ] Merge limpio sin conflictos
- [ ] Todos los subdominios operativos
- [ ] Tests pasan en todos los entornos
- [ ] Sin errores en logs críticos
- [ ] Performance dentro de SLAs
- [ ] Rollback plan probado

**Tiempo Estimado**: {2-4 horas}
````

### 6. GitHub Agent

#### Template: Creación de Issues desde Backlog

````markdown
**Contexto**:

- Proyecto: gaudeix-codex
- Repository: cdryampi/gaudeix-codex
- Fuente: `/docs/migration_issues.md`

**Tarea**:
Crear issues en GitHub según el backlog de migración documentado.

**Proceso**:

1. **Leer backlog**:

   - Archivo: `/docs/migration_issues.md`
   - Extraer todos los issues listados

2. **Verificar labels**:

   - Consultar: `/docs/GITHUB_LABELS.md`
   - Validar que todas las labels existan en el repo
   - Crear labels faltantes con colores exactos

3. **Crear issues**:
   Para cada issue en el backlog:

   ```markdown
   Title: {título del issue}

   Body:
   {cuerpo detallado del issue}

   Labels:

   - type/{tipo}
   - area/{área}
   - priority/{prioridad}
   - size/{tamaño} (si está definido)
   - status/ready (o el estado que corresponda)
   ```

4. **Validar**:
   - Confirmar creación exitosa
   - Verificar labels aplicadas correctamente
   - Documentar issues creados

**Referencias**:

- `/docs/migration_issues.md`
- `/docs/GITHUB_LABELS.md`
- `/agents/shared_context.md`

**Entregables**:

1. Lista de issues creados con URLs
2. Reporte de labels creadas (si hubo)
3. Documentación de errores (si los hubo)

**Criterios de Aceptación**:

- [ ] Todos los issues del backlog creados
- [ ] Labels correctamente aplicadas
- [ ] Issues navegables y bien formateados
- [ ] Sin duplicados

**Tiempo Estimado**: {15-30 minutos}
````

## Templates Especializados

### Coordinación Multi-Agente

#### Template: Pipeline Completo (Feature Nueva)

```markdown
**Objetivo Final**:
Implementar feature completa: {descripción de la feature}

**Contexto Compartido**:

- Consultar: `/agents/shared_context.md`

**Pipeline de Ejecución**:

### Fase 1: Generación Backend

**Subagente**: Generador Backend
**Input**:
{usar template "Nuevo Endpoint API"}

**Output Esperado**:

- API endpoint implementado
- Tests básicos
- Documentación

**Criterios de Paso a Fase 2**:

- [ ] Tests pasan
- [ ] Sin errores de linting

---

### Fase 2: Testing Backend

**Subagente**: Tester Backend
**Input**:

- Código generado en Fase 1
  {usar template "Suite de Tests"}

**Output Esperado**:

- Suite completa de tests
- Reporte de coverage

**Criterios de Paso a Fase 3**:

- [ ] Coverage >80%
- [ ] Todos los tests pasan

---

### Fase 3: Auditoría Backend

**Subagente**: Auditor Backend
**Input**:

- Código de Fase 1
- Tests de Fase 2
  {usar template "Auditoría de Código"}

**Output Esperado**:

- Reporte de auditoría
- Lista de mejoras

**Criterios de Paso a Fase 4**:

- [ ] Sin hallazgos críticos
- [ ] Aprobación de auditoría

---

### Fase 4: Generación Frontend

**Subagente**: Generador Frontend
**Input**:

- API documentada (Fase 1)
  {usar template "Nuevo Componente React"}

**Output Esperado**:

- Componentes React
- Integración con API
- Tests unitarios

---

### Fase 5: Integración Final

**Subagente**: Integrador
**Input**:

- Backend (Fases 1-3)
- Frontend (Fase 4)
  {usar template "Preparación de Release"}

**Output Esperado**:

- Feature integrada
- Documentación completa
- Release notes

---

**Director Técnico (ChatGPT)**:

- Orquesta el pipeline
- Valida cada fase
- Toma decisiones de go/no-go
- Gestiona iteraciones si hay rechazos
- Documenta aprendizajes

**Tiempo Total Estimado**: {2-4 horas}
```

## Notas de Uso

### Para el Director Técnico (ChatGPT)

1. **Selección de Template**:

   - Elige el template apropiado al tipo de tarea
   - Adapta el template al contexto específico
   - No omitas secciones importantes

2. **Personalización**:

   - Rellena todos los placeholders `{variable}`
   - Añade contexto específico de la tarea
   - Ajusta criterios de aceptación según necesidad

3. **Referencias**:

   - Siempre incluye `/agents/shared_context.md`
   - Apunta a documentación específica en `/docs`
   - Proporciona links a documentación externa si es útil

4. **Validación**:
   - Verifica que el prompt tenga toda la información necesaria
   - Confirma que los criterios son verificables
   - Asegura que las restricciones están claras

### Para Subagentes (cuando usen estos templates)

1. **Lectura Completa**:

   - Lee el template completo antes de empezar
   - Consulta todas las referencias mencionadas
   - Entiende los criterios de aceptación

2. **Auto-Validación**:

   - Verifica cada criterio antes de retornar
   - Ejecuta tests si se requieren
   - Valida contra estándares del proyecto

3. **Comunicación**:
   - Si falta información, repórtalo inmediatamente
   - Si encuentras bloqueadores, documenta claramente
   - Proporciona contexto en tus respuestas

## Actualización de Templates

Estos templates deben evolucionar con el proyecto. Actualiza cuando:

- Se identifiquen campos faltantes recurrentemente
- Cambien los estándares del proyecto
- Se añadan nuevos tipos de tareas
- Se detecten ambigüedades o errores

**Responsable**: Director Técnico (ChatGPT)

```

```
