/**
 * Cliente de la API pública de onboarding (Segmento A, 2026-10-13) —
 * habla con /control (control/server.js, rutas /api/public/onboarding/*).
 * Sin credenciales: es tráfico de un prospecto sin cuenta todavía.
 *
 * Nunca lee import.meta.env.PUBLIC_* directo — pasa siempre por
 * publicEnv (ver src/config/publicEnv.ts), mismo criterio que el resto
 * del sitio.
 */
import { publicEnv } from "../config/publicEnv";

export type Ciclo = "mensual" | "anual";

export interface Borrador {
  token: string;
  planClave: string;
  ciclo: Ciclo;
  nombreEmpresa: string | null;
  slug: string | null;
  contactoEmail: string | null;
  nombreComercial: string | null;
  zonaHoraria: string;
  adminEmail: string | null;
  tieneContrasena: boolean;
  pasoActual: string;
  estado: string;
}

export class OnboardingApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "OnboardingApiError";
    this.status = status;
  }
}

function baseUrl(): string {
  if (!publicEnv.apiBaseUrl) {
    // No hay URL configurada todavía (dev local o despliegue pendiente) —
    // mensaje explícito en vez de un fetch roto con error genérico de red.
    throw new OnboardingApiError(
      "El onboarding todavía no está conectado en este entorno (falta configurar PUBLIC_CLARVO_API_BASE_URL).",
      0
    );
  }
  return publicEnv.apiBaseUrl.replace(/\/$/, "");
}

async function solicitar<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${baseUrl()}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    });
  } catch {
    throw new OnboardingApiError("No se pudo conectar. Verifica tu conexión e intenta de nuevo.", 0);
  }
  const cuerpo = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new OnboardingApiError(
      (cuerpo as { error?: string })?.error || "Ocurrió un error. Intenta de nuevo.",
      res.status
    );
  }
  return cuerpo as T;
}

// Reporte de cupones (punto en curso): captura best-effort del
// utm_source con el que llegó el visitante — lee el query param real de
// la página actual, nunca inventa uno. Si no viene, se manda null y el
// reporte simplemente no sabe de dónde vino ese prospecto (honesto, no
// un dato fabricado).
function utmSourceActual(): string | null {
  try {
    return new URLSearchParams(window.location.search).get("utm_source");
  } catch {
    return null;
  }
}

export function crearBorrador(planClave: string, ciclo: Ciclo) {
  return solicitar<{ ok: true; borrador: { token: string; planClave: string; ciclo: Ciclo } }>(
    "/api/public/onboarding/borrador",
    { method: "POST", body: JSON.stringify({ planClave, ciclo, utmSource: utmSourceActual() }) }
  );
}

export function obtenerBorrador(token: string) {
  return solicitar<{ borrador: Borrador }>(`/api/public/onboarding/borrador/${encodeURIComponent(token)}`);
}

export function actualizarBorrador(token: string, cambios: Record<string, unknown>) {
  return solicitar<{ ok: true; borrador: Borrador }>(
    `/api/public/onboarding/borrador/${encodeURIComponent(token)}`,
    { method: "PUT", body: JSON.stringify(cambios) }
  );
}

// Punto Stripe ("cobrar primero, activar después" — confirmado por el
// usuario): el borrador YA NO se convierte directo desde el navegador —
// convertirBorrador() (control/utils/onboardingConversion.js) ahora solo
// lo invoca el webhook de Stripe, una vez que el pago se confirma de
// verdad. Lo que el frontend sí hace es (1) pedir un Checkout Session y
// redirigir ahí, y (2) después del regreso, preguntar si ya se activó —
// ver estadoPago() abajo.
export interface ResultadoPago {
  ok: true;
  checkoutUrl: string;
}

// Mismo criterio de Turnstile que antes (hallazgo M-06, sonar_1.1.html):
// este sigue siendo el único paso público que de verdad mueve dinero, así
// que sigue exigiendo el token de Cloudflare.
export function pagarBorrador(token: string, turnstileToken: string) {
  return solicitar<ResultadoPago>(`/api/public/onboarding/pagar/${encodeURIComponent(token)}`, {
    method: "POST",
    body: JSON.stringify({ turnstileToken }),
  });
}

export interface EstadoPago {
  pagoEstado: "pendiente" | "confirmado" | "fallido" | null;
  metodoPago: string | null;
  estado: "activo" | "convertido" | "abandonado";
  activado: boolean;
  resultado: { slug: string; urlAdmin: string; urlPortal: string | null } | null;
}

// Polling de solo lectura — se usa (a) al volver del redirect de Stripe,
// y (b) mientras se espera una ficha OXXO/SPEI pendiente. Nunca expone
// nada de otro tenant: el token del borrador es la única llave.
export function estadoPago(token: string) {
  return solicitar<EstadoPago>(`/api/public/onboarding/estado-pago/${encodeURIComponent(token)}`);
}

export async function slugDisponible(slug: string): Promise<boolean> {
  const data = await solicitar<{ slug: string; disponible: boolean }>(
    `/api/public/onboarding/slug-disponible?slug=${encodeURIComponent(slug)}`
  );
  return data.disponible;
}
