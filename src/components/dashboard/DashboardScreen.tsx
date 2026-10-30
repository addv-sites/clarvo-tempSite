import type { CSSProperties } from "react";
import MetricCard from "./MetricCard";
import AnimatedLineChart from "./AnimatedLineChart";
import AnimatedDonutChart from "./AnimatedDonutChart";
import { metricCards, utilidadNetaMensual, antiguedadSaldos } from "../../data/dashboardDemo";

interface Props {
  variant?: "full" | "compact";
  /** Solo aplica en `variant="compact"` (pantalla de la laptop en el hero
   *  3D): delay base en segundos para la fase C del ensamblaje
   *  ("el tablero se construye") — ver CONTENT_REVEAL_START en
   *  HeroScene.tsx. La variante `full` (sección de producto en la página)
   *  no tiene esta animación: ya está visible sin el ensamblaje del hero. */
  revealAt?: number;
}

/**
 * Reconstrucción real de "Resumen financiero" + "Cuentas por cobrar" desde
 * capturas reales (ver docs/product-screen-inventory.md). HTML/SVG reales,
 * nunca una imagen plana. Mismo componente para la sección demo (`full`) y
 * para las pantallas de la escena 3D del hero (`compact`) — master prompt
 * sección 8: "el mismo componente de interfaz debe poder renderizarse en
 * modo plano o integrarse dentro de la composición".
 */
export default function DashboardScreen({ variant = "full", revealAt = 0 }: Props) {
  const compact = variant === "compact";
  // Antes solo `compact` (hero) animaba. La variante `full` vive en un
  // island `client:visible` (DashboardDemoSection.astro): React no monta
  // este componente hasta que entra en viewport, así que el mismo delay
  // relativo al montaje produce el mismo efecto de "ensamblarse en
  // tiempo real" pedido por el usuario, sin necesitar un IntersectionObserver
  // propio.
  const reveal = (offset: number): { className?: string; style?: CSSProperties } => ({
    className: "hero-reveal",
    style: { animationDelay: `${revealAt + offset}s` },
  });

  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
        // Fondo blanco + tarjetas oscuras (estilo Apple, pedido explícito
        // del usuario) — antes todo el lienzo era azul marino oscuro.
        background: "#ffffff",
        color: "#0f172a",
        width: "100%",
        // `compact` (hero) vive dentro de un lienzo de pantalla con alto
        // FIJO (ver SPECS en DeviceMesh.tsx) y debe llenarlo exacto. `full`
        // (DashboardDemoSection.astro) ya no fuerza un aspect-ratio en su
        // contenedor — forzar height:100% ahí colapsaba a 0 y luego la
        // gráfica (alto fijo) desbordaba sobre la tarjeta de abajo
        // (reportado por el usuario: línea pegada a otros elementos, dona
        // "incompleta" porque su mitad superior quedaba tapada).
        height: compact ? "100%" : "auto",
        boxSizing: "border-box",
        padding: compact ? 12 : 20,
        display: "flex",
        flexDirection: "column",
        gap: compact ? 8 : 14,
        overflow: "hidden",
      }}
    >
      <div {...reveal(0)}>
        <p style={{ margin: 0, fontSize: compact ? 10 : 12, fontWeight: 800, letterSpacing: 0.3 }}>CLARVO</p>
        <p style={{ margin: 0, fontSize: compact ? 8.5 : 11, color: "#64748b" }}>Resumen financiero</p>
      </div>

      <div
        // `full`: sin gridTemplateColumns inline — lo decide el className
        // de Tailwind (grid-cols-2 en móvil, sm:grid-cols-4 desde 640px),
        // para que SÍ pueda responder al ancho real de pantalla. Un estilo
        // inline nunca lo hubiera dejado (gana siempre sobre una clase,
        // sin importar breakpoint) — exactamente lo que mantenía las 4
        // columnas fijas incluso en celular y encimaba los montos
        // (reportado por el usuario, captura real adjunta).
        className={compact ? undefined : "grid-cols-2 sm:grid-cols-4"}
        style={{
          display: "grid",
          // minmax(0, 1fr) y no 1fr a secas: una celda de grid tiene
          // min-width:auto por defecto, así que si el contenido de la
          // tarjeta pide más ancho que su 1fr (p. ej. "$75,959.48" cerca
          // del breakpoint lg, donde la tarjeta completa se angosta), la
          // fila entera se ensancha más allá del contenedor y la última
          // columna queda recortada por el overflow:hidden del lienzo —
          // se veía como una tarjeta "pegada"/cortada contra el borde
          // (reportado por el usuario, reproducido en vivo a 1024px).
          // Ojo: si "full" trajera aquí CUALQUIER valor de
          // gridTemplateColumns (incluido "none"), un estilo inline gana
          // siempre sobre una clase sin importar el valor — las clases de
          // Tailwind de arriba nunca podrían aplicar. Por eso la rama
          // !compact no mete la llave en absoluto, no la pone en "none".
          ...(compact ? { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" } : {}),
          gap: compact ? 6 : 10,
        }}
      >
        {(compact ? metricCards.slice(0, 2) : metricCards).map((m, i) => {
          const r = reveal(0.2 + i * 0.13);
          // Las 4 tarjetas se quedan visibles en todos los anchos (ocultar
          // "Total gastos" en móvil se probó y el usuario prefirió
          // conservarlas completas) — el ajuste que sí evita el encimado es
          // en MetricCard: el valor usa clamp() + ellipsis, así se angosta
          // solo donde hace falta en vez de desaparecer una tarjeta.
          return (
            <div key={m.label} className={r.className} style={{ minWidth: 0, ...r.style }}>
              <MetricCard {...m} />
            </div>
          );
        })}
      </div>

      <div
        className={reveal(0.45).className}
        style={{
          background: "#121b2f",
          borderRadius: 12,
          // +2px de padding compacto: la gráfica se sentía apretada contra
          // el borde de la tarjeta (reportado por el usuario).
          padding: compact ? 10 : 14,
          // flex:1 solo en compact, donde el alto total es fijo y la
          // gráfica debe absorber el espacio restante. En `full` (alto
          // automático) no hay espacio "restante" que repartir — flex:1
          // ahí fue lo que hacía que la gráfica se calculara más alta que
          // el hueco real disponible y desbordara sobre la tarjeta de
          // abajo.
          ...(compact ? { flex: 1, minHeight: 0 } : {}),
          overflow: "hidden",
          boxShadow: "0 4px 14px rgba(15, 23, 42, 0.12)",
          ...reveal(0.45).style,
        }}
      >
        <p style={{ margin: 0, fontSize: compact ? 9 : 11, color: "#94a3b8" }}>{utilidadNetaMensual.title}</p>
        <AnimatedLineChart points={utilidadNetaMensual.points} height={compact ? 80 : 120} />
      </div>

      {!compact && (
        <div
          className={reveal(0.6).className}
          style={{
            background: "#121b2f",
            borderRadius: 12,
            padding: 14,
            overflow: "hidden",
            boxShadow: "0 4px 14px rgba(15, 23, 42, 0.12)",
            ...reveal(0.6).style,
          }}
        >
          <p style={{ margin: "0 0 8px", fontSize: 11, color: "#94a3b8" }}>{antiguedadSaldos.title}</p>
          <AnimatedDonutChart segments={antiguedadSaldos.segments} size={110} />
        </div>
      )}
    </div>
  );
}
