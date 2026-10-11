/**
 * Preguntas grounded en market.md y CLARVO_Planes.md — nada de términos
 * comerciales (cancelación, cambios de plan, etc.) que no estén
 * confirmados en ninguna fuente todavía. Compartido entre FaqSection.astro
 * y el JSON-LD de FAQPage en index.astro para que el contenido visible y
 * los datos estructurados nunca se desincronicen (master prompt sección 17).
 */
export const faqs = [
  {
    q: "¿Qué es CLARVO?",
    a: "El sistema que te enseña a administrar mientras lo usas. Ventas, cobros, gastos, inventario y facturación en un solo lugar, en vez de Excel, WhatsApp y cuadernos sueltos.",
  },
  {
    q: "¿Necesito instalar algo o comprar equipo?",
    a: "No. Tu celular, tablet o computadora ya son tu punto de venta — apuntas la cámara al código de barras y listo. Lectores externos e impresoras de ticket son opcionales, nunca obligatorios.",
  },
  {
    q: "¿Funciona sin internet?",
    a: "Sí, para ventas y gastos: el sistema los guarda y los sincroniza solo en cuanto vuelve la señal.",
  },
  {
    q: "¿Cuánto cuesta multi-caja o varios cajeros al mismo tiempo?",
    a: "Nada extra. Todos los paquetes incluyen multi-caja sin costo adicional y sin letra chica.",
  },
  {
    q: "¿Y si ninguno de los 4 planes encaja con mi negocio?",
    a: "Arma un plan a la medida — cuéntanos qué necesitas y te preparamos una propuesta personalizada.",
  },
];
