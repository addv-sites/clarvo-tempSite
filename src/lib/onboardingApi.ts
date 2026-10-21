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

export function crearBorrador(planClave: string, ciclo: Ciclo) {
  return solicitar<{ ok: true; borrador: { token: string; planClave: string; ciclo: Ciclo } }>(
    "/api/public/onboarding/borrador",
    { method: "POST", body: JSON.stringify({ planClave, ciclo }) }
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

export interface ResultadoConversion {
  ok: true;
  slug: string;
  urlAdmin: string;
  urlPortal: string;
}

// Segmento B: convierte un borrador completo en un tenant real — intake +
// aprovisionamiento físico + plan + usuario admin, sin operador de por
// medio. Idempotente del lado del servidor: reintentar tras un timeout
// de red es seguro, nunca duplica nada.
//
// Hallazgo M-06 (sonar_1.1.html, Fase D): este es el único paso que de
// verdad aprovisiona infraestructura real, así que es donde se exige el
// token de Turnstile — /control lo verifica contra Cloudflare antes de
// convertir nada (ver control/utils/turnstile.js).
export function convertirBorrador(token: string, turnstileToken: string) {
  return solicitar<ResultadoConversion>(`/api/public/onboarding/convertir/${encodeURIComponent(token)}`, {
    method: "POST",
    body: JSON.stringify({ turnstileToken }),
  });
}

export async function slugDisponible(slug: string): Promise<boolean> {
  const data = await solicitar<{ slug: string; disponible: boolean }>(
    `/api/public/onboarding/slug-disponible?slug=${encodeURIComponent(slug)}`
  );
  return data.disponible;
}
