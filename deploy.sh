#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────
# deploy.sh — primer despliegue de clarvo.mx en el VPS (mismo servidor
# donde corre portalFac/control, ruta hermana /root/clarvo/clarvo-site/).
#
# A diferencia de prod/deploy.sh de portalFac, este script NO es
# destructivo: el sitio no tiene base de datos ni volúmenes con estado
# (build estatico de Astro servido por nginx), así que correrlo varias
# veces solo reconstruye la imagen y recrea el contenedor — nunca borra
# nada. Para actualizaciones posteriores de código, usa ./actualizar.sh
# en vez de este.
#
# Qué hace, EN ORDEN:
#   1. Verifica Docker + el plugin "docker compose" (no los instala).
#   2. Verifica que ./.env exista (copiar de .env.prod.example si no).
#   3. Construye y levanta el contenedor "web" (nginx + build estatico).
#   4. Espera a que responda en 127.0.0.1:$CLARVO_SITE_PORT.
#   5. Instala nginx + certbot en el HOST (fuera de Docker) si hace falta
#      — mismo patron que portalFac/prod/deploy.sh, server block aparte
#      para este dominio, nunca toca el vhost de otros sitios del VPS.
#   6. Corre certbot --nginx para emitir el certificado HTTPS real.
#   7. Verifica el sitio real por HTTPS y deja un resumen final.
#
# Uso:
#   sudo ./deploy.sh
#
# Variables de entorno opcionales:
#   DOMAIN=clarvo.mx
#   CERTBOT_EMAIL=antonio.prado@addv.mx
#   CLARVO_SITE_PORT=8090   (puerto loopback donde el nginx del host
#                            conecta con este contenedor — nunca público;
#                            cambiar si ya está en uso por otro stack del
#                            mismo VPS, ej. portalFac usa 8080/4001)
# ──────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

DOMAIN="${DOMAIN:-clarvo.mx}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-antonio.prado@addv.mx}"
CLARVO_SITE_PORT="${CLARVO_SITE_PORT:-8090}"
ENV_FILE="$SCRIPT_DIR/.env"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.prod.yml"

info()  { printf '\n\033[1;36m==> %s\033[0m\n' "$1"; }
warn()  { printf '\033[1;33m!!  %s\033[0m\n' "$1"; }
fail()  { printf '\033[1;31mXX  %s\033[0m\n' "$1"; exit 1; }

if [ "$(id -u)" -ne 0 ]; then
  fail "Corre este script con sudo (necesita instalar/configurar nginx y certbot en el host): sudo ./deploy.sh"
fi

# ---------- Paso 0: prerequisitos ----------
info "Verificando Docker..."
command -v docker >/dev/null 2>&1 || fail "No se encontró 'docker' en el PATH. Instálalo antes de continuar."
if docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE="docker-compose"
else
  fail "No se encontró el plugin 'docker compose' ni el binario 'docker-compose'."
fi

if [ ! -f "$ENV_FILE" ]; then
  fail "No existe $ENV_FILE — copia .env.prod.example a .env, llena las variables PUBLIC_* reales (GA4, Turnstile, endpoint de leads) y vuelve a correr."
fi

# ---------- Paso 1: build + up ----------
info "Construyendo imagen (npm ci + astro build con las variables PUBLIC_* de .env)..."
$COMPOSE -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build web

info "Levantando el contenedor..."
CLARVO_SITE_PORT="$CLARVO_SITE_PORT" $COMPOSE -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --force-recreate web

# ---------- Paso 2: esperar a que responda ----------
info "Esperando a que el sitio responda en 127.0.0.1:${CLARVO_SITE_PORT}..."
INTENTOS=0
until curl -sf "http://127.0.0.1:${CLARVO_SITE_PORT}/health" >/dev/null 2>&1; do
  INTENTOS=$((INTENTOS + 1))
  if [ "$INTENTOS" -ge 30 ]; then
    $COMPOSE -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs --tail=30 web
    fail "El contenedor no respondió tras ~90s — revisa los logs de arriba."
  fi
  sleep 3
done
info "Contenedor respondiendo OK en loopback."

# ---------- Paso 3: nginx + certbot del HOST ----------
info "Verificando nginx/certbot del host..."
if ! command -v nginx >/dev/null 2>&1; then
  info "Instalando nginx..."
  apt-get update -y && apt-get install -y nginx
fi
if ! command -v certbot >/dev/null 2>&1; then
  info "Instalando certbot..."
  apt-get install -y certbot python3-certbot-nginx
fi

SITE_CONF="/etc/nginx/sites-available/${DOMAIN}"
if [ ! -f "$SITE_CONF" ]; then
  info "Publicando server block HTTP para ${DOMAIN} (sin tocar otros vhosts del VPS)..."
  cat > "$SITE_CONF" <<NGINX
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:${CLARVO_SITE_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX
  ln -sf "$SITE_CONF" "/etc/nginx/sites-enabled/${DOMAIN}"
  nginx -t && systemctl reload nginx
else
  warn "Ya existe $SITE_CONF — no se sobreescribe. Si el puerto cambió, edítalo a mano."
fi

# ---------- Paso 4: certificado TLS ----------
info "Emitiendo/renovando certificado TLS con certbot..."
certbot --nginx -d "$DOMAIN" -d "www.${DOMAIN}" --non-interactive --agree-tos -m "$CERTBOT_EMAIL" --redirect

# ---------- Paso 5: verificación final ----------
info "Verificando https://${DOMAIN}..."
if curl -sf "https://${DOMAIN}/health" >/dev/null 2>&1; then
  printf '\033[1;32m✔ clarvo.mx desplegado y respondiendo por HTTPS.\033[0m\n'
else
  warn "El sitio respondió en loopback pero https://${DOMAIN} aún no — revisa DNS (debe apuntar a este VPS) y vuelve a correr certbot si hace falta."
fi
