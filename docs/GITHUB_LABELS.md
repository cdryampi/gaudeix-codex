# GITHUB LABELS

## Introducción
Las labels de GitHub nos permiten clasificar issues y pull requests para priorizarlos y coordinarnos mejor. Esta guía resume las etiquetas estándar del proyecto para que cualquier persona pueda aplicarlas de forma consistente.

## Convenciones generales
- Los prefijos `type/*`, `area/*`, `priority/*`, `status/*` y `size/*` indican la categoría de cada label.
- Al crear o actualizar un issue o pull request es recomendable combinar al menos:
  - 1 label `type/*` para describir la naturaleza del trabajo.
  - 1 label `area/*` para señalar el ámbito impactado.
  - 1 label `priority/*` para reflejar urgencia o impacto.
- Las labels `status/*` describen el estado del trabajo dentro del flujo (por ejemplo, listo, en progreso o bloqueado).
- Las labels `size/*` ayudan a estimar el esfuerzo relativo y facilitan la planificación.

## Tabla de labels
| Nombre               | Categoría | Descripción (ES)                                        | Color HEX |
|----------------------|-----------|---------------------------------------------------------|-----------|
| type/feature         | type      | Nueva funcionalidad o mejora visible para usuarios.     | 1D76DB    |
| type/bug             | type      | Corrección de un error que afecta al comportamiento esperado. | D73A4A    |
| type/chore           | type      | Tarea de mantenimiento, limpieza o actualización menor. | FBCA04    |
| type/refactor        | type      | Refactorización interna sin cambios funcionales.        | C5DEF5    |
| type/docs            | type      | Trabajo relacionado con documentación.                  | 5319E7    |
| type/spike           | type      | Investigación, prototipo o validación rápida de ideas.  | 0E8A16    |
| area/frontend        | area      | Código de interfaz de usuario, componentes y estilos.   | F9D0C4    |
| area/backend         | area      | APIs, lógica de negocio, integraciones y base de datos. | FEE39F    |
| area/infra           | area      | Infraestructura, IaC, CI/CD y despliegues.              | C2E0C6    |
| area/devops          | area      | Pipelines, observabilidad y tooling operativo.          | C5F1FF    |
| area/docs            | area      | Documentación funcional o técnica del proyecto.         | E4E669    |
| priority/P0-blocker  | priority  | Bloqueante: requiere atención inmediata.                | B60205    |
| priority/P1-high     | priority  | Alta prioridad: debe atenderse pronto.                  | D93F0B    |
| priority/P2-medium   | priority  | Prioridad media: importante pero no urgente.            | FBCA04    |
| priority/P3-low      | priority  | Prioridad baja: se puede planificar más adelante.       | 0E8A16    |
| status/ready         | status    | Listo para que alguien lo tome.                         | 0E8A16    |
| status/in-progress   | status    | Trabajo actualmente en curso.                           | 1D76DB    |
| status/blocked       | status    | Bloqueado por dependencias externas o problemas pendientes. | D73A4A    |
| status/needs-review  | status    | Requiere revisión técnica o funcional.                  | 5319E7    |
| status/needs-info    | status    | Falta información o aclaraciones para avanzar.          | FEE39F    |
| status/done          | status    | Trabajo completado y aprobado.                          | 7057FF    |
| size/XS              | size      | Esfuerzo mínimo, menos de media jornada.                | BFE5BF    |
| size/S               | size      | Esfuerzo pequeño, hasta una jornada.                    | 99D1B9    |
| size/M               | size      | Esfuerzo medio, entre una y dos jornadas.               | 6FBA82    |
| size/L               | size      | Esfuerzo grande, varios días de trabajo.                | 3E8E41    |
| size/XL              | size      | Esfuerzo muy grande, requiere planificación dedicada.   | 196127    |

## Guía de uso
### Ejemplos de combinación de labels
- Feature de frontend prioritaria:
  - `type/feature`, `area/frontend`, `priority/P1-high`, `size/M`
  - Se busca implementar una nueva capacidad de interfaz visible y con impacto alto.
- Bug crítico en backend que bloquea:
  - `type/bug`, `area/backend`, `priority/P0-blocker`, `status/blocked`, `size/S`
  - Sirve para destacar errores severos en la API que impiden avanzar hasta su resolución.
  - Tarea de documentación:
  - `type/docs`, `area/docs`, `priority/P2-medium`, `size/XS`
  - Permite planificar actualizaciones de documentación sin urgencia inmediata.

Estas combinaciones son orientativas; ajusta las labels según el contexto real del trabajo.

## Cómo crear las labels en un repositorio nuevo
> Usa `gh` (GitHub CLI) autenticado con un token que tenga permisos sobre el repo. Ejecuta el siguiente script desde la raíz del proyecto para crear todas las labels definidas en esta guía.

```bash
#!/usr/bin/env bash
set -euo pipefail

cat <<'JSON' | gh api --method PUT -H "Accept: application/vnd.github+json" \
  /repos/:owner/:repo/labels --input -
[
  {"name":"type/feature","color":"1D76DB","description":"Nueva funcionalidad o mejora visible para usuarios."},
  {"name":"type/bug","color":"D73A4A","description":"Corrección de un error que afecta al comportamiento esperado."},
  {"name":"type/chore","color":"FBCA04","description":"Tarea de mantenimiento, limpieza o actualización menor."},
  {"name":"type/refactor","color":"C5DEF5","description":"Refactorización interna sin cambios funcionales."},
  {"name":"type/docs","color":"5319E7","description":"Trabajo relacionado con documentación."},
  {"name":"type/spike","color":"0E8A16","description":"Investigación, prototipo o validación rápida de ideas."},
  {"name":"area/frontend","color":"F9D0C4","description":"Código de interfaz de usuario, componentes y estilos."},
  {"name":"area/backend","color":"FEE39F","description":"APIs, lógica de negocio, integraciones y base de datos."},
  {"name":"area/infra","color":"C2E0C6","description":"Infraestructura, IaC, CI/CD y despliegues."},
  {"name":"area/devops","color":"C5F1FF","description":"Pipelines, observabilidad y tooling operativo."},
  {"name":"area/docs","color":"E4E669","description":"Documentación funcional o técnica del proyecto."},
  {"name":"priority/P0-blocker","color":"B60205","description":"Bloqueante: requiere atención inmediata."},
  {"name":"priority/P1-high","color":"D93F0B","description":"Alta prioridad: debe atenderse pronto."},
  {"name":"priority/P2-medium","color":"FBCA04","description":"Prioridad media: importante pero no urgente."},
  {"name":"priority/P3-low","color":"0E8A16","description":"Prioridad baja: se puede planificar más adelante."},
  {"name":"status/ready","color":"0E8A16","description":"Listo para que alguien lo tome."},
  {"name":"status/in-progress","color":"1D76DB","description":"Trabajo actualmente en curso."},
  {"name":"status/blocked","color":"D73A4A","description":"Bloqueado por dependencias externas o problemas pendientes."},
  {"name":"status/needs-review","color":"5319E7","description":"Requiere revisión técnica o funcional."},
  {"name":"status/needs-info","color":"FEE39F","description":"Falta información o aclaraciones para avanzar."},
  {"name":"status/done","color":"7057FF","description":"Trabajo completado y aprobado."},
  {"name":"size/XS","color":"BFE5BF","description":"Esfuerzo mínimo, menos de media jornada."},
  {"name":"size/S","color":"99D1B9","description":"Esfuerzo pequeño, hasta una jornada."},
  {"name":"size/M","color":"6FBA82","description":"Esfuerzo medio, entre una y dos jornadas."},
  {"name":"size/L","color":"3E8E41","description":"Esfuerzo grande, varios días de trabajo."},
  {"name":"size/XL","color":"196127","description":"Esfuerzo muy grande, requiere planificación dedicada."}
]
JSON
```

### Aplicación rápida de labels sugeridas
- Para issues del backlog de migración, aplica al menos una label `type/*`, una `area/*`, una `priority/*` y añade `size/*` según estimación.
- Usa `status/ready` para issues listos para ser tomados y `status/in-progress` al asignar a alguien.
