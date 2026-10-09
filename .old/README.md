# CLARVO — sitio provisional

Landing "sitio en construcción" con lista de espera/canal de WhatsApp, para
que CLARVO siga vendiendo mientras la app definitiva no está lista. Astro +
Tailwind CSS v4, sin backend propio, sin Docker, sin base de datos. Se
despliega estático en GitHub Pages.

Estado detallado del proyecto, decisiones tomadas y pendientes:
[`project_state.md`](./project_state.md).

## Desarrollo local

Requiere Node ≥22.12 (ver `package.json` → `engines`).

```sh
npm install
cp .env.example .env   # llenar valores reales si aplica (GA4, dominio)
npm run dev             # http://localhost:4321
```

| Comando | Qué hace |
| :--- | :--- |
| `npm install` | Instala dependencias |
| `npm run dev` | Servidor local en `localhost:4321` |
| `npm test` | Corre las pruebas unitarias (Vitest) |
| `npm run build` | Build de producción a `./dist/` |
| `npm run preview` | Sirve el build de `./dist/` localmente, para probar antes de desplegar |

## Estructura

```text
/
├── public/              # assets estáticos (logos, favicon, capturas del dashboard, CNAME)
├── src/
│   ├── components/       # Crystal, DashboardMockup, CommunityCta, WaitlistForm→CommunityCta, Footer...
│   ├── layouts/           # Layout.astro (meta tags, JSON-LD, Analytics)
│   └── pages/             # index.astro, robots.txt.ts
├── .github/workflows/     # deploy.yml — build + deploy a GitHub Pages
└── project_state.md       # estado, decisiones y pendientes (fuente de verdad del proyecto)
```

## Deploy (GitHub Pages)

`.github/workflows/deploy.yml` corre en cada push a `main`: instala
dependencias, corre `npm test`, hace `npm run build`, y publica `dist/` a
GitHub Pages automáticamente. No hace falta ejecutar nada a mano para
desplegar un cambio ya mergeado a `main`.

**Dominio propio (`clarvo.mx`) — 2 pasos que sí son manuales, fuera de este repo:**

1. **DNS en el registrador del dominio** — como es un dominio raíz (apex),
   agregar registros **A** apuntando a las 4 IPs de GitHub Pages:
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```
   (opcional, IPv6) registros **AAAA**:
   ```
   2606:50c0:8000::153
   2606:50c0:8001::153
   2606:50c0:8002::153
   2606:50c0:8003::153
   ```
   Si además se quiere `www.clarvo.mx`, ese puede ser un registro **CNAME**
   apuntando a `addv-sites.github.io.`

2. **GitHub → repo → Settings → Pages** — campo "Custom domain" =
   `clarvo.mx` (el archivo `public/CNAME` ya lo trae, pero GitHub igual
   requiere confirmarlo en Settings la primera vez). Esperar a que el check
   de DNS pase (puede tardar desde minutos hasta horas tras propagar el
   DNS) y entonces activar **"Enforce HTTPS"** — así es como GitHub
   aprovisiona el certificado TLS (Let's Encrypt) automáticamente; no hay
   una acción de "solicitar certificado" separada de esto.

Variables opcionales del build (Settings → Secrets and variables → Actions
→ Variables): `PUBLIC_GA_MEASUREMENT_ID` para activar Google Analytics 4
(si se deja vacía, simplemente no se inyecta el snippet, no rompe nada).

## Documentación de Astro

[docs.astro.build](https://docs.astro.build)
