export interface CotizadorFormData {
  empresa: string;
  nombreContacto: string;
  correo: string;
  telefono: string;
  modulos: string[];
  notas: string;
}

export type CotizadorFormErrors = Partial<
  Record<keyof Omit<CotizadorFormData, "modulos" | "notas">, string> & { modulos?: string }
>;

export interface CotizadorValidationResult {
  valid: boolean;
  errors: CotizadorFormErrors;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s()+-]{8,20}$/;

export function validateCotizador(data: CotizadorFormData): CotizadorValidationResult {
  const errors: CotizadorFormErrors = {};

  if (!data.empresa.trim()) {
    errors.empresa = "Escribe el nombre de tu empresa.";
  }
  if (!data.nombreContacto.trim()) {
    errors.nombreContacto = "Escribe tu nombre completo.";
  }
  if (!EMAIL_RE.test(data.correo.trim())) {
    errors.correo = "Escribe un correo válido.";
  }
  if (!PHONE_RE.test(data.telefono.trim())) {
    errors.telefono = "Escribe un teléfono válido (8 a 20 dígitos).";
  }
  if (data.modulos.length === 0) {
    errors.modulos = "Selecciona al menos un módulo o necesidad.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export interface CotizadorPayload {
  origen: "cotizador";
  empresa: string;
  nombreContacto: string;
  correo: string;
  telefono: string;
  modulos: string[];
  notas: string;
  fecha: string;
}

export function buildCotizadorPayload(data: CotizadorFormData): CotizadorPayload {
  return {
    origen: "cotizador",
    empresa: data.empresa.trim(),
    nombreContacto: data.nombreContacto.trim(),
    correo: data.correo.trim(),
    telefono: data.telefono.trim(),
    modulos: data.modulos,
    notas: data.notas.trim(),
    fecha: new Date().toISOString(),
  };
}
