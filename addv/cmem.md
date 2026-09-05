# Historial comprimido — clarvo-tempSite

## 2026-09-05 — Segmento 0: setup del proyecto

**Pedido:** sitio provisional fiel a `siteTemporal.png` (repo `clarvo`), landing
"en construcción" con waitlist, para seguir vendiendo mientras la app definitiva
no está lista. Deploy en GitHub Pages, sin backend, sin Docker, sin BD. Requería
animación de luz sobre "la marca de Clarvo" (isotipo) y envío de correo de
suscriptores vía SMTP de Google.

**Crítica planteada y aceptada:** enviar correo con credenciales SMTP crudas
desde un sitio 100% estático es técnicamente inviable y viola "nada sensible en
el frontend" — cualquier credencial en el JS del bundle es legible por cualquiera.
Se presentaron 3 alternativas (EmailJS, Google Apps Script Web App, Formspree/
Web3Forms); el usuario eligió **EmailJS**.

**Decisiones confirmadas por el usuario:**
- El elemento "iluminado" (la usuaria lo describió como "una Y") es el
  cristal/diamante geométrico grande de la imagen, no el aro de la "O" del
  wordmark. Se construirá como SVG trazado a mano (no imagen de IA), para poder
  animar la luz con CSS.
- Hay capturas reales del dashboard CLARVO disponibles — se usarán esas para los
  mockups de laptop/teléfono, no se generan con IA.
- Servicio de correo: EmailJS.
- Stack: Astro + CSS puro para la animación (en vez de Next.js + Framer Motion),
  por mejor rendimiento en el speed test.
- Repo del sitio: `addv-sites/clarvo-tempSite.git` (repo separado del proyecto
  `clarvo` principal), clonado en `D:\srv\clarvo-tempSite`.
- Se descartó la necesidad de `imagenes.md`/prompt de ChatGPT: todos los assets
  se pueden construir directamente (wordmark = texto real, iconos = librería SVG,
  isotipo = SVG a mano, mockups = capturas reales del usuario).

**Implementado en este segmento:**
- Clonado repo vacío `clarvo-tempSite`.
- Scaffold Astro (`create-astro`, template minimal, TypeScript strict).
- Tailwind CSS v4 instalado y cableado a mano (`astro add tailwind` falló
  instalando dependencias automáticamente — exit code 1 — se instaló
  `@tailwindcss/vite` + `tailwindcss` manual y se configuró
  `astro.config.mjs` + `src/styles/global.css`).
- Estructura de carpetas: `src/components`, `src/layouts`, `src/assets/icons`,
  `src/styles`.
- Verificado con build real (`npm run build`): compiló, y se confirmó por grep
  en el CSS de salida que las clases de Tailwind sí se generan (no solo que el
  build no truena).
- Documentación creada: `project_state.md`, `addv/cmem.md`, bloque operativo
  agregado a `CLAUDE.md` (sin borrar el bloque genérico de Astro que trae el
  scaffold).

**Pendiente para siguiente segmento (bloqueantes):**
- Capturas reales del dashboard (laptop + teléfono).
- Credenciales EmailJS/Gmail + correo destino de notificaciones (para Segmento 3,
  no bloquea Segmento 1).
- Confirmación explícita del usuario para avanzar a Segmento 1 (maqueta estática).

## 2026-09-05 — Segmento 2 (parcial, placeholder): maqueta estática

**Pedido:** usuario dio luz verde a Segmento 1, capturas reales del dashboard
las pasa después.

**Implementado:**
- Componentes: `Layout.astro`, `Logo.astro`, `WaitlistForm.astro` (form estático,
  sin JS de envío todavía — eso es Segmento 3), `FeatureIcons.astro` (5 features
  con iconos `@lucide/astro`), `CrystalPlaceholder.astro` (SVG low-poly estático,
  sin animación — la animación de luz es Segmento 2 real, esto es solo para
  ocupar el espacio en el layout), `DashboardMockup.astro` (laptop + teléfono,
  con placeholder "captura pendiente" hasta que lleguen las capturas reales),
  `Footer.astro`.
- `index.astro` ensambla todo en hero de dos columnas + features + testimonial +
  footer, fiel a `siteTemporal.png`.
- Verificado con build real y con navegador (Chrome, captura de pantalla
  comparada contra la imagen de referencia) — no solo "el build no truena".

**Bugs encontrados y corregidos en la verificación visual (no hubieran salido
solo con build):**
- Mockup de teléfono con `aspect-9/19` en ancho grande se volvía demasiado alto
  y se montaba encima del texto "Simple. Poderoso. Tuyo." de arriba — se redujo
  a `w-28 sm:w-32` + `aspect-9/18`.
- Overflow horizontal en la página (scrollbar) por el mismo motivo — se agregó
  `overflow-x-hidden` en `<body>` como red de seguridad adicional.
- `@lucide/astro` no tiene iconos de marca (LinkedIn/YouTube/Instagram) — se
  reemplazaron por SVG inline a mano.
- Nombres de icono equivocados (`BarChart3`→`ChartColumn`, `PieChart`→`ChartPie`)
  causaban error de build (`MISSING_EXPORT`) — corregido.
- Emoji de flechas (↘↗) y bandera (🇲🇽) no renderizan en Chrome/Windows (glifos
  rotos, problema de plataforma, no del código) — reemplazados por SVG
  (iconos Lucide `ArrowDownRight`/`ArrowUpRight` y bandera MX en SVG a mano).

**Pendiente:**
- Capturas reales del dashboard (laptop + teléfono) — mockups quedan con
  placeholder visible hasta entonces.

## 2026-09-05 — Segmento 2: SVG del cristal + animación de luz

**Hallazgo al recortar la imagen de referencia de cerca** (usando PIL para
recortar y hacer zoom): el elemento "iluminado" no es una sola pieza — son
**2 cúmulos de cristal separados** (izquierdo grande y complejo con ~6 facetas,
derecho simple con 2 facetas), con un hueco entre ambos donde asoma el laptop.
El `CrystalPlaceholder` del Segmento 1 era una sola pieza, no fiel.

**Implementado:**
- `Crystal.astro` reemplaza `CrystalPlaceholder.astro`: SVG con viewBox
  `0 0 560 260`, facetas trazadas a mano coloreadas por tono (oscuro→claro)
  imitando el gem faceted look real.
- Barrido de luz animado: cada cúmulo tiene un `clip-path` (su silueta exterior)
  + un `<rect>` con gradiente diagonal blanco-transparente, animado con
  `transform: translate(...)` vía `@keyframes` (solo transform, cumple
  `low-impact-motion`). Delay distinto entre cúmulo izq/der para que no se
  muevan en sincronía perfecta. `prefers-reduced-motion: reduce` desactiva
  la animación.
- Verificado con build real + navegador (Chrome): comparé 2 capturas separadas
  por ~2s y confirmé visualmente que las facetas pasan de oscuras a más claras
  (el brillo sí recorre el cristal) — también confirmado por JS
  (`getComputedStyle` mostró `animationPlayState: running` y el `transform`
  cambiando entre capturas).

**Pendiente:**
- Confirmación del usuario para Segmento 3 (waitlist funcional + EmailJS) —
  sigue bloqueado por credenciales EmailJS/Gmail y correo destino.
- Capturas reales del dashboard (laptop + teléfono).

## 2026-09-05 — Segmento 4: SEO + Analytics

**Pedido:** usuario dijo "te paso las capturas ahorita, sigue con lo que
puedas" — Segmento 3 sigue bloqueado (sin credenciales EmailJS), así que se
adelantó Segmento 4 (no depende de esos bloqueos). Antes de tocar código se
preguntó por el dominio de producción (afecta `site`/`base` de Astro y todas
las URLs de SEO) — usuario confirmó que será **dominio propio**, pero aún no
da el dominio exacto.

**Decisión tomada para no bloquear:** todo el sitio usa `https://clarvo.example`
como placeholder (vía `PUBLIC_SITE_URL` en `.env`, con ese valor como fallback
en `astro.config.mjs`). `.example` es TLD reservado por RFC 2606 específicamente
para documentación/placeholders — nunca resuelve a un sitio real, así que no
hay riesgo de que quede pegado en producción sin que se note.

**Implementado:**
- `@astrojs/sitemap` instalado manual (mismo problema de `astro add` fallando
  al instalar deps automáticamente que ya se vio con tailwind) — genera
  `sitemap-index.xml` + `sitemap-0.xml` a partir de `site` en config.
- `src/pages/robots.txt.ts` — endpoint dinámico (no archivo estático) que arma
  la URL del sitemap a partir de `site`, para que nunca quede desincronizado
  del dominio real cuando se configure.
- `Layout.astro`: meta description, canonical, Open Graph, Twitter card,
  JSON-LD `Organization` (solo con los campos que sí se conocen — nombre,
  descripción, url; **sin** `sameAs` porque los links sociales del footer
  todavía son placeholder `#`, no se inventaron URLs reales).
- `Analytics.astro`: snippet de GA4 condicional a `PUBLIC_GA_MEASUREMENT_ID` —
  si no está seteado, no inyecta nada (verificado: 0 referencias a
  `googletagmanager` en el HTML de build). Así no se manda tráfico a un ID
  inventado ni se rompe nada mientras no haya Measurement ID real.
- `.env.example` creado documentando las 3 variables pendientes:
  `PUBLIC_SITE_URL`, `PUBLIC_GA_MEASUREMENT_ID`, y las 3 de EmailJS para
  cuando lleguen (Segmento 3).
- Verificado con build real: inspeccionado el HTML/XML de salida (no solo que
  el build no truena) — meta tags, JSON-LD, sitemap y robots.txt todos con
  contenido correcto.

**No se hizo (pendiente, requiere datos reales del usuario):**
- Verificación de Google Search Console (meta tag con token) — no hay token,
  no se inventa.
- `public/CNAME` para el dominio custom — no se crea con un dominio adivinado.
- og:image — no hay asset final de imagen todavía (depende de capturas reales
  + diseño final del cristal), se omite en vez de referenciar una imagen rota.

**Pendiente:**
- Dominio real de producción, Measurement ID de GA4, credenciales EmailJS,
  capturas reales del dashboard.

## 2026-09-05 — Estructura de assets (logos + capturas), preparando actualizaciones futuras

**Pedido:** usuario va a pasar logos para tema dark/light y capturas de
dashboard, avisando que los tableros van a seguir cambiando ("por ahora basate
en los que te doy pero después actualizamos") — pidió generar la carpeta de
imágenes y la estructura para que reemplazar archivos sea trivial.

**Implementado:**
- `public/images/logo/` con `README.md` documentando la convención de nombres:
  `logo-on-dark.svg`/`logo-on-light.svg` (nombrado por dónde se usa el logo,
  no por su color, para evitar la ambigüedad de qué significa "logo dark").
  Aclarado que el wordmark del hero sigue siendo texto real, no imagen — estos
  archivos son para favicon/OG/usos fuera del hero, salvo que el usuario pida
  explícitamente reemplazar el wordmark por una imagen (eso sería un cambio de
  diseño nuevo, no cubierto todavía).
- `public/images/dashboard/` con `README.md`: nombres fijos `laptop.png` /
  `phone.png`. `DashboardMockup.astro` ahora resuelve estos paths
  automáticamente vía `fs.existsSync` en build — si el usuario reemplaza el
  archivo con el mismo nombre, se recoge solo en el próximo build, sin tocar
  código. Verificado con build real que sin archivos reales sigue mostrando
  el placeholder "captura pendiente" (no rompe, no muestra imagen rota).

**Pendiente:** que el usuario coloque los archivos reales (logos + capturas).
Cuando lleguen las capturas, solo hace falta rebuildear para verlas.

## 2026-09-05 — Assets reales recibidos: capturas + logos dark/light

**Recibido y colocado:**
- `laptop.png` (captura real del "Resumen financiero" de CLARVO) — coincide
  exacto con el archivo pegado por el usuario, verificado en navegador.
- `phone.png` (vista móvil, screenshot largo de página completa) — apareció
  en el proyecto sin que yo lo copiara explícitamente; se le preguntó al
  usuario por transparencia (dado el incidente documentado en el otro
  proyecto de una herramienta tocando archivos sin avisar) y confirmó que
  pegó las 2 imágenes (PC + móvil) en el mismo mensaje. Falsa alarma, no hubo
  intervención externa.
- `logo-on-light.png` y `logo-on-dark.png` — ambos llegaron con typo en el
  nombre (`logoLight.ong.png` / `logoDark.ong.png`), renombrados a la
  convención documentada. Contenido verificado visualmente: light = texto
  azul oscuro sobre transparente, dark = texto blanco sobre transparente
  (correcto según el nombre). `logo-on-dark.png` tiene ruido de compresión
  visible alrededor de las letras — se avisó al usuario, no se "arregló" a
  ciegas porque no hay forma de saber si el original tiene mejor calidad.

**Nota de copy nueva descubierta en los logos:** el archivo de logo trae
tagline "Tu negocio bajo control", distinto al que ya está codeado en el hero
("Tu portal de gestión"). No se tocó el copy del hero — los logos por ahora
solo están guardados en `public/images/logo/`, no wireados a ningún
componente (el wordmark del hero sigue siendo texto CSS, no imagen).

**Pendiente (no bloqueante):**
- Decidir si se quiere favicon de marca (actual es el default de Astro) —
  necesitaría una versión solo-ícono, estos logos son wordmarks anchos.
- Decidir diseño de `og:image` (tarjeta social completa, no solo el logo
  transparente).
- Verificado con build real que las capturas se ven bien en el mockup
  (navegador, laptop + teléfono renderizando contenido real, sin overflow).

## 2026-09-05 — Favicon real, rehacer el cristal, logo real en el hero, EmailJS (Segmento 3), reversión de capturas

**Favicon:** el usuario pasó el PNG original de marca (diamante-V, 1254×1254,
transparente) para usar como favicon. La primera vez no se pudo procesar
porque la imagen llegó sin ruta de archivo en disco (a diferencia de otras
capturas que sí generan `pasted-image-XXXX.png` en el temp) — se le pidió al
usuario guardarla manualmente en `public/images/logo/favicon-source.png`, así
funcionó. Generado desde ahí: `favicon.ico` (16/32/48), `favicon-32.png`,
`apple-touch-icon.png` (180×180), reemplazando el default genérico de Astro.

**Hallazgo importante — el cristal del Segmento 2 estaba mal reconstruido:**
el favicon reveló que el isotipo es **una sola pieza** (diamante en forma de
V/checkmark), no 2 cúmulos separados como se había trazado a mano en SVG —
esa reconstrucción anterior era una interpretación a ciegas porque en
`siteTemporal.png` el laptop tapa el vértice donde convergen los 2 brazos.
Con el asset real disponible, se reemplazó `Crystal.astro` para usar el PNG
real (recortado a `crystal-mark.png`) en vez de polígonos a mano, con barrido
de luz vía `mask-image` (usa el canal alfa real del PNG) + `transform:
translate` — mismo principio de solo transform/opacity, pero mucho más fiel.
Iteración de posición/tamaño en navegador real (varias rondas: muy grande y
se salía del viewport, luego el sheen se veía muy lavado en blanco — se bajó
opacidad del gradiente de 0.85 a 0.45 + `mix-blend-mode: screen`) hasta que
el usuario confirmó "fiel" comparando contra un recorte de la imagen de
referencia original que mostró el mismo (vértice detrás del laptop, ambos
brazos flanqueando visibles).

**Cambio de decisión — wordmark del hero ahora es imagen, no texto:** el
usuario mostró un mock de su logo real y pidió sustituir el wordmark CSS del
Segmento 0 por la imagen `logo-on-dark.png`. Se avisó explícitamente que el
logo trae un tagline distinto horneado en el PNG ("Tu negocio bajo control"
vs. "Tu portal de gestión" del copy original) — el usuario confirmó usarlo
tal cual, tagline nuevo incluido. Se optimizó el archivo antes de usarlo
(2046×768/643KB → 900px de ancho/58KB WebP con fallback PNG) dado el énfasis
del usuario en el resultado del speed test.

**Reversión de capturas del dashboard:** después de haber colocado las
capturas reales (`laptop.png`/`phone.png`) y verificado en navegador, el
usuario pidió "no uses mis capturas, tómalas como mockup" — instrucción
ambigua que se aclaró explícitamente antes de actuar (AskUserQuestion): sí,
quitar las capturas reales del sitio y volver al placeholder. Se movieron a
`public/images/dashboard/reference/` (preservadas, no borradas) en vez de
eliminarlas, y se documentó en el README de esa carpeta cómo "publicarlas" de
vuelta cuando el usuario confirme una versión final de los tableros.

**Segmento 3 completo (waitlist + EmailJS):**
- `src/lib/waitlist.ts` (lógica pura: validación de email, honeypot anti-spam,
  chequeo de configuración) + `src/lib/waitlist.test.ts` (11 tests, Vitest,
  `npm test`) — todos pasan.
- `WaitlistForm.astro`: honeypot oculto, estados de carga/éxito/error con
  `aria-live`, deshabilita el submit con mensaje claro si faltan credenciales
  EmailJS (`PUBLIC_EMAILJS_*` en `.env`, todavía no dadas por el usuario).
  Verificado en navegador real: sin `.env`, el form se deshabilita
  correctamente y no hay errores de consola. **No se ha podido probar el
  envío real de un correo** porque faltan las credenciales EmailJS/Gmail y el
  correo destino — eso queda pendiente para cuando el usuario las dé.

**Pendiente:** credenciales EmailJS reales (probar envío end-to-end), versión
final de tableros (recuperar capturas de `reference/`), dominio real,
Measurement ID de GA4, diseño de `og:image`. Confirmación del usuario para
avanzar a Segmento 5 (deploy).
