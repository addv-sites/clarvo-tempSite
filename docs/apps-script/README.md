# Apps Script — captura de leads y cotizaciones

`code.gs` es el backend (Google Apps Script) detrás del único endpoint que usa
el sitio para dos formularios: la waitlist de `/masterclass` y el cotizador
"Clarvo a la medida". No se despliega con este repo — vive en el editor de
Apps Script ligado al Google Sheet donde ya caen los leads de masterclass.

## Instalar / actualizar

1. Abre el Google Sheet donde hoy llegan los leads de `/masterclass`.
2. Extensiones → Apps Script.
3. Reemplaza el contenido de `Código.gs` por el de `code.gs` de esta carpeta.
4. Implementar → Administrar implementaciones → ícono de lápiz en la
   implementación activa (la que ya usa `/masterclass`) → Versión: **Nueva
   versión** → Implementar.
5. No cambies la URL del Web App ni `PUBLIC_LEADS_ENDPOINT` en `.env` — es el
   mismo endpoint, ahora atiende los dos formularios.

## Qué cambia respecto al original

Base real: `gsheet/code.gs` (lo que ya está desplegado hoy — confirmado
2026-10-09, no supuesto). Dos correcciones sobre mi primera versión de este
archivo: usa `getActiveSheet()` sin pestañas nombradas para masterclass (no
inventar una hoja "Leads - Masterclass" que no existe), y **ya manda correo
a `antonio.prado@addv.mx` en cada lead de masterclass** — no era un
comportamiento nuevo que yo agregara.

- Leads de masterclass: exactamente igual que hoy, cero cambios de forma —
  misma hoja activa, mismas 6 columnas, mismo correo "Nuevo registro —
  Masterclass CLARVO".
- `Cotizaciones - A la medida`: hoja nueva (se crea sola la primera vez que
  llega una cotización) con empresa, contacto, correo, teléfono, módulos
  seleccionados y notas.
- Cada cotización dispara su propio correo a `antonio.prado@addv.mx` con
  asunto fijo `Clarvo - Cotización` (antes `Clarvo Cotización — {empresa}`,
  cambiado a petición del usuario 2026-10-29 — el nombre de la empresa ya
  va en el cuerpo del correo, no hace falta repetirlo en el asunto) y el
  detalle completo en el cuerpo.

## Contrato de payload esperado por el frontend (Segmento 4)

```json
{
  "origen": "cotizador",
  "empresa": "string",
  "nombreContacto": "string",
  "correo": "string",
  "telefono": "string",
  "modulos": ["string", "..."],
  "notas": "string (opcional)",
  "fecha": "ISO 8601"
}
```

Si `origen` es cualquier otro valor (o viene vacío, como hoy en masterclass),
se trata como lead de masterclass y cae en `Leads - Masterclass` sin tocar
correo.
