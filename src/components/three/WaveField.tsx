import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  LineBasicMaterial,
  LineSegments,
} from "three";

/* ── Cinta de malla retorcida, de fondo ───────────────────────────────────
 *
 * Clonado del fondo de login de MinIO (confirmado en vivo contra
 * http://127.0.0.1:9001/login con la extensión de Chrome): una cinta/grid
 * que se RETUERCE sobre su propio eje longitudinal (x). La forma general
 * se queda fija; lo que fluye con el tiempo es el ángulo de torsión.
 *
 * Dos detalles que faltaban en el primer intento y que SÍ se notan a
 * simple vista comparando capturas:
 *  1. Degradado de color — pálido casi blanco donde la cinta es un hilo
 *     delgado, cian saturado donde se abre en el nudo tejido. Un color
 *     plano se lee "chato" comparado con la referencia.
 *  2. Brillo/bloom — las líneas de la fuente tienen halo difuso, no son
 *     trazos duros de 1px. No hay postprocessing instalado en el
 *     proyecto; se resuelve con `filter: drop-shadow(...)` en CSS sobre
 *     el propio <canvas> (ver HeroWaveBackground.tsx) — drop-shadow sí
 *     respeta el alfa real de lo dibujado, a diferencia de box-shadow.
 */

function envelope(x: number, fadeFrom: number, fadeSpan: number): number {
  return Math.min(1, Math.max(0, (x - fadeFrom) / fadeSpan));
}

function DustPoints({ width, depth }: { width: number; depth: number }) {
  const count = 90;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * width;
      arr[i * 3 + 1] = (Math.random() - 0.3) * 1.6;
      arr[i * 3 + 2] = (Math.random() - 0.5) * depth * 1.4;
    }
    return arr;
  }, [width, depth]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#eaffff"
        size={0.04}
        transparent
        opacity={0.7}
        depthWrite={false}
        blending={AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

export default function WaveField({
  position,
  width = 11,
  maxCrossWidth = 1.2,
  segX = 150,
  segZ = 30,
  opacity = 0.55,
  fadeFrom,
  fadeSpan,
  twistRate = 0.52,
  twistSpeed = 0.35,
  mirror = false,
}: {
  position: [number, number, number];
  /** largo total de la cinta en x. */
  width?: number;
  /** cuánto se "abre" la cinta en su punto más ancho. */
  maxCrossWidth?: number;
  /** resolución a lo largo (x). */
  segX?: number;
  /** resolución a lo ancho de la cinta. */
  segZ?: number;
  opacity?: number;
  /** x local donde empieza a abrirse la cinta (default: borde izquierdo). */
  fadeFrom?: number;
  /** distancia en x hasta que la cinta llega a su ancho completo. */
  fadeSpan?: number;
  /** radianes de torsión por unidad de x — más alto = más pellizcos/lazos. */
  twistRate?: number;
  /** velocidad de giro continuo de la trama, en rad/s. */
  twistSpeed?: number;
  /** Invierte horizontalmente alrededor de `position`. */
  mirror?: boolean;
}) {
  const groupRef = useRef<Group>(null);
  const resolvedFadeFrom = fadeFrom ?? -width / 2;
  const resolvedFadeSpan = fadeSpan ?? width * 0.3;
  const vCount = (segX + 1) * (segZ + 1);

  const idx = (i: number, j: number) => i * (segZ + 1) + j;

  const indices = useMemo(() => {
    const out: number[] = [];
    for (let i = 0; i < segX; i++) {
      for (let j = 0; j <= segZ; j++) {
        out.push(idx(i, j), idx(i + 1, j));
      }
    }
    for (let i = 0; i <= segX; i++) {
      for (let j = 0; j < segZ; j++) {
        out.push(idx(i, j), idx(i, j + 1));
      }
    }
    return new Uint32Array(out);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segX, segZ]);

  const { lineSegments, positionAttr, colorAttr } = useMemo(() => {
    const geo = new BufferGeometry();
    const posAttr = new BufferAttribute(new Float32Array(vCount * 3), 3);
    const colAttr = new BufferAttribute(new Float32Array(vCount * 3), 3);
    geo.setAttribute("position", posAttr);
    geo.setAttribute("color", colAttr);
    geo.setIndex(new BufferAttribute(indices, 1));
    const mat = new LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: AdditiveBlending,
      fog: true,
    });
    return { lineSegments: new LineSegments(geo, mat), positionAttr: posAttr, colorAttr: colAttr };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vCount, indices, opacity]);

  // Pálido (hilo delgado) → cian saturado (nudo tejido) a lo largo de x.
  const colorThin = useMemo(() => new Color("#dff3ff"), []);
  const colorThick = useMemo(() => new Color("#1fb6ea"), []);
  const tmpColor = useMemo(() => new Color(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pos = positionAttr.array as Float32Array;
    const col = colorAttr.array as Float32Array;

    for (let i = 0; i <= segX; i++) {
      const x = -width / 2 + width * (i / segX);
      const env = envelope(x, resolvedFadeFrom, resolvedFadeSpan);
      const crossWidth = env * maxCrossWidth;
      // Forma macro fija (sin t): un lazo ancho, un pellizco, otro lazo
      // continuando fuera del encuadre — igual que la referencia.
      const spine = env * (0.36 * Math.sin(x * 0.46 + 0.4) + 0.15 * Math.sin(x * 0.17 - 0.8));
      const twist = x * twistRate + t * twistSpeed;
      const sinT = Math.sin(twist);
      const cosT = Math.cos(twist);

      tmpColor.copy(colorThin).lerp(colorThick, env);

      for (let j = 0; j <= segZ; j++) {
        const u = -1 + (2 * j) / segZ;
        const vIdx = idx(i, j) * 3;
        pos[vIdx] = x;
        pos[vIdx + 1] = spine + u * crossWidth * sinT;
        pos[vIdx + 2] = u * crossWidth * cosT;
        col[vIdx] = tmpColor.r;
        col[vIdx + 1] = tmpColor.g;
        col[vIdx + 2] = tmpColor.b;
      }
    }
    positionAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;

    if (groupRef.current) {
      groupRef.current.position.y = position[1];
    }
  });

  return (
    <group ref={groupRef} position={position} scale={mirror ? [-1, 1, 1] : [1, 1, 1]}>
      <primitive object={lineSegments} />
      <DustPoints width={width} depth={maxCrossWidth * 2.4} />
    </group>
  );
}
