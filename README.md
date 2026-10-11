# CLARVO — sitio comercial

Landing de CLARVO ("tu negocio bajo control"): dashboard flotante 3D,
reconstrucción real del producto, planes y cotizador a la medida. Astro +
Tailwind v4, con una isla de React Three Fiber para la escena 3D del hero.
Construido siguiendo `MASTER_PROMPT_CLARVO_DASHBOARD_3D.md` bajo el
protocolo `addv-web-app` (ver `CLAUDE.md`).

`/masterclass` es una landing aparte, ya en producción — no depende de
nada de lo anterior y no debe romperse al tocar el sitio principal.

## Requisitos

- Node ≥ 22.12 (ver `engines` en `package.json`)
- npm

## Desarrollo local

```bash
npm install
npm run dev        # http://localhost:4321
```

```bash
npm test           # vitest — validación de formularios (leads, cotizador)
npm run build      # build estático a dist/
npm run preview    # sirve dist/ localmente
```

## Variables de entorno

Copia `.env.example` a `.env`. Todas son `PUBLIC_*` (Astro las expone al
navegador — nunca pongas secretos aquí, el sitio es estático).

| Variable | Para qué | Estado |
|---|---|---|
| `PUBLIC_SITE_URL` | Dominio canónico (sitemap, OG, JSON-LD) | Activa, default `https://clarvo.mx` |
| `PUBLIC_LEADS_ENDPOINT` | Web App de Apps Script que recibe leads de masterclass y cotizaciones (ver `docs/apps-script/`) | Activa |
| `PUBLIC_CLARVO_API_BASE_URL` | API de CLARVO (onboarding, cuentas) | **Pendiente** — vacía hasta tener URL de producción |
| `PUBLIC_CLARVO_ONBOARDING_URL` | Flujo de alta de cuenta | **Pendiente** |
| `PUBLIC_CLARVO_APP_URL` | App oficial (login) | **Pendiente** |
| `OPENAI_API_KEY` | Solo para regenerar imágenes con `scripts/generate-images.mjs` — nunca se expone al build del sitio | Local, no se usa en producción |

Las tres variables "Pendiente" se leen centralizadas en
`src/config/publicEnv.ts` — nada en el código lee `import.meta.env.PUBLIC_*`
directamente fuera de ese archivo. El sitio compila y funciona completo
aunque estén vacías; cuando existan URLs reales de la API/onboarding/app,
solo hay que llenarlas ahí y en el entorno de build.

En GitHub Actions, `PUBLIC_LEADS_ENDPOINT` y `PUBLIC_GA_MEASUREMENT_ID` se
inyectan desde **Settings → Secrets and variables → Actions → Variables**
del repo (ver `.github/workflows/deploy.yml`).

## Despliegue

GitHub Actions (`.github/workflows/deploy.yml`) construye y publica a
GitHub Pages en cada push a `main`. El trabajo activo vive en la rama
`sitioOficial` — no se despliega solo hasta fusionarse a `main`.

## Estructura relevante

- `src/components/site/` — secciones de la landing principal.
- `src/components/three/` — escena 3D del hero (React Three Fiber).
- `src/components/dashboard/` — reconstrucción real del producto (gráficas SVG animadas, datos citados en `docs/product-screen-inventory.md`).
- `src/components/masterclass/`, `src/pages/masterclass/` — landing de masterclass, no tocar sin razón explícita.
- `src/data/` — datos separados de presentación (planes, FAQ, dashboard demo) — fuente única para UI y JSON-LD.
- `docs/apps-script/` — backend (Google Apps Script) de los formularios.
- `docs/product-screen-inventory.md`, `docs/image-generation-prompts.md` — trazabilidad de qué se reconstruyó de dónde.
- `.old/` — sitio anterior archivado, de referencia.

## Pruebas funcionales pendientes de automatizar

- Verificación visual responsive (mobile/tablet) de la escena 3D — hecha a
  mano en Chrome desktop, no hay prueba automatizada de breakpoints.
- Envío real de los formularios contra el Apps Script desplegado — probado
  manualmente, no hay test end-to-end.
