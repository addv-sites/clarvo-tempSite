import { useEffect, useRef, useState } from "react";
import {
  actualizarBorrador,
  convertirBorrador,
  crearBorrador,
  obtenerBorrador,
  slugDisponible,
  OnboardingApiError,
  type Ciclo,
  type ResultadoConversion,
} from "../../lib/onboardingApi";
import TurnstileWidget from "./TurnstileWidget";

type Paso = "plan" | "pago" | "empresa" | "config" | "credenciales" | "completado";

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
  const [resultadoActivacion, setResultadoActivacion] = useState<ResultadoConversion | null>(null);
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

  // Último paso: guarda las credenciales Y activa la cuenta real de una
  // vez (intake + aprovisionamiento físico + plan + usuario admin, todo
  // del lado de /control) — self-service, sin operador de por medio.
  // Idempotente del lado del servidor: si falla a medias, reintentar con
  // el mismo botón es seguro.
  async function finalizarYActivar() {
    if (estado.adminPassword !== estado.adminPassword2) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!turnstileToken) {
      setError("Completa la verificación de seguridad antes de continuar.");
      return;
    }
    setCargando(true);
    setError(null);
    try {
      const token = await asegurarBorrador();
      await actualizarBorrador(token, {
        adminEmail: estado.adminEmail,
        adminPassword: estado.adminPassword,
        pasoActual: "completado",
      });
      const resultado = await convertirBorrador(token, turnstileToken);
      setResultadoActivacion(resultado);
      setPaso("completado");
    } catch (err) {
      setError(err instanceof OnboardingApiError ? err.message : "Ocurrió un error. Intenta de nuevo.");
      // Un token de Turnstile es de un solo uso — si la conversión falló
      // (incluso por otro motivo), hay que pedir uno nuevo antes de
      // reintentar.
      setTurnstileToken(null);
    } finally {
      setCargando(false);
    }
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
            onContinuar={() => avanzar("pago", { ciclo: estado.ciclo })}
          />
        )}

        {paso === "pago" && (
          <PasoPago
            estado={estado}
            precio={precio}
            cargando={cargando}
            onAtras={() => setPaso("plan")}
            onContinuar={() => avanzar("empresa")}
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
            onAtras={() => setPaso("pago")}
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
            onContinuar={() =>
              avanzar("credenciales", {
                nombreComercial: estado.nombreComercial,
                zonaHoraria: estado.zonaHoraria,
              })
            }
          />
        )}

        {paso === "credenciales" && (
          <PasoCredenciales
            estado={estado}
            cargando={cargando}
            turnstileToken={turnstileToken}
            onCambiarCorreoAdmin={(adminEmail) => setEstado((prev) => ({ ...prev, adminEmail }))}
            onCambiarPassword={(adminPassword) => setEstado((prev) => ({ ...prev, adminPassword }))}
            onCambiarPassword2={(adminPassword2) => setEstado((prev) => ({ ...prev, adminPassword2 }))}
            onTurnstileToken={setTurnstileToken}
            onTurnstileExpire={() => setTurnstileToken(null)}
            onAtras={() => setPaso("config")}
            onContinuar={finalizarYActivar}
          />
        )}

        {paso === "completado" && (
          <PasoCompletado estado={estado} resultado={resultadoActivacion} onCerrar={cerrar} />
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

function BotonContinuar({ onClick, cargando, children }: { onClick: () => void; cargando: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={cargando}
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
  onAtras,
  onContinuar,
}: {
  estado: EstadoBorrador;
  precio: number;
  cargando: boolean;
  onAtras: () => void;
  onContinuar: () => void;
}) {
  return (
    <div>
      <Titulo eyebrow="Paso 2 de 5">Método de pago</Titulo>
      <p className="mt-2 text-sm text-text-secondary">
        {PLAN_NOMBRE[estado.planClave]} · ${dinero(precio)}
        {estado.ciclo === "mensual" ? "/mes" : "/año"}
      </p>
      <div className="mt-5 rounded-xl border border-accent-electric/30 bg-accent-electric/5 p-4 text-sm text-text-secondary">
        Estamos terminando de conectar el cobro con Stripe. Continúa y guardamos tu progreso — te avisamos por
        correo en cuanto puedas completar tu pago, sin perder nada de lo que ya llenaste.
      </div>
      <div className="mt-6 flex gap-3">
        <BotonAtras onClick={onAtras} />
        <div className="flex-1">
          <BotonContinuar onClick={onContinuar} cargando={cargando}>
            Continuar (pago pendiente)
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
      <Titulo eyebrow="Paso 3 de 5">Datos de tu empresa</Titulo>
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
      <Titulo eyebrow="Paso 4 de 5">Configura tu panel admin</Titulo>
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
  turnstileToken,
  onCambiarCorreoAdmin,
  onCambiarPassword,
  onCambiarPassword2,
  onTurnstileToken,
  onTurnstileExpire,
  onAtras,
  onContinuar,
}: {
  estado: EstadoBorrador;
  cargando: boolean;
  turnstileToken: string | null;
  onCambiarCorreoAdmin: (v: string) => void;
  onCambiarPassword: (v: string) => void;
  onCambiarPassword2: (v: string) => void;
  onTurnstileToken: (token: string) => void;
  onTurnstileExpire: () => void;
  onAtras: () => void;
  onContinuar: () => void;
}) {
  const puedeContinuar =
    estado.adminEmail.includes("@") &&
    estado.adminPassword.length >= 8 &&
    estado.adminPassword2.length >= 8 &&
    !!turnstileToken;

  return (
    <div>
      <Titulo eyebrow="Paso 5 de 5">Usuario y contraseña del admin</Titulo>
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

      <TurnstileWidget onToken={onTurnstileToken} onExpire={onTurnstileExpire} />

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
  onCerrar,
}: {
  estado: EstadoBorrador;
  resultado: ResultadoConversion | null;
  onCerrar: () => void;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-accent-success/40 bg-accent-success/10">
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-accent-success" fill="none" stroke="currentColor" strokeWidth="2.6">
          <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="font-display text-xl font-bold text-text-primary">Tu cuenta ya está activa</h2>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        {PLAN_NOMBRE[estado.planClave]} para{" "}
        <span className="text-text-primary">clarvo.mx/{resultado?.slug || estado.slug}</span>. Te enviamos tus
        accesos a <span className="text-text-primary">{estado.adminEmail || estado.contactoEmail}</span>. El cobro
        con Stripe lo conectamos pronto — mientras tanto tu negocio ya puede operar.
      </p>
      {resultado && (
        <a
          href={resultado.urlAdmin}
          className="mt-6 block w-full rounded-full bg-accent-electric px-5 py-3 text-sm font-semibold text-surface-deep transition hover:brightness-110"
        >
          Entrar a mi panel
        </a>
      )}
      <button
        type="button"
        onClick={onCerrar}
        className="mt-3 w-full rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-text-primary transition hover:border-white/30"
      >
        Cerrar
      </button>
    </div>
  );
}
