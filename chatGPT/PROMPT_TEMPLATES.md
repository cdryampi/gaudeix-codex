# Plantillas de Prompts para Codex Cloud

## 1. Prompt para Subagente Generador
TAREA:
Generar únicamente el código para [DESCRIPCIÓN EXACTA].

LÍMITES:
- No cambiar otros archivos.
- No añadir funcionalidad no solicitada.
-Output dentro de CODE.

OUTPUT:
---
## 2. Prompt para Auditor
TAREA:
Audita el código entregado.

REVISA:
- errores potenciales
- seguridad
- estilo
- consistencia

OUTPUT:
(lista de problemas)


---

## 3. Prompt para Test Generator
TAREA:
- Generar tests unitarios para el módulo [X].

LÍMITES:
- No modificar código existente.
- Output dentro de TESTS

---

## 4. Prompt para Integrador
TAREA:
Generar tests unitarios para el módulo [X].

LÍMITES:
- No modificar código existente.
- Output dentro de TESTS


---

## 4. Prompt para Integrador

TAREA:
Unir los outputs de los subagentes previos en un archivo final coherente.

LÍMITES:
- No añadir nada nuevo.
- Output dentro de FINAL
