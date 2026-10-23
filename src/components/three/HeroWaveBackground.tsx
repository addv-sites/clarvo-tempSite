import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import WaveField from "./WaveField";

/* ── Fondo de líneas onduladas, a lo ancho de toda la sección del hero ───
 *
 * Canvas propio e independiente del de los dispositivos (HeroScene): ese
 * tiene cámara/fog/luces afinados para los dispositivos en PBR y una caja
 * angosta (3:2). Este es solo decorativo, full-bleed detrás de texto y
 * dispositivos por igual, así que separarlo evita arriesgar esa cámara
 * ya calibrada por un requisito puramente visual.
 */

function ensureWebglSupport(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")),
    );
  } catch {
    return false;
  }
}

export default function HeroWaveBackground() {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setSupported(!reducedMotion && ensureWebglSupport());
  }, []);

  // El wrapper SIEMPRE se renderiza (con tamaño real, inset-0) aunque
  // `supported` todavía sea false antes de montar: `client:visible` de
  // Astro depende de un IntersectionObserver sobre este nodo, y un
  // `return null` aquí lo deja sin geometría antes de hidratar — nunca
  // intersecciona nada, así que la isla nunca llega a hidratarse.
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {supported && (
        <Canvas
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
          camera={{ position: [0, 0.4, 9], fov: 50 }}
          style={{
            filter:
              "drop-shadow(0 0 2px #dff3ff) drop-shadow(0 0 9px #2fd2ff) drop-shadow(0 0 20px #1a8fc4)",
          }}
        >
          <fog attach="fog" args={["#0a1322", 7, 15]} />
          <WaveField
            position={[3, -4.4, -3]}
            width={30}
            maxCrossWidth={0.85}
            segX={150}
            segZ={30}
            opacity={0.58}
            fadeFrom={-2}
            fadeSpan={7}
            twistRate={0.5}
            twistSpeed={0.35}
            mirror
          />
        </Canvas>
      )}
    </div>
  );
}
