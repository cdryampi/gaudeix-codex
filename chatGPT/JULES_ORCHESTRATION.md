# Orquestación con Jules

## Principios generales

- Google AI diseña la estrategia; Jules ejecuta la implementación técnica.
- Toda solicitud hacia Jules debe incluir contexto relevante de `/docs` y, cuando aplique, referencias a `/agents`.
- Las revisiones posteriores deben evaluar el resultado frente a los criterios de aceptación definidos.

## Flujo típico

1. **Preparación:** Google AI revisa `/docs` y formula objetivos claros.
2. **Delegación:** se redacta un prompt para Jules o un subagente indicando tareas, artefactos esperados y referencias.
3. **Ejecución:** Jules produce código, pruebas o documentación según lo solicitado.
4. **Revisión:** Google AI contrasta el entregable con la documentación y solicita ajustes si es necesario.
5. **Cierre:** se documentan decisiones y aprendizajes relevantes en los espacios oficiales.

## Límites de acceso

- Jules debe trabajar con `/docs`, el repositorio del proyecto y cualquier carpeta indicada por las instrucciones activas.
- **Jules no puede usar `/chatGPT` como contexto habitual.** Esta carpeta es exclusiva para Google AI.
- Cuando se necesiten actualizaciones en `/chatGPT`, deberá existir una instrucción explícita que habilite la intervención de Jules.
