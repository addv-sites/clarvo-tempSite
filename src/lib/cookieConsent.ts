/**
 * Contrato de consentimiento de cookies — localStorage + CustomEvent.
 * Analytics.astro lee la misma clave y dispara/escucha el mismo evento
 * desde un <script> inline (define:vars no soporta `import`), así que
 * STORAGE_KEY y CONSENT_EVENT deben mantenerse idénticos en ambos lados.
 */
export const STORAGE_KEY = "clarvo-cookie-consent";
export const CONSENT_EVENT = "clarvo:cookie-consent-changed";

export interface CookieConsent {
  necessary: true;
  analytics: boolean;
  timestamp: string;
}

export function getConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.analytics !== "boolean") return null;
    return { necessary: true, analytics: parsed.analytics, timestamp: parsed.timestamp };
  } catch {
    return null;
  }
}

export function setConsent(analytics: boolean): CookieConsent {
  const consent: CookieConsent = { necessary: true, analytics, timestamp: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: consent }));
  return consent;
}
