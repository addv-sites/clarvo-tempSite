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

## 2026-09-05 — Segmento 1b: mockup hero girado sobre el cristal (laptop + teléfono)

**Pedido:** usuario compartió `siteTemporal.png` y pidió el mockup hero fiel
a esa imagen — laptop + teléfono en ángulo, superpuestos sobre el isotipo
Crystal cubriendo su vértice, picos asomando arriba. Primero dijo usar "los
mocks" (se entendió como las capturas reales guardadas en `reference/`);
tras ver la propuesta corrigió explícitamente: usar el contenido que ya
aparece dentro de la propia imagen `siteTemporal.png`, no sus capturas
reales (esas se quedan sin tocar en `reference/`).

**Análisis/crítica (protocolo completo antes de tocar código):** se generó
un artifact HTML de comparación lado a lado (referencia recortada vs.
propuesta CSS) usando las imágenes como data URIs, sin tocar el proyecto
real todavía. Crítica explícita: la referencia es un render 3D fotográfico
(aluminio, reflejos), un mockup CSS puro (`transform`/`opacity`, sin
librería — regla fija del proyecto, skill `low-impact-motion`) se acerca
mucho pero no es pixel-idéntico; alternativa (imagen compuesta única)
descartada por perder responsividad y el flujo de "reemplaza el PNG y ya".
Usuario aprobó el approach CSS y pidió implementar, corrigiendo el origen
del contenido de pantalla (ver arriba).

**Implementado:**
- `DashboardMockup.astro` reescrito: absorbe `Crystal` internamente (antes
  vivía suelto en `index.astro`) y arma el "stage" completo — laptop con
  bisel/base metálica (`clip-path`) + pantalla a `aspect-ratio` exacto del
  recorte real, teléfono rotado con notch superpuesto en el ángulo
  inferior-derecho. `index.astro` simplificado a `<DashboardMockup />` solo.
- Ajuste de posicionamiento (no trivial): el primer intento con
  `padding-top` en `.rig` dejaba un hueco entre cristal y laptop sin
  superponerse. Diagnosticado con capturas de pantalla reales (Edge headless
  vía `msedge.exe --headless --screenshot`, porque la extensión de Chrome no
  estaba conectada en esta sesión) — se corrigió a `margin-top: -46%` en
  `.rig` para jalar el laptop dentro del área del cristal. Verificado
  visualmente contra la referencia en desktop (1440px) y móvil (390px).
- Contenido de pantalla: `public/images/dashboard/laptop.png` (544×398) y
  `phone.png` (146×360) son recortes exactos de `siteTemporal.png` (medidos
  por muestreo de píxeles de la imagen original 1536×1024), reemplazando el
  placeholder "captura pendiente" que estaba activo desde el segmento
  anterior. Las capturas reales del usuario en `reference/` quedan intactas,
  sin usar.
- Verificado: `npm test` (11/11), `astro build` sin errores, sin regresiones
  visibles en el resto del hero/página.

**Pendiente:** contenido de pantalla sigue siendo temporal (recorte de foto
de referencia, no captura navegable real) — reemplazar cuando el usuario
confirme los tableros definitivos.

## 2026-09-05 (mismo día) — Corrección de recortes/ángulo + reemplazo waitlist por CTA WhatsApp

**Pedido doble del usuario:** (1) el mockup se veía "mal cortado" — texto y
tarjetas del teléfono cortados a la mitad, contenido inclinado dentro de un
marco recto, laptop plano sin sensación de ángulo real; (2) cambiar el
requerimiento de la waitlist por email: en vez de capturar correo, mandar al
visitante a unirse a la comunidad de WhatsApp de CLARVO (link de invitación
dado), cambiar el ícono de sobre por uno de WhatsApp manteniendo el mismo
color, y que el botón tenga un pulso sutil para llamar la atención.

**Fix de imágenes:** el teléfono venía de un recorte rectangular de la foto
de referencia, pero el teléfono está fotografiado en ángulo (~6°) — un
recorte recto de contenido rotado corta texto de forma impredecible ("RVO"
en vez de "CLARVO"). Se re-recortó con margen, se enderezó con
`PIL.Image.rotate(6)` (ángulo medido por muestreo de píxeles del bisel), y se
recortó exacto a la pantalla ya derecha (nuevo `phone.png`, 135×362, sin
rotación horneada — la inclinación visual la pone el CSS `rotate(9deg)`,
sola, sin doble-inclinación). De paso se encontró un bug propio: un "notch"
decorativo que yo había agregado (`.phone-screen::before`) tapaba la mitad
del wordmark "CLARVO" real de la captura — eliminado, la captura ya trae su
propio header. Para el laptop, el problema era que `rotateX(7deg)` no tenía
`perspective` en ningún ancestro (se ve casi plano sin eso) — se agregó
`perspective: 1400px` + se subió a `rotateX(15deg) rotateY(-4deg)
rotate(-1deg)`, ahora con fuga real (trapecio), como foto en ángulo. Todo
verificado con capturas de pantalla reales (Edge headless) en desktop y
móvil, comparado contra la captura que mandó el usuario.

**Reemplazo waitlist → comunidad WhatsApp:** decisión explícita del usuario,
revierte el Segmento 3 (EmailJS) que estaba completo y probado. Eliminado
`WaitlistForm.astro` + `src/lib/waitlist.ts` + `waitlist.test.ts` (11 tests) —
vive en el historial de git si hace falta recuperarlo. Nuevo
`CommunityCta.astro`: mismo layout de card, ícono de WhatsApp (SVG inline,
mismo patrón que los íconos de marca de `Footer.astro`) con el mismo color
que tenía el sobre, botón como `<a>` (no formulario) al link de invitación
con `target="_blank" rel="noopener noreferrer"`, halo de pulso sutil
alrededor del botón vía `opacity`/`transform:scale` (regla del proyecto,
`low-impact-motion`), respeta `prefers-reduced-motion`. `@emailjs/browser`
quedó en `package.json` sin usar — no se desinstaló sin confirmación aparte
(regla del protocolo sobre quitar dependencias). Se agregó
`vitest.config.ts` con `passWithNoTests: true` porque `npm test` empezó a
fallar con "No test files found" al no quedar ningún test en el proyecto —
documentado en vez de fabricar un test artificial.

**Verificado:** `npm test` (exit 0, sin tests), `astro build` sin errores,
capturas de pantalla reales confirmando ambos cambios en desktop y móvil.

**Pendiente:** decidir si se desinstala `@emailjs/browser`; contenido de
pantalla del mockup sigue temporal (recorte de referencia, no tablero real).

## 2026-09-05 (mismo día) — Cambio de approach: recorte real de la imagen en vez de CSS, + ajustes finales

**Pedido del usuario:** desinstalar `@emailjs/browser` (confirmado), centrar
el botón, arreglar el texto "Simple. Poderoso. Tuyo." (no se distinguía), y
sobre todo: el mockup CSS del laptop/teléfono "no queda bien... siguen
viéndose los cortes" — pidió tomar literalmente el laptop+teléfono de
`siteTemporal.png` (con las gráficas incluidas), quitarle solo el fondo, y
usar eso en vez de la reconstrucción CSS. Pidió propuesta visual antes/después
de nuevo (protocolo). Después, a media tarea, mandó el link nuevo del canal
de WhatsApp (`https://whatsapp.com/channel/0029VbDBw54G8l59H2IDES1o`,
reemplaza el link de grupo anterior).

**Diagnóstico de por qué "se veían los cortes":** no era el crop en sí (ya
corregido en la ronda anterior) — era la perspectiva 3D CSS (`rotateX`/
`rotateY` + `perspective`) que le había agregado para simular "foto en
ángulo": el navegador tiene que re-samplear/interpolar el texto de la
captura en ese ángulo, y a este tamaño se ve borroso, leyéndose como
"cortado". Antes de llegar a la solución final se hizo una ronda intermedia
(bajar la perspectiva a algo sutil) que ya mejoraba bastante, pero el
usuario pidió ir más allá y directamente usar la foto real.

**Solución final — recorte real con fondo quitado:**
- Sin `scipy` disponible (sin acceso a red en el entorno) — implementado a
  mano con `numpy`: flood-fill por conectividad de color desde los bordes
  del recorte (no un umbral de color global), porque la barra lateral azul
  marino de la app y el fondo del sitio son casi idénticos en color — un
  umbral global se hubiera comido la barra lateral completa (pasó en el
  primer intento). Fix: erosionar la máscara candidata (radio 8px) antes del
  flood-fill y dilatarla de vuelta después, para no dejar que costuras de
  1-2px de antialiasing entre el bisel negro y el fondo actúen como "puente"
  y inunden el interior del laptop. Limpieza manual final de 2 fragmentos de
  texto de marketing sueltos que quedaban dentro del recorte ("Poderoso.
  Tuyo." y "Todo tu negocio..." de la imagen original — esos ya los pone el
  sitio por su cuenta vía CSS, no debían venir horneados en la imagen).
- Guardado como `public/images/dashboard/devices.png` (710×545 RGBA con
  transparencia), reemplaza `laptop.png`/`phone.png` (borrados).
- `DashboardMockup.astro` simplificado a lo mínimo: `Crystal` + una sola
  `<img>`, sin bisel/base/marco dibujados a mano. Posicionamiento **medido
  por píxeles**, no a ojo: bbox del cristal en `siteTemporal.png`
  `x[666,1171] y[46,559]`, bbox del recorte de dispositivos
  `x[770,1480] y[185,730]` → bbox combinado `x[666,1480] y[46,730]`, de ahí
  salen los porcentajes exactos de `.crystal`/`.devices` en el componente.
  Resultado: coincide con la referencia al pixel porque es literalmente la
  misma foto — ya no hay fugas de recorte ni pérdida de nitidez.
- Contra documentado (para el futuro): al ser una foto, actualizar el
  contenido de pantalla requiere repetir recorte+quitado de fondo sobre la
  imagen nueva, no se puede editar con código — aceptado por ser temporal
  hasta que lleguen los tableros definitivos.

**Otros ajustes del mismo pase:**
- `@emailjs/browser` desinstalado (`npm uninstall`, confirmado).
- Botón centrado (`flex justify-center`).
- Texto "Simple. Poderoso. Tuyo." → blanco + semi-negrita + sombra de texto
  (antes gris claro sobre el cristal brillante, ilegible).
- Link de WhatsApp actualizado a canal (no grupo) — copy de
  `CommunityCta.astro` ajustado para no prometer interacción bidireccional
  que un canal (broadcast) no tiene: "Síguenos en WhatsApp" / "Seguir el
  canal", ya no "conecta con otros emprendedores".

**Verificado:** `npm test`, `astro build`, capturas de pantalla reales
(desktop 1440px y móvil 390px) confirmando cada cambio contra la referencia.

**Pendiente:** contenido de pantalla del mockup sigue temporal (recorte de
`siteTemporal.png`, no un tablero navegable real) — reemplazar `devices.png`
cuando lleguen los tableros definitivos, repitiendo el mismo proceso de
recorte + quitado de fondo.

## 2026-09-05 (mismo día) — Mockup definitivo del usuario + bug crítico de build encontrado

El recorte de `siteTemporal.png` "no quedó bien" — el usuario pidió quitar
el mockup entero y dejar solo el cristal de fondo (como al inicio del
proyecto), y luego pasó **`ClarvoMock.png`**: mockup profesional ya armado
(laptop+teléfono+gráficas+los 2 globos de texto horneados, fondo
transparente real) pidiendo agregarlo optimizado.

**Implementado:** recorte del margen transparente sobrante, guardado como
`devices.png` (PNG fallback) + `devices.webp` (calidad 82, **176KB, 85%
menos que el PNG**) — `<picture>` con WebP primero. Como el globo de texto
ya viene horneado en la imagen, se quitaron los `<p class="caption">` de CSS
(hubieran quedado duplicados). Posición del cristal detrás ajustada a ojo
(esta imagen no viene de `siteTemporal.png`, no hay coordenadas que medir).

**Bug crítico encontrado (no cosmético):** `publicFileExists()` resolvía la
ruta con `import.meta.url` — funciona en `astro dev` pero en `astro build`
el componente se empaqueta en `dist/.prerender/chunks/*.mjs`, así que
`import.meta.url` apunta ahí y la ruta relativa resuelve dentro de `dist/`
en vez de `public/` real. Confirmado con debug: `existsSync` daba `false`
en build → el build de producción mostraba el placeholder "Captura
pendiente", aunque `astro dev` se viera perfecto. **Este patrón se usó
desde que se creó `DashboardMockup.astro` — es posible que los mockups
anteriores nunca se hayan visto en un build de producción real**, solo en
dev, porque las verificaciones previas solo comprobaban que `astro build`
no tronara sin inspeccionar el HTML de salida.

**Fix:** `path.join(process.cwd(), "public", publicPath)` en vez de
`import.meta.url` — `process.cwd()` es la raíz del proyecto en ambos modos.
Verificado inspeccionando el HTML real de `dist/` (ya no aparece
`screen-placeholder`, sí aparece `src="/images/dashboard/devices.png"`).

**Lección aplicada:** de ahora en más, cualquier componente con fallback
condicional se verifica inspeccionando el output real del build, no solo
el exit code.

## 2026-09-05 (mismo día) — Segmento 5: deploy a GitHub Pages, dominio clarvo.mx

**Pedido:** desplegar a GitHub Pages, usuario dijo "ya está configurado el
actions", dio el dominio `clarvo.mx`, pidió solicitar certificados y pasar a
producción.

**Hallazgo (contradice al usuario, se avisó en vez de asumir):**
`git ls-remote origin` vacío — el repo remoto nunca tuvo un commit, no
existía `.github/workflows/` ni local ni remoto. El Actions no estaba
configurado, a pesar de lo que creía el usuario.

**Implementado:** `.github/workflows/deploy.yml` (solo acciones oficiales
de primera parte — `checkout`, `setup-node`, `configure-pages`,
`upload-pages-artifact`, `deploy-pages` — nada de terceros sin auditar) que
corre `npm ci && npm test && npm run build` y despliega `dist/` en cada
push a `main`. `public/CNAME` con `clarvo.mx`. `astro.config.mjs`: dominio
real reemplaza el placeholder `clarvo.example`. Verificado con build real
que canonical/og:url/robots.txt/sitemap ya apuntan a `https://clarvo.mx` y
`dist/CNAME` se copia bien.

**Lo que NO se hizo desde aquí (fuera del repo, sin herramienta para
tocarlo — no hay `gh` CLI en este entorno):**
1. DNS de `clarvo.mx` en el registrador — necesita registros A a las 4 IPs
   de GitHub Pages (`185.199.108/109/110/111.153`), documentado en
   `project_state.md` con el detalle completo.
2. GitHub → Settings → Pages → campo "Custom domain" = `clarvo.mx` +
   esperar el check de DNS + activar "Enforce HTTPS" — así es como GitHub
   realmente "solicita" el certificado (Let's Encrypt automático en cuanto
   el DNS resuelve), no es una acción aparte que se pueda disparar antes.

**Pendiente:** que el usuario haga esos 2 pasos manuales — sin eso el sitio
solo sirve en la URL default de Pages, no en `clarvo.mx`.
