# Backoffice Visual Refresh (Municipal / Corporativo)

## 1) Guía conceptual (principios)

- Priorizar claridad institucional: superficies limpias, jerarquía tipográfica y bloques bien delimitados.
- Comunicar confianza y estabilidad con paleta sobria (azules cívicos, verdes suaves y neutros).
- Asegurar lectura rápida en operaciones diarias: contraste alto, densidad media y microcopys visibles.
- Mantener familiaridad funcional: misma arquitectura visual y mismos componentes; solo refinamiento estético.
- Reducir ruido visual: menos efectos “llamativos”, transiciones discretas y estados consistentes.
- Reforzar consistencia: iconografía Lucide homogénea, radios y sombras sistematizados.
- Mejorar percepción de calidad en listados/formularios con contenedores, tablas y filtros más estructurados.

## 2) Propuesta de tokens

- **Color**
  - `primary` (azul institucional): de `#f0f6fb` a `#152739`.
  - `secondary` (verde cívico suave): de `#f1f7f4` a `#243f32`.
  - Neutros operativos: base en `slate` para fondos, bordes y textos.
- **Tipografía**
  - `--font-sans`: `Source Sans 3` (fallback `Inter`, `system-ui`, `sans-serif`).
  - Pesos recomendados: 400/500/600/700.
- **Radios**
  - Contenedores principales: `rounded-xl`.
  - Controles y acciones: `rounded-md`.
- **Sombras**
  - Estado base: `shadow-sm`.
  - Elevación en hover: `shadow-md` muy contenida.
- **Spacing**
  - Ritmo 4/6/8 en separaciones de secciones.
  - Tablas y cards con paddings de 4-6 para legibilidad.

## 3) Aplicación en pantallas clave

- **Home / Dashboard**
  - KPI cards con tono institucional y hover sutil.
  - Quick actions unificadas (mismo lenguaje visual y jerarquía).
  - Actividad reciente con timeline más limpio y contrastado.
- **Listado de contenidos (Noticias)**
  - Filtros en panel contenedor sobrio (borde + fondo blanco).
  - Tabla con cabecera neutra institucional y estados publicados/borrador más legibles.
  - Acciones de fila con feedback suave y color semántico controlado.
- **Detalle/Formulario (Noticias Dialog)**
  - Superficie del modal y bloques internos con mejor separación visual.
  - Inputs/select/toggles con neutros de mayor contraste.
  - Tabs y paneles multimedia con estructura más corporativa.

## 4) Antes / Después y rationale

- **Antes:** look más “producto startup” (acentos vivos, hover más expresivos, mezcla cromática).  
  **Después:** look administrativo institucional (neutros + azul/verde cívico), más sobrio y realista.
- **Antes:** jerarquía visual irregular entre filtros, tablas y cards.  
  **Después:** contenedores, bordes y títulos consistentes entre módulos.
- **Antes:** algunos controles con contraste justo en estados intermedios.  
  **Después:** contraste reforzado en textos/bordes/estados para uso diario (AA orientativo).
- **Antes:** microinteracciones más decorativas.  
  **Después:** interacciones discretas enfocadas en feedback, no en protagonismo.

## 5) Checklist no-breaking

- [x] Sin cambios en lógica de negocio.
- [x] Sin cambios en rutas ni navegación.
- [x] Sin cambios en API client ni contratos.
- [x] Sin cambios en permisos/autenticación.
- [x] Sin cambios de arquitectura ni estructura de features.
- [x] Sin introducir librerías nuevas de iconos (se mantiene Lucide).
