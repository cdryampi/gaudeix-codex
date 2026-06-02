# Guía de Estilo Multimedia e Ilustración por Capas — Gaudeix Codex

Esta guía documenta la identidad visual, la fórmula de prompts de IA y el catálogo de recursos gráficos generados para el componente **`HistoricalStoryExplorer`** del frontend de Cabrera de Mar. El objetivo es permitir a futuros desarrolladores o agentes de IA generar nuevos recursos multimedia manteniendo una consistencia estética del 100%.

---

## 1. Identidad Estética de los Recursos

Para alejarse de la estética de una landing page corporativa genérica (SaaS) y lograr una experiencia de archivo histórico, editorial y cultural, se ha definido el siguiente estilo visual para las ilustraciones:

- **Técnica Artística:** Boceto/grabado minimalista hecho a mano alzada con tinta, emulando ilustraciones de libros históricos o cuadernos de viaje.
- **Paleta de Color de la Imagen:** Monocromática o bitonal, utilizando principalmente trazos en color carbón/grafito y acentos sutiles en terracota.
- **Fondo de la Imagen:** Blanco roto / crema cálido continuo y limpio. Sin gradientes complejos ni ruido fotográfico.
- **Tratamiento en Interfaz (CSS):**
  - **Efecto Postal:** Aplicado en la tarjeta interactiva con un filtro sepia del 20% al 35% (`sepia-[20%]`), que recupera sus colores originales en hover (`hover:sepia-0 group-hover:scale-105 transition-all`).
  - **Textura de Fondo:** Proyectado detrás del texto narrativo con una opacidad muy baja (`opacity-[0.08]`) para dar profundidad sin interferir en la legibilidad del texto (contraste accesible).

---

## 2. Fórmula de Prompts de IA para Generación de Imágenes

Para generar nuevos grabados o bocetos del mismo estilo (por ejemplo, para nuevas rutas, yacimientos arqueológicos, playas, ermitas o festividades), utiliza la siguiente plantilla de prompt:

```text
Minimalist hand-drawn ink sketch illustration of [ELEMENTO_A_ILUSTRAR] in Cabrera de Mar, [DETALLES_ESPECIFICOS_Y_ENTORNO], minimalist vector art style, elegant terracotta and charcoal outline on off-white cream background, clean lines, no text, no words.
```

### Parámetros Clave del Prompt:

1. **`Minimalist hand-drawn ink sketch illustration`**: Define la técnica (boceto minimalista a tinta).
2. **`minimalist vector art style`**: Evita que la IA añada texturas 3D, sombras realistas o colores fotográficos indeseados.
3. **`elegant terracotta and charcoal outline`**: Limita la paleta a trazos de contorno elegantes en terracota (color acento cálido) y carbón (gris oscuro).
4. **`on off-white cream background, clean lines`**: Garantiza que el fondo sea un crema limpio y continuo que se integra perfectamente con el fondo crema del componente (`bg-[#FAF8F6]`).
5. **`no text, no words`**: Evita que el generador de imágenes añada texto, firmas, etiquetas, marcas de agua o tipografías sobre la ilustración, asegurando que el recurso sea puramente visual y la información se renderice dinámicamente con código HTML.

---

## 3. Catálogo de Recursos Generados

Los siguientes archivos se encuentran guardados en el directorio público del frontend `frontend/public/media/` y están integrados de forma dinámica y como fallback en el timeline:

| Época Histórica | Archivo en Frontend            | Prompt Utilizado                                                                                                                                                                                                                                                                                   |
| :-------------- | :----------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Laietania**   | `/media/laietania_sketch.png`  | `Minimalist hand-drawn ink sketch illustration of an ancient Iberian round stone house and village on a green forested hill overlooking the sea, laietan origin, minimalist vector art style, elegant terracotta and charcoal outline on off-white cream background, clean lines.`                 |
| **Ilturo**      | `/media/ilturo_sketch.png`     | `Minimalist hand-drawn ink sketch illustration of a Roman aqueduct arches and ruins in Cabrera de Mar, ancient Roman Ilturo heritage, minimalist vector art style, elegant terracotta and charcoal outline on off-white cream background, clean lines.`                                            |
| **Edad Media**  | `/media/burriac_sketch.png`    | `Minimalist ink sketch illustration of Castillo de Burriac castle on top of a mountain, Cabrera de Mar, hand-drawn vector art style, elegant editorial outline, monochrome warm terracotta and charcoal color on off-white cream background, high contrast, clean, warm aesthetic.`                |
| **Modernidad**  | `/media/modernidad_sketch.png` | `Minimalist hand-drawn ink sketch illustration of a Catalan modernista Art Nouveau villa facade and houses with decorative balconies in Cabrera de Mar, palm tree in background, minimalist vector art style, elegant terracotta and charcoal outline on off-white cream background, clean lines.` |

### Recursos Decorativos Flotantes (Background Watermarks)

Adicionalmente, se han generado 3 ilustraciones de baja opacidad (`opacity-[0.035]`) posicionadas de forma absoluta en el fondo del explorador como marcas de agua artísticas representativas del municipio:

| Elemento Patrimonial     | Archivo en Frontend       | Prompt Utilizado                                                                                                                                                                                                                                                                           |
| :----------------------- | :------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Columna Romana**       | `/media/columna_deco.png` | `Minimalist hand-drawn ink sketch illustration of a single broken classical Roman column standing on ancient ground, Roman archaeology, minimalist outline vector art style, elegant terracotta and charcoal outline on off-white cream background, clean lines.`                          |
| **Altar del Dios Mitra** | `/media/mitra_deco.png`   | `Minimalist hand-drawn ink sketch illustration of an ancient Roman stone relief representing the god Mithras sacrificing the bull, tauroctony scene from Can Modolell, antique carved stone style, minimalist terracotta and charcoal outline on off-white cream background, clean lines.` |
| **Terrazas Agrícolas**   | `/media/cultivo_deco.png` | `Minimalist hand-drawn ink sketch illustration of historic terraced fields and ancient agricultural zones on steep mountain slopes, minimalist outline vector art style, elegant terracotta and charcoal outline on off-white cream background, clean lines.`                              |

---

## 4. Integración Técnica en React

Cuando se añade una nueva etapa o recurso que requiere mostrar este grabado, el componente lo importa y renderiza dinámicamente:

```tsx
<img
  src={getImagePathForStage(stage.id)}
  alt={stage.title}
  className="w-full h-full object-cover sepia-[20%] hover:sepia-0 group-hover:scale-105 transition-all duration-700 pointer-events-none"
/>
```

Esta estructura descentralizada y limpia asegura que la aplicación consuma poco ancho de banda, sea accesible, y tenga una estética cultural idéntica en cualquier pantalla.
