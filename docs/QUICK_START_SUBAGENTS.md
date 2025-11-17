# ⚡ Quick Start - Sistema Mejorado de Subagentes

> 📌 **Para empezar inmediatamente** con el nuevo sistema

## 🎯 En 5 Minutos

### Si eres Director Técnico (ChatGPT)

1. **Lee esto primero**: [`/agents/shared_context.md`](../agents/shared_context.md)

   - Estado del proyecto
   - Stack técnico
   - Estándares

2. **Abre esto cuando delegues**: [`/chatGPT/SUBAGENT_INVOCATION_TEMPLATES.md`](../chatGPT/SUBAGENT_INVOCATION_TEMPLATES.md)

   - Busca el template apropiado
   - Copia y personaliza
   - Delega a Codex

3. **Consulta cuando dudes**: [`/chatGPT/WORKFLOW_GUIDE.md`](../chatGPT/WORKFLOW_GUIDE.md)
   - Workflow completo
   - Troubleshooting
   - Ejemplos

### Si eres Subagente (Codex)

1. **Lee esto SIEMPRE antes de empezar**: [`/agents/shared_context.md`](../agents/shared_context.md)

2. **Lee tu definición**: `/agents/{tu_subagente}.md`

   - Tu prompt de sistema
   - Tus herramientas
   - Tu workflow

3. **Auto-valida antes de retornar**:
   - Checklist en tu definición
   - Tests, linting, documentación
   - Solo retorna si todo ✅

## 💡 Ejemplo Práctico (10 Minutos)

### Tarea: Crear endpoint GET /api/v1/posts/

#### Paso 1: Director Técnico Prepara

```markdown
1. Abre /chatGPT/SUBAGENT_INVOCATION_TEMPLATES.md
2. Busca: "Template: Nuevo Endpoint API"
3. Copia el template completo
```

#### Paso 2: Personaliza el Template

```markdown
Reemplaza:

- {nombre_modulo}: blog
- {MÉTODO}: GET
- {recurso}: posts
- {Autenticación}: Opcional (público)
- {Permisos}: IsAuthenticatedOrReadOnly

Define criterios:
□ Tests >80%
□ Paginación implementada
□ Sin errores linting
□ Documentado en README
```

#### Paso 3: Añade Contexto

```markdown
Referencias:

- /agents/shared_context.md - Sección "Backend"
- Modelo Post ya existe en backend/blog/models.py
```

#### Paso 4: Delega

```markdown
Invoca a Codex con:

"Actúa como Generador Backend.

[pega el template completo personalizado]

Consulta /agents/shared_context.md para estándares.
"
```

#### Paso 5: Codex Ejecuta

```markdown
Generador Backend (Codex):

1. Lee /agents/shared_context.md
2. Lee /agents/generador_backend.md (su definición)
3. Sigue workflow interno:
   - Analiza modelo Post existente
   - Crea PostSerializer
   - Crea PostViewSet
   - Configura URLs
   - Escribe tests
   - Ejecuta validaciones
4. Auto-valida:
   □ pytest - todos pasan
   □ coverage >80%
   □ ruff check - sin errores
   □ black --check - formateado OK
   □ README actualizado
5. Retorna código + evidencias
```

#### Paso 6: Director Valida

```markdown
Director Técnico (ChatGPT):

1. Revisa entregables contra criterios
2. Verifica evidencias (logs de tests, coverage)
3. Si OK: Aprueba
4. Si NO: Feedback específico y re-delega
```

**Total**: ~15-20 minutos para implementación completa

## 📚 Documentos Clave

### Must Read (Orden de lectura)

1. **README.md** - Visión general y sistema de subagentes
2. **`/docs/SUBAGENT_IMPLEMENTATION_GUIDE.md`** - Guía práctica completa
3. **`/agents/shared_context.md`** - Estado del proyecto (leer siempre)
4. **`/chatGPT/WORKFLOW_GUIDE.md`** - Workflow detallado
5. **`/chatGPT/SUBAGENT_INVOCATION_TEMPLATES.md`** - Templates

### Para Profundizar

6. **`/docs/SUBAGENT_SYSTEM_IMPROVEMENTS.md`** - Análisis técnico
7. **`/docs/SUBAGENT_IMPROVEMENTS_SUMMARY.md`** - Resumen completo
8. **`/agents/{subagente}.md`** - Definición de cada subagente

## 🎓 Casos de Uso Rápidos

### Caso 1: Tarea Simple (5-10 min)

```markdown
Tarea: Añadir campo "slug" al modelo Post

Director:
→ Template: "Refactorización Backend" (simplificado)
→ Subagente: Generador Backend
→ Criterios: Migración OK, tests pasan

Generador:
→ Añade campo slug
→ Crea migración
→ Actualiza serializer
→ Tests OK
→ Retorna
```

### Caso 2: Tarea Media (30-45 min)

```markdown
Tarea: Implementar endpoint POST /api/v1/posts/

Director:
→ Template: "Nuevo Endpoint API" completo
→ Pipeline: Generador → Tester → Auditor

Generador Backend:
→ Serializer con validaciones
→ ViewSet con IsAuthenticated
→ Tests básicos
→ Retorna

Tester Backend:
→ Suite completa de tests
→ Coverage >80%
→ Retorna

Auditor Backend:
→ Revisa seguridad
→ Aprueba o sugiere mejoras
→ Retorna
```

### Caso 3: Feature Completa (2-3 horas)

```markdown
Tarea: Sistema de categorías para posts

Director:
→ Template: "Pipeline Completo"
→ Fases:

1. Backend API (Generador)
2. Tests (Tester)
3. Auditoría (Auditor)
4. Frontend UI (Generador)
5. Tests Frontend (Tester)
6. Integración (Integrador)

Ejecutar fase por fase validando cada una
```

## 🚦 Checklist de Adopción

### Primera Vez Usando el Sistema

**Director Técnico**:

- [ ] Leí `/agents/shared_context.md` completo
- [ ] Entiendo el workflow de 6 fases
- [ ] Sé dónde encontrar templates
- [ ] Probé delegar una tarea simple
- [ ] Validé resultado contra criterios

**Subagente (Codex)**:

- [ ] Leí `/agents/shared_context.md`
- [ ] Leí mi definición en `/agents/{mi_subagente}.md`
- [ ] Entiendo mi workflow interno
- [ ] Sé qué herramientas puedo usar
- [ ] Conozco mis criterios de auto-validación

### Uso Regular

**Antes de cada delegación**:

- [ ] Consulté `/agents/shared_context.md` para estado actual
- [ ] Seleccioné template apropiado
- [ ] Personalicé todos los placeholders
- [ ] Definí criterios verificables
- [ ] Incluí referencias a `/docs`

**Antes de retornar resultado**:

- [ ] Auto-validé contra checklist
- [ ] Tests pasan (si aplica)
- [ ] Linting OK (si aplica)
- [ ] Documentación actualizada (si aplica)
- [ ] Preparé evidencias

## ⚠️ Errores Comunes y Soluciones

### ❌ Error: "No sé qué subagente usar"

✅ **Solución**:

- Backend API/lógica → Generador Backend
- Frontend UI/componentes → Generador Frontend
- Revisar calidad → Auditor (Backend o Frontend)
- Probar código → Tester (Backend o Frontend)
- Deploy/merge → Integrador
- GitHub issues/PRs → GitHub Agent

### ❌ Error: "El template no tiene lo que necesito"

✅ **Solución**:

1. Usa el template más cercano
2. Añade secciones personalizadas
3. Documenta la mejora para futuras versiones
4. Considera crear nuevo template si es recurrente

### ❌ Error: "Subagente no entiende el contexto"

✅ **Solución**:

1. Verifica que incluiste `/agents/shared_context.md` en el prompt
2. Añade referencias específicas a `/docs`
3. Proporciona ejemplo concreto
4. Simplifica el scope si es muy amplio

### ❌ Error: "Resultado no cumple criterios"

✅ **Solución**:

1. Revisa si criterios fueron claros en prompt
2. Da feedback específico sobre qué falla
3. Re-delega con criterios más explícitos
4. Verifica que subagente tiene herramientas necesarias

## 🎯 Próximo Paso

**Acción inmediata**: Delega tu primera tarea usando el nuevo sistema

1. Identifica una tarea pequeña (añadir campo, crear endpoint simple, etc.)
2. Abre `/chatGPT/SUBAGENT_INVOCATION_TEMPLATES.md`
3. Selecciona template apropiado
4. Personaliza y delega
5. Valida resultado
6. Documenta aprendizajes

**Después de 3-5 delegaciones**:

- Habrás internalizado el workflow
- Templates serán naturales
- Criterios serán más claros
- Calidad será consistente

## 📞 ¿Necesitas Ayuda?

**Documentación**:

- Guía completa: `/docs/SUBAGENT_IMPLEMENTATION_GUIDE.md`
- Troubleshooting: `/chatGPT/WORKFLOW_GUIDE.md` sección 9
- Casos de uso: `/docs/SUBAGENT_IMPLEMENTATION_GUIDE.md` sección "Casos de Uso"

**Actualizaciones**:

- Estado del proyecto: `/agents/shared_context.md`
- Mejoras del sistema: `/docs/SUBAGENT_IMPROVEMENTS_SUMMARY.md`

---

**Última actualización**: 2025-11-17
**Versión**: 2.0
**Status**: ✅ Sistema operativo

🚀 **¡Empieza ahora!** El sistema está listo para usar.
