import { antiguedadSaldos } from "../../data/dashboardDemo";

/**
 * Vista de la tablet en la escena 3D del hero. Lienzo de diseño: 129×172 px
 * (ver SPECS.tablet) — es el tamaño REAL que ocupa en el lienzo de 600×400,
 * así que el contenido se maqueta a escala 1 y no se reescala.
 *
 * Por qué no es el mismo `DashboardScreen` que la laptop: repetir la misma
 * pantalla en dos dispositivos lee como un error de render, no como
 * profundidad. La tablet muestra otro módulo real del producto — "Cuentas
 * por cobrar · Antigüedad de saldos" — con los MISMOS datos verificados de
 * `dashboardDemo.ts` (fuente: capClar/03-cuentas-por-cobrar.jpg). Los 4
 * segmentos y sus porcentajes son los de la captura; no hay nada inventado.
 *
 * Es un listado de barras y no el `AnimatedDonutChart` porque ese componente
 * maqueta donut + leyenda en fila y a 129 px la leyenda se desborda. La
 * tablet es el elemento terciario de la composición y aparece recortada por
 * el borde del lienzo, así que prioriza silueta limpia sobre detalle.
 */
interface Props {
  /** Delay base en segundos para la fase C del ensamblaje — ver
   *  CONTENT_REVEAL_START en HeroScene.tsx. Sin este prop (otros usos del
   *  componente) no hay animación, solo render estático. */
  revealAt?: number;
}

export default function TabletScreen({ revealAt }: Props) {
  const reveal = (offset: number): { className?: string; style?: Record<string, string> } =>
    revealAt === undefined
      ? {}
      : { className: "hero-reveal", style: { animationDelay: `${revealAt + offset}s` } };

  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
        // Fondo blanco + tarjetas oscuras (estilo Apple, consistente con
        // laptop/celular) — antes todo el lienzo era azul marino oscuro.
        background: "#ffffff",
        color: "#0f172a",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        padding: "9px 10px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        overflow: "hidden",
      }}
    >
      <div {...reveal(0)}>
        <p style={{ margin: 0, fontSize: 9, fontWeight: 800, letterSpacing: 0.3 }}>CLARVO</p>
        <p style={{ margin: "1px 0 0", fontSize: 7, color: "#64748b" }}>Cuentas por cobrar</p>
      </div>

      <div
        {...reveal(0.07)}
        style={{ background: "#121b2f", borderRadius: 8, padding: "6px 8px", boxShadow: "0 3px 10px rgba(15, 23, 42, 0.12)" }}
      >
        <p style={{ margin: 0, fontSize: 7, color: "#94a3b8" }}>Total por cobrar</p>
        <p style={{ margin: "1px 0 0", fontSize: 13, fontWeight: 800, letterSpacing: -0.2, color: "#fff" }}>
          $706,097.86
        </p>
      </div>

      <div
        {...reveal(0.12)}
        style={{
          background: "#121b2f",
          borderRadius: 8,
          padding: "6px 8px",
          flex: 1,
          minHeight: 0,
          boxShadow: "0 3px 10px rgba(15, 23, 42, 0.12)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <p style={{ margin: "0 0 4px", fontSize: 7, color: "#94a3b8" }}>{antiguedadSaldos.title}</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1, justifyContent: "center" }}>
          {antiguedadSaldos.segments.map((seg, i) => (
            <div key={seg.label} {...reveal(0.18 + i * 0.05)}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 4, marginBottom: 2 }}>
                <span
                  style={{
                    fontSize: 6.5,
                    color: "#cbd5e1",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {seg.label}
                </span>
                <span style={{ fontSize: 6.5, fontWeight: 700, color: seg.color, flexShrink: 0 }}>
                  {seg.percent}%
                </span>
              </div>
              {/* Barra +1px (4→5) — se perdía un poco contra el resto del
                  contenido (feedback directo del usuario). */}
              <div style={{ height: 5, borderRadius: 2.5, background: "#1c2946", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${seg.percent}%`, background: seg.color, borderRadius: 2.5 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
