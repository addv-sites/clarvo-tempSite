## Protocolo del proyecto

Este proyecto sigue el protocolo `addv-web-app`: Analizar → Revisar impacto →
Criticar y mejorar → Propuesta visual → Confirmar → Implementar → Probar →
Asegurar. Ningún segmento se implementa sin confirmación explícita del usuario.
Ver `project_state.md` (raíz) para el plan segmentado y su estado actual, y
`addv/cmem.md` para el historial comprimido de decisiones de esta conversación.

Reglas fijas de este sitio:
- Sin backend propio, sin Docker, sin base de datos — deploy a GitHub Pages.
- Envío de la waitlist vía EmailJS (nunca credenciales SMTP crudas en el frontend).
- Animación del isotipo con CSS puro (`transform`/`opacity` solamente), sin
  librería JS de animación — ver skill `low-impact-motion`.
- Ninguna clave/credencial se hardcodea; todo vía variables de entorno (`.env`,
  ya ignorado en `.gitignore`).

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
