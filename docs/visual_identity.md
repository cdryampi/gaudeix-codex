# Guía de Identidad Visual — Gaudeix Codex (Frontend Público)

Paleta corporativa oficial aplicada a todo el frontend. Los valores hexadecimales son la fuente de verdad y se sincronizan entre `frontend/src/index.css` (CSS vars) y `frontend/tailwind.config.js` (tokens Tailwind).

---

## Tokens oficiales (HEX como source of truth)

| Token             | HEX       | Uso principal                                     |
| ----------------- | --------- | ------------------------------------------------- |
| `primary`         | `#E7640C` | Naranja enérgico. CTAs, hero shell, marca, iconos |
| `primary-dark`    | `#C94B00` | Naranja oscuro. Hover sobre CTAs, sombras cálidas |
| `secondary`       | `#0F76A4` | Azul accesible. Enlaces, interactivos             |
| `secondary-light` | `#7BC2EC` | Azul cielo. Fondos suaves, tarjetas, ribbons      |
| `green`           | `#036830` | Verde institucional. Éxito, validaciones, badges  |
| `green-light`     | `#93C01F` | Verde lima. Detalles, micro-acento                |
| `accent`          | `#F9B31F` | Amarillo highlight. Badges puntuales              |
| `background`      | `#FAFCFE` | Fondo principal de pantalla                       |
| `surface`         | `#FFFFFF` | Cards, modales, paneles elevados                  |
| `text-primary`    | `#111827` | Texto de lectura principal                        |
| `text-secondary`  | `#475569` | Texto de lectura secundario                       |
| `border-soft`     | `#E5E7EB` | Bordes discretos y separadores                    |

### Escalas derivadas (50–950)

Las escalas se generan automáticamente en `tailwind.config.js` y permiten usar utilidades de opacidad (`bg-primary/15`, `text-secondary/30`, etc.). Las sombras de los 50 se usan como fondos tintados de badges y cards suaves.

---

## Equivalencias HSL (referencia)

| Token             | Modo claro (HSL)     | Modo oscuro (HSL)    |
| ----------------- | -------------------- | -------------------- |
| `primary`         | `hsl(22, 88%, 47%)`  | `hsl(22, 88%, 61%)`  |
| `primary-dark`    | `hsl(19, 100%, 39%)` | `hsl(22, 88%, 47%)`  |
| `secondary`       | `hsl(197, 86%, 35%)` | `hsl(197, 86%, 58%)` |
| `secondary-light` | `hsl(202, 76%, 70%)` | `hsl(202, 76%, 82%)` |
| `green`           | `hsl(146, 96%, 19%)` | `hsl(146, 60%, 56%)` |
| `green-light`     | `hsl(75, 70%, 47%)`  | `hsl(75, 70%, 60%)`  |
| `accent`          | `hsl(42, 95%, 55%)`  | `hsl(42, 95%, 70%)`  |
| `background`      | `hsl(210, 50%, 99%)` | `hsl(222, 47%, 11%)` |
| `surface`         | `hsl(0, 0%, 100%)`   | `hsl(220, 30%, 7%)`  |
| `text-primary`    | `hsl(221, 39%, 11%)` | `hsl(210, 40%, 98%)` |
| `text-secondary`  | `hsl(215, 19%, 35%)` | `hsl(217, 19%, 70%)` |
| `border-soft`     | `hsl(220, 13%, 91%)` | `hsl(217, 30%, 16%)` |

---

## Reglas de uso

1. **Nunca usar hex hardcodeados en componentes** (`bg-[#E7640C]`, `text-[#475569]`, etc.). Usar siempre tokens semánticos (`bg-primary`, `text-text-secondary`, `border-border-soft`).
2. **Respetar proporciones**: 60% fondos claros / 25% azul-neutros / 10% naranja / 5% verde-amarillo.
3. **Sombras** reutilizar los tokens `shadow-card`, `shadow-soft`, `shadow-orange`, `shadow-blue` definidos en `index.css`.
4. **Gradientes decorativos** complejos pueden mantener hex inline si son branding único (p. ej. hero gradient), pero siempre anclados a un token base.
5. **Estados focus** universales con `ring-2 ring-primary` (definido en `@layer base` de `index.css`).
6. **Dark mode** se activa con la clase `.dark` en `<html>`. Las CSS vars hacen swap automático.

---

## Theme dinámico (theme_config del backend)

`MainLayout.tsx` reescribe las CSS vars (`--primary`, `--secondary`, etc.) en runtime con el campo `theme_config` de la API de `site-settings`. Esto permite personalización por municipio sin tocar el código.

- El **default sembrado** coincide con la paleta corporativa de esta guía.
- Los **presets del editor del backoffice** (`backoffice/.../SiteSettingsPage.tsx`) son 5 variantes de la misma familia corporativa (cálido, mediterráneo, brisa, sol, atardecer) para que el admin no rompa la identidad visual.
- Si el theme_config de la BD tiene valores viejos, ganarán sobre el CSS estático. Para forzar la paleta corporativa: `python manage.py seed_all` (re-sembrado idempotente) o `UPDATE site_settings SET theme_config = '{...}'`.

---

## Accesibilidad

- Texto sobre `primary`/`secondary` debe ser `#FFFFFF` o un `text-primary` para mantener contraste AA/AAA.
- `:user-invalid` cambia el borde a `#ef4444` solo tras interacción del usuario.
- Estados focus usan `ring-primary` con `ring-offset` de 2px.
