import { useEffect, useId, useRef } from "react";
import { publicEnv } from "../../config/publicEnv";

/**
 * Widget de Cloudflare Turnstile para el paso final del onboarding
 * (hallazgo M-06, sonar_1.1.html, Fase D) — carga el script oficial una
 * sola vez (lo comparte cualquier instancia que haya en la página) y
 * renderiza el widget en un div propio. El token se verifica siempre del
 * lado del servidor (control/utils/turnstile.js); este componente solo
 * lo obtiene y lo entrega hacia arriba.
 */

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string;
      remove: (widgetId: string) => void;
    };
    __turnstileScriptPromise?: Promise<void>;
  }
}

function cargarScriptTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (window.__turnstileScriptPromise) return window.__turnstileScriptPromise;
  window.__turnstileScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar Cloudflare Turnstile."));
    document.head.appendChild(script);
  });
  return window.__turnstileScriptPromise;
}

export default function TurnstileWidget({
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
    cargarScriptTurnstile()
      .then(() => {
        if (!montado) return;
        const contenedor = document.getElementById(contenedorId);
        if (!contenedor || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(contenedor, {
          sitekey: publicEnv.turnstileSiteKey,
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
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contenedorId]);

  return <div id={contenedorId} className="mt-4" />;
}
