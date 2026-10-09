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
- **Waitlist por email (EmailJS) reemplazada por CTA a comunidad de WhatsApp**
  (2026-09-05, ver sección propia abajo) — decisión explícita del usuario,
  revierte el Segmento 3 anterior.
- **Capturas del dashboard: el usuario dio 2 capturas reales pero pidió NO
  usarlas** ("tómalas como mockups, no uses mis capturas") — preservadas sin
  usar en `public/images/dashboard/reference/`. El mockup hero actual usa
  `public/images/dashboard/devices.png` (recorte real de `siteTemporal.png`
  con el fondo quitado, ver Segmento 1b). Reemplazar ese archivo (mismo
  proceso: recortar + quitar fondo) cuando el usuario confirme una versión
  final navegable de los tableros.
- Repo: `addv-sites/clarvo-tempSite.git`, clonado en `D:\srv\clarvo-tempSite`
  (carpeta hermana de `D:\srv\clarvo`, repo git independiente).
- No hizo falta `imagenes.md`/prompt de ChatGPT — todos los assets necesarios
  llegaron directo del usuario (logos, favicon) o se resolvieron con librería
  de iconos (Lucide) / SVG a mano (iconos sociales, bandera MX).

## Segmento 3 — Waitlist + EmailJS (histórico, reemplazado 2026-09-05)
Este segmento se dio por completo (`WaitlistForm.astro` + `src/lib/waitlist.ts`
+ 11 tests unitarios + integración EmailJS end-to-end pendiente solo de
credenciales) pero el usuario **cambió el requerimiento**: en vez de capturar
el correo para una waitlist, quiere mandar al visitante a unirse directo a la
comunidad de WhatsApp de CLARVO. Código eliminado (vive en el historial de
git si hace falta recuperarlo): `src/components/WaitlistForm.astro`,
`src/lib/waitlist.ts`, `src/lib/waitlist.test.ts`. `.env.example` ya no
documenta las 3 variables `PUBLIC_EMAILJS_*`. La dependencia `@emailjs/browser`
**se dejó en `package.json` sin usar** — no se desinstaló sin confirmación
explícita (regla del protocolo: quitar dependencias es una acción que hay que
confirmar aparte). Ver "Segmento 3b" abajo para el reemplazo.

## Segmento 3b — CTA "Únete a la comunidad" (WhatsApp) (2026-09-05)
- `src/components/CommunityCta.astro` (nuevo, reemplaza `WaitlistForm.astro`
  en `index.astro`): mismo layout de card que antes (ícono en círculo +
  título + descripción + botón), pero:
  - Ícono: WhatsApp (SVG inline, mismo patrón que los íconos de marca de
    `Footer.astro` — Lucide no trae íconos de marca) — **mismo color que el
    sobre anterior** (`bg-brand-cyan/15 text-brand-cyan`), tal como pidió el
    usuario.
  - Botón ("Unirme a la comunidad") es un `<a>` al link de invitación de
    WhatsApp (`target="_blank" rel="noopener noreferrer"` — seguridad básica
    contra reverse tabnabbing), no un formulario. Link de invitación es
    público (no es un secreto), se hardcodea directo en el componente.
  - **Halo de pulso sutil** alrededor del botón para llamar la atención,
    pedido explícito del usuario ("que dé flashazos, sutiles pero que se
    noten") — implementado con `opacity`/`transform: scale` solamente (regla
    fija del proyecto, ver `low-impact-motion`), respeta
    `prefers-reduced-motion` (sin animación, halo oculto).
- Sin lógica de validación/estado que testear (no hay input de usuario) — la
  verificación fue funcional: build real + captura de pantalla en navegador
  confirmando el link, el ícono y el halo.
- `vitest.config.ts` (nuevo): `test.passWithNoTests: true` — sin esto, `npm
  test` fallaba con "No test files found" al quedar el proyecto sin ningún
  archivo de test tras borrar `waitlist.test.ts`. Documentado explícitamente
  en vez de fabricar un test artificial solo para tener uno.

## Plan segmentado
| # | Segmento | Estado |
|---|---|---|
| 0 | Setup: clonar repo, scaffold Astro + Tailwind, estructura de carpetas | **Hecho** |
| 1 | Maqueta estática fiel a la imagen (hero, wordmark, waitlist card, 5 features, footer) | **Hecho** — wordmark ahora es imagen real (ver arriba); mockup del dashboard (laptop+teléfono girados, cubriendo el cristal) implementado, ver sección propia abajo |
| 2 | Isotipo + animación de luz | **Hecho, rehecho con asset real** (ver arriba) — más fiel que la v1 con SVG a mano |
| 3 | ~~Waitlist funcional + integración EmailJS~~ → CTA comunidad WhatsApp | **Reemplazado** (2026-09-05) — ver Segmento 3b, requerimiento cambió por decisión del usuario |
| 4 | SEO + Analytics (meta tags, JSON-LD, sitemap.xml, robots.txt, GA4, Search Console) | **Hecho** (parcial, ver pendientes) |
| 5 | Deploy GitHub Actions → GitHub Pages | **Código listo, esperando pasos manuales del usuario** (ver Segmento 5 abajo) |
| 6 | Landing `/masterclass` (funnel de captura de leads + retema de mockups de `stitch/`) | **Código completo, esperando 2 insumos del usuario antes de desplegar** (ver Segmento 6 abajo) |

## Pendiente de confirmar/recibir del usuario
- Versión final de los tableros (dashboard) — el mockup hero ya usa
  `ClarvoMock.png` (dado por el usuario, ver Segmento 1d), pero sigue siendo
  un mockup, no un tablero navegable real. Cuando el usuario confirme una
  versión final, reemplazar `public/images/dashboard/devices.png`/`.webp`.
- **3 pasos manuales para terminar el deploy — no ejecutables desde aquí**
  (sin `gh` CLI instalado en este entorno, y de todas formas viven fuera del
  repo — DNS del registrador, Settings de GitHub): ver Segmento 5 abajo,
  sección "Lo que falta y por qué no lo hice yo".
- Measurement ID de GA4 (`PUBLIC_GA_MEASUREMENT_ID`) — sin esto no se inyecta
  nada (confirmado, no rompe), pero tampoco hay analítica activa. El
  workflow de deploy ya lo lee de una variable de repo (`vars.PUBLIC_GA_MEASUREMENT_ID`)
  si se agrega en Settings → Secrets and variables → Actions → Variables.
- Verificación de Google Search Console — no bloqueante para salir a
  producción, se puede hacer después.
- Decisión pendiente (no bloqueante): diseño de `og:image` — el logo
  transparente solo no sirve como preview social, necesitaría una tarjeta
  completa (logo + fondo + texto).

## Estructura de assets
- `public/images/logo/`: `logo-on-dark.png/.webp` (usado en el hero/footer,
  optimizado), `logo-on-light.png/.webp` (guardado, no usado todavía),
  `favicon-source.png` (original 1254×1254 sin recortar, de donde salen
  favicon + `crystal-mark.png`), `crystal-mark.png` (recorte ajustado usado
  por `Crystal.astro`).
- `public/images/dashboard/`: `devices.png` **activo** — recorte real de
  laptop+teléfono de `siteTemporal.png` con el fondo quitado (pantalla
  "Inicio" de la foto de referencia), no las capturas reales del usuario.
  `reference/laptop.png` y `reference/phone.png` — capturas reales que el
  usuario dio, preservadas pero sin usar (el usuario pidió explícitamente no
  usarlas como contenido del mockup). Ver el `README.md` de esa carpeta para
  el detalle y cómo reemplazar cuando llegue la versión final.
- README.md en cada carpeta con la convención de nombres.

## Segmento 1b — Mockup hero (laptop + teléfono girados sobre el cristal) (2026-09-05)

**Pedido:** el usuario compartió `siteTemporal.png` (mockup de referencia
completo, guardado en la raíz del repo) y pidió que el hero fuera fiel a esa
imagen: laptop + teléfono en ángulo, superpuestos sobre el isotipo Crystal
tapando su vértice (los 2 picos del isotipo asoman arriba, flanqueando el
laptop), usando temporalmente los mocks disponibles — luego corrigió que
"los mocks" significa el contenido que ya aparece dentro de la propia imagen
`siteTemporal.png`, no las capturas reales que el usuario había dado antes
(esas se quedan sin usar en `reference/`).

**Análisis/crítica (protocolo, antes de implementar):** se armó un artifact
de comparación lado a lado (referencia vs. propuesta) antes de tocar código,
señalando explícitamente que un mockup CSS (`transform`/`opacity` puro, sin
librería — regla fija del proyecto) se acerca al render 3D fotográfico de la
referencia pero no es pixel-idéntico; alternativa descartada (imagen
compuesta única) por perder responsividad y el flujo actual de "reemplaza el
PNG y ya" cuando lleguen tableros reales. Usuario aprobó el approach CSS.

**Implementado:**
- `DashboardMockup.astro` reescrito completo: ya no es un rectángulo plano.
  Ahora renders `Crystal` internamente (antes vivía en `index.astro`) y arma
  un "stage" con laptop (bisel + base metálica con `clip-path`, pantalla con
  `aspect-ratio` exacto al recorte real) y teléfono (rotado, notch, superpuesto
  al ángulo inferior-derecho del laptop) — todo con `transform`/`opacity`
  solamente. `index.astro` simplificado a solo `<DashboardMockup />`.
- **Ajuste de posicionamiento no trivial:** el primer intento (rig con
  `padding-top: 19%`) dejaba un hueco grande entre el cristal y el laptop en
  vez de superponerlos — el laptop no llegaba a cubrir el vértice. Diagnóstico
  con capturas de pantalla reales (Edge headless, sin extensión de Chrome
  conectada en esta sesión) confirmó que hacía falta **superposición fuerte**,
  no solo padding pequeño: se cambió a `margin-top: -46%` en `.rig` (jala el
  laptop hacia arriba, dentro del área del cristal) + `stage` con padding-top
  reducido a 2%. Verificado visualmente contra la referencia — muy cercano
  (picos asomando arriba, vértice tapado, teléfono en el ángulo correcto).
- **Contenido de pantalla:** `public/images/dashboard/laptop.png` (544×398) y
  `phone.png` (146×360) son recortes exactos de `siteTemporal.png` (coords
  medidas por muestreo de píxeles: laptop `(808,214)-(1352,612)`, teléfono
  `(1308,318)-(1454,678)` en la imagen original 1536×1024) — no las capturas
  reales del usuario. Ver detalle en `public/images/dashboard/README.md`.
- Verificado: `npm test` (11/11 pasan, sin relación directa pero confirma que
  nada se rompió), `astro build` completa sin errores, capturas de pantalla
  reales en desktop (1440px) y móvil (390px) confirmando que el mockup escala
  bien y sigue superpuesto correctamente en ambos breakpoints.

### Corrección 2026-09-05 (mismo día): recortes se veían mal cortados, laptop se veía plano

El usuario marcó dos problemas con captura real en mano: (1) el teléfono
mostraba texto/tarjetas cortadas a la mitad ("RVO" en vez de "CLARVO",
"nventario" sin la "I") y contenido visiblemente inclinado dentro de un marco
recto; (2) el laptop se veía como una imagen plana pegada, no como algo
fotografiado en ángulo.

**Causa raíz (teléfono):** el recorte original venía directo de la foto de
referencia, donde el teléfono está fotografiado en ángulo (~6° rotado) — un
recorte rectangular de contenido rotado, puesto dentro de un marco CSS recto,
corta contenido de forma impredecible y no alinea con el marco.

**Fix:** recorte generoso del teléfono en `siteTemporal.png`, enderezado con
`PIL.Image.rotate(6°)` (medido por muestreo de píxeles del borde del bisel en
varias filas) y luego recortado exacto a la pantalla ya derecha — nuevo
`phone.png` es 135×362, sin rotación horneada, contenido completo (wordmark
"CLARVO" entero, las 4 tarjetas completas). La rotación visual del teléfono
en el sitio ahora la pone el CSS (`transform: rotate(9deg)` en `.phone`, sin
tocar), consistente y sin doble-inclinación.

**Fix (laptop, "se ve plano"):** el `rotateX(7deg)` original no tenía
`perspective` en ningún ancestro — sin eso, una rotación 3D en CSS se ve casi
sin profundidad (proyección ortográfica). Se agregó `perspective: 1400px` en
`.rig` y se subió la transformación a `rotateX(15deg) rotateY(-4deg)
rotate(-1deg)` en `.laptop-body` — ahora el lado derecho de la pantalla se ve
en fuga real (trapecio), como una foto en ángulo, no un rectángulo plano.

**Bug propio encontrado en el camino:** el "notch" falso del teléfono
(`.phone-screen::before`, un círculo decorativo que yo había agregado para
simular cámara frontal) tapaba la mitad del wordmark "CLARVO" real de la
captura — la captura ya trae su propio header de teléfono, el notch de
adorno sobraba. Eliminado.

Verificado con capturas de pantalla reales (desktop y móvil) tras cada
cambio — confirmado visualmente contra la imagen que mandó el usuario, sin
texto ni tarjetas cortadas, laptop con profundidad real.

**Pendiente:** contenido de pantalla sigue siendo temporal (recorte de la
imagen de referencia, no una captura navegable real) — reemplazar
`devices.png` (ver Segmento 1c) cuando el usuario confirme los tableros
definitivos.

## Segmento 1c — Mockup hero: recorte real de la imagen en vez de CSS a mano (2026-09-05, mismo día)

Ni el approach CSS-plano ni el CSS-con-perspectiva-3D del Segmento 1b
convencieron al usuario ("no queda bien... siguen viéndose los cortes"). El
usuario pidió un cambio de approach completo: en vez de reconstruir el
laptop/teléfono con `div`s + CSS, **tomar literalmente el laptop+teléfono de
`siteTemporal.png` (con todo y las gráficas) y quitarle solo el fondo**.

**Implementado:**
- Recorte de `siteTemporal.png` región `(770,185)-(1480,730)` (imagen
  original 1536×1024) con laptop+teléfono completos.
- Fondo quitado con **flood-fill por conectividad de color desde los bordes**
  (no un umbral de color global) — necesario porque la barra lateral de la
  app (azul marino) y el fondo del sitio son casi el mismo color; un umbral
  global se hubiera comido la barra lateral. Se usó erosión+flood-fill+dilate
  (radio 8px) para evitar fugas por costuras de 1-2px de antialiasing entre
  el bisel negro y el fondo. Limpieza manual de 2 fragmentos de texto de
  marketing sueltos dentro del recorte ("Simple. Poderoso. Tuyo." y "Todo tu
  negocio..." de la imagen original, que el sitio ya pone por su cuenta).
  Sin `scipy` disponible (sin red en el entorno) — implementado a mano con
  `numpy` (dilatación/erosión binaria por desplazamiento de arrays).
- Guardado como `public/images/dashboard/devices.png` (710×545, RGBA con
  transparencia). `laptop.png`/`phone.png` de la versión anterior, borrados.
- `DashboardMockup.astro` simplificado drásticamente: ya no hay bisel/base
  dibujados a mano ni contenedores de pantalla — solo `Crystal` + una
  `<img>` (`devices.png`), ambos posicionados con porcentajes **medidos por
  píxeles** en `siteTemporal.png` (bbox del cristal `x[666,1171] y[46,559]`,
  bbox del recorte `x[770,1480] y[185,730]` → bbox combinado
  `x[666,1480] y[46,730]`), no ajustados a ojo. Detalle completo del cálculo
  en el comentario del `<style>` del componente y en el `README.md` de
  `public/images/dashboard/`.
- Resultado: coincide visualmente con la referencia al pixel (es la misma
  foto), sin las fugas de recorte/legibilidad que tenía el approach CSS.
- **Contra documentado:** al ser una foto, cambiar el contenido de las
  pantallas requiere repetir recorte+quitado de fondo sobre la imagen nueva,
  no se puede editar con código — aceptado por ser temporal.

**También en este mismo pase:**
- `@emailjs/browser` desinstalado (`npm uninstall`, confirmado explícito del
  usuario) — ya no queda dependencia sin usar.
- Botón "Seguir el canal" (antes "Unirme a la comunidad") centrado
  (`flex justify-center`) en vez de alineado a la izquierda.
- Texto "Simple. Poderoso. Tuyo." con bajo contraste sobre el cristal —
  cambiado a blanco + semi-negrita + sombra de texto.
- **Link de WhatsApp cambiado de grupo a canal** (`https://whatsapp.com/channel/0029VbDBw54G8l59H2IDES1o`,
  dado directamente por el usuario) — un canal de WhatsApp es de difusión
  unidireccional (broadcast), no un chat grupal donde los miembros
  interactúan entre sí. Copy del `CommunityCta.astro` ajustado para
  reflejar eso con precisión: "Síguenos en WhatsApp" / "Entérate de las
  novedades... directo en nuestro canal" / botón "Seguir el canal" — antes
  decía "conecta con otros emprendedores", que ya no aplica a un canal.
- Verificado: `npm test`, `astro build`, capturas de pantalla reales
  (desktop y móvil) confirmando todos los cambios.

## Segmento 1d — Mockup definitivo del usuario (`ClarvoMock.png`) + bug de build crítico encontrado (2026-09-05, mismo día)

El recorte de `siteTemporal.png` del Segmento 1c "no quedó bien" — el usuario
pidió quitar el mockup por completo y dejar solo el cristal de fondo (como
al principio del proyecto). Luego pasó **`ClarvoMock.png`**: un mockup
profesional ya armado (laptop + teléfono + gráficas + **los dos globos de
texto ya horneados** — "Simple. Poderoso. Tuyo." / "Todo tu negocio en la
palma de tu mano" — con fondo transparente real, no hubo que quitarlo a
mano) y pidió agregarlo optimizado para carga rápida.

**Implementado:**
- Recorte del margen transparente sobrante (`Image.getbbox()`), 1535×1024 →
  1507×1024. Guardado como `public/images/dashboard/devices.png` (PNG
  fallback, 1.2MB) + `public/images/dashboard/devices.webp` (calidad 82,
  **176KB — 85% menos que el PNG**). `DashboardMockup.astro` ahora sirve
  `<picture>` con el WebP como fuente primaria y el PNG como fallback (mismo
  patrón que `logo-on-dark.webp`/`.png`).
- Como esta imagen ya trae los globos de texto horneados, se quitaron los
  `<p class="caption">` de CSS del componente (habrían quedado duplicados).
- Posicionamiento del cristal detrás del mockup **ajustado a ojo** (no medido
  por píxeles como en el Segmento 1c) — esta imagen no viene de
  `siteTemporal.png`, no hay correspondencia de coordenadas que medir.
  Verificado visualmente contra varias iteraciones de captura de pantalla.

**Bug crítico encontrado (no cosmético — afectaba producción):**
`publicFileExists()` resolvía la ruta del archivo con
`fileURLToPath(new URL("../../public" + publicPath, import.meta.url))`. En
`astro dev` esto apunta al archivo fuente real y funciona. **En `astro
build`, el componente se empaqueta dentro de `dist/.prerender/chunks/*.mjs`
— `import.meta.url` apunta ahí, y `../../public` resuelve dentro de `dist/`
en vez de la carpeta `public/` real del proyecto.** Confirmado con debug
directo: `diskPath` resolvía a `dist\public\images\dashboard\devices.png`
(no existe) → `existsSync` devolvía `false` → el build de producción
mostraba el placeholder "Captura pendiente" en vez de la imagen, **aunque el
`astro dev` local se viera perfecto**. Este mismo patrón se usó desde que se
creó `DashboardMockup.astro` (Segmentos 1b/1c) — es decir, **es posible que
los mockups anteriores nunca se hayan visto en un build de producción real**,
solo en dev. No se había detectado porque las verificaciones anteriores solo
comprobaban que `astro build` no tronara, sin inspeccionar el HTML de salida
para confirmar que la imagen (no el placeholder) quedara en el output.

**Fix:** resolver con `path.join(process.cwd(), "public", publicPath)` en
vez de `import.meta.url` — `process.cwd()` es la raíz del proyecto tanto en
`astro dev` como en `astro build`. Verificado con debug (`cwdExists: true`
en build) y luego confirmado en el HTML de salida real
(`grep 'src="/images/dashboard/devices.png"' dist/index.html` — ya no
aparece `screen-placeholder`).

**Lección para futuras verificaciones:** "el build no truena" no es lo
mismo que "el build muestra lo correcto" — a partir de ahora, cualquier
componente con fallback condicional (`existsSync`, feature flags, etc.) se
verifica inspeccionando el HTML/output real del build, no solo el exit code.

## Segmento 5 — Deploy a GitHub Pages, dominio `clarvo.mx` (2026-09-05)

**Pedido:** el usuario pidió desplegar a GitHub Pages, dijo "ya está
configurado el actions" y dio el dominio `clarvo.mx`, pidiendo solicitar los
certificados y dar pase a producción.

**Hallazgo importante (contradice lo que creía el usuario):**
`git ls-remote origin` devolvió **vacío** — el repo remoto
(`addv-sites/clarvo-tempSite`) no tiene ni un solo commit todavía, nunca se
ha hecho push. No existía `.github/workflows/` ni localmente ni (por
definición, dado que el remoto está vacío) en GitHub — el Actions **no**
estaba configurado. Se avisó explícitamente en vez de asumir que sí estaba
y seguir de largo.

**Implementado (todo lo que sí se puede hacer desde el repo):**
- `.github/workflows/deploy.yml` — workflow estándar de GitHub (acciones
  oficiales `actions/checkout`, `actions/setup-node`,
  `actions/configure-pages`, `actions/upload-pages-artifact`,
  `actions/deploy-pages` — nada de terceros/comunidad, todas de primera
  parte, ya auditadas por GitHub). Corre en cada push a `main` (+
  `workflow_dispatch` manual): `npm ci` → `npm test` → `npm run build` →
  sube `dist/` → despliega a Pages. `PUBLIC_SITE_URL` fijo a
  `https://clarvo.mx` en el paso de build; `PUBLIC_GA_MEASUREMENT_ID` lee de
  `vars.PUBLIC_GA_MEASUREMENT_ID` (variable de repo, vacía por ahora — no
  rompe, solo no manda analítica hasta que se configure).
- `public/CNAME` con `clarvo.mx` — Astro lo copia tal cual a `dist/CNAME`
  (verificado).
- `astro.config.mjs`: el dominio real (`https://clarvo.mx`) reemplaza el
  placeholder `clarvo.example` (RFC 2606) como default — sigue
  overrideable vía `PUBLIC_SITE_URL` en `.env` para builds locales contra
  otro dominio.
- Verificado con build real: `canonical`, `og:url`, `robots.txt` y
  `sitemap-index.xml` todos apuntando a `https://clarvo.mx` correctamente;
  `dist/CNAME` presente con el contenido correcto.

**Lo que falta y por qué no lo hice yo:** 3 pasos que viven fuera del repo
git — no hay `gh` CLI instalado en este entorno (verificado, ni en Bash ni
en PowerShell) para tocarlos vía API, y aunque lo hubiera, dos de los tres
dependen de acceso al registrador del dominio o al panel de GitHub que solo
tiene el usuario:
1. **Push inicial** — hecho por mí en este mismo segmento (primer push real
   del repo, autorización explícita del usuario: "despliegas... damos pase
   a producción").
2. **DNS de `clarvo.mx` en el registrador** (GoDaddy, Namecheap, el que
   sea) — apex domain, necesita registros **A** apuntando a las 4 IPs de
   GitHub Pages: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`,
   `185.199.111.153` (y opcionalmente **AAAA** para IPv6:
   `2606:50c0:8000::153`, `:8001::153`, `:8002::153`, `:8003::153`). Si
   además quiere `www.clarvo.mx`, ese sí puede ser un registro **CNAME**
   apuntando a `addv-sites.github.io.`
3. **GitHub → repo → Settings → Pages**: source = "GitHub Actions" (se
   configura solo la primera vez que corre el workflow, pero conviene
   confirmarlo); campo "Custom domain" = `clarvo.mx`; esperar a que el
   check de DNS pase (puede tardar minutos a horas después de que el DNS
   propague); ahí aparece el checkbox **"Enforce HTTPS"** — eso es
   literalmente "solicitar el certificado": GitHub aprovisiona el
   certificado de Let's Encrypt automáticamente en cuanto el DNS resuelve
   correctamente, no es una acción separada que se pueda disparar antes de
   que el DNS esté en su lugar.

**Pendiente:** que el usuario configure el DNS (paso 2) y confirme/ajuste
Settings → Pages (paso 3) — sin eso, el sitio no será alcanzable en
`https://clarvo.mx` aunque el workflow corra exitosamente (correría, pero
solo publicaría en `https://addv-sites.github.io/clarvo-tempSite/`, la URL
default de Pages, hasta que el dominio custom quede activo).

**Resuelto (2026-09-06):** verificado en vivo desde otra sesión de trabajo
(la del sitio ADDV, al enlazar `productos.html` a `clarvo.mx`) — DNS ya
propagado y Pages ya configurado correctamente:
- `clarvo.mx` (A) → `185.199.108.153`, `.109.153`, `.110.153`, `.111.153`
  (las 4 IPs de GitHub Pages, confirmado por `nslookup`).
- `www.clarvo.mx` (CNAME) → `addv-sites.github.io`.
- `https://clarvo.mx` responde `200 OK` (certificado HTTPS ya
  aprovisionado — "Enforce HTTPS" del paso 3 ya se cumplió, no quedó
  pendiente).
- `http://clarvo.mx` responde `301` → `https://clarvo.mx/`.

Los 3 pasos manuales documentados arriba (push, DNS, Settings → Pages)
están completos. Sitio en producción, alcanzable en el dominio final.

## Segmento 6 — Landing `/masterclass` (2026-09-14)

**Pedido:** el usuario dejó diseños en `stitch/` (`code.html`, `DESIGN.md`,
`screen.png`) para una landing de masterclass a publicarse en
`clarvo.mx/masterclass`, pidiendo capturar nombre/correo/negocio/teléfono
del visitante además de invitarlo al canal de WhatsApp — todo sin backend
propio (regla fija del sitio).

**Análisis/crítica (protocolo, antes de implementar) — propuesta visual
antes/después mostrada y aprobada primero, ver artifact publicado en la
conversación:**
- El mock de `stitch/` trae su propio sistema de diseño ("Clarvo Precision
  Dark": paleta cobalto+cian dual, Plus Jakarta Sans vía Google Fonts CDN,
  Tailwind vía `<script src="cdn.tailwindcss.com">`, iconos Material
  Symbols por CDN) que no coincide con la identidad real ya en producción
  (acento único `#2fd2ff`, tarjetas `brand-card`/`brand-border`, Tailwind
  v4 compilado con Vite, `@lucide/astro`). Se retemátizó completo a la
  identidad real en vez de portarlo literal.
- El formulario de 2 pasos del mock original **no capturaba nada** — el
  botón "Continuar" solo cambiaba de vista sin enviar los datos a ningún
  lado. Se implementó el envío real (ver más abajo).
- Se agregó campo de teléfono/WhatsApp (el mock original no lo traía) por
  pedido explícito del usuario.
- Fotos de stock del mock (avatar de perfil, retrato de "ponente" apuntando
  a URLs de `lh3.googleusercontent.com` sin licencia clara) se quitaron —
  reemplazadas por fallback de iniciales hasta que el usuario ponga una
  foto real.

**Decisión de arquitectura de captura (3 alternativas presentadas, usuario
eligió la primera):**
- **Elegida — Google Sheets vía Google Apps Script (Web App):** el
  formulario hace `fetch` a una URL `/exec` publicada por el usuario desde
  un Apps Script atado a una Google Sheet propia. Un solo script cubre las
  dos necesidades del usuario ("correo y base de datos"): agrega una fila
  por registro **y** dispara un correo de notificación vía
  `MailApp.sendEmail`.
  - Descartadas: EmailJS (ya autorizado en el proyecto, pero deja los leads
    como correos sueltos, no una lista) y Formspree/Web3Forms (cero setup
    propio, pero un tercero externo procesa los datos del cliente y hay
    límite de envíos gratis).
  - El usuario ofreció compartir credenciales de su cuenta de Google — se
    rechazó explícitamente (regla de seguridad: nunca se aceptan
    contraseñas/tokens/2FA de terceros). El Apps Script lo publica el
    usuario en su propia cuenta; lo único que se necesita aquí es la URL
    `/exec` resultante (no es secreta, es un endpoint público de recepción,
    igual que el link del canal de WhatsApp ya hardcodeado) y el correo de
    destino para las notificaciones.
- Foto de ponente/equipo: el usuario dejará `ponente.png` en
  `public/images/dashboard/../ponente/ponente.png` — implementado con
  fallback automático a un badge con iniciales ("CV") si el archivo aún no
  existe (mismo patrón `publicFileExists()`/`process.cwd()` que
  `DashboardMockup.astro`, ver Segmento 1d para el porqué de ese patrón).
- Movimiento/motion: pedido explícito del usuario ("efectos sutiles,
  desvanecimientos, destellos, sin perder profesionalismo") — implementado
  vía skill `low-impact-motion` (solo `transform`/`opacity`, nunca
  propiedades que disparan layout/paint):
  - Reveal-on-scroll con `IntersectionObserver` (nunca el evento `scroll`
    continuo) en cada sección — utilidad compartida `.reveal`/`.is-visible`
    en `global.css`, envuelta en `@media (prefers-reduced-motion:
    no-preference)` para que con reduced-motion el contenido nunca dependa
    de que el observer corra.
  - Destello ("shine") sutil al hover en los CTAs primarios —
    `.cta-shine` en `global.css`, pseudo-elemento con gradiente animado por
    `transform: translateX` únicamente.
  - Pulso ambiental en el botón de WhatsApp del paso 2 y en el punto "en
    vivo" del badge — mismo patrón que ya usa `CommunityCta.astro`
    (`scale`/`opacity` en bucle, respeta `prefers-reduced-motion`).
  - FAQ con `<details>`/`<summary>` nativos (sin JS) — el chevron rota con
    `group-open:rotate-180` de Tailwind.
  - Barra sticky inferior (mobile/tablet): visibilidad controlada por
    `IntersectionObserver` sobre la tarjeta `#registro` (no por el evento
    `scroll`).

**Implementado (archivos nuevos):**
- `src/pages/masterclass/index.astro` — ensambla la página, ruta pública
  final `clarvo.mx/masterclass`.
- `src/components/masterclass/{Header,Hero,Comparativa,Pilares,Faq,FinalCta,StickyBar}.astro`.
- `src/lib/leadForm.ts` (+ `leadForm.test.ts`, 8 tests, todos pasan) —
  validación de nombre/correo/negocio/teléfono y armado del payload,
  aislado del DOM para poder testear sin navegador.
- `public/images/ponente/README.md` — documenta el archivo esperado y el
  fallback.
- `.env.example` y `.github/workflows/deploy.yml`: nueva variable
  `PUBLIC_LEADS_ENDPOINT` (mismo patrón que `PUBLIC_GA_MEASUREMENT_ID` —
  si se deja vacía, el formulario sigue funcionando pero no envía nada a
  ningún lado, con un aviso en consola).
- `src/styles/global.css`: utilidades compartidas `.reveal`/`.is-visible` y
  `.cta-shine`.

**Cómo envía los datos el formulario (importante para cuando se configure
el endpoint):** `fetch(endpoint, { method: "POST", mode: "no-cors",
headers: { "Content-Type": "text/plain;charset=utf-8" }, body:
JSON.stringify(payload) })` — Apps Script Web Apps no responden con
headers CORS legibles desde `fetch`, así que el envío es "fire-and-forget"
en modo `no-cors` (no se puede leer la respuesta ni confirmar entrega
desde el cliente; es la técnica estándar para este truco sin backend).
Incluye un honeypot (`#mc-hp`, campo invisible) para descartar bots sin
exponer el endpoint a un captcha.

**Verificado:** `npm test` (19/19 — 8 nuevos de `leadForm` + 11 previos),
`astro build` sin errores, inspección del HTML de salida (`devices.png` se
resuelve bien, sin `screen-placeholder`; fallback "CV" activo porque
`ponente.png` aún no existe; sin `cdn.tailwindcss.com` ni
`fonts.googleapis.com` en el output). Verificación funcional en navegador
real (Chrome vía extensión): flujo completo del formulario (validación de
los 4 campos con mensajes de error, transición a paso 2, barra de progreso,
botón de WhatsApp con pulso), acordeón de FAQ, barra sticky apareciendo al
salir de vista la tarjeta de registro, sección comparativa reutilizando
`DashboardMockup` sin cambios.

**Pendiente — 2 insumos del usuario antes de poder desplegar a
producción:**
1. ~~URL `/exec` del Apps Script + correo de destino~~ — **resuelto
   2026-09-21**, ver "Corrección 2026-09-21" abajo.
2. **`public/images/ponente/ponente.png`** — el usuario dijo que lo
   dejará ahí directamente; mientras tanto el badge "CV" se ve en
   producción sin romper nada.

No se ha hecho commit ni push de este segmento — el código vive sin
confirmar en el working tree hasta que el usuario revise el resultado.

### Corrección 2026-09-21: endpoint de leads no llegaba al Sheet (diagnóstico + fix)

**Pedido:** el usuario dio la primera URL `/exec`
(`.../a/macros/addv.mx/s/.../exec`) y la probó llenando el formulario en
local — no vio ninguna fila nueva en el Google Sheet.

**Diagnóstico:** `.env` local se creó con la URL dada
(`PUBLIC_LEADS_ENDPOINT`), build/dev verificado (URL horneada
correctamente en el HTML de salida — el amarre en sí no tenía bug). Se
probó el envío real en navegador (Chrome vía extensión): la request POST
al endpoint sí salía, pero devolvía **503**. `curl` directo al mismo
endpoint reveló la causa real: **401 Unauthorized**, página de Google
Drive "No se pudo abrir el archivo en este momento" — la URL traía
`/a/macros/addv.mx/` (variante de dominio Google Workspace), señal de que
el deploy del Apps Script quedó con "Quién tiene acceso" en **"Solo yo"**
o **"Cualquiera de `addv.mx`"**, no en **"Cualquier usuario"** como pedía
la guía (`pasos.html`) — por eso visitantes anónimos del sitio no podían
pegarle al endpoint.

**Fix (hecho por el usuario, fuera del repo):** editó la implementación
en Apps Script (Implementar → Administrar implementaciones → lápiz →
"Quién tiene acceso" → Cualquier usuario) y volvió a implementar — generó
una **URL nueva sin el prefijo de dominio**
(`script.google.com/macros/s/.../exec`). `.env` local actualizado con
la URL nueva.

**Verificación de la URL nueva:** `curl -i` directo mostró un `302
Found` normal (comportamiento esperado de Apps Script Web Apps — redirige
a `script.googleusercontent.com/macros/echo?...`) en vez del `401`
anterior — confirma que el deploy ya es público. Siguiendo ese redirect a
mano (`curl` no reenvía bien un POST a través de un 302 con `-L` simple;
se resolvió pegándole directo al header `Location` recibido) la respuesta
final fue `200 OK` con cuerpo `{"ok":true}` — el `doPost` del script sí
corre y responde bien.

**Hallazgo colateral (no bloqueante, documentado por si se repite):** la
prueba vía navegador automatizado (extensión de Chrome) siguió mostrando
`503` en el request capturado por las network tools, pese a que `curl`
plano contra la misma URL nueva respondía limpio. Hipótesis: protección
anti-bot de Google reaccionando a tráfico de automatización (Chrome
Devtools Protocol vía extensión), no un fallo real del endpoint —
Apps Script ejecuta `doPost` (y agrega la fila a la Sheet) **antes** de
emitir cualquier respuesta HTTP, así que aunque el request automatizado
mostrara 503, el lead ya había quedado guardado. **Confirmado por el
usuario:** las filas de prueba (`Prueba Debug 2/3/4/5`, `Prueba Claude`)
sí aparecieron en el Google Sheet — el endpoint funciona end-to-end para
visitantes reales (no automatizados). Filas de prueba pendientes de
borrar por el usuario.

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

## Segmento 6b — Placeholder del nombre + auto-join al canal con countdown (2026-09-21)

- Placeholder del campo "Nombre completo" en el formulario de `/masterclass`
  cambiado de "Ej. Antonio Prado" a "Ej. Juan Hernández" (dato de ejemplo
  neutro, pedido explícito del usuario). Commit aparte (`41397df`).
- **Auto-unión al canal de WhatsApp tras 8s en el paso 2:** el usuario pidió
  que, tras completar el registro, se dispare solo el evento de unirse al
  canal (antes requería clic manual en "Unirme al canal para confirmar").
  - **Limitación técnica explicada antes de implementar:** abrir pestaña
    nueva (`window.open`/`target="_blank"`) disparado por un `setTimeout`
    sin gesto directo del usuario lo bloquean los navegadores modernos
    (popup blocker) — un timer de 8s rompe la cadena de "gesto de usuario"
    que exige Chrome/Firefox/Safari.
  - **Solución acordada con el usuario (de 3 opciones presentadas):**
    countdown visible ("Te unimos al canal en 8s...") que redirige la
    **misma pestaña** (`window.location.href`, no `window.open`) al llegar
    a 0 — evita el bloqueo de popups por completo. El botón manual sigue
    disponible durante la espera: un clic real ahí sí abre pestaña nueva
    (`target="_blank"`, comportamiento sin cambios) y cancela el timer.
  - Implementado en `Hero.astro`: `id="mc-whatsapp-link"` en el botón,
    `<span id="mc-countdown-seconds">` para el número regresivo (con
    `aria-live="polite"` + texto `sr-only` que anuncia una sola vez al
    inicio, en vez de anunciar cada segundo — evita ruido excesivo para
    lectores de pantalla). Script: `startWhatsappCountdown()` se dispara
    al mostrar el paso 2 (tras el submit exitoso), `cancelWhatsappCountdown()`
    se llama al hacer clic manual en el botón o al volver al paso 1
    ("Modificar mis datos de registro") — evita que el timer dispare un
    redirect después de que el usuario ya se fue o decidió regresar.
  - Verificado end-to-end en navegador real: formulario completo → paso 2
    → countdown baja de 8 a 0 → la pestaña navega sola a
    `whatsapp.com/channel/...` sin intervención manual, confirmado por el
    cambio de URL/título de la pestaña capturado en la prueba.
