# gaudeix-codex

## 1. Resumen del Proyecto
Este repositorio impulsa la reconstrucción completa, moderna y modular de un sistema legado originalmente desarrollado como un monolito Django. El objetivo es evolucionarlo hacia una plataforma totalmente desacoplada donde cada capa (backend, frontend, backoffice e infraestructura) se diseñe desde cero para alinearse con la visión arquitectónica actualizada.

- **Backend moderno con Django REST Framework, JWT, PostgreSQL y módulos desacoplados.**
- **Frontend SPA con React + Vite integrado vía API REST.**
- **Backoffice con React Admin o solución equivalente.**
- **Infraestructura con Docker, despliegues automatizados en Dokploy y CI/CD con GitHub Actions.**

## 2. Objetivo General del Proyecto
Reconstruir el sistema desde cero siguiendo una arquitectura desacoplada, escalable, versionada y basada en REST, garantizando la migración de datos desde el sistema antiguo hacia la nueva plataforma modular.

## 3. Arquitectura
La arquitectura definida maximiza el desacoplamiento y la escalabilidad, permitiendo que cada módulo evolucione de forma independiente sin comprometer la cohesión global.

### Backend
- API REST con Django y Django REST Framework.
- Autenticación JWT, endpoints versionados y documentados.
- PostgreSQL como base de datos, gestión de media persistente y pruebas unitarias e integraciones automatizadas.
- Módulos clave: Usuarios & Autenticación, Blog/Noticias, Agenda/Eventos, Lugares, Media Manager, Configuración general y Traducciones.

### Frontend
- SPA desacoplada con React + Vite, routing avanzado y soporte multilenguaje.
- Consumo directo de la API REST con manejo robusto de estados y caching.
- Módulos clave: Home, Noticias, Detalle de noticia, Agenda, Detalle de evento, Mapa/Lugares, About, Selector de idioma y Layout (Header/Footer).

### Backoffice
- Panel administrativo en React Admin u otra solución React equivalente, autenticado mediante JWT contra la misma API.
- Módulos clave: Autenticación administrativa, Posts, Eventos, Lugares, Usuarios, Configuración, Media y Auditoría básica.

### Infraestructura
- Contenedores Docker y orquestación con Docker Compose.
- Despliegues automatizados en Dokploy y pipelines CI/CD en GitHub Actions.
- Observabilidad mínima con logs centralizados y métricas básicas.

Esta arquitectura fue elegida para facilitar la escalabilidad horizontal, acelerar la entrega continua, permitir reemplazos tecnológicos por capas y reducir dependencias entre equipos, asegurando una plataforma resiliente y preparada para iteraciones rápidas.

## 4. Filosofía de Desarrollo
- Desacoplamiento total entre backend y frontend: la interacción ocurre exclusivamente mediante APIs REST.
- ChatGPT actúa como Director Técnico: diseña arquitectura, define prompts y estrategias, y revisa la calidad.
- Codex actúa como equipo de programadores responsable de generar código y artefactos.
- La documentación viva es el pilar de control y se mantiene actualizada para guiar cada decisión.
- Subagentes especializados complementan al equipo para tareas concretas de generación, auditoría, pruebas e integración.

## 5. Sistema de Dirección Técnica
El modelo operativo establece que ChatGPT diseña la arquitectura, promueve estrategias, detalla prompts y valida entregables sin generar código directamente. Codex ejecuta las implementaciones siguiendo dichas directrices, manteniendo una trazabilidad clara y documentada.

- `/docs` es siempre la fuente de verdad para decisiones técnicas, flujos de trabajo y definiciones de producto.
- `/agents` documenta los subagentes disponibles, sus roles y reglas de interacción.
- Las revisiones de calidad siguen los criterios definidos por el Director Técnico, asegurando coherencia entre la visión y las implementaciones.

## 6. Subagentes
Los subagentes son roles especializados definidos en `/agents` que extienden las capacidades del equipo principal para garantizar entregables de alta calidad.

- **Tipos de subagentes:** generador, auditor, tester, integrador y otros roles que se activen según las necesidades del proyecto.
- **Delegación de tareas:** el Director Técnico asigna tareas concretas a cada subagente, proporcionando contexto y criterios de aceptación alineados con `/docs`.
- **Interacción con Codex:** los subagentes colaboran con Codex aportando entregables específicos (código, revisiones, pruebas, integraciones) que luego se consolidan bajo la supervisión del Director Técnico.

## 7. Workflow Operativo
El flujo de trabajo real del proyecto sigue los pasos definidos por el Director Técnico:

1. **Preparación:** revisar actualizaciones en `/docs`, estado de `/agents` y riesgos abiertos.
2. **Análisis:** sintetizar el estado actual del proyecto utilizando la documentación oficial.
3. **Planificación:** establecer objetivos, tareas y responsables, alineados con la arquitectura y prioridades.
4. **Delegación:** emitir prompts precisos para Codex y subagentes, citando documentación relevante.
5. **Revisión:** validar entregables contra los criterios definidos y registrar observaciones.
6. **Iteración:** solicitar ajustes necesarios y mantener la trazabilidad de cambios.
7. **Cierre:** documentar resultados, actualizar aprendizajes y sincronizar la documentación viva.

## 8. Estructura del Repositorio
La estructura actual del repositorio (sujeta a expansión conforme se creen los módulos planificados) es la siguiente:

```
.
├── README.md
├── docs/
├── agents/
└── chatGPT/
```

Las carpetas `backend/`, `frontend/`, `backoffice/` e `infrastructure/` se incorporarán conforme se materialicen los componentes correspondientes de la arquitectura.

## 9. Cómo Contribuir (para humanos y para IA)
- Consulta primero `/docs` para entender alcance, prioridades, dependencias y reglas vigentes.
- Revisa `/agents` para identificar subagentes relevantes y comprender sus responsabilidades.
- Define estrategias y prompts claros antes de delegar, citando la documentación oficial y especificando criterios de aceptación.
- Coordina revisiones técnicas con el Director Técnico, asegurando que cada entrega cumpla los estándares establecidos.
- Al iniciar una contribución, sincroniza el contexto, documenta hallazgos relevantes y registra el cierre de cada iteración en la documentación correspondiente.

## 10. Requisitos a cumplir
- Mantener el desacoplamiento total entre backend y frontend mediante comunicación exclusiva vía APIs REST.
- Diseñar módulos escalables y versionados que faciliten la evolución independiente de cada capa.
- Respetar la gobernanza del proyecto: ChatGPT dirige; Codex y los subagentes implementan.
- Consultar siempre `/docs` y `/agents` como fuentes de verdad antes de tomar decisiones técnicas.
- Incluir pruebas, migraciones, despliegues automatizados y observabilidad como parte integral de la plataforma modernizada.
