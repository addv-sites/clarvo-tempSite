// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// TODO: reemplazar por el dominio real antes de desplegar (Segmento 5).
// clarvo.example usa el TLD reservado para documentación (RFC 2606), nunca
// resuelve a un sitio real, así que no puede quedar hardcodeado por error.
const SITE_URL = process.env.PUBLIC_SITE_URL || 'https://clarvo.example';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
