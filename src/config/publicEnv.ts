/**
 * Configuración pública centralizada — master prompt sección 16.
 *
 * Alcance actual: solo el sitio comercial. La API de onboarding, la app
 * oficial y el checkout no existen todavía — estas variables quedan
 * vacías hasta que se confirmen URLs de producción reales. Nadie debe leer
 * `import.meta.env.PUBLIC_*` directamente fuera de este archivo: así, el
 * día que estas URLs existan, se configuran en un solo lugar.
 *
 * No hace llamadas de red. No falla el build ni la landing si están
 * vacías — ver criterios de aceptación de la sección 16.
 */

function readUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).toString();
  } catch {
    console.warn(`publicEnv: valor no es una URL válida, se ignora: "${value}"`);
    return null;
  }
}

export const publicEnv = {
  /** URL pública base de la API de CLARVO — pendiente, no implementada aún. */
  apiBaseUrl: readUrl(import.meta.env.PUBLIC_CLARVO_API_BASE_URL),
  /** URL pública del onboarding — pendiente, no implementada aún. */
  onboardingUrl: readUrl(import.meta.env.PUBLIC_CLARVO_ONBOARDING_URL),
  /** URL pública de la app oficial (login) — pendiente, no implementada aún. */
  appUrl: readUrl(import.meta.env.PUBLIC_CLARVO_APP_URL),
  /** Endpoint de Apps Script que recibe leads de masterclass y cotizaciones. */
  leadsEndpoint: import.meta.env.PUBLIC_LEADS_ENDPOINT || null,
  /**
   * Site key de Cloudflare Turnstile para el widget del onboarding
   * (hallazgo M-06, sonar_1.1.html, Fase D). El default es el site key
   * PÚBLICO de prueba que documenta Cloudflare (siempre pasa, pensado
   * para desarrollo/CI) — nunca un secreto real. Producción debe
   * sobreescribirlo con el site key real del dashboard de Cloudflare.
   */
  turnstileSiteKey: import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA",
};
