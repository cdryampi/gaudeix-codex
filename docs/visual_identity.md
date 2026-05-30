# Guía de Identidad Visual: Cabrera de Mar HSL y Modo Claro/Oscuro

Esta guía detalla la paleta cromática unificada para el **Frontend Público** y el **Backoffice Administrativo** de **Gaudeix Codex**, inspirada en los paisajes mediterráneos de Cabrera de Mar (sol, arena cálida y azul marina).

---

## 🎨 Paleta de Colores HSL y Equivalencias Hexadecimales

Para garantizar la máxima flexibilidad visual, consistencia e interpolaciones fluidas, toda la paleta se define utilizando variables **HSL (Hue, Saturation, Lightness)** en CSS.

| Nombre de Variable   | Propósito                        | Modo Claro                       | Modo Oscuro                      | Contraste WCAG 2.1             |
| -------------------- | -------------------------------- | -------------------------------- | -------------------------------- | ------------------------------ |
| `--primary`          | Identidad / Acciones principales | `hsl(209, 79%, 28%)` (`#0f4c81`) | `hsl(209, 85%, 45%)` (`#1b75c9`) | Excelente (AA/AAA)             |
| `--secondary`        | Acentos secundarios / Bandera    | `hsl(178, 83%, 31%)` (`#0d8f8c`) | `hsl(178, 80%, 42%)` (`#15a4a1`) | Excelente                      |
| `--accent`           | Resaltados alegres (oro)         | `hsl(35, 100%, 65%)` (`#ffb24d`) | `hsl(35, 95%, 58%)` (`#fca128`)  | Accesible sobre fondos oscuros |
| `--background-light` | Fondo principal de pantalla      | `hsl(210, 40%, 98%)` (`#f8fafc`) | `hsl(209, 73%, 9%)` (`#06182c`)  | N/A                            |
| `--surface`          | Paneles, tarjetas y modales      | `hsl(0, 0%, 100%)` (`#ffffff`)   | `hsl(209, 60%, 14%)` (`#0a2542`) | N/A                            |
| `--surface-muted`    | Fondos de inputs, hover          | `hsl(207, 30%, 95%)` (`#ebf1f5`) | `hsl(209, 50%, 18%)` (`#113154`) | N/A                            |
| `--text-primary`     | Texto de lectura principal       | `hsl(206, 58%, 18%)` (`#14324a`) | `hsl(210, 20%, 95%)` (`#f1f5f9`) | Cumple 4.5:1 / 7:1             |
| `--text-secondary`   | Texto de lectura secundario      | `hsl(207, 20%, 43%)` (`#587185`) | `hsl(208, 15%, 78%)` (`#cbd5e1`) | Cumple 4.5:1                   |
| `--border-soft`      | Bordes discretos y sutiles       | `hsl(207, 30%, 92%)` (`#e2eaf0`) | `hsl(209, 40%, 18%)` (`#1b2f44`) | N/A                            |
| `--border-strong`    | Bordes interactivos              | `hsl(207, 20%, 85%)` (`#cbdce6`) | `hsl(209, 30%, 24%)` (`#2b3f54`) | N/A                            |

---

## 🌗 Transiciones de Color (UX Suave)

Todos los elementos deben soportar la transición suave al conmutar de tema de acuerdo con el estándar de micro-animaciones del proyecto:

```css
transition:
  background-color 0.4s ease,
  color 0.4s ease,
  border-color 0.4s ease,
  box-shadow 0.4s ease;
```

---

## ♿ Accesibilidad y Contraste WCAG 2.1 AA

1. **Uso de Textos**: Evitar escribir textos en `--color-text-secondary` sobre fondos de color `--color-primary` o `--color-secondary` directamente. Utilizar `--color-surface` en su lugar.
2. **Estados Focus**: Todos los elementos con capacidad de foco por teclado deben emplear:
   ```css
   outline: none;
   ring: 2px solid var(--color-primary);
   ring-offset: 2px;
   ```
3. **Indicadores de Validación**: Los elementos con `:user-invalid` (según las directrices de `modern-web-guidance`) cambian el borde a un color rojo semántico (`#ef4444`) únicamente tras la interacción del usuario para evitar contaminación por errores prematuros.
