import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { LinePoint } from "../../data/dashboardDemo";

interface Props {
  points: LinePoint[];
  width?: number;
  height?: number;
  color?: string;
}

export default function AnimatedLineChart({ points, width = 280, height = 120, color = "#00d2ff" }: Props) {
  const pathRef = useRef<SVGPathElement>(null);
  const dotsRef = useRef<SVGCircleElement[]>([]);

  const padX = 28;
  const padY = 16;
  const max = Math.max(...points.map((p) => p.value));
  const min = Math.min(...points.map((p) => p.value));
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = padX + (i / Math.max(points.length - 1, 1)) * (width - padX * 2);
    const y = padY + (1 - (p.value - min) / range) * (height - padY * 2);
    return { x, y, ...p };
  });

  const d = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const length = path.getTotalLength();

    // ui-ux-pro-max (Animation > Reduced Motion, severity High): el resto
    // del sitio respeta prefers-reduced-motion (ver HeroScene/global.css),
    // pero este componente se usa también fuera del hero (demo de producto
    // en la página) y disparaba el trazo/stagger sin comprobarlo. Con
    // reduced-motion, el trazo y los puntos aparecen completos de una vez.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: 0 });
      gsap.set(dotsRef.current, { scale: 1 });
      return;
    }

    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    gsap.set(dotsRef.current, { scale: 0, transformOrigin: "center" });

    // Duraciones: /1.18 (+18% motion continuo) * 1.2 (-20% extra en el
    // ensamblaje al cargar, pedido tras ver el +18% en acción).
    const tl = gsap.timeline();
    tl.to(path, { strokeDashoffset: 0, duration: 1.118, ease: "power2.out" });
    tl.to(dotsRef.current, { scale: 1, duration: 0.356, stagger: 0.122, ease: "back.out(2)" }, "-=0.3");

    return () => {
      tl.kill();
    };
  }, [points]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label="Utilidad neta mensual">
      <path ref={pathRef} d={d} fill="none" stroke={color} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" />
      {coords.map((c, i) => (
        <g key={c.label}>
          <circle
            ref={(el) => {
              if (el) dotsRef.current[i] = el;
            }}
            cx={c.x}
            cy={c.y}
            r={4}
            fill={color}
          />
          <text x={c.x} y={height - 2} fontSize={9} fill="#94a3b8" textAnchor="middle">
            {c.label}
          </text>
          <text x={c.x} y={c.y - 10} fontSize={9.5} fontWeight={700} fill="#fff" textAnchor="middle">
            {c.displayValue}
          </text>
        </g>
      ))}
    </svg>
  );
}
