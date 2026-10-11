import type { MetricCardData } from "../../data/dashboardDemo";

const TONE_COLOR: Record<MetricCardData["deltaTone"], string> = {
  up: "#10b981",
  down: "#f87171",
  neutral: "#94a3b8",
};

export default function MetricCard({ label, value, delta, deltaTone }: MetricCardData) {
  return (
    <div
      style={{
        // Tarjeta oscura sobre el nuevo fondo blanco del lienzo: la sombra
        // reemplaza al borde translúcido anterior (invisible sobre blanco).
        background: "#121b2f",
        borderRadius: 12,
        padding: "12px 14px",
        minWidth: 0,
        boxShadow: "0 4px 14px rgba(15, 23, 42, 0.12)",
        // La rejilla ya estira cada celda a la altura de la fila, pero esta
        // tarjeta (el hijo visible) no la llenaba — cuando el delta de una
        // tarjeta envolvía a 2 líneas (p. ej. "Facturado – gastos del mes")
        // esa tarjeta quedaba más alta que las demás y se veían
        // desalineadas (reportado por el usuario). height:100% + flex la
        // hace ocupar siempre toda la celda, con el delta pegado abajo.
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <div>
        <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {label}
        </p>
        <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 800, color: "#fff" }}>{value}</p>
      </div>
      {delta && <p style={{ margin: 0, fontSize: 10.5, color: TONE_COLOR[deltaTone] }}>{delta}</p>}
    </div>
  );
}
