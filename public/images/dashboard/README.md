# Capturas del dashboard

Nombres de archivo fijos — para actualizar la captura solo hay que reemplazar
el archivo con el mismo nombre, sin tocar código. `DashboardMockup.astro`
detecta automáticamente si el archivo existe en el build; si no existe,
muestra el placeholder "Captura pendiente".

| Archivo | Uso | Formato recomendado |
|---|---|---|
| `laptop.png` | Captura del dashboard dentro del mockup de laptop | PNG/WebP, mínimo 1280×800, recorte limpio de solo la pantalla (sin el marco físico de laptop — ese lo dibuja el CSS) |
| `phone.png` | Captura del dashboard dentro del mockup de teléfono | PNG/WebP, mínimo 360×760, mismo criterio (solo pantalla, sin marco físico) |

## Actualizaciones futuras

Vas a seguir cambiando los tableros — cuando tengas una versión nueva,
simplemente reemplaza `laptop.png`/`phone.png` con el mismo nombre y se
recoge solo en el próximo build. Si quieres mantener varias versiones en
paralelo (ej. para comparar), usa un sufijo (`laptop-v2.png`) y avisa para
actualizar la referencia en el componente.

## `reference/` (2026-09-05)

Las primeras capturas reales que pasó el usuario (`laptop.png`, `phone.png`)
se movieron a `reference/` — son mockups de referencia de los tableros
todavía en cambio, **no se muestran en el sitio**. `DashboardMockup.astro`
solo busca los archivos directamente en `public/images/dashboard/` (no en
`reference/`), así que mientras estén ahí el sitio sigue mostrando el
placeholder "Captura pendiente". Cuando el usuario confirme una versión
final de los tableros, mover el archivo de vuelta a esta carpeta (no a
`reference/`) para que se publique.
