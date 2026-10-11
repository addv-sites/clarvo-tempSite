import { forwardRef, useLayoutEffect, useMemo, useRef } from "react";
import type { Group, InstancedMesh } from "three";
import { Matrix4 } from "three";
import { RoundedBox } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";

type DeviceType = "laptop" | "tablet" | "phone";

interface Spec {
  /** Ancho/alto del área visible de pantalla, en unidades de escena. */
  screenW: number;
  screenH: number;
  /** Tamaño de diseño del overlay DOM, en px CSS. Debe cumplir
   *  htmlW / htmlH === screenW / screenH, y elegirse cerca del tamaño
   *  real en pantalla para que el texto no se escale (ver ScreenSync). */
  htmlW: number;
  htmlH: number;
  /** Radio de esquina del overlay DOM, en px. */
  radius: number;
}

/**
 * Proporciones tomadas de dispositivos reales:
 *  - laptop  16:10 (1.600)
 *  - tablet  3:4 vertical (0.750)
 *  - phone   ~9:19.5 (0.4615)
 *
 * htmlW/htmlH se dimensionan al tamaño que el dispositivo ocupa en el
 * canvas de 600×400 del hero, para que el overlay se muestre a escala ≈1
 * y la tipografía quede nítida y legible — ampliar el overlay y
 * reducirlo por transform es lo que volvía ilegible el dashboard.
 */
const SPECS: Record<DeviceType, Spec> = {
  laptop: { screenW: 3.04, screenH: 1.9, htmlW: 400, htmlH: 250, radius: 3 },
  tablet: { screenW: 1.44, screenH: 1.92, htmlW: 129, htmlH: 172, radius: 7 },
  phone: { screenW: 0.78, screenH: 1.692, htmlW: 118, htmlH: 256, radius: 12 },
};

/* ── Materiales ──────────────────────────────────────────────────────────
 * Tres acabados, no uno: aluminio anodizado del cuerpo, cristal negro del
 * frente y un chaflán metálico más claro que asoma 1–2 px alrededor de la
 * silueta. Esa línea brillante en el canto es lo que separa un dispositivo
 * de una caja oscura: es lo único que delata el bisel contra el fondo
 * marino. Todos recogen el <Environment> de la escena. */
const BODY = { color: "#0f141f", metalness: 0.82, roughness: 0.46 } as const;
const EDGE = { color: "#7d8ea6", metalness: 1, roughness: 0.14 } as const;
const GLASS = { color: "#05080f", metalness: 0.25, roughness: 0.12 } as const;
const SCREEN_OFF = { color: "#070e1c", metalness: 0.1, roughness: 0.28 } as const;

/** Ángulo de apertura de la tapa (~101°). HeroScene lo necesita para animar
 *  la bisagra de cerrada (0) a abierta (-OPEN_ANGLE) en la fase A del
 *  ensamblaje — se exporta en vez de duplicar el número en dos archivos. */
const OPEN_ANGLE = 0.2;
const KEY = { color: "#1a2130", metalness: 0.25, roughness: 0.62 } as const;
const DECK = { color: "#0e131d", metalness: 0.55, roughness: 0.58 } as const;

/** Placa de pantalla apagada. El contenido real (DashboardScreen) lo pinta
 *  el overlay DOM sincronizado — ver ScreenSync en HeroScene.tsx. Esta
 *  placa solo evita que se vea el cuerpo si el overlay aún no montó. */
function ScreenPlate({ spec, z }: { spec: Spec; z: number }) {
  return (
    <mesh position={[0, 0, z]}>
      <planeGeometry args={[spec.screenW, spec.screenH]} />
      <meshStandardMaterial {...SCREEN_OFF} />
    </mesh>
  );
}

/** Panel plano con chaflán: cuerpo metálico + cristal frontal + canto claro. */
function Panel({
  w,
  h,
  d,
  r,
  glassInset = 0.028,
  children,
}: {
  w: number;
  h: number;
  d: number;
  r: number;
  glassInset?: number;
  children?: React.ReactNode;
}) {
  return (
    <group>
      {/* Chaflán: ligeramente mayor y más fino, asoma por el borde. */}
      <RoundedBox args={[w + 0.038, h + 0.038, d * 0.66]} radius={r + 0.019} smoothness={4}>
        <meshStandardMaterial {...EDGE} />
      </RoundedBox>
      <RoundedBox args={[w, h, d]} radius={r} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial {...BODY} />
      </RoundedBox>
      {/* Cristal frontal: el bisel negro alrededor de la pantalla. */}
      <RoundedBox
        args={[w - glassInset, h - glassInset, d * 0.34]}
        radius={Math.max(r - glassInset / 2, 0.004)}
        smoothness={4}
        position={[0, 0, d * 0.4]}
      >
        <meshStandardMaterial {...GLASS} />
      </RoundedBox>
      {children}
    </group>
  );
}

/** Teclado: 5×14 teclas en un solo instancedMesh (1 draw call, 70 cuerpos)
 *  — el presupuesto de la sección 9 no da para 70 meshes sueltos. */
function Keyboard({ width, depth, z }: { width: number; depth: number; z: number }) {
  const COLS = 14;
  const ROWS = 5;
  const mesh = useRef<InstancedMesh>(null);

  const layout = useMemo(() => {
    const gapX = width / COLS;
    const gapZ = depth / ROWS;
    return { gapX, gapZ, keyW: gapX * 0.82, keyD: gapZ * 0.74 };
  }, [width, depth]);

  useLayoutEffect(() => {
    const instanced = mesh.current;
    if (!instanced) return;
    const m = new Matrix4();
    let i = 0;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        // La última fila es la barra espaciadora: se omiten las teclas
        // centrales y se dibuja aparte, si no el teclado parece una rejilla.
        if (row === ROWS - 1 && col > 4 && col < 10) {
          m.makeScale(0, 0, 0);
        } else {
          m.makeTranslation(
            (col - (COLS - 1) / 2) * layout.gapX,
            0,
            (row - (ROWS - 1) / 2) * layout.gapZ,
          );
        }
        instanced.setMatrixAt(i++, m);
      }
    }
    instanced.instanceMatrix.needsUpdate = true;
  }, [layout]);

  return (
    <group position={[0, 0, z]}>
      <instancedMesh ref={mesh} args={[undefined, undefined, COLS * ROWS]} castShadow>
        <boxGeometry args={[layout.keyW, 0.016, layout.keyD]} />
        <meshStandardMaterial {...KEY} />
      </instancedMesh>
      {/* Barra espaciadora */}
      <mesh position={[0, 0, ((ROWS - 1) / 2) * layout.gapZ]} castShadow>
        <boxGeometry args={[layout.gapX * 4.6, 0.016, layout.keyD]} />
        <meshStandardMaterial {...KEY} />
      </mesh>
    </group>
  );
}

/**
 * Laptop con bisagra real: base horizontal con teclado y trackpad, y tapa
 * abatida hacia atrás. El origen local está en la línea de bisagra; el
 * conjunto se recentra para que el grupo quede visualmente equilibrado.
 *
 * La sensación de 3D de toda la escena sale de aquí — del escorzo de la
 * base — y no de girar la pantalla, que es lo que arruinaría la lectura
 * del dashboard (master prompt §4: "evitar reflejos/deformaciones que
 * dificulten la lectura de la interfaz").
 */
function Laptop({
  anchorRef,
  lidRef,
  deckRef,
}: {
  anchorRef?: React.MutableRefObject<Group | null>;
  /** Tapa: HeroScene la anima por frame (apertura de bisagra, fase A del
   *  ensamblaje) — ver Rig en HeroScene.tsx. */
  lidRef?: React.MutableRefObject<Group | null>;
  /** Base (teclado + trackpad): HeroScene la anima por frame (aparece tras
   *  la tapa, fase A del ensamblaje). */
  deckRef?: React.MutableRefObject<Group | null>;
}) {
  const spec = SPECS.laptop;
  const lidW = spec.screenW + 0.17;
  const lidH = spec.screenH + 0.21;
  const lidT = 0.052;
  const baseD = lidH * 0.94;
  const baseT = 0.075;
  const openAngle = OPEN_ANGLE; // ~101° de apertura

  return (
    <group position={[0, -lidH * 0.42, -baseD * 0.3]}>
      {/* Base */}
      <group ref={deckRef}>
        <RoundedBox
          args={[lidW, baseT, baseD]}
          radius={0.018}
          smoothness={4}
          position={[0, -baseT / 2, baseD / 2]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial {...BODY} />
        </RoundedBox>
        {/* Hueco del teclado */}
        <mesh position={[0, -0.001, baseD * 0.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[lidW * 0.84, baseD * 0.52]} />
          <meshStandardMaterial {...DECK} />
        </mesh>
        <Keyboard width={lidW * 0.78} depth={baseD * 0.44} z={baseD * 0.4} />
        {/* Trackpad */}
        <mesh position={[0, 0.0005, baseD * 0.79]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[lidW * 0.3, baseD * 0.24]} />
          <meshStandardMaterial color="#10161f" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Muesca frontal para abrir la tapa */}
        <mesh position={[0, -0.012, baseD - 0.004]} rotation={[0, 0, 0]}>
          <planeGeometry args={[lidW * 0.16, 0.03]} />
          <meshStandardMaterial {...GLASS} />
        </mesh>
      </group>

      {/* Bisagra */}
      <mesh position={[0, 0.012, 0.012]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.024, 0.024, lidW * 0.52, 14]} />
        <meshStandardMaterial {...EDGE} />
      </mesh>

      {/* Tapa */}
      <group ref={lidRef} rotation={[-openAngle, 0, 0]}>
        <group position={[0, lidH / 2, 0]}>
          <Panel w={lidW} h={lidH} d={lidT} r={0.026} glassInset={0.055}>
            {/* Cámara */}
            <mesh position={[0, lidH / 2 - 0.055, lidT * 0.58]}>
              <circleGeometry args={[0.012, 12]} />
              <meshStandardMaterial color="#0b1a2b" metalness={0.4} roughness={0.2} />
            </mesh>
            <ScreenPlate spec={spec} z={lidT * 0.58} />
          </Panel>
          <group ref={anchorRef} position={[0, 0, lidT * 0.58 + 0.004]} />
        </group>
      </group>
    </group>
  );
}

/** Tablet y teléfono: una sola placa, con botones laterales en el teléfono. */
function Slab({
  type,
  anchorRef,
}: {
  type: "tablet" | "phone";
  anchorRef?: React.MutableRefObject<Group | null>;
}) {
  const spec = SPECS[type];
  const isPhone = type === "phone";
  const bezel = isPhone ? 0.07 : 0.15;
  const w = spec.screenW + bezel;
  const h = spec.screenH + bezel;
  const d = isPhone ? 0.078 : 0.07;
  const r = isPhone ? 0.085 : 0.062;

  return (
    <group>
      <Panel w={w} h={h} d={d} r={r} glassInset={isPhone ? 0.018 : 0.026}>
        <ScreenPlate spec={spec} z={d * 0.58} />
        {!isPhone && (
          <mesh position={[0, h / 2 - 0.055, d * 0.58]}>
            <circleGeometry args={[0.011, 12]} />
            <meshStandardMaterial color="#0b1a2b" metalness={0.4} roughness={0.2} />
          </mesh>
        )}
      </Panel>
      {isPhone && (
        <>
          {/* Botones laterales: volumen (izq.) y encendido (der.) */}
          <mesh position={[-w / 2 - 0.004, h * 0.2, 0]}>
            <boxGeometry args={[0.014, 0.17, d * 0.5]} />
            <meshStandardMaterial {...EDGE} />
          </mesh>
          <mesh position={[-w / 2 - 0.004, h * 0.02, 0]}>
            <boxGeometry args={[0.014, 0.17, d * 0.5]} />
            <meshStandardMaterial {...EDGE} />
          </mesh>
          <mesh position={[w / 2 + 0.004, h * 0.14, 0]}>
            <boxGeometry args={[0.014, 0.24, d * 0.5]} />
            <meshStandardMaterial {...EDGE} />
          </mesh>
        </>
      )}
      <group ref={anchorRef} position={[0, 0, d * 0.58 + 0.004]} />
    </group>
  );
}

// `GroupProps` no existe en @react-three/fiber v9: los tipos de elemento
// viven en `ThreeElements`. El import anterior compilaba porque `astro build`
// solo borra tipos, no los verifica — nunca llegó a comprobarse.
type DeviceMeshProps = ThreeElements["group"] & {
  type: DeviceType;
  /** Grupo situado en el plano de la pantalla (ejes locales = ejes de la
   *  pantalla). ScreenSync lo usa como única fuente de verdad para
   *  proyectar el overlay DOM; no hay offsets duplicados en la escena. */
  anchorRef?: React.MutableRefObject<Group | null>;
  /** Solo se usan cuando `type === "laptop"` — ver Laptop(). */
  lidRef?: React.MutableRefObject<Group | null>;
  deckRef?: React.MutableRefObject<Group | null>;
};

/** Carcasas con geometría propia — master prompt §8, capa 2: no se
 *  justifica un GLB para esto, y un GLB no cumpliría el presupuesto de
 *  carga de §9. */
const DeviceMesh = forwardRef<Group, DeviceMeshProps>(
  ({ type, anchorRef, lidRef, deckRef, ...groupProps }, ref) => (
    <group ref={ref} {...groupProps}>
      {type === "laptop" ? (
        <Laptop anchorRef={anchorRef} lidRef={lidRef} deckRef={deckRef} />
      ) : (
        <Slab type={type} anchorRef={anchorRef} />
      )}
    </group>
  ),
);

DeviceMesh.displayName = "DeviceMesh";
export default DeviceMesh;
export { SPECS, OPEN_ANGLE };
export type { DeviceType, Spec };
