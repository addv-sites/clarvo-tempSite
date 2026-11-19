/**
 * Eventos de conversión del embudo de onboarding (GA4). Respeta el mismo
 * candado de consentimiento que Analytics.astro: si GA nunca se cargó
 * (sin consentimiento analítico, o sin PUBLIC_GA_MEASUREMENT_ID
 * configurado), `window.gtag` no existe y estas funciones no hacen nada
 * — nunca lanzan, nunca bloquean el flujo real de alta/pago.
 */

type Gtag = (...args: unknown[]) => void;

function obtenerGtag(): Gtag | null {
  if (typeof window === "undefined") return null;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  return typeof gtag === "function" ? gtag : null;
}

export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  const gtag = obtenerGtag();
  if (!gtag) return;
  gtag("event", name, params);
}

// "purchase" (evento estándar de ecommerce de GA4, el que alimenta el
// reporte de ingresos/conversiones) solo debe mandarse UNA vez por alta
// real — el polling de estado-pago (OXXO/SPEI) puede confirmar la misma
// activación varias veces cada 5s, y volver a cargar la página de éxito
// repite el mismo efecto. localStorage recuerda qué tokens ya se
// reportaron para que el conteo de conversiones no se infle solo.
const CLAVE_PURCHASE_ENVIADO = "clarvo-ga-purchase-sent";

export function trackPurchaseOnce(token: string, params: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  try {
    const enviados: string[] = JSON.parse(localStorage.getItem(CLAVE_PURCHASE_ENVIADO) || "[]");
    if (enviados.includes(token)) return;
    trackEvent("purchase", { transaction_id: token, ...params });
    localStorage.setItem(CLAVE_PURCHASE_ENVIADO, JSON.stringify([...enviados, token].slice(-50)));
  } catch {
    // localStorage no disponible/corrupto — en el peor caso se manda dos
    // veces; nunca bloquea el flujo real de pago por esto.
    trackEvent("purchase", { transaction_id: token, ...params });
  }
}
