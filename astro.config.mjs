// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Dominio real de producción (Segmento 5). Overrideable vía PUBLIC_SITE_URL
// en `.env` para builds locales/staging contra otro dominio.
const SITE_URL = process.env.PUBLIC_SITE_URL || 'https://clarvo.mx';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
