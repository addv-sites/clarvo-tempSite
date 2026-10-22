import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, PerspectiveCamera } from "@react-three/drei";
import { Matrix4, Vector3, type Group } from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import DeviceMesh, { SPECS, OPEN_ANGLE, type DeviceType } from "./DeviceMesh";
import DashboardScreen from "../dashboard/DashboardScreen";
import TabletScreen from "./TabletScreen";
import PhoneScreen from "./PhoneScreen";

let pluginRegistered = false;

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

/* ── Composición ─────────────────────────────────────────────────────────
 *
 * Site.png: una laptop dominante y un teléfono secundario que asoma por su
 * esquina inferior derecha. Se mantiene esa lectura y la tablet entra como
 * TERCER plano, no como tercer protagonista: desplazada a la izquierda,
 * más atrás y recortada por el borde del lienzo. Tres dispositivos
 * completos y centrados en 600×400 px es justo lo que hacía que la escena
 * se leyera como tres tarjetas apiladas.
 *
 * La profundidad se consigue con z real (no solo con escala), que es lo
 * que hace que el parallax del cursor separe los planos.
 *
 * Importante para la oclusión: los overlays DOM se pintan SIEMPRE sobre el
 * canvas, así que un dispositivo de atrás nunca puede quedar tapado por
 * uno de delante. Las posiciones están elegidas para que ninguna pantalla
 * se solape con el CUERPO de otra; solo el teléfono invade la laptop, y es
 * el que va delante y último en el DOM. */
interface DeviceLayout {
  type: DeviceType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  /** Amplitud de la flotación vertical propia, en unidades de escena. */
  floatAmp: number;
  /** Velocidad y desfase de esa flotación: distintos por dispositivo para
   *  que la composición no se mueva como un bloque rígido. */
  floatSpeed: number;
  floatPhase: number;
  /** Desplazamiento lateral por cursor. Mayor cuanto más cerca está el
   *  dispositivo de la cámara — eso es el parallax, y es lo que convierte
   *  tres planos en una escena con volumen. */
  parallax: number;
  /** Opacidad del overlay: perspectiva atmosférica para el plano de fondo. */
  overlayOpacity: number;
}

/** +18% de velocidad en todo el motion (pedido por el usuario tras ver la
 *  primera versión) — multiplica frecuencias/velocidades CONTINUAS (la
 *  flotación/parallax de reposo, que sigue corriendo después del
 *  ensamblaje). */
const SPEED_UP = 1.18;
/** -20% adicional, pero solo en el ensamblaje AL CARGAR (pedido después de
 *  ver el +18%: "reduce más la velocidad del motion al cargar"). Se aplica
 *  sobre el +18% ya vigente, no sobre el original — por eso se divide por
 *  SPEED_UP y se multiplica por este factor, no se reemplaza. Neto: el
 *  ensamblaje queda ~2% más lento que el original, el reposo sigue +18%. */
const LOAD_SLOWDOWN = 1.2;
const sp = (seconds: number) => (seconds / SPEED_UP) * LOAD_SLOWDOWN;

const LAYOUT: DeviceLayout[] = [
  {
    type: "tablet",
    position: [-2.1, 0.42, -1.4],
    rotation: [0.015, 0.46, -0.02],
    scale: 0.8,
    floatAmp: 0.035,
    floatSpeed: 0.42 * SPEED_UP,
    floatPhase: 2.1,
    parallax: -0.028,
    overlayOpacity: 0.78,
  },
  {
    type: "laptop",
    position: [0.46, 0.4, 0],
    rotation: [0.02, -0.19, 0],
    scale: 1,
    floatAmp: 0.055,
    floatSpeed: 0.5 * SPEED_UP,
    floatPhase: 0,
    parallax: 0.045,
    overlayOpacity: 1,
  },
  {
    type: "phone",
    // Antes en [1.58, -0.5, 1.25] el celular quedaba recortado por el borde
    // del lienzo (reportado por el usuario en captura real). Se acerca a
    // la composición (menos x/z) y sube un poco (menos y negativa), y el
    // FOV de la cámara se abrió de 30→33 para dar margen extra sin achicar
    // demasiado la lectura del resto de la escena.
    position: [1.32, -0.36, 1.0],
    rotation: [0.01, -0.4, 0.05],
    scale: 0.68,
    floatAmp: 0.075,
    floatSpeed: 0.62 * SPEED_UP,
    floatPhase: 4.3,
    parallax: 0.09,
    overlayOpacity: 1,
  },
];

/**
 * Composición reducida para lienzos estrechos (móvil en una columna).
 * Master prompt §9 Móvil: priorizar legibilidad y evitar superposiciones.
 * Tres dispositivos repartidos en ~330 px dejan cada pantalla a un tercio
 * de su tamaño y el dashboard deja de leerse como un producto. Se muestra
 * solo la laptop, centrada y más grande.
 *
 * El criterio es el ancho MEDIDO del lienzo, no una media query: entre
 * `lg` y `md` el hero pasa a una columna y el lienzo se vuelve MÁS ancho
 * que en escritorio, así que el ancho de viewport no predice el espacio
 * disponible.
 */
const NARROW_LAYOUT: DeviceLayout[] = [
  { ...LAYOUT[1], position: [0.12, 0.26, 0.45], rotation: [0.02, -0.13, 0], scale: 1.03, parallax: 0.03 },
];

const NARROW_MAX_WIDTH = 430;

const DEVICE_ORDER = LAYOUT.map((d) => d.type);

type GroupRefs = Record<DeviceType, React.MutableRefObject<Group | null>>;
type OverlayRefs = Record<DeviceType, React.MutableRefObject<HTMLDivElement | null>>;

/* ── Ensamblaje al cargar (Propuesta 1, aprobada por el usuario) ─────────
 *
 * Tres fases, sin solape entre A y B/C:
 *   A. Estructura (0 → ~1.1s): la tapa de la laptop abre bisagra, la base
 *      (teclado/trackpad) aparece justo después, y tablet/celular "vuelan"
 *      hacia su posición final desde un offset + escala reducida. Esto vive
 *      en Rig/useFrame porque son mallas 3D, no DOM.
 *   B. Pantallas encienden (~0.95 → 1.55s): fade-in de opacidad del overlay
 *      DOM de cada pantalla. Puro CSS (clarvo-screen-power en global.css),
 *      independiente del reloj de R3F — el montaje del componente coincide
 *      con el arranque de ese reloj, así que no hace falta sincronizarlos.
 *   C. El tablero se construye (desde ~1.6s): el contenido de cada pantalla
 *      (marca, tarjetas, gráficas) revela con stagger vía CSS
 *      (clarvo-reveal) — ver `revealAt` en DashboardScreen/TabletScreen/
 *      PhoneScreen. Las gráficas ya animadas (AnimatedLineChart,
 *      AnimatedDonutChart) disparan su propia animación al montar, que es
 *      exactamente cuando esta fase empieza.
 */
const INTRO_DEVICE: Record<
  DeviceType,
  { start: number; dur: number; offset: { x: number; y: number; z: number }; rotY: number; scaleFrom: number } | null
> = {
  laptop: null, // la laptop se ensambla por partes (lid/deck), no "vuela".
  tablet: { start: sp(0.1), dur: sp(1.0), offset: { x: -0.9, y: 0.6, z: -1.1 }, rotY: -0.6, scaleFrom: 0.15 },
  phone: { start: sp(0.2), dur: sp(1.0), offset: { x: 0.9, y: -0.7, z: 0.9 }, rotY: 0.5, scaleFrom: 0.15 },
};

const INTRO_LAPTOP = {
  lid: { start: sp(0), dur: sp(0.9) },
  deck: { start: sp(0.3), dur: sp(0.75) },
};

/** Encendido de pantalla (fase B) — delay en segundos desde el montaje,
 *  consumido por ScreenOverlay vía CSS `animation-delay`. */
const SCREEN_POWER_START: Record<DeviceType, number> = {
  tablet: sp(0.95),
  laptop: sp(1.0),
  phone: sp(1.15),
};

/** Arranque del contenido del tablero (fase C) — delay base en segundos;
 *  cada pantalla aplica su propio micro-stagger interno a partir de este. */
const CONTENT_REVEAL_START: Record<DeviceType, number> = {
  tablet: sp(1.6),
  laptop: sp(1.65),
  phone: sp(2.1),
};

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

/** Progreso 0→1 con ligero rebase (overshoot sutil), como el
 *  cubic-bezier(.19,1.1,.25,1.15) del artifact — una llegada "con peso",
 *  no un ease-out plano. */
function easeOutBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

interface RigProps {
  hovering: React.MutableRefObject<boolean>;
  scrollProgress: React.MutableRefObject<number>;
  deviceRefs: GroupRefs;
  anchorRefs: GroupRefs;
}

/**
 * Movimiento. Master prompt §5 pide que se sienta "deliberada y premium,
 * no como un objeto girando sin propósito", con "la menor cantidad de
 * movimiento necesaria".
 *
 * Tres capas con responsabilidades separadas:
 *  A. Flotación — cada dispositivo con su propia amplitud, velocidad y
 *     desfase. Antes el grupo entero subía y bajaba rígido, que es
 *     exactamente lo que delata una composición plana: si los tres se
 *     mueven igual, el ojo los lee como una sola imagen.
 *  B. Cursor — parallax diferencial (el teléfono se desplaza ~4× más que
 *     la tablet) más una rotación mínima del conjunto. Amortiguado con
 *     1-e^(-k·dt), independiente de los fps; el lerp lineal anterior
 *     cambiaba de sensación entre 60 y 120 Hz.
 *  C. Scroll — la composición se eleva, retrocede en z y se inclina
 *     ligeramente, entregando la atención a la sección de producto. Con
 *     smoothstep para que el arranque no sea abrupto.
 */
function Rig({
  hovering,
  scrollProgress,
  deviceRefs,
  anchorRefs,
  layout,
  introT0,
  laptopLidRef,
  laptopDeckRef,
}: RigProps & {
  layout: DeviceLayout[];
  introT0: React.MutableRefObject<number | null>;
  laptopLidRef: React.MutableRefObject<Group | null>;
  laptopDeckRef: React.MutableRefObject<Group | null>;
}) {
  const rig = useRef<Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    const group = rig.current;
    if (!group) return;

    const t = state.clock.elapsedTime;
    if (introT0.current === null) introT0.current = t;
    const lt = t - introT0.current;

    // Amortiguación exponencial: misma sensación a 60 y a 144 Hz.
    const k = 1 - Math.exp(-3.4 * SPEED_UP * Math.min(delta, 0.1));
    const targetX = hovering.current ? state.pointer.x : 0;
    const targetY = hovering.current ? state.pointer.y : 0;
    pointer.current.x += (targetX - pointer.current.x) * k;
    pointer.current.y += (targetY - pointer.current.y) * k;
    const px = pointer.current.x;
    const py = pointer.current.y;

    const p = scrollProgress.current;
    const e = p * p * (3 - 2 * p); // smoothstep

    group.position.y = Math.sin(t * 0.34 * SPEED_UP) * 0.028 + e * 0.6;
    group.position.z = -e * 1.15;
    group.rotation.x = -py * 0.038 + e * 0.1;
    group.rotation.y = px * 0.085 - e * 0.05;
    group.rotation.z = Math.sin(t * 0.26 * SPEED_UP) * 0.006;
    group.scale.setScalar(1 - e * 0.06);

    for (const d of layout) {
      const node = deviceRefs[d.type].current;
      if (!node) continue;
      node.position.x = d.position[0] + px * d.parallax;
      node.position.y =
        d.position[1] + Math.sin(t * d.floatSpeed + d.floatPhase) * d.floatAmp + py * d.parallax * 0.4;
      node.position.z = d.position[2];
      node.rotation.y = d.rotation[1] + px * d.parallax * 0.5;
      node.rotation.z = d.rotation[2] + Math.sin(t * d.floatSpeed * 0.7 + d.floatPhase) * 0.009;
      node.scale.setScalar(d.scale);

      // Fase A del ensamblaje: tablet/celular "vuelan" a su posición final
      // desde un offset + escala reducida. La laptop no entra aquí — se
      // ensambla por partes (tapa + base) más abajo.
      const intro = INTRO_DEVICE[d.type];
      if (intro) {
        const eased = easeOutBack(clamp01((lt - intro.start) / intro.dur));
        const remain = 1 - eased;
        node.position.x += remain * intro.offset.x;
        node.position.y += remain * intro.offset.y;
        node.position.z += remain * intro.offset.z;
        node.rotation.y += remain * intro.rotY;
        node.scale.setScalar(d.scale * (intro.scaleFrom + (1 - intro.scaleFrom) * eased));
      }
    }

    // Fase A, laptop: la tapa abre bisagra y la base aparece justo después.
    const lid = laptopLidRef.current;
    if (lid) {
      const eased = easeOutBack(clamp01((lt - INTRO_LAPTOP.lid.start) / INTRO_LAPTOP.lid.dur));
      lid.rotation.x = -OPEN_ANGLE * eased;
    }
    const deck = laptopDeckRef.current;
    if (deck) {
      const eased = easeOutBack(clamp01((lt - INTRO_LAPTOP.deck.start) / INTRO_LAPTOP.deck.dur));
      deck.scale.setScalar(Math.max(eased, 0.0001));
      deck.position.y = (1 - eased) * -0.12;
    }
  });

  return (
    <group ref={rig}>
      {layout.map((d) => (
        <DeviceMesh
          key={d.type}
          ref={deviceRefs[d.type]}
          anchorRef={anchorRefs[d.type]}
          lidRef={d.type === "laptop" ? laptopLidRef : undefined}
          deckRef={d.type === "laptop" ? laptopDeckRef : undefined}
          type={d.type}
          position={d.position}
          rotation={d.rotation}
          scale={d.scale}
        />
      ))}
    </group>
  );
}

/**
 * Proyección del overlay DOM sobre la pantalla de cada dispositivo.
 *
 * No se usa drei <Html>: en este árbol dejaba el <Canvas> completamente en
 * blanco en todas las configuraciones probadas (documentado 2026-10-09).
 * En su lugar, cada pantalla es un <div> normal, hermano del canvas, al
 * que se le aplica por frame la matriz completa
 *
 *     px ← NDC · Proyección · Vista · Mundo(ancla) · (px→unidades)
 *
 * como un único `matrix3d`. CSS hace la división por w, así que el overlay
 * queda con perspectiva CORRECTA: se escorza igual que la pantalla 3D que
 * lo sostiene, en vez de ser un rectángulo pegado encima.
 *
 * Esto sustituye al `translate/rotate/scale` anterior, que además de no
 * poder representar perspectiva tenía un error de origen: combinaba
 * `transform-origin: center` con un `translate(-50%,-50%)` final afectado
 * por la escala, lo que dejaba cada pantalla desplazada ~(130, 80) px
 * respecto de su dispositivo — el dashboard de la laptop aterrizaba sobre
 * el teclado.
 *
 * Se conserva `getBoundingClientRect()` y NO `useThree().size`: size
 * devuelve el búfer con devicePixelRatio aplicado y producía overlays
 * ~1.35× más grandes que el bisel.
 */
function ScreenSync({ anchorRefs, overlayRefs, layout }: { anchorRefs: GroupRefs; overlayRefs: OverlayRefs; layout: DeviceLayout[] }) {
  const { camera, gl } = useThree();
  const ndcToPx = useMemo(() => new Matrix4(), []);
  const localToUnits = useMemo(
    () =>
      Object.fromEntries(
        DEVICE_ORDER.map((type) => {
          const s = SPECS[type];
          const m = new Matrix4();
          // px del overlay (origen arriba-izquierda, y hacia abajo) →
          // unidades de escena en el plano del ancla (origen centro, y arriba).
          m.set(
            s.screenW / s.htmlW, 0, 0, -s.screenW / 2,
            0, -s.screenH / s.htmlH, 0, s.screenH / 2,
            0, 0, 1, 0,
            0, 0, 0, 1,
          );
          return [type, m];
        }),
      ) as Record<DeviceType, Matrix4>,
    [],
  );
  const work = useMemo(() => new Matrix4(), []);
  const worldPos = useMemo(() => new Vector3(), []);
  const camDir = useMemo(() => new Vector3(), []);

  useFrame(() => {
    const rect = gl.domElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    camera.updateMatrixWorld();
    camera.getWorldDirection(camDir);

    ndcToPx.set(
      rect.width / 2, 0, 0, rect.width / 2,
      0, -rect.height / 2, 0, rect.height / 2,
      0, 0, 1, 0,
      0, 0, 0, 1,
    );

    for (const { type } of layout) {
      const anchor = anchorRefs[type].current;
      const overlay = overlayRefs[type].current;
      if (!anchor || !overlay) continue;

      anchor.updateWorldMatrix(true, false);

      // Detrás de la cámara: ocultar en vez de proyectar basura (w ≤ 0).
      worldPos.setFromMatrixPosition(anchor.matrixWorld).sub(camera.position);
      if (worldPos.dot(camDir) <= 0.01) {
        overlay.style.visibility = "hidden";
        continue;
      }
      overlay.style.visibility = "visible";

      work
        .copy(ndcToPx)
        .multiply(camera.projectionMatrix)
        .multiply(camera.matrixWorldInverse)
        .multiply(anchor.matrixWorld)
        .multiply(localToUnits[type]);

      // z del overlay aplanada: la profundidad la resuelve el orden del
      // DOM, y dejar la z proyectada provoca artefactos de composición.
      const m = work.elements;
      m[2] = 0;
      m[6] = 0;
      m[10] = 1;
      m[14] = 0;

      overlay.style.transform = `matrix3d(${m.join(",")})`;
    }
  });

  return null;
}

function Scene({
  hovering,
  scrollProgress,
  deviceRefs,
  anchorRefs,
  overlayRefs,
  layout,
  introT0,
  laptopLidRef,
  laptopDeckRef,
}: RigProps & {
  overlayRefs: OverlayRefs;
  layout: DeviceLayout[];
  introT0: React.MutableRefObject<number | null>;
  laptopLidRef: React.MutableRefObject<Group | null>;
  laptopDeckRef: React.MutableRefObject<Group | null>;
}) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.22, 6.3]} fov={33} />
      {/* Niebla muy leve: separa el plano de la tablet del de la laptop sin
          tocar las pantallas (el color iguala el fondo del hero). */}
      <fog attach="fog" args={["#0a1322", 7.2, 13.5]} />

      {/* Luz clave cálida-neutra arriba-derecha, relleno frío y, sobre todo,
          un contraluz cian de marca que dibuja el canto de los dispositivos.
          La escena anterior era ambiente + dos direccionales planas: sin
          contraluz el aluminio oscuro sobre fondo marino no tiene silueta. */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[4.5, 5, 6]} intensity={1.35} />
      <directionalLight position={[-5, 1.5, 2]} intensity={0.55} color="#8fb4ff" />
      <directionalLight position={[-2.5, 2.5, -5]} intensity={2.3} color="#2fd2ff" />
      <Environment files="/hdri/potsdamer_platz_1k.hdr" environmentIntensity={0.3} background={false} />

      <Rig
        hovering={hovering}
        scrollProgress={scrollProgress}
        deviceRefs={deviceRefs}
        anchorRefs={anchorRefs}
        layout={layout}
        introT0={introT0}
        laptopLidRef={laptopLidRef}
        laptopDeckRef={laptopDeckRef}
      />
      <ScreenSync anchorRefs={anchorRefs} overlayRefs={overlayRefs} layout={layout} />
    </>
  );
}

function StaticFallback() {
  return (
    <picture>
      <source srcSet="/images/dashboard/devices.webp" type="image/webp" />
      <img
        src="/images/dashboard/devices.png"
        alt="Vista preliminar del dashboard de CLARVO en laptop, tablet y celular"
        width={1507}
        height={1024}
        loading="lazy"
        style={{ width: "100%", height: "auto", display: "block" }}
      />
    </picture>
  );
}

function useGroupRefs(): GroupRefs {
  const tablet = useRef<Group | null>(null);
  const laptop = useRef<Group | null>(null);
  const phone = useRef<Group | null>(null);
  return { tablet, laptop, phone };
}

function useOverlayRefs(): OverlayRefs {
  const tablet = useRef<HTMLDivElement | null>(null);
  const laptop = useRef<HTMLDivElement | null>(null);
  const phone = useRef<HTMLDivElement | null>(null);
  return { tablet, laptop, phone };
}

function ScreenContent({ type }: { type: DeviceType }) {
  const revealAt = CONTENT_REVEAL_START[type];
  if (type === "laptop") return <DashboardScreen variant="compact" revealAt={revealAt} />;
  if (type === "tablet") return <TabletScreen revealAt={revealAt} />;
  return <PhoneScreen revealAt={revealAt} />;
}

function ScreenOverlay({
  layout,
  overlayRef,
}: {
  layout: DeviceLayout;
  overlayRef: React.MutableRefObject<HTMLDivElement | null>;
}) {
  const spec = SPECS[layout.type];
  return (
    <div
      ref={overlayRef}
      className="hero-screen-power"
      style={
        {
          position: "absolute",
          top: 0,
          left: 0,
          width: spec.htmlW,
          height: spec.htmlH,
          // El origen es la esquina superior izquierda porque la matriz ya
          // lleva la traslación: cualquier otro origen la duplicaría.
          transformOrigin: "0 0",
          // Oculto hasta el primer frame de ScreenSync, para que no se vea
          // un instante en la esquina del lienzo sin transformar.
          visibility: "hidden",
          pointerEvents: "none",
          overflow: "hidden",
          borderRadius: spec.radius,
          // Fase B del ensamblaje: la opacidad final (perspectiva
          // atmosférica de la tablet) la fija la animación CSS
          // clarvo-screen-power, no un valor estático — la pantalla
          // "enciende" en vez de aparecer de golpe.
          "--screen-opacity": layout.overlayOpacity,
          animationDelay: `${SCREEN_POWER_START[layout.type]}s`,
          backfaceVisibility: "hidden",
          willChange: "transform",
        } as React.CSSProperties
      }
    >
      <ScreenContent type={layout.type} />
    </div>
  );
}

export default function HeroScene() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [active, setActive] = useState(true);
  const [narrow, setNarrow] = useState(false);
  const hovering = useRef(false);
  const scrollProgress = useRef(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const deviceRefs = useGroupRefs();
  const anchorRefs = useGroupRefs();
  const overlayRefs = useOverlayRefs();
  const introT0 = useRef<number | null>(null);
  const laptopLidRef = useRef<Group | null>(null);
  const laptopDeckRef = useRef<Group | null>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setSupported(!reducedMotion && ensureWebglSupport());
  }, []);

  useEffect(() => {
    if (!supported || !wrapperRef.current) return;
    if (!pluginRegistered) {
      gsap.registerPlugin(ScrollTrigger);
      pluginRegistered = true;
    }

    const trigger = ScrollTrigger.create({
      trigger: wrapperRef.current,
      start: "top 20%",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        scrollProgress.current = self.progress;
      },
    });

    return () => trigger.kill();
  }, [supported]);

  // Master prompt §9: no renderizar de forma continua cuando la escena no
  // está visible. Solo se observa el viewport, NO `document.hidden`: el
  // navegador ya suspende requestAnimationFrame en pestañas ocultas, así
  // que añadirlo no ahorra nada y sí rompe cualquier contexto que reporte
  // visibilityState "hidden" de forma permanente (navegadores embebidos,
  // automatización), donde la escena quedaría en blanco para siempre.
  useEffect(() => {
    if (!supported || !wrapperRef.current) return;
    const el = wrapperRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: "140px" },
    );
    observer.observe(el);

    // Ancho real del lienzo → composición completa o reducida. Se mide una
    // vez de forma síncrona además de observar: el callback del
    // ResizeObserver se entrega con el ciclo de render, así que sin una
    // medida inicial la primera composición sería la de escritorio hasta
    // el primer frame (y nunca cambiaría donde ese ciclo esté suspendido).
    const measure = (width: number) => setNarrow(width > 0 && width < NARROW_MAX_WIDTH);
    measure(el.getBoundingClientRect().width);
    const resize = new ResizeObserver(([entry]) => measure(entry.contentRect.width));
    resize.observe(el);

    return () => {
      observer.disconnect();
      resize.disconnect();
    };
  }, [supported]);

  const layout = narrow ? NARROW_LAYOUT : LAYOUT;

  if (supported === null) {
    return <div style={{ aspectRatio: "3 / 2" }} aria-hidden="true" />;
  }

  if (!supported) {
    return <StaticFallback />;
  }

  return (
    <div
      ref={wrapperRef}
      style={{ position: "relative", aspectRatio: "3 / 2", width: "100%", overflow: "hidden" }}
      onPointerEnter={() => (hovering.current = true)}
      onPointerLeave={() => (hovering.current = false)}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "-12% -8% -20% -4%",
          background:
            "radial-gradient(62% 56% at 56% 42%, rgba(52,170,255,0.3) 0%, rgba(26,96,190,0.13) 44%, rgba(10,19,34,0) 74%)",
          pointerEvents: "none",
        }}
      />
      <Canvas frameloop={active ? "always" : "never"} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}>
        <Scene
          hovering={hovering}
          scrollProgress={scrollProgress}
          deviceRefs={deviceRefs}
          anchorRefs={anchorRefs}
          overlayRefs={overlayRefs}
          layout={layout}
          introT0={introT0}
          laptopLidRef={laptopLidRef}
          laptopDeckRef={laptopDeckRef}
        />
      </Canvas>
      {/* Orden del DOM = orden de profundidad: atrás → delante. */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {layout.map((d) => (
          <ScreenOverlay key={d.type} layout={d} overlayRef={overlayRefs[d.type]} />
        ))}
      </div>
    </div>
  );
}
