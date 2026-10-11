/**
 * Precios y estructura de 4 planes confirmados por el usuario el
 * 2026-10-09 (fuente: CLARVO_Planes.md, sección "PRECIOS" — Site.png traía
 * una estructura de 3 planes distinta, descartada explícitamente). Anual =
 * 2 meses gratis vs. mensual × 12, no un % distinto por plan. Compartido
 * entre PricingSection.astro y el JSON-LD de Offers en index.astro.
 */
export interface Plan {
  id: string;
  name: string;
  tagline: string;
  monthly: number;
  annual: number;
  featured: boolean;
  badge?: string;
  items: string[];
  cta: string;
}

export const plans: Plan[] = [
  {
    id: "solicita",
    name: "CLARVO Solicita",
    tagline: "Deja de perseguir facturas por WhatsApp.",
    monthly: 199,
    annual: 1990,
    featured: false,
    items: [
      "Solicitudes de facturación",
      "Tickets y seguimiento",
      "Datos fiscales",
      "Validación de RFC",
      "Uso de CFDI",
      "Historial de solicitudes",
      "Portal para clientes",
    ],
    cta: "Empieza a ordenar tu facturación",
  },
  {
    id: "controla",
    name: "CLARVO Controla",
    tagline: "Deja de administrar tu negocio a ciegas.",
    monthly: 599,
    annual: 5990,
    featured: true,
    badge: "Plan más elegido",
    items: [
      "Todo lo de Solicita",
      "Registro de ventas",
      "Registro de gastos",
      "Cuentas por cobrar",
      "Registro de cobros",
      "Utilidad neta",
      "Dashboard financiero",
      "Reportes y exportación",
      "Onboarding guiado",
    ],
    cta: "Empieza a tener el control",
  },
  {
    id: "crece",
    name: "CLARVO Crece",
    tagline: "Controla tu operación mientras tu negocio crece.",
    monthly: 799,
    annual: 7990,
    featured: false,
    items: [
      "Todo lo de Controla",
      "Inventario",
      "Entradas y salidas",
      "Costo promedio",
      "Stock mínimo",
      "Código de barras",
      "Hasta 5 usuarios",
      "Hasta 2 sucursales",
      "Reportes avanzados",
      "Auditoría",
      "Personalización de marca",
      "Operación offline",
    ],
    cta: "Haz crecer tu negocio con control",
  },
  {
    id: "domina",
    name: "CLARVO Domina",
    tagline: "Ten una visión completa de tu negocio.",
    monthly: 999,
    annual: 9990,
    featured: false,
    items: [
      "Todo lo de Crece",
      "Hasta 10 usuarios",
      "Hasta 5 sucursales",
      "Inventario avanzado",
      "Dashboard avanzado",
      "Reportes avanzados",
      "Auditoría consultable",
      "Personalización avanzada",
      "Automatizaciones disponibles",
      "Soporte prioritario",
    ],
    cta: "Lleva tu negocio al siguiente nivel",
  },
];
