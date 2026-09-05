# Logos

Nombrado por dónde se usa el logo, no por el color del logo (para evitar
confusión: "logo dark" podría leerse como "logo de color oscuro" o "logo para
fondo oscuro" — aquí siempre es lo segundo).

| Archivo | Uso | Formato recomendado |
|---|---|---|
| `logo-on-dark.svg` | Logo para colocar sobre fondo oscuro (navy) — típicamente texto/trazo claro o blanco | SVG (vectorial, escala sin perder calidad) |
| `logo-on-light.svg` | Logo para colocar sobre fondo claro/blanco — típicamente texto/trazo oscuro | SVG |
| `logo-on-dark.png` / `logo-on-light.png` | Fallback raster si no hay versión vectorial | PNG con fondo transparente, mínimo 512px de ancho |

## Nota importante

El wordmark "CLARVO" que aparece en el hero y el footer del sitio **hoy es
texto real (HTML/CSS)**, no una imagen — decisión tomada en Segmento 0 por
mejor SEO/accesibilidad. Los archivos de esta carpeta, cuando lleguen, se
usan para:
- Favicon / `apple-touch-icon`.
- `og:image` (vista previa al compartir el link en redes/WhatsApp).
- Cualquier otro lugar fuera del hero donde se necesite el logo como imagen.

Si en vez de eso quieres que el wordmark del hero se reemplace por una imagen
de logo diseñada, avisa explícitamente — es un cambio de diseño, no solo de
archivo, y pasa por confirmación como cualquier otro cambio visual.
