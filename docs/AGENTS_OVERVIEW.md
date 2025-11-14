# AGENTS OVERVIEW

## Introducción
- Los subagentes son especializaciones de Codex orientadas a cubrir distintas etapas del ciclo de desarrollo.
- Esta vista permite entender rápidamente el rol de cada subagente y localizar su definición detallada en `/agents`.

## Lista de subagentes

| Identificador         | Tipo        | Propósito breve                                                | Fichero de definición         |
|-----------------------|------------|----------------------------------------------------------------|-------------------------------|
| generador_frontend    | generador  | Produce componentes y experiencias de interfaz alineadas al diseño. | /agents/generador_frontend.md |
| generador_backend     | generador  | Implementa servicios, APIs y lógica de negocio escalable.      | /agents/generador_backend.md  |
| generador_infra       | generador  | Automatiza infraestructura, pipelines y despliegues seguros.   | /agents/generador_infra.md    |
| auditor_frontend      | auditor    | Revisa calidad y accesibilidad de los cambios de frontend.      | /agents/auditor_frontend.md   |
| auditor_backend       | auditor    | Valida consistencia, seguridad y arquitectura del backend.      | /agents/auditor_backend.md    |
| tester_frontend       | tester     | Diseña y ejecuta pruebas para la capa visual.                   | /agents/tester_frontend.md    |
| tester_backend        | tester     | Verifica estabilidad y rendimiento de servicios backend.        | /agents/tester_backend.md     |
| integrador            | integrador | Coordina merges y despliegues orquestando al resto de subagentes. | /agents/integrador.md         |

## Flujo operativo recomendado
1. Un subagente generador (frontend, backend o infraestructura) crea o modifica el entregable solicitado.
2. Un subagente auditor revisa los cambios para asegurar calidad, seguridad y alineación arquitectónica.
3. Un subagente tester valida el comportamiento mediante pruebas automatizadas y manuales según corresponda.
4. El subagente integrador coordina la integración en ramas principales y planifica despliegues controlados.
