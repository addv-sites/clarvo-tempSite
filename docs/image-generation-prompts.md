# Inventario de imágenes — CLARVO

Master prompt sección 20. Cada activo: dónde se usa, prompt completo, y
estado. Generadas con la API de OpenAI (`gpt-image-1`) provista por el
usuario el 2026-10-09 — ver `scripts/generate-images.mjs`.

## 1. Foto del emprendedor — ProblemSection

- **Uso:** `src/components/site/ProblemSection.astro`, columna derecha (hoy placeholder "Foto pendiente").
- **Tipo:** activo decorativo / escena de apoyo.
- **Archivo:** `public/images/site/problem-entrepreneur.png` → optimizado a `.webp`.
- **Formato objetivo:** 4:3, ~1200×900, fondo opaco (no necesita transparencia).
- **Estado:** generado e integrado.

```
PROMPT PARA CHATGPT IMAGE GENERATION

Fotografía realista de un emprendedor mexicano de unos 35 años, piel morena
clara, sentado en el mostrador de su changarro (tienda pequeña de barrio),
con una laptop vieja abierta y un montón de papeles/tickets de venta
desordenados junto a un cuaderno. Expresión pensativa, preocupada pero no
desesperada — se está preguntando cómo le está yendo a su negocio. Luz
natural cálida de ventana, estilo documental/editorial, nada de iluminación
de estudio artificial. Composición horizontal 4:3, el personaje ligeramente
a la izquierda del encuadre dejando espacio negativo a la derecha. Colores
cálidos pero con un azul sutil de la pantalla de la laptop. Sin texto, sin
logotipos, sin marcas de agua, sin marcas de terceros visibles en productos
o empaques. No usar un ejecutivo corporativo de traje — es el dueño de un
negocio pequeño real, vestimenta casual de trabajo. Calidad fotográfica
profesional, alta resolución, sin deformaciones anatómicas.

Negativo: texto ilegible, logotipos inventados, marcas de agua, manos o
dedos deformes, estilo caricatura o 3D render, iluminación de stock
genérica tipo "business photo".
```

## 2. Imagen Open Graph (compartir en redes/WhatsApp)

- **Uso:** `src/layouts/Layout.astro`, meta `og:image` / `twitter:image`.
- **Tipo:** activo de marca / producto.
- **Archivo:** `public/images/site/og-cover.png`.
- **Formato objetivo:** 1200×630 (estándar OG), fondo opaco.
- **Estado:** generado e integrado.

```
PROMPT PARA CHATGPT IMAGE GENERATION

Imagen de portada para redes sociales (1200x630px, horizontal) para la
marca CLARVO — software de gestión para emprendedores. Fondo degradado
azul marino profundo oscuro (#091326 a #0a1931) con un acento geométrico
sutil tipo cristal/diamante facetado en azul eléctrico (#00D2FF) en una
esquina, sin ocupar el centro. Composición limpia, premium, estilo SaaS
moderno — nada de iconos genéricos de negocios ni gráficas falsas de
dashboard. Deja el área central y superior izquierda con espacio negativo
limpio (ahí se sobrepondrá el logotipo y texto por separado, no los
incluyas tú). Sin texto, sin logotipos, sin personas, sin capturas de
pantalla falsas de producto. Estilo: gradiente suave, geometría de bajo
poligonaje con destellos de luz, profesional y minimalista.

Negativo: texto, logotipos, marcas de agua, interfaces de usuario falsas,
iconos de negocios genéricos (gráficas de pastel, apretones de manos),
estilo clipart.
```

## Activos NO generados (y por qué)

- **Interfaz/gráficas del dashboard:** reconstruidas como componentes HTML/SVG reales (`src/components/dashboard/`) — el master prompt prohíbe generarlas como imagen con texto inventado.
- **Avatares de testimonios:** se usan iniciales (HTML/CSS), no fotos — evita implicar que existen fotos reales de personas que no dieron su imagen.
- **Logo / isotipo:** ya existen en `public/images/logo/` — no se regeneran, el master prompt prohíbe inventar una versión alterna.
