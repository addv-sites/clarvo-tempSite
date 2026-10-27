import { useEffect, useRef, useState } from "react";
import {
  actualizarBorrador,
  pagarBorrador,
  estadoPago,
  crearBorrador,
  obtenerBorrador,
  slugDisponible,
  OnboardingApiError,
  type Ciclo,
  type EstadoPago,
} from "../../lib/onboardingApi";
import TurnstileWidget from "./TurnstileWidget";

// Orden real del wizard (punto 429, corregido): el pago es el ÚLTIMO
// paso antes de redirigir a Stripe, nunca el segundo. El webhook de
// Stripe confirma el pago en 1-3 segundos — si "Pagar" viniera temprano
// (como antes), casi siempre llegaría ANTES de que el visitante termine
// de llenar empresa/config/credenciales, y como el aprovisionamiento
// exige esos datos completos, el intento de activación fallaría y el
// evento de Stripe quedaría marcado "ya procesado" para siempre (sin
// reintento automático posible) — confirmado real probando en local.
type Paso = "plan" | "empresa" | "config" | "credenciales" | "pago" | "completado";
const PASOS_VALIDOS: Paso[] = ["plan", "empresa", "config", "credenciales", "pago", "completado"];

// Resultado ya NO lo arma convertirBorrador() en el navegador (eso ahora
// corre del lado del webhook de Stripe) — lo arma el polling de
// estado-pago cuando activado=true, a partir de la misma información que
// antes devolvía la conversión directa.
interface ResultadoActivacion {
  slug: string;
  urlAdmin: string;
  urlPortal: string | null;
}

const PLAN_NOMBRE: Record<string, string> = {
  solicita: "CLARVO Solicita",
  controla: "CLARVO Controla",
  crece: "CLARVO Crece",
  domina: "CLARVO Domina",
};

const PLAN_PRECIO_MENSUAL: Record<string, number> = { solicita: 199, controla: 599, crece: 799, domina: 999 };
const PLAN_PRECIO_ANUAL: Record<string, number> = { solicita: 1990, controla: 5990, crece: 7990, domina: 9990 };

const ZONAS = ["America/Mexico_City", "America/Tijuana", "America/Monterrey", "America/Cancun"];

const STORAGE_KEY = "clarvo_onboarding_borrador";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 48);
}

function dinero(n: number): string {
  return n.toLocaleString("es-MX");
}

interface EstadoBorrador {
  token: string | null;
  planClave: string;
  ciclo: Ciclo;
  nombreEmpresa: string;
  slug: string;
  contactoEmail: string;
  nombreComercial: string;
  zonaHoraria: string;
  adminEmail: string;
  adminPassword: string;
  adminPassword2: string;
}

const ESTADO_INICIAL: EstadoBorrador = {
  token: null,
  planClave: "controla",
  ciclo: "mensual",
  nombreEmpresa: "",
  slug: "",
  contactoEmail: "",
  nombreComercial: "",
  zonaHoraria: "America/Mexico_City",
  adminEmail: "",
  adminPassword: "",
  adminPassword2: "",
};

export default function OnboardingModal() {
  const [abierto, setAbierto] = useState(false);
  const [paso, setPaso] = useState<Paso>("plan");
  const [estado, setEstado] = useState<EstadoBorrador>(ESTADO_INICIAL);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultadoActivacion, setResultadoActivacion] = useState<ResultadoActivacion | null>(null);
  const [pagoInfo, setPagoInfo] = useState<EstadoPago | null>(null);
  const [slugEstado, setSlugEstado] = useState<"idle" | "revisando" | "disponible" | "tomado">("idle");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const slugTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slugTocado = useRef(false);

  useEffect(() => {
    function onAbrir(e: Event) {
      const detalle = (e as CustomEvent<{ planClave: string; ciclo?: Ciclo }>).detail;
      slugTocado.current = false;
      setError(null);
      setSlugEstado("idle");
      setResultadoActivacion(null);
      setPaso("plan");
      setEstado({ ...ESTADO_INICIAL, planClave: detalle.planClave, ciclo: detalle.ciclo || "mensual" });
      setAbierto(true);
    }
    window.addEventListener("clarvo:abrir-onboarding", onAbrir);
    return () => window.removeEventListener("clarvo:abrir-onboarding", onAbrir);
  }, []);

  // Reanuda el wizard al volver del redirect de Stripe (success_url /
  // cancel_url de control/utils/stripePagos.js: "?onboarding=<token>&paso=<paso>").
  // La página se recarga por completo al salir a checkout.stripe.com, así
  // que todo el estado de React se perdió — esto lo reconstruye leyendo el
  // borrador real desde el servidor, nunca de memoria local.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("onboarding");
    if (!token) return;
    // "completado" por default: con el pago como ÚLTIMO paso, volver de
    // Stripe ya exitoso significa que no queda NADA por llenar — solo
    // esperar el polling. success_url/cancel_url (stripePagos.js) siempre
    // mandan su propio "paso" explícito; este fallback es solo defensivo.
    const pasoResumen = (params.get("paso") as Paso) || "completado";

    (async () => {
      try {
        if (pasoResumen === "completado") {
          // Bug real encontrado al probar (punto 429): obtenerBorrador()
          // exige estado='activo' en el servidor — en cuanto el webhook de
          // Stripe convierte el borrador (1-3s, con frecuencia ANTES de
          // que esta misma página termine de cargar), ese fetch da 404 y
          // el catch de abajo se traga el error sin mostrar nada — el
          // visitante que SÍ pagó ve el sitio normal, sin éxito ni error.
          // estadoPago() es la única ruta que no exige ese estado
          // (a propósito, ver control/utils/onboardingBorrador.js) — es
          // la única fuente confiable para el caso "vengo de pagar".
          const data = await estadoPago(token);
          setPagoInfo(data);
          if (data.activado && data.resultado) setResultadoActivacion(data.resultado);
          const guardado = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
          setEstado((prev) => ({
            ...prev,
            token,
            planClave: guardado?.planClave || prev.planClave,
          }));
          setPaso("completado");
          setAbierto(true);
          return;
        }

        const { borrador } = await obtenerBorrador(token);
        setEstado({
          ...ESTADO_INICIAL,
          token: borrador.token,
          planClave: borrador.planClave,
          ciclo: borrador.ciclo,
          nombreEmpresa: borrador.nombreEmpresa || "",
          slug: borrador.slug || "",
          contactoEmail: borrador.contactoEmail || "",
          nombreComercial: borrador.nombreComercial || "",
          zonaHoraria: borrador.zonaHoraria || "America/Mexico_City",
          adminEmail: borrador.adminEmail || "",
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: borrador.token, planClave: borrador.planClave }));
        setPaso(PASOS_VALIDOS.includes(pasoResumen) ? pasoResumen : "completado");
        setAbierto(true);
      } catch {
        // Token inválido/expirado — no hay nada que reanudar, el visitante
        // simplemente ve el sitio normal y puede empezar de cero.
      } finally {
        const url = new URL(window.location.href);
        url.searchParams.delete("onboarding");
        url.searchParams.delete("paso");
        url.searchParams.delete("session_id");
        window.history.replaceState({}, "", url.toString());
      }
    })();
  }, []);

  useEffect(() => {
    if (!abierto) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setAbierto(false);
    }
    document.addEventListener("keydown", onKeyDown);
    dialogRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [abierto]);

  // Mientras se espera confirmación de pago (sobre todo OXXO/SPEI, que
  // tardan de minutos a días) — pregunta cada 5s si el webhook de Stripe
  // ya activó la cuenta. Se detiene sola en cuanto activado=true o si el
  // componente se desmonta/cambia de paso.
  useEffect(() => {
    if (paso !== "completado" || !estado.token) return;
    let cancelado = false;
    async function verificar() {
      try {
        const data = await estadoPago(estado.token as string);
        if (cancelado) return;
        setPagoInfo(data);
        if (data.activado && data.resultado) {
          setResultadoActivacion(data.resultado);
        }
      } catch {
        // Red intermitente — el siguiente tick reintenta, no hace falta
        // mostrar error por un fallo de polling aislado.
      }
    }
    verificar();
    const id = setInterval(() => {
      if (pagoInfo?.activado) {
        clearInterval(id);
        return;
      }
      verificar();
    }, 5000);
    return () => {
      cancelado = true;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paso, estado.token]);

  if (!abierto) return null;

  const precio =
    estado.ciclo === "mensual" ? PLAN_PRECIO_MENSUAL[estado.planClave] : PLAN_PRECIO_ANUAL[estado.planClave];

  async function asegurarBorrador(): Promise<string> {
    if (estado.token) return estado.token;

    // Intenta reanudar un borrador previo del mismo plan guardado en este
    // navegador (localStorage) — si ya no existe o cambió de plan, crea uno
    // nuevo en vez de fallar.
    try {
      const guardado = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (guardado?.token && guardado?.planClave === estado.planClave) {
        const { borrador } = await obtenerBorrador(guardado.token);
        setEstado((prev) => ({
          ...prev,
          token: borrador.token,
          ciclo: borrador.ciclo,
          nombreEmpresa: borrador.nombreEmpresa || prev.nombreEmpresa,
          slug: borrador.slug || prev.slug,
          contactoEmail: borrador.contactoEmail || prev.contactoEmail,
          nombreComercial: borrador.nombreComercial || prev.nombreComercial,
          zonaHoraria: borrador.zonaHoraria || prev.zonaHoraria,
          adminEmail: borrador.adminEmail || prev.adminEmail,
        }));
        return borrador.token;
      }
    } catch {
      // localStorage corrupto o borrador ya no existe — se crea uno nuevo abajo.
    }

    const { borrador } = await crearBorrador(estado.planClave, estado.ciclo);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: borrador.token, planClave: estado.planClave }));
    setEstado((prev) => ({ ...prev, token: borrador.token }));
    return borrador.token;
  }

  async function avanzar(pasoSiguiente: Paso, cambios: Record<string, unknown> = {}) {
    setCargando(true);
    setError(null);
    try {
      const token = await asegurarBorrador();
      await actualizarBorrador(token, { ...cambios, pasoActual: pasoSiguiente });
      setPaso(pasoSiguiente);
    } catch (err) {
      setError(err instanceof OnboardingApiError ? err.message : "Ocurrió un error. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  // Último paso del wizard: ya NO activa nada directo — crea el Checkout
  // Session real y manda al visitante a pagar en Stripe. El Turnstile se
  // exige AQUÍ: este es el único paso que de verdad mueve dinero/llama a
  // la API de Stripe, así que es el que hay que proteger de bots — ver
  // DOCS/confStripe.html.
  async function irAPagar() {
    if (!turnstileToken) {
      setError("Completa la verificación de seguridad antes de continuar.");
      return;
    }
    setCargando(true);
    setError(null);
    try {
      const token = await asegurarBorrador();
      await actualizarBorrador(token, { ciclo: estado.ciclo, pasoActual: "pago" });
      const { checkoutUrl } = await pagarBorrador(token, turnstileToken);
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof OnboardingApiError ? err.message : "Ocurrió un error. Intenta de nuevo.");
      setTurnstileToken(null);
    } finally {
      setCargando(false);
    }
  }

  // Guarda las credenciales y avanza a Pago (ÚLTIMO paso, ver nota en
  // el tipo Paso arriba) — para cuando el webhook de Stripe confirme el
  // pago, el borrador ya tiene TODO (empresa + config + credenciales) y
  // convertirBorrador() puede aprovisionar sin fallar.
  async function guardarCredenciales() {
    if (estado.adminPassword !== estado.adminPassword2) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    await avanzar("pago", { adminEmail: estado.adminEmail, adminPassword: estado.adminPassword });
  }

  function revisarSlug(valor: string) {
    const limpio = slugify(valor);
    setEstado((prev) => ({ ...prev, slug: limpio }));
    if (slugTimer.current) clearTimeout(slugTimer.current);
    if (!limpio) {
      setSlugEstado("idle");
      return;
    }
    setSlugEstado("revisando");
    slugTimer.current = setTimeout(async () => {
      try {
        const disponible = await slugDisponible(limpio);
        setSlugEstado(disponible ? "disponible" : "tomado");
      } catch {
        setSlugEstado("idle");
      }
    }, 450);
  }

  function cerrar() {
    setAbierto(false);
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-surface-deep/70 backdrop-blur-sm p-4 transition-opacity motion-reduce:transition-none"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) cerrar();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Activar ${PLAN_NOMBRE[estado.planClave]}`}
        tabIndex={-1}
        className="relative w-full max-w-md max-h-[88vh] overflow-y-auto rounded-3xl border border-border-specular bg-surface-card p-7 shadow-2xl outline-none"
      >
        <button
          type="button"
          onClick={cerrar}
          aria-label="Cerrar"
          className="absolute right-5 top-5 rounded-full p-1.5 text-text-muted transition hover:bg-surface-card-hover hover:text-text-primary"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.3" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>

        {error && (
          <div className="mb-5 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {paso === "plan" && (
          <PasoPlan
            estado={estado}
            precio={precio}
            cargando={cargando}
            onCambiarCiclo={(ciclo) => setEstado((prev) => ({ ...prev, ciclo }))}
            onContinuar={() => avanzar("empresa", { ciclo: estado.ciclo })}
          />
        )}

        {paso === "empresa" && (
          <PasoEmpresa
            estado={estado}
            slugEstado={slugEstado}
            cargando={cargando}
            onCambiarNombre={(nombreEmpresa) =>
              setEstado((prev) => {
                const next = { ...prev, nombreEmpresa };
                if (!slugTocado.current) {
                  next.slug = slugify(nombreEmpresa);
                  revisarSlug(next.slug);
                }
                return next;
              })
            }
            onCambiarSlug={(slug) => {
              slugTocado.current = true;
              revisarSlug(slug);
            }}
            onCambiarCorreo={(contactoEmail) => setEstado((prev) => ({ ...prev, contactoEmail }))}
            onAtras={() => setPaso("plan")}
            onContinuar={() =>
              avanzar("config", {
                nombreEmpresa: estado.nombreEmpresa,
                slug: estado.slug,
                contactoEmail: estado.contactoEmail,
              })
            }
          />
        )}

        {paso === "config" && (
          <PasoConfig
            estado={estado}
            cargando={cargando}
            onCambiarNombreComercial={(nombreComercial) => setEstado((prev) => ({ ...prev, nombreComercial }))}
            onCambiarZona={(zonaHoraria) => setEstado((prev) => ({ ...prev, zonaHoraria }))}
            onAtras={() => setPaso("empresa")}
            onContinuar={() => {
              // El campo de correo del admin en el paso siguiente MUESTRA
              // contactoEmail como relleno si adminEmail está vacío, pero
              // eso es solo visual — sin esto, el estado real se queda
              // vacío y el botón de ese paso nunca se habilita hasta que
              // el usuario borre y vuelva a escribir el mismo correo.
              const adminEmail = estado.adminEmail || estado.contactoEmail;
              setEstado((prev) => ({ ...prev, adminEmail }));
              avanzar("credenciales", {
                nombreComercial: estado.nombreComercial,
                zonaHoraria: estado.zonaHoraria,
                adminEmail,
              });
            }}
          />
        )}

        {paso === "credenciales" && (
          <PasoCredenciales
            estado={estado}
            cargando={cargando}
            onCambiarCorreoAdmin={(adminEmail) => setEstado((prev) => ({ ...prev, adminEmail }))}
            onCambiarPassword={(adminPassword) => setEstado((prev) => ({ ...prev, adminPassword }))}
            onCambiarPassword2={(adminPassword2) => setEstado((prev) => ({ ...prev, adminPassword2 }))}
            onAtras={() => setPaso("config")}
            onContinuar={guardarCredenciales}
          />
        )}

        {paso === "pago" && (
          <PasoPago
            estado={estado}
            precio={precio}
            cargando={cargando}
            turnstileToken={turnstileToken}
            onTurnstileToken={setTurnstileToken}
            onTurnstileExpire={() => setTurnstileToken(null)}
            onAtras={() => setPaso("credenciales")}
            onContinuar={irAPagar}
          />
        )}

        {paso === "completado" && (
          <PasoCompletado estado={estado} resultado={resultadoActivacion} pagoInfo={pagoInfo} onCerrar={cerrar} />
        )}
      </div>
    </div>
  );
}

function Titulo({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <>
      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-accent-electric">{eyebrow}</span>
      <h2 className="font-display text-xl font-bold text-text-primary">{children}</h2>
    </>
  );
}

function BotonContinuar({
  onClick,
  cargando,
  deshabilitado,
  children,
}: {
  onClick: () => void;
  cargando: boolean;
  deshabilitado?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={cargando || deshabilitado}
      className="mt-6 w-full rounded-full bg-accent-electric px-5 py-3 text-sm font-semibold text-surface-deep transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {cargando ? "Guardando..." : children}
    </button>
  );
}

function BotonAtras({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-6 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-text-primary transition hover:border-white/30"
    >
      Atrás
    </button>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-xs font-semibold text-text-secondary">{label}</span>
      {children}
    </label>
  );
}

const inputClase =
  "w-full rounded-lg border border-border-translucent bg-surface px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-accent-electric";

function PasoPlan({
  estado,
  precio,
  cargando,
  onCambiarCiclo,
  onContinuar,
}: {
  estado: EstadoBorrador;
  precio: number;
  cargando: boolean;
  onCambiarCiclo: (c: Ciclo) => void;
  onContinuar: () => void;
}) {
  return (
    <div>
      <Titulo eyebrow="Paso 1 de 5">Confirma tu plan</Titulo>
      <p className="mt-2 text-sm text-text-secondary">
        Elegiste <strong className="text-text-primary">{PLAN_NOMBRE[estado.planClave]}</strong>. Puedes cambiar el
        ciclo de cobro antes de continuar.
      </p>
      <div className="mt-5 inline-flex rounded-full border border-border-translucent bg-surface p-1">
        <button
          type="button"
          onClick={() => onCambiarCiclo("mensual")}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
            estado.ciclo === "mensual" ? "bg-accent-electric text-surface-deep" : "text-text-secondary"
          }`}
        >
          Mensual · ${dinero(PLAN_PRECIO_MENSUAL[estado.planClave])}
        </button>
        <button
          type="button"
          onClick={() => onCambiarCiclo("anual")}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
            estado.ciclo === "anual" ? "bg-accent-electric text-surface-deep" : "text-text-secondary"
          }`}
        >
          Anual · ${dinero(PLAN_PRECIO_ANUAL[estado.planClave])} (2 meses gratis)
        </button>
      </div>
      <p className="mt-4 text-2xl font-extrabold text-text-primary">
        ${dinero(precio)}
        <span className="text-sm font-medium text-text-muted">{estado.ciclo === "mensual" ? "/mes" : "/año"}</span>
      </p>
      <BotonContinuar onClick={onContinuar} cargando={cargando}>
        Continuar
      </BotonContinuar>
    </div>
  );
}

function PasoPago({
  estado,
  precio,
  cargando,
  turnstileToken,
  onTurnstileToken,
  onTurnstileExpire,
  onAtras,
  onContinuar,
}: {
  estado: EstadoBorrador;
  precio: number;
  cargando: boolean;
  turnstileToken: string | null;
  onTurnstileToken: (token: string) => void;
  onTurnstileExpire: () => void;
  onAtras: () => void;
  onContinuar: () => void;
}) {
  return (
    <div>
      <Titulo eyebrow="Paso 5 de 5">Método de pago</Titulo>
      <p className="mt-2 text-sm text-text-secondary">
        {PLAN_NOMBRE[estado.planClave]} · ${dinero(precio)}
        {estado.ciclo === "mensual" ? "/mes" : "/año"}
      </p>
      <div className="mt-5 rounded-xl border border-accent-electric/30 bg-accent-electric/5 p-4 text-sm text-text-secondary">
        Vas a pagar en una página segura de Stripe. Puedes pagar con tarjeta (se activa al instante) o con
        OXXO/SPEI (tu cuenta se activa en cuanto se confirme el pago, normalmente de minutos a un par de días).
      </div>

      <TurnstileWidget onToken={onTurnstileToken} onExpire={onTurnstileExpire} />

      <div className="mt-6 flex gap-3">
        <BotonAtras onClick={onAtras} />
        <div className="flex-1">
          <BotonContinuar onClick={onContinuar} cargando={cargando} deshabilitado={!turnstileToken}>
            Pagar ${dinero(precio)} y continuar
          </BotonContinuar>
        </div>
      </div>
    </div>
  );
}

function PasoEmpresa({
  estado,
  slugEstado,
  cargando,
  onCambiarNombre,
  onCambiarSlug,
  onCambiarCorreo,
  onAtras,
  onContinuar,
}: {
  estado: EstadoBorrador;
  slugEstado: "idle" | "revisando" | "disponible" | "tomado";
  cargando: boolean;
  onCambiarNombre: (v: string) => void;
  onCambiarSlug: (v: string) => void;
  onCambiarCorreo: (v: string) => void;
  onAtras: () => void;
  onContinuar: () => void;
}) {
  const puedeContinuar =
    estado.nombreEmpresa.trim().length > 0 &&
    estado.slug.trim().length > 0 &&
    slugEstado !== "tomado" &&
    estado.contactoEmail.includes("@");

  return (
    <div>
      <Titulo eyebrow="Paso 2 de 5">Datos de tu empresa</Titulo>
      <p className="mt-2 text-sm text-text-secondary">Con esto creamos tu espacio dedicado — tu propia base de datos y URL.</p>

      <div className="mt-5">
        <Campo label="Nombre de la empresa">
          <input
            className={inputClase}
            value={estado.nombreEmpresa}
            onChange={(e) => onCambiarNombre(e.target.value)}
            placeholder="Mi Negocio S.A. de C.V."
          />
        </Campo>

        <Campo label="Tu URL en Clarvo">
          <input
            className={inputClase}
            value={estado.slug}
            onChange={(e) => onCambiarSlug(e.target.value)}
            placeholder="mi-negocio"
          />
          <span
            className={`mt-1.5 block text-xs ${
              slugEstado === "tomado" ? "text-red-300" : slugEstado === "disponible" ? "text-accent-success" : "text-text-muted"
            }`}
          >
            {estado.slug
              ? slugEstado === "revisando"
                ? `Revisando clarvo.mx/${estado.slug}...`
                : slugEstado === "tomado"
                  ? `clarvo.mx/${estado.slug} ya está en uso — elige otro.`
                  : `clarvo.mx/${estado.slug} — disponible`
              : "Se genera a partir del nombre"}
          </span>
        </Campo>

        <Campo label="Correo de contacto">
          <input
            type="email"
            className={inputClase}
            value={estado.contactoEmail}
            onChange={(e) => onCambiarCorreo(e.target.value)}
            placeholder="tu@empresa.com"
          />
          <span className="mt-1.5 block text-xs leading-relaxed text-text-muted">
            Aquí llegan las aclaraciones que te envíen tus clientes, y nosotros lo usamos para avisarte de
            mantenimientos y promociones. Lo puedes cambiar cuando quieras desde tu cuenta admin.
          </span>
        </Campo>
      </div>

      <div className="flex gap-3">
        <BotonAtras onClick={onAtras} />
        <div className="flex-1">
          <button
            type="button"
            onClick={onContinuar}
            disabled={cargando || !puedeContinuar}
            className="mt-6 w-full rounded-full bg-accent-electric px-5 py-3 text-sm font-semibold text-surface-deep transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {cargando ? "Guardando..." : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PasoConfig({
  estado,
  cargando,
  onCambiarNombreComercial,
  onCambiarZona,
  onAtras,
  onContinuar,
}: {
  estado: EstadoBorrador;
  cargando: boolean;
  onCambiarNombreComercial: (v: string) => void;
  onCambiarZona: (v: string) => void;
  onAtras: () => void;
  onContinuar: () => void;
}) {
  return (
    <div>
      <Titulo eyebrow="Paso 3 de 5">Configura tu panel admin</Titulo>
      <p className="mt-2 text-sm text-text-secondary">
        Esto es lo primero que vas a ajustar dentro de tu propio /admin — lo puedes cambiar después.
      </p>

      <div className="mt-5">
        <Campo label="Nombre comercial (lo verán tus clientes)">
          <input
            className={inputClase}
            value={estado.nombreComercial}
            onChange={(e) => onCambiarNombreComercial(e.target.value)}
            placeholder="Mi Negocio"
          />
        </Campo>

        <Campo label="Zona horaria">
          <select className={inputClase} value={estado.zonaHoraria} onChange={(e) => onCambiarZona(e.target.value)}>
            {ZONAS.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </Campo>

        <Campo label="Moneda">
          <input className={inputClase} value="MXN — Peso mexicano" disabled />
        </Campo>
      </div>

      <div className="flex gap-3">
        <BotonAtras onClick={onAtras} />
        <div className="flex-1">
          <BotonContinuar onClick={onContinuar} cargando={cargando}>
            Continuar
          </BotonContinuar>
        </div>
      </div>
    </div>
  );
}

function PasoCredenciales({
  estado,
  cargando,
  onCambiarCorreoAdmin,
  onCambiarPassword,
  onCambiarPassword2,
  onAtras,
  onContinuar,
}: {
  estado: EstadoBorrador;
  cargando: boolean;
  onCambiarCorreoAdmin: (v: string) => void;
  onCambiarPassword: (v: string) => void;
  onCambiarPassword2: (v: string) => void;
  onAtras: () => void;
  onContinuar: () => void;
}) {
  const puedeContinuar =
    estado.adminEmail.includes("@") && estado.adminPassword.length >= 8 && estado.adminPassword2.length >= 8;

  return (
    <div>
      <Titulo eyebrow="Paso 4 de 5">Usuario y contraseña del admin</Titulo>
      <p className="mt-2 text-sm text-text-secondary">Con esto vas a entrar a tu /admin en cuanto esté listo.</p>

      <div className="mt-5">
        <Campo label="Correo del administrador">
          <input
            type="email"
            className={inputClase}
            value={estado.adminEmail || estado.contactoEmail}
            onChange={(e) => onCambiarCorreoAdmin(e.target.value)}
            placeholder="admin@empresa.com"
          />
        </Campo>
        <Campo label="Contraseña">
          <input
            type="password"
            className={inputClase}
            value={estado.adminPassword}
            onChange={(e) => onCambiarPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres, con número, minúscula y mayúscula"
          />
        </Campo>
        <Campo label="Confirmar contraseña">
          <input
            type="password"
            className={inputClase}
            value={estado.adminPassword2}
            onChange={(e) => onCambiarPassword2(e.target.value)}
            placeholder="Repite la contraseña"
          />
        </Campo>
      </div>

      <div className="flex gap-3">
        <BotonAtras onClick={onAtras} />
        <div className="flex-1">
          <button
            type="button"
            onClick={onContinuar}
            disabled={cargando || !puedeContinuar}
            className="mt-6 w-full rounded-full bg-accent-electric px-5 py-3 text-sm font-semibold text-surface-deep transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {cargando ? "Guardando..." : "Guardar y continuar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PasoCompletado({
  estado,
  resultado,
  pagoInfo,
  onCerrar,
}: {
  estado: EstadoBorrador;
  resultado: ResultadoActivacion | null;
  pagoInfo: EstadoPago | null;
  onCerrar: () => void;
}) {
  // Rechazado: el único caso que necesita que el visitante vuelva a
  // intentar algo — no hay nada que esperar, el pago ya falló de verdad.
  if (pagoInfo?.pagoEstado === "fallido" && !resultado) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-red-400/40 bg-red-400/10">
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-red-300" fill="none" stroke="currentColor" strokeWidth="2.4">
            <circle cx="12" cy="12" r="9" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h2 className="font-display text-xl font-bold text-text-primary">Tu pago no se pudo procesar</h2>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          No te cobramos nada. Verifica los datos de tu tarjeta o elige otro método e intenta de nuevo — todo lo
          que ya llenaste sigue guardado.
        </p>
        <button
          type="button"
          onClick={onCerrar}
          className="mt-6 w-full rounded-full bg-accent-electric px-5 py-3 text-sm font-semibold text-surface-deep transition hover:brightness-110"
        >
          Entendido
        </button>
      </div>
    );
  }

  // Activado (pago ya confirmado, por tarjeta al instante o por
  // OXXO/SPEI ya liquidado): mismo diseño de siempre.
  if (resultado) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-accent-success/40 bg-accent-success/10">
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-accent-success" fill="none" stroke="currentColor" strokeWidth="2.6">
            <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="font-display text-xl font-bold text-text-primary">Tu cuenta ya está activa</h2>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          {PLAN_NOMBRE[estado.planClave]} para <span className="text-text-primary">clarvo.mx/{resultado.slug}</span>.
          {estado.adminEmail || estado.contactoEmail ? (
            <>
              {" "}Te enviamos tus accesos a{" "}
              <span className="text-text-primary">{estado.adminEmail || estado.contactoEmail}</span>.
            </>
          ) : (
            // Caso "vengo de pagar antes de que el borrador fuera accesible"
            // (ver resume-effect arriba): no tenemos el correo en memoria
            // aquí, pero sí es real que el correo se mandó — evita
            // interpolar un campo vacío ("a .").
            " Revisa tu correo para tus accesos."
          )}
        </p>
        <a
          href={resultado.urlAdmin}
          className="mt-6 block w-full rounded-full bg-accent-electric px-5 py-3 text-sm font-semibold text-surface-deep transition hover:brightness-110"
        >
          Entrar a mi panel
        </a>
        {resultado.urlPortal && (
          <a
            href={resultado.urlPortal}
            className="mt-3 block w-full rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-text-primary transition hover:border-white/30"
          >
            Ver portal de clientes
          </a>
        )}
        <button
          type="button"
          onClick={onCerrar}
          className="mt-3 w-full text-xs font-semibold text-text-muted transition hover:text-text-secondary"
        >
          Cerrar
        </button>
      </div>
    );
  }

  // Pendiente (OXXO/SPEI esperando confirmación, o tarjeta cuyo webhook
  // todavía no llega) — ángulo de neuroventas "compromiso + anclaje":
  // recalca lo que YA se hizo y traduce el precio a un número chico
  // diario, en vez de solo pedir paciencia.
  const metodo = pagoInfo?.metodoPago;
  const precioDia = Math.round(
    (estado.ciclo === "mensual" ? PLAN_PRECIO_MENSUAL[estado.planClave] : PLAN_PRECIO_ANUAL[estado.planClave]) /
      (estado.ciclo === "mensual" ? 30 : 365)
  );

  return (
    <div className="text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10">
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-amber-300" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 7 12 12 15 15" />
        </svg>
      </div>
      <h2 className="font-display text-xl font-bold text-text-primary">Casi listo, falta confirmar tu pago</h2>

      <ul className="mt-4 flex flex-col gap-1.5 text-left text-sm text-text-secondary">
        <li className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 flex-none text-accent-success" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Empresa configurada
        </li>
        <li className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 flex-none text-accent-success" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Administrador listo
        </li>
      </ul>

      <div className="mt-4 flex items-baseline justify-between rounded-xl bg-surface px-4 py-3">
        <span className="text-xs text-text-muted">Equivale a</span>
        <span className="text-lg font-bold text-accent-electric">${dinero(precioDia)} MXN / día</span>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-text-secondary">
        {metodo === "oxxo"
          ? "Paga tu ficha OXXO antes de que venza — tu cuenta se activa sola en cuanto se confirme."
          : metodo === "spei"
            ? "En cuanto tu banco confirme la transferencia SPEI, tu cuenta se activa sola."
            : "Estamos confirmando tu pago con Stripe — esto normalmente toma unos segundos."}{" "}
        Te avisamos por correo a <span className="text-text-primary">{estado.adminEmail || estado.contactoEmail}</span>.
      </p>

      <button
        type="button"
        onClick={onCerrar}
        className="mt-6 w-full rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-text-primary transition hover:border-white/30"
      >
        Cerrar (puedes volver cuando quieras)
      </button>
    </div>
  );
}
