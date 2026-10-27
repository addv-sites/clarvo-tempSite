# ---------- Etapa de build ----------
FROM node:22-alpine AS build
WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Variables PUBLIC_* de Astro: se hornean en el HTML/JS estático en build
# time, nunca son secretas (ver .env.example) -- OPENAI_API_KEY NUNCA se
# pasa aqui (solo la usa scripts/generate-images.mjs en local, nunca el
# build del sitio).
ARG PUBLIC_SITE_URL=https://clarvo.mx
ARG PUBLIC_GA_MEASUREMENT_ID
ARG PUBLIC_LEADS_ENDPOINT
ARG PUBLIC_CLARVO_API_BASE_URL
ARG PUBLIC_CLARVO_ONBOARDING_URL
ARG PUBLIC_CLARVO_APP_URL
ARG PUBLIC_TURNSTILE_SITE_KEY
ENV PUBLIC_SITE_URL=${PUBLIC_SITE_URL} \
    PUBLIC_GA_MEASUREMENT_ID=${PUBLIC_GA_MEASUREMENT_ID} \
    PUBLIC_LEADS_ENDPOINT=${PUBLIC_LEADS_ENDPOINT} \
    PUBLIC_CLARVO_API_BASE_URL=${PUBLIC_CLARVO_API_BASE_URL} \
    PUBLIC_CLARVO_ONBOARDING_URL=${PUBLIC_CLARVO_ONBOARDING_URL} \
    PUBLIC_CLARVO_APP_URL=${PUBLIC_CLARVO_APP_URL} \
    PUBLIC_TURNSTILE_SITE_KEY=${PUBLIC_TURNSTILE_SITE_KEY}

RUN npm run build

# ---------- Etapa final ----------
FROM nginx:1.27-alpine AS final

# CSP_CONNECT_SRC_EXTRA: SOLO para pruebas locales de onboarding, cuando
# este contenedor (sitio estatico) y "control" corren en puertos/origenes
# distintos del host (ej. 127.0.0.1:8090 vs 127.0.0.1:8088) -- la CSP real
# de produccion usa "connect-src 'self'" a secas porque clarvo.mx y su API
# publica viven detras del mismo dominio. Vacio por default (el build de
# produccion real NUNCA pasa este ARG), así que esto no afloja nada en
# produccion -- solo lo ensancha si alguien lo pide explicitamente al
# construir localmente.
ARG CSP_CONNECT_SRC_EXTRA=""

RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf
COPY security-headers.conf /etc/nginx/security-headers.conf
RUN if [ -n "$CSP_CONNECT_SRC_EXTRA" ]; then \
      sed -i "s|connect-src 'self'|connect-src 'self' ${CSP_CONNECT_SRC_EXTRA}|" /etc/nginx/security-headers.conf; \
    fi
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/dist/ /usr/share/nginx/html/

EXPOSE 80

# Mismo criterio que frontend/Dockerfile de portalFac: los workers de
# nginx (los que procesan cada request) ya corren como el usuario
# "nginx" sin privilegios de fabrica en esta imagen -- solo el proceso
# master (PID 1) es root, y solo para bindear el puerto 80.
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
