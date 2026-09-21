export interface LeadFormData {
  name: string;
  email: string;
  business: string;
  phone: string;
}

export type LeadFormErrors = Partial<Record<keyof LeadFormData, string>>;

export interface LeadValidationResult {
  valid: boolean;
  errors: LeadFormErrors;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s()+-]{8,20}$/;

export function validateLead(data: LeadFormData): LeadValidationResult {
  const errors: LeadFormErrors = {};

  if (!data.name.trim()) {
    errors.name = "Escribe tu nombre completo.";
  }
  if (!EMAIL_RE.test(data.email.trim())) {
    errors.email = "Escribe un correo válido.";
  }
  if (!data.business.trim()) {
    errors.business = "Selecciona el giro de tu negocio.";
  }
  if (!PHONE_RE.test(data.phone.trim())) {
    errors.phone = "Escribe un teléfono válido (8 a 20 dígitos).";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export interface LeadPayload {
  nombre: string;
  correo: string;
  negocio: string;
  telefono: string;
  origen: string;
  fecha: string;
}

export function buildLeadPayload(data: LeadFormData): LeadPayload {
  return {
    nombre: data.name.trim(),
    correo: data.email.trim(),
    negocio: data.business.trim(),
    telefono: data.phone.trim(),
    origen: "masterclass",
    fecha: new Date().toISOString(),
  };
}
