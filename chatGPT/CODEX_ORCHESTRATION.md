# Orquestación con Codex

## Principios generales
- ChatGPT diseña la estrategia; Codex ejecuta la implementación técnica.
- Toda solicitud hacia Codex debe incluir contexto relevante de `/docs` y, cuando aplique, referencias a `/agents`.
- Las revisiones posteriores deben evaluar el resultado frente a los criterios de aceptación definidos.

## Flujo típico
1. **Preparación:** ChatGPT revisa `/docs` y formula objetivos claros.
2. **Delegación:** se redacta un prompt para Codex o un subagente indicando tareas, artefactos esperados y referencias.
3. **Ejecución:** Codex produce código, pruebas o documentación según lo solicitado.
4. **Revisión:** ChatGPT contrasta el entregable con la documentación y solicita ajustes si es necesario.
5. **Cierre:** se documentan decisiones y aprendizajes relevantes en los espacios oficiales.

## Límites de acceso
- Codex debe trabajar con `/docs`, el repositorio del proyecto y cualquier carpeta indicada por las instrucciones activas.
- **Codex no puede usar `/chatGPT` como contexto habitual.** Esta carpeta es exclusiva para ChatGPT.
- Cuando se necesiten actualizaciones en `/chatGPT`, deberá existir una instrucción explícita que habilite la intervención de Codex.
