# Visual Refresh Suave — Frontend público

## 1) Mini guía visual (7 principios)

1. **Institucional sin rigidez**: tono sobrio con acentos medidos para comunicar confianza pública.
2. **Jerarquía calmada**: titulares grandes pero no extremos; más espacio para contenido legible.
3. **Color con propósito**: neutros dominantes y acento municipal solo en acciones y señales clave.
4. **Componentes contenidos**: radios y sombras moderadas para reducir estética “flashy”.
5. **Accesibilidad por defecto**: foco visible, contraste suficiente y estados hover/focus diferenciados.
6. **Consistencia entre páginas**: home, listado y detalle comparten patrón visual común.
7. **Animación discreta**: transiciones cortas/suaves para reforzar interacción, no decorarla.

## 2) Tokens propuestos

### Color

- `--color-primary`: `#1f5f4a` (verde institucional)
- `--color-secondary`: `#586b7a` (gris azulado de soporte)
- `--color-accent`: `#b9872f` (acento municipal cálido)
- `--color-background-light`: `#f6f8fa` (fondo base)
- `--color-background-dark`: `#12202d` (fondo secciones oscuras)
- `--color-surface`: `#ffffff` (superficie principal)
- `--color-surface-muted`: `#eef2f5` (superficie secundaria)
- `--color-text-primary`: `#15212b`
- `--color-text-secondary`: `#45525f`

### Tipografía (escala práctica)

- Display/Hero: `text-[clamp(2.25rem,7vw,6rem)]` (peso 600–700)
- H1 detalle/listado: `text-[clamp(2.4rem,8vw,5.75rem)]` (peso 600)
- H2 sección: `text-3xl md:text-5xl` (peso 700)
- Body: `text-base md:text-lg` (leading relajado)
- Meta/UI: `text-[11px]` uppercase con tracking contenido

### Spacing

- Secciones: `py-24` / `py-20`
- Contenido: `px-6 md:px-20`
- Cards: `p-7 md:p-8`
- Gaps de grid: `gap-12` / `gap-16`

### Radius

- Macro-contenedores: `rounded-3xl`
- Botones/chips: `rounded-xl`
- Badges: `rounded-full`

### Sombras

- Card base: `0 8px 24px rgba(15,23,42,0.08)`
- Card hover: `0 16px 32px rgba(15,23,42,0.12)`
- Superficie destacada oscura: `0 16px 48px rgba(0,0,0,0.35)`

## 3) Validación de alcance

Este refresh es **exclusivamente visual**:
- sin cambios de rutas,
- sin cambios de contratos API,
- sin cambios de lógica funcional.
