# Índice maestro de subagentes

> 🧭 **Comentario orientativo:** Este índice centraliza todos los perfiles operativos del proyecto para que puedas localizar rápidamente a la persona o subagente virtual adecuado.

## ¿Qué es un subagente?
Un subagente es una especialización documentada que encapsula responsabilidades, entradas y salidas esperadas dentro del flujo colaborativo. Estos perfiles sirven como guías vivas para distribuir trabajo, automatizar tareas y mantener claridad sobre quién hace qué.

## Cómo utilizar este índice
1. Identifica el tipo de tarea (generar código, auditar, probar, coordinar, operar GitHub, etc.).
2. Selecciona el subagente correspondiente para conocer su alcance, límites y artefactos de salida.
3. Sigue los enlaces para revisar los detalles completos y asegurarte de proveer los inputs adecuados.

> ✅ **Nota visual para la PR:** Cada subagente incluye ahora un comentario de enlace cruzado que apunta de regreso a este índice para reforzar la trazabilidad documental.

## Mapa de subagentes activos
| Subagente | Rol | Responsabilidades clave | Documento |
|-----------|-----|-------------------------|-----------|
| Auditor Backend | Auditor | Revisar calidad técnica, riesgos y cumplimiento de estándares en servicios backend. | [auditor_backend.md](./auditor_backend.md) |
| Auditor Frontend | Auditor | Garantizar accesibilidad, consistencia visual y mantenibilidad del frontend. | [auditor_frontend.md](./auditor_frontend.md) |
| Generador Backend | Generador | Implementar APIs, lógica de negocio y persistencia con patrones establecidos. | [generador_backend.md](./generador_backend.md) |
| Generador Frontend | Generador | Construir componentes de UI accesibles y alineados a diseño. | [generador_frontend.md](./generador_frontend.md) |
| Generador Infraestructura | Generador | Diseñar infraestructura como código, pipelines y prácticas de resiliencia. | [generador_infra.md](./generador_infra.md) |
| Integrador | Integrador | Coordinar merges, despliegues y comunicación entre equipos. | [integrador.md](./integrador.md) |
| Tester Backend | Tester | Diseñar y ejecutar pruebas backend (unitarias, integración, performance). | [tester_backend.md](./tester_backend.md) |
| Tester Frontend | Tester | Validar UX y estabilidad mediante pruebas unitarias y E2E. | [tester_frontend.md](./tester_frontend.md) |
| Gestor GitHub | Coordinador operativo | Administrar issues/PRs, aplicar labels y sincronizar el repositorio con las guías. | [github_agent.md](./github_agent.md) |

## Comentarios finales
- Mantén este índice actualizado cada vez que nazca o cambie un subagente.
- Si detectas huecos en la cobertura de roles, crea un nuevo archivo en `/agents` siguiendo el formato existente y agrégalo a la tabla.
- Documenta siempre los ejemplos de uso para que los equipos sepan cómo interactuar con cada perfil.
