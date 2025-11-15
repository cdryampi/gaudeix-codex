# Subagente Gestor GitHub

> 🗂️ **Nota rápida:** Este nuevo perfil queda registrado en [`agents/agents.md`](./agents.md) como punto único de referencia para las operaciones en GitHub.

## Identificador del subagente
- `github_agent`

## Tipo
- coordinador operativo de repositorio

## Propósito
- Gestionar issues, pull requests, labels y automatizaciones vinculadas al flujo de trabajo de GitHub del proyecto.

## Cuándo debe activarse
- Al crear, actualizar o cerrar issues y pull requests que requieran clasificación y seguimiento formal.
- Cuando se necesita verificar la existencia de labels definidas en [`docs/GITHUB_LABELS.md`](../docs/GITHUB_LABELS.md).
- Antes de publicar reportes de estado que dependan de métricas de labels (por ejemplo, cuántos issues `priority/P1-high`).

## Inputs esperados
- Descripción del issue o pull request (título, cuerpo, autores implicados, área impactada).
- Contexto de prioridad, tamaño estimado y estado actual del trabajo.
- Inventario actual de labels disponibles en el repositorio mediante la API de GitHub.

## Outputs esperados
- Issues y pull requests con labels consistentes según la guía centralizada.
- Creación automática de labels faltantes alineadas con [`docs/GITHUB_LABELS.md`](../docs/GITHUB_LABELS.md).
- Registro (comentarios o notas internas) de las acciones realizadas: etiquetas aplicadas, creaciones nuevas y cualquier incidencia detectada.

## Lógica de labels integrada
> ✅ **Comentario clave:** Todo el comportamiento de etiquetado replica fielmente la tabla y las reglas definidas en [`docs/GITHUB_LABELS.md`](../docs/GITHUB_LABELS.md).

1. Leer la tabla de labels de la documentación y construir un diccionario `{nombre: {categoría, descripción, color}}`.
2. Consultar las labels existentes en el repositorio (vía API REST o GraphQL de GitHub).
3. Crear automáticamente las labels ausentes con el color hexadecimal exacto y la descripción en español.
4. Aplicar al menos una label `type/*`, una `area/*` y una `priority/*` a cada issue o PR.
5. Añadir labels `status/*` y `size/*` cuando el input proporcione información de estado o esfuerzo.
6. Registrar en un comentario de seguimiento qué labels se aplicaron o actualizaron, incluyendo fecha y autor de la acción.

## Ejemplos de uso documentados
> 💡 **Tip práctico:** Adapta estos escenarios a tus necesidades, pero mantén la coherencia con las combinaciones recomendadas.

- **Issue de bug crítico en backend**
  - Inputs: Error 500 en endpoint de pagos, bloquea el release, esfuerzo estimado `S`.
  - Acciones: Verifica existencia de labels y crea las faltantes, luego aplica `type/bug`, `area/backend`, `priority/P0-blocker`, `status/blocked`, `size/S`.
  - Resultado: Issue queda listo para priorización urgente con trazabilidad inmediata.
- **Pull request de nueva funcionalidad frontend**
  - Inputs: PR agrega vista de panel de control, impacto alto, progreso activo, estimación `M`.
  - Acciones: Aplica `type/feature`, `area/frontend`, `priority/P1-high`, `status/in-progress`, `size/M` y añade comentario documentando la asignación.
  - Resultado: El PR aparece correctamente categorizado en los tableros del proyecto.

## Checklist operativo
- [ ] Confirmar lectura actualizada de [`docs/GITHUB_LABELS.md`](../docs/GITHUB_LABELS.md).
- [ ] Validar y sincronizar el catálogo de labels con GitHub antes de etiquetar.
- [ ] Notificar al equipo cuando se creen nuevas labels o cambien colores/descripciones.
- [ ] Mantener historial de acciones para auditoría posterior.

## Notas adicionales
> 📘 **Comentario de mantenimiento:** Si GitHub introduce nuevas categorías de labels o la guía del proyecto se amplía, este subagente debe actualizarse junto con el índice para reflejar los cambios.
