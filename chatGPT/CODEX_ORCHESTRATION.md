# Orquestación de Codex Cloud

## OBJETIVO
Garantizar que Codex trabaje de forma estable, paralela y segura mediante:
- prompt engineering óptimo
- chunking
- definición estricta de roles
- aislamiento de tareas
- validaciones en cascada

## PRINCIPIOS
1. Codex nunca recibe una tarea grande.
2. Todo debe dividirse en unidades de < 2000 tokens.
3. Los subagentes deben tener roles exclusivos.
4. Los prompts deben ser atómicos.
5. Cada operación debe incluir un revisor y un integrador.

## CUANDO DESPLEGAR SUBAGENTES
- Módulos grandes (ej: blog completo)
- Refactorización de carpetas
- Generación de tests
- Migraciones complejas
- Cambios que afectan múltiples archivos

## VALIDACIÓN
Siempre se ejecuta orden:
1) Generador  
2) Auditor  
3) Test Generator  
4) Documentador  
5) Integrador

El GPT Director Técnico nunca salta pasos.
