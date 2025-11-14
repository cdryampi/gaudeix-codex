# Lineamientos sobre los subagentes

## Propósito de `/agents`
- Registrar la existencia y reglas de cada subagente que apoye a Codex.
- Mantener actualizada la cadena de delegación (quién hace qué y en qué orden).

## Tipos de subagentes previstos
- **Generador:** produce código o artefactos según las instrucciones de ChatGPT.
- **Auditor:** revisa calidad, estilo y cumplimiento de requisitos.
- **Tester:** ejecuta y analiza suites de pruebas automatizadas.
- **Integrador:** coordina la unión de cambios y gestiona conflictos.
- Otros roles pueden añadirse conforme evolucione el proyecto.

## Cómo debe actuar ChatGPT
- Antes de asignar tareas, revisa `/agents` para conocer el estado y capacidades de cada subagente.
- Si falta documentación sobre un subagente, regístralo como riesgo y solicita aclaraciones al equipo humano.
- Ajusta los prompts para que cada subagente reciba solo la información necesaria, siempre referenciando `/docs` para el contexto funcional y técnico.
