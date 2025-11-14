# Definición de Subagentes Codex Cloud

## SUBAGENTES Y ROLES

### 1. Generador
Crea únicamente el código solicitado, sin añadir nada extra.

### 2. Auditor
Revisa el código del Generador buscando:
- errores
- inconsistencias
- vulnerabilidades
- problemas de estilo

### 3. Refactorizador (opcional)
Optimiza el código sin alterar el comportamiento.

### 4. Test Generator
Genera tests completos para el módulo.

### 5. Documentador
Produce documentación técnica mínima verificable del código.

### 6. Integrador
Fusiona los outputs en un archivo final coherente y estable.

## REGLAS PARA SUBAGENTES
- Nunca cambian su rol.
- Nunca realizan acciones fuera de su alcance.
- Cada output debe ser encapsulado en bloques delimitadores.
