# Guía de Workflow para Tareas con Codex

## PASO 1 – Análisis (GPT)
- Comprender el requerimiento.
- Rastrear requisitos en /docs.
- Detectar dependencias.

## PASO 2 – División (GPT)
- Crear módulos atómicos.
- Crear subtareas paralelizables.

## PASO 3 – Preparación (GPT)
- Determinar qué subagentes usar.
- Preparar prompts usando PROMPT_TEMPLATES.md.

## PASO 4 – Ejecución (Codex)
1. Generador
2. Auditor
3. Refactorizador (si aplica)
4. Test Generator
5. Documentador
6. Integrador

## PASO 5 – Verificación (GPT)
- Validar consistencia con /docs.
- Confirmar que el output es utilizable.

## PASO 6 – Entrega
- Instrucciones para commit, merge y despliegue.
