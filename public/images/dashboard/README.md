# Capturas del dashboard

Nombre de archivo fijo — para actualizar la captura solo hay que reemplazar
el archivo con el mismo nombre, sin tocar código. `DashboardMockup.astro`
detecta automáticamente si el archivo existe en el build; si no existe,
muestra el placeholder "Captura pendiente".

| Archivo | Uso | Formato |
|---|---|---|
| `devices.webp` | Fuente primaria (fondo transparente), servida vía `<picture>` | WebP, calidad 82, 176KB |
| `devices.png` | Fallback para navegadores sin soporte WebP | PNG con transparencia, 1507×1024 |

## `devices.png`/`.webp` (2026-09-05, versión actual): mockup del usuario, `ClarvoMock.png`

El usuario pasó un mockup ya armado profesionalmente (`ClarvoMock.png`) —
laptop + teléfono con las gráficas dentro, **más los dos globos de texto
"Simple. Poderoso. Tuyo." / "Todo tu negocio en la palma de tu mano" ya
horneados en la imagen** — con el fondo ya transparente (no hubo que
quitarlo a mano esta vez). Reemplaza el recorte de `siteTemporal.png` de la
versión anterior. Recortado el margen transparente sobrante
(`Image.getbbox()`, 1535×1024 → 1507×1024) y guardado en dos formatos:
`devices.png` (PNG optimizado, 1.2MB) + `devices.webp` (calidad 82, 176KB —
85% menos peso). `DashboardMockup.astro` sirve el WebP primero vía
`<picture>`, con el PNG como fallback.

**Ojo:** como esta imagen ya trae los globos de texto horneados, el
componente **ya no dibuja sus propios `<p class="caption">`** — si se
reemplaza este archivo por otro que no traiga los textos horneados, hay que
avisar para volver a agregarlos por CSS.

**Posicionamiento del cristal detrás:** ajustado a ojo (por captura de
pantalla), no medido por píxeles — a diferencia de la versión anterior
(recorte de `siteTemporal.png`, que sí tenía coordenadas exactas que medir
porque venía de la misma imagen que el cristal), este mockup es un archivo
distinto sin correspondencia de coordenadas conocida.

**Contra de este approach:** al ser una imagen (no HTML+CSS real), cambiar
el contenido de las pantallas requiere una imagen nueva del usuario — no se
puede editar el texto/datos con código.

## `reference/` (histórico)

Las primeras capturas reales que pasó el usuario (`laptop.png`, `phone.png`)
siguen en `reference/`, preservadas, sin usarse — el usuario pidió
explícitamente no usar esas capturas.
