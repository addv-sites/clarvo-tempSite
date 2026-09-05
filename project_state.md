# Estado del proyecto — clarvo-tempSite

## Qué es esto
Sitio provisional (landing "sitio en construcción" con waitlist) para que CLARVO
siga vendiendo mientras la app definitiva no está lista. Fiel a `siteTemporal.png`
del repo `clarvo`. Se despliega en GitHub Pages, sin backend propio, sin Docker,
sin base de datos.

## Decisiones ya tomadas (confirmadas por el usuario)
- Stack: Astro + Tailwind CSS v4. Animación del isotipo con CSS puro (no librería JS).
- **El isotipo/cristal es un asset real, no trazado a mano.** El usuario pasó el
  favicon original (PNG transparente, 1254×1254, el diamante-V completo) — eso
  reveló que el "SVG de 2 cúmulos" del Segmento 2 original era una reconstrucción
  a ciegas (el laptop ocultaba el vértice donde convergen los 2 brazos en la
  imagen de referencia). Se reemplazó por `Crystal.astro` usando el PNG real
  (`public/images/logo/crystal-mark.png`, recorte ajustado del favicon) con
  barrido de luz animado vía **CSS `mask-image` (alpha del PNG) + `transform:
  translate`** — más fiel que el SVG a mano, mismo principio de solo
  transform/opacity, respeta `prefers-reduced-motion`.
- **Wordmark del hero/footer: ahora es la imagen real del logo**, no texto CSS
  (cambio de decisión — originalmente iba a ser texto por SEO/accesibilidad,
  pero el usuario pidió explícitamente usar la imagen de marca real). Usa
  `logo-on-dark.png`/`.webp` (optimizado: 2046×768 original → 900px de ancho,
  643KB → 58KB WebP). El logo trae tagline horneado en el PNG: **"Tu negocio
  bajo control"**, distinto al copy original del sitio ("Tu portal de gestión")
  — el usuario confirmó explícitamente usar el logo tal cual con ese tagline.
- Favicon real generado desde el PNG de marca: `favicon.ico` (16/32/48),
  `favicon-32.png`, `apple-touch-icon.png` (180×180). Reemplaza el default
  genérico de Astro.
- Envío de correo de la waitlist: **EmailJS, ya implementado** (Segmento 3
  completo). Ver sección propia abajo.
- **Capturas del dashboard: el usuario dio 2 capturas reales pero luego pidió
  NO usarlas todavía** ("tómalas como mockups, no uses mis capturas") — se
  movieron a `public/images/dashboard/reference/` (preservadas, no borradas,
  pero `DashboardMockup.astro` no las recoge desde ahí). El sitio muestra el
  placeholder "Captura pendiente" a propósito. Mover un archivo de vuelta a
  `public/images/dashboard/` (nombre `laptop.png`/`phone.png`) cuando el
  usuario confirme una versión final de los tableros.
- Repo: `addv-sites/clarvo-tempSite.git`, clonado en `D:\srv\clarvo-tempSite`
  (carpeta hermana de `D:\srv\clarvo`, repo git independiente).
- No hizo falta `imagenes.md`/prompt de ChatGPT — todos los assets necesarios
  llegaron directo del usuario (logos, favicon) o se resolvieron con librería
  de iconos (Lucide) / SVG a mano (iconos sociales, bandera MX).

## Segmento 3 — Waitlist + EmailJS (completo)
- `src/lib/waitlist.ts`: lógica pura testeable — `isEmailJsConfigured`,
  `isValidEmail`, `validateWaitlistSubmission` (valida email + honeypot
  anti-spam).
- `src/lib/waitlist.test.ts`: **11 pruebas unitarias, todas pasan.** Comando:
  `npm test` (Vitest).
- `WaitlistForm.astro`: form con campo honeypot oculto (anti-spam sin backend),
  estados de carga/éxito/error con `aria-live`, deshabilita el submit y
  muestra "La lista de espera todavía no está activa" si faltan credenciales
  EmailJS — **verificado en navegador real**: sin `.env` configurado, el form
  se deshabilita correctamente, cero errores de consola.
- Credenciales (`PUBLIC_EMAILJS_SERVICE_ID`, `PUBLIC_EMAILJS_TEMPLATE_ID`,
  `PUBLIC_EMAILJS_PUBLIC_KEY`) vía `.env`, documentadas en `.env.example`.
  **Pendiente real**: el usuario todavía no ha dado estas credenciales — el
  envío de correo real (end-to-end) no se ha podido probar todavía, solo el
  comportamiento "sin configurar". Falta esa verificación final cuando lleguen
  los datos de EmailJS/Gmail y el correo destino de notificaciones.

## Plan segmentado
| # | Segmento | Estado |
|---|---|---|
| 0 | Setup: clonar repo, scaffold Astro + Tailwind, estructura de carpetas | **Hecho** |
| 1 | Maqueta estática fiel a la imagen (hero, wordmark, waitlist card, 5 features, footer) | **Hecho** — wordmark ahora es imagen real (ver arriba); dashboard vuelve a placeholder a propósito |
| 2 | Isotipo + animación de luz | **Hecho, rehecho con asset real** (ver arriba) — más fiel que la v1 con SVG a mano |
| 3 | Waitlist funcional + integración EmailJS | **Hecho** (código completo, 11 tests unitarios) — falta probar envío real con credenciales reales |
| 4 | SEO + Analytics (meta tags, JSON-LD, sitemap.xml, robots.txt, GA4, Search Console) | **Hecho** (parcial, ver pendientes) |
| 5 | Deploy GitHub Actions → GitHub Pages + pruebas Lighthouse/PageSpeed + accesibilidad + smoke test real | Pendiente |

## Pendiente de confirmar/recibir del usuario
- Credenciales EmailJS/Gmail + correo destino de notificaciones — para probar
  el envío real (Segmento 3 está implementado pero no probado end-to-end).
- Versión final de los tableros (dashboard) para volver a colocar capturas
  reales en `public/images/dashboard/` (ahora mismo solo hay referencia en
  `public/images/dashboard/reference/`).
- **Dominio real de producción** — confirmado que será dominio propio, falta
  el valor exacto. Todo usa el placeholder `https://clarvo.example` (TLD
  reservado, RFC 2606) vía `PUBLIC_SITE_URL` en `.env`. Bloquea `public/CNAME`
  (Segmento 5) y las URLs finales de sitemap/canonical/OG.
- Measurement ID de GA4 (`PUBLIC_GA_MEASUREMENT_ID`) — sin esto no se inyecta
  nada (confirmado, no rompe), pero tampoco hay analítica activa.
- Verificación de Google Search Console — pendiente para Segmento 5 junto con
  el dominio real.
- Decisión pendiente (no bloqueante): diseño de `og:image` — el logo
  transparente solo no sirve como preview social, necesitaría una tarjeta
  completa (logo + fondo + texto).
- Confirmación explícita para avanzar a Segmento 5 (protocolo addv-web-app).

## Estructura de assets
- `public/images/logo/`: `logo-on-dark.png/.webp` (usado en el hero/footer,
  optimizado), `logo-on-light.png/.webp` (guardado, no usado todavía),
  `favicon-source.png` (original 1254×1254 sin recortar, de donde salen
  favicon + `crystal-mark.png`), `crystal-mark.png` (recorte ajustado usado
  por `Crystal.astro`).
- `public/images/dashboard/`: vacío de capturas a propósito (placeholder
  activo). `reference/laptop.png` y `reference/phone.png` — capturas reales
  que el usuario dio, preservadas pero no mostradas en el sitio todavía. Ver
  el `README.md` de esa carpeta para cómo "publicarlas" cuando toque.
- README.md en cada carpeta con la convención de nombres.

## Notas técnicas
- `astro add tailwind` y `astro add sitemap` **fallan instalando dependencias
  automáticamente** (exit code 1) — patrón repetido, siempre se resuelve
  instalando el paquete manual (`npm i <paquete>`) y cableando la config a mano.
- `.env` ya está en `.gitignore` — ahí van las claves de EmailJS y demás,
  nunca hardcodeadas en el repo (`.env.example` documenta qué va).
- `@lucide/astro` **no incluye iconos de marca** (LinkedIn/YouTube/Instagram,
  removidos por trademark) — resueltos con SVG inline a mano en `Footer.astro`.
  Nombres de icono correctos: `ChartColumn` (no `BarChart3`), `ChartPie` (no
  `PieChart`), `ArrowDownRight`/`ArrowUpRight` (para las flechas, no emoji).
- Emoji (flechas, bandera) no renderizan bien en Chrome/Windows — siempre usar
  SVG en su lugar (bandera MX hecha a mano en `Footer.astro`).
- Mockup de teléfono: cuidado con `aspect-9/19` en ancho grande, se vuelve muy
  alto. Quedó en `w-28 sm:w-32` + `aspect-9/18`.
- `overflow-x-hidden` en `<body>` (Layout.astro) como red de seguridad contra
  overflow horizontal de elementos `absolute`.
- Imágenes pegadas por el usuario a veces no traen ruta de archivo accesible
  (a diferencia de las que sí generan `pasted-image-XXXX.png` en el temp) —
  cuando pase, pedir que las guarde manualmente en una ruta del proyecto en
  vez de asumir o reintentar el paste indefinidamente.
- Todo cambio visual de esta sesión (cristal, logo, tamaños) se verificó con
  build real + navegador (Chrome), nunca solo "el build no truena".
