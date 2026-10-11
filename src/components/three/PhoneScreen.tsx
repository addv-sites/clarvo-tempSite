import { metricCards, utilidadNetaMensual } from "../../data/dashboardDemo";

/**
 * Vista móvil en la escena 3D del hero.
 *
 * Master prompt §4: el smartphone "no debe limitarse a encoger el
 * dashboard de escritorio". A 118 px de ancho, `DashboardScreen` en
 * variante `compact` desborda — su rejilla de dos tarjetas con cifras de
 * 11 dígitos necesita ~200 px — así que aquí la estructura es de app
 * móvil: una cifra protagonista, tendencia y barra de módulos.
 *
 * Los datos son los MISMOS verificados de `dashboardDemo.ts`
 * (capClar/06-resumen-financiero.jpg). No hay cifras inventadas ni
 * módulos que no aparezcan ya en la navegación del producto.
 */

/** Módulos que ya aparecen en la navegación del producto y en el copy del
 *  hero ("Ventas, clientes, inventario, gastos…"). No se inventa ninguno. */
const MODULES = [
  { label: "Ventas", color: "#18b8e6" },
  { label: "Clientes", color: "#38bdf8" },
  { label: "Inventario", color: "#64748b" },
  { label: "Gastos", color: "#f59e0b" },
];

/** Sparkline de los mismos 3 puntos confirmados de utilidad neta mensual.
 *  Estático a propósito: a este tamaño una animación de trazo no se
 *  percibe y solo añade trabajo por frame (master prompt §9). */
function Sparkline() {
  const pts = utilidadNetaMensual.points;
  const w = 86;
  const h = 30;
  const values = pts.map((p) => p.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const coords = pts.map((p, i) => ({
    x: (i / Math.max(pts.length - 1, 1)) * w,
    y: h - ((p.value - min) / range) * h,
  }));

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} aria-hidden="true" style={{ display: "block" }}>
      <polyline
        points={coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ")}
        fill="none"
        stroke="#00d2ff"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {coords.map((c, i) => (
        <circle key={pts[i].label} cx={c.x} cy={c.y} r={2.8} fill="#00d2ff" />
      ))}
    </svg>
  );
}

interface Props {
  /** Delay base en segundos para la fase C del ensamblaje — ver
   *  CONTENT_REVEAL_START en HeroScene.tsx. Sin este prop (otros usos del
   *  componente) no hay animación, solo render estático. */
  revealAt?: number;
}

export default function PhoneScreen({ revealAt }: Props) {
  const primary = metricCards[0];
  const secondary = metricCards[1];
  const reveal = (offset: number): { className?: string; style?: Record<string, string> } =>
    revealAt === undefined
      ? {}
      : { className: "hero-reveal", style: { animationDelay: `${revealAt + offset}s` } };

  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
        // Fondo blanco + tarjetas oscuras (estilo Apple, consistente con
        // laptop/tablet) — antes todo el lienzo era azul marino oscuro.
        background: "#ffffff",
        color: "#0f172a",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Isla / notch: va aquí y no en la geometría 3D porque el overlay
          DOM se dibuja por encima del canvas y la taparía. Se mantiene
          negra a propósito: es el bisel físico del teléfono, no contenido
          de pantalla, así que no sigue el cambio a fondo blanco. */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 6 }}>
        <div style={{ width: 34, height: 9, borderRadius: 999, background: "#05080f" }} />
      </div>

      <div style={{ flex: 1, padding: "8px 11px 0", display: "flex", flexDirection: "column", gap: 8 }}>
        <div {...reveal(0)}>
          <p style={{ margin: 0, fontSize: 10.5, fontWeight: 800, letterSpacing: 0.3 }}>CLARVO</p>
          <p style={{ margin: "1px 0 0", fontSize: 8.5, color: "#64748b" }}>Resumen financiero</p>
        </div>

        <div
          className={reveal(0.15).className}
          style={{
            background: "#10214b",
            borderRadius: 10,
            padding: "9px 10px",
            boxShadow: "0 3px 10px rgba(15, 23, 42, 0.12)",
            ...reveal(0.15).style,
          }}
        >
          <p style={{ margin: 0, fontSize: 8.5, color: "#9fb4d8" }}>{primary.label}</p>
          {/* Sin color explícito heredaba el #0f172a (casi negro) de la raíz
              — invisible sobre esta tarjeta oscura (reportado por el
              usuario: "esos números no se ven porque están en negro"). */}
          <p style={{ margin: "2px 0 5px", fontSize: 16, fontWeight: 800, letterSpacing: -0.3, color: "#fff" }}>
            {primary.value}
          </p>
          <Sparkline />
        </div>

        <div
          className={reveal(0.25).className}
          style={{
            background: "#121b2f",
            borderRadius: 10,
            padding: "8px 10px",
            boxShadow: "0 3px 10px rgba(15, 23, 42, 0.12)",
            ...reveal(0.25).style,
          }}
        >
          <p style={{ margin: 0, fontSize: 8.5, color: "#94a3b8" }}>{secondary.label}</p>
          <p style={{ margin: "2px 0 0", fontSize: 13.5, fontWeight: 800, color: "#fff" }}>{secondary.value}</p>
        </div>
      </div>

      {/* Barra de módulos. Fichas con punto de color en vez de etiquetas de
          6 px: a la escala a la que se ve el teléfono (~0.7) el texto se
          convierte en ruido, mientras que la forma sí comunica "app con
          navegación". El nombre queda en el title por accesibilidad. */}
      <div
        className={reveal(0.35).className}
        style={{ display: "flex", gap: 5, padding: "8px 9px 11px", ...reveal(0.35).style }}
      >
        {MODULES.map((m) => (
          <div
            key={m.label}
            title={m.label}
            style={{
              flex: 1,
              height: 22,
              background: "#121b2f",
              borderRadius: 7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: 2, background: m.color, display: "block" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
