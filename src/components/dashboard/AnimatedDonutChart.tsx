import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { DonutSegment } from "../../data/dashboardDemo";

interface Props {
  segments: DonutSegment[];
  size?: number;
}

export default function AnimatedDonutChart({ segments, size = 140 }: Props) {
  const arcsRef = useRef<SVGCircleElement[]>([]);
  const radius = size / 2 - 14;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let cumulative = 0;
  const arcs = segments.map((seg) => {
    const offset = cumulative;
    cumulative += seg.percent;
    return { ...seg, offset, length: (seg.percent / 100) * circumference };
  });

  useEffect(() => {
    // ui-ux-pro-max (Animation > Reduced Motion, severity High): mismo caso
    // que AnimatedLineChart — este componente vive fuera del hero (donde sí
    // se respeta) y no comprobaba la preferencia del usuario.
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    arcsRef.current.forEach((el, i) => {
      if (!el) return;
      const arc = arcs[i];

      if (reducedMotion) {
        gsap.set(el, {
          strokeDasharray: `${arc.length} ${circumference}`,
          strokeDashoffset: -(arc.offset / 100) * circumference,
        });
        return;
      }

      gsap.set(el, { strokeDasharray: `${arc.length} ${circumference}`, strokeDashoffset: circumference });
      // Duraciones: /1.18 (+18% motion continuo) * 1.2 (-20% extra en el
      // ensamblaje al cargar, pedido tras ver el +18% en acción).
      //
      // El offset final estaba mal: con strokeDasharray `${length}
      // ${circumference}` el período del patrón es length+circumference,
      // NO circumference — así que `circumference - cumulativo` (lo que
      // había antes) desplazaba cada arco por una vuelta completa de más,
      // y como el período no es exactamente una vuelta, el desfase NO se
      // cancelaba: los 4 arcos quedaban rotados a posiciones incorrectas y
      // separados entre sí (reportado por el usuario: "la dona se ve
      // incompleta"). La fórmula correcta (la del offset negativo del
      // acumulado) es la técnica estándar de donut con stroke-dasharray.
      gsap.to(el, {
        strokeDashoffset: -(arc.offset / 100) * circumference,
        duration: 1.016,
        delay: 0.152 + i * 0.122,
        ease: "power2.out",
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments]);

  // ui-ux-pro-max (Charts > Part-to-Whole, riesgo de accesibilidad alto):
  // un lector de pantalla solo anunciaba el título del gráfico, no el
  // desglose — la lista de abajo SÍ es texto accesible normal, pero el
  // propio <svg> quedaba mudo sobre los valores que dibuja.
  const summary = segments.map((s) => `${s.label} ${s.percent}%`).join(", ");

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label={`Antigüedad de saldos: ${summary}`}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#121b2f" strokeWidth={14} />
        {arcs.map((arc, i) => (
          <circle
            key={arc.label}
            ref={(el) => {
              if (el) arcsRef.current[i] = el;
            }}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth={14}
            strokeLinecap="butt"
            transform={`rotate(-90 ${center} ${center})`}
          />
        ))}
      </svg>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, fontSize: 10.5 }}>
        {segments.map((seg) => (
          <li key={seg.label} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, color: "#cbd5e1" }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: seg.color, display: "inline-block" }} />
            {seg.label} · {seg.percent}%
          </li>
        ))}
      </ul>
    </div>
  );
}
