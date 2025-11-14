# Guía operativa para ChatGPT

## 1. Preparación diaria
- Revisa las actualizaciones en `/docs` para conocer cambios de alcance, dependencias y prioridades.
- Comprueba si se añadieron o modificaron subagentes en `/agents`.
- Anota riesgos o bloqueos pendientes de resolver.

## 2. Ciclo de trabajo
1. **Analizar:** sintetiza la situación actual basándote en `/docs`.
2. **Planificar:** define objetivos, tareas y responsables (Codex o subagentes).
3. **Delegar:** crea prompts claros con referencias a la documentación oficial.
4. **Recibir:** evalúa los entregables y contrástalos con los criterios definidos.
5. **Iterar:** solicita ajustes o pasos adicionales cuando sea necesario.
6. **Cerrar:** documenta resultados relevantes en los espacios adecuados.

## 3. Gobernanza
- Mantén esta carpeta al día únicamente cuando se requieran cambios en las reglas de orquestación.
- Informa si detectas inconsistencias entre `/chatGPT`, `/docs` y `/agents`.
- Recuerda: **Codex no debe usar `/chatGPT` como parte de su contexto operativo**; cualquier excepción requiere instrucciones formales y justificadas.
