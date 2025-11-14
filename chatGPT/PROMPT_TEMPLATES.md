# Plantillas de prompts para Codex y subagentes

Usa estas guías como base y adáptalas según el contexto real. Siempre incluye referencias a `/docs` y a las reglas definidas en `/agents`.

## Solicitud de implementación al subagente generador
```
Contexto:
- Resumen del objetivo.
- Referencias a `/docs` relevantes (archivos y secciones específicas).

Tarea:
- Lista detallada de cambios esperados.
- Restricciones técnicas o de estilo.

Entregables:
- Archivos a modificar o crear.
- Pruebas o validaciones requeridas.

Criterios de aceptación:
- Puntos verificables para confirmar el éxito de la tarea.
```

## Solicitud de auditoría o revisión
```
Contexto:
- Descripción del entregable recibido.
- Referencias a `/docs` y a los estándares aplicables.

Tarea:
- Checklist de aspectos a validar (funcionalidad, estilo, seguridad, etc.).

Resultado esperado:
- Informe con hallazgos, riesgos y recomendaciones.
```

## Coordinación entre subagentes
```
Objetivo:
- Resultado final deseado y motivo.

Flujo propuesto:
1. Subagente A realiza acción X.
2. Subagente B revisa o complementa.
3. ChatGPT verifica con base en `/docs`.

Notas adicionales:
- Dependencias, tiempos límite o validaciones cruzadas necesarias.
```
