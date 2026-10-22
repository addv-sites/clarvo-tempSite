#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────
# actualizar.sh — aplica una actualización de código a clarvo.mx (VPS)
#
# Asume que ya corriste ./deploy.sh al menos una vez (nginx del host +
# certbot ya configurados). Solo reconstruye la imagen con el código
# nuevo y recrea el contenedor — nunca toca nginx/certbot del host.
#
# Uso (en el VPS, tras copiar el repo actualizado encima del existente —
# git pull / rsync, lo que uses; nunca pisa ./.env):
#   ./actualizar.sh
# ──────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

CLARVO_SITE_PORT="${CLARVO_SITE_PORT:-8090}"
ENV_FILE="$SCRIPT_DIR/.env"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.prod.yml"

info()  { printf '\n\033[1;36m==> %s\033[0m\n' "$1"; }
warn()  { printf '\033[1;33m!!  %s\033[0m\n' "$1"; }
fail()  { printf '\033[1;31mXX  %s\033[0m\n' "$1"; exit 1; }

command -v docker >/dev/null 2>&1 || fail "No se encontró 'docker' en el PATH."
if docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE="docker-compose"
else
  fail "No se encontró el plugin 'docker compose' ni el binario 'docker-compose'."
fi

[ -f "$ENV_FILE" ] || fail "No existe $ENV_FILE — corre ./deploy.sh primero (ese sí lo exige/documenta)."

info "Reconstruyendo imagen con el código nuevo..."
$COMPOSE -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build web

info "Recreando el contenedor..."
CLARVO_SITE_PORT="$CLARVO_SITE_PORT" $COMPOSE -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --force-recreate web

info "Esperando a que el sitio responda en 127.0.0.1:${CLARVO_SITE_PORT}..."
INTENTOS=0
until curl -sf "http://127.0.0.1:${CLARVO_SITE_PORT}/health" >/dev/null 2>&1; do
  INTENTOS=$((INTENTOS + 1))
  if [ "$INTENTOS" -ge 30 ]; then
    warn "No respondió tras ~90s — revisa los logs abajo antes de dar la actualización por buena."
    break
  fi
  sleep 3
done

info "Últimos logs (20 líneas):"
$COMPOSE -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs --tail=20 web

if curl -sf "http://127.0.0.1:${CLARVO_SITE_PORT}/health" >/dev/null 2>&1; then
  printf '\033[1;32m✔ Actualización aplicada — /health responde OK.\033[0m\n'
else
  warn "Revisa los logs de arriba — el contenedor pudo quedar en crash-loop."
fi
