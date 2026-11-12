import { useEffect, useId, useRef } from "react";
import { publicEnv } from "../../config/publicEnv";

/**
 * Widget de Google reCAPTCHA v2 (Checkbox) para el paso final del
 * onboarding (hallazgo M-06, sonar_1.1.html, Fase D; migrado de
 * Cloudflare Turnstile, 2026-11-12 — ver DOCS/recaptcha.html en
 * portalFac) — carga el script oficial una sola vez (lo comparte
 * cualquier instancia que haya en la página) y renderiza el widget en un
 * div propio. El token se verifica siempre del lado del servidor
 * (control/utils/recaptcha.js); este componente solo lo obtiene y lo
 * entrega hacia arriba.
 */

const SCRIPT_SRC = "https://www.google.com/recaptcha/api.js?render=explicit";

declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
    };
    __recaptchaScriptPromise?: Promise<void>;
    __recaptchaOnLoad?: () => void;
  }
}

function cargarScriptRecaptcha(): Promise<void> {
  if (window.grecaptcha?.render) return Promise.resolve();
  if (window.__recaptchaScriptPromise) return window.__recaptchaScriptPromise;
  window.__recaptchaScriptPromise = new Promise((resolve, reject) => {
    window.__recaptchaOnLoad = () => resolve();
    const script = document.createElement("script");
    script.src = `${SCRIPT_SRC}&onload=__recaptchaOnLoad`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("No se pudo cargar Google reCAPTCHA."));
    document.head.appendChild(script);
  });
  return window.__recaptchaScriptPromise;
}

export default function RecaptchaWidget({
  onToken,
  onExpire,
}: {
  onToken: (token: string) => void;
  onExpire: () => void;
}) {
  const contenedorId = useId();
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    let montado = true;
    cargarScriptRecaptcha()
      .then(() => {
        if (!montado) return;
        const contenedor = document.getElementById(contenedorId);
        if (!contenedor || !window.grecaptcha) return;
        widgetIdRef.current = window.grecaptcha.render(contenedor, {
          sitekey: publicEnv.recaptchaSiteKey,
          callback: onToken,
          "expired-callback": onExpire,
          "error-callback": onExpire,
        });
      })
      .catch(() => {
        // Sin el script no hay token — el botón de continuar sigue
        // deshabilitado (ver puedeContinuar en OnboardingModal), así que
        // no hace falta un estado de error aparte aquí.
      });
    return () => {
      montado = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contenedorId]);

  return <div id={contenedorId} className="mt-4" />;
}
