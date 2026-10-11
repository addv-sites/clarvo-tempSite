/**
 * Datos del dashboard de demostración — separados de la presentación
 * (master prompt sección 7). Cada valor cita su fuente real: captura +
 * sección del inventario (docs/product-screen-inventory.md). Nada
 * inventado; donde la captura no trae cifra legible, el punto se omite
 * en vez de interpolarse.
 */

export interface MetricCardData {
  label: string;
  value: string;
  delta?: string;
  deltaTone: "up" | "down" | "neutral";
  source: string;
}

export const metricCards: MetricCardData[] = [
  {
    label: "Total facturado",
    value: "$27,768.52",
    delta: "-93% vs mes anterior",
    deltaTone: "down",
    source: "capClar/06-resumen-financiero.jpg",
  },
  {
    label: "Ventas sin facturar",
    value: "$98,776.78",
    deltaTone: "neutral",
    source: "capClar/06-resumen-financiero.jpg",
  },
  {
    label: "Balance ventas vs gastos",
    value: "-$48,190.96",
    delta: "Facturado − gastos del mes",
    deltaTone: "down",
    source: "capClar/06-resumen-financiero.jpg",
  },
  {
    label: "Total gastos",
    value: "$75,959.48",
    delta: "-41% vs mes anterior",
    deltaTone: "down",
    source: "capClar/06-resumen-financiero.jpg",
  },
];

export interface LinePoint {
  label: string;
  value: number;
  displayValue: string;
  confirmed: boolean;
}

/**
 * "Utilidad neta mensual" — de 6 meses visibles en la captura, solo 3
 * traen cifra legible (May, Sep "récord", Oct). Jun/Jul/Ago quedan fuera
 * del trazo (no se interpolan) — ver inventario.
 */
export const utilidadNetaMensual = {
  title: "Utilidad neta mensual",
  subtitle: "Acumulado 6M $1,906,864.01 · Máximo Sep (récord) $462,077.35",
  source: "capClar/06-resumen-financiero.jpg",
  points: [
    { label: "May", value: 347500, displayValue: "$347.5k", confirmed: true },
    { label: "Sep", value: 462077, displayValue: "$462.1k", confirmed: true },
    { label: "Oct", value: 33100, displayValue: "$33.1k", confirmed: true },
  ] satisfies LinePoint[],
};

export interface DonutSegment {
  label: string;
  value: number;
  amount: string;
  percent: number;
  color: string;
}

/**
 * "Antigüedad de saldos" (Cuentas por cobrar) — 4/4 segmentos con monto y
 * % exactos en la captura, sin discrepancias entre tomas.
 */
export const antiguedadSaldos = {
  title: "Antigüedad de saldos",
  subtitle: "Total $706,097.86 · Cuentas por cobrar",
  source: "capClar/03-cuentas-por-cobrar.jpg",
  segments: [
    { label: "Sin fecha de vencimiento", value: 30291.87, amount: "$30,291.87", percent: 4.3, color: "#64748b" },
    { label: "Sin vencer", value: 125005.06, amount: "$125,005.06", percent: 17.7, color: "#18b8e6" },
    { label: "Vencido ≤ 30 días", value: 60376.98, amount: "$60,376.98", percent: 8.6, color: "#f59e0b" },
    { label: "Vencido > 30 días", value: 490423.95, amount: "$490,423.95", percent: 69.5, color: "#ef4444" },
  ] satisfies DonutSegment[],
};
