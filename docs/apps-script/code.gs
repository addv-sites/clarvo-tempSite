/**
 * CLARVO — Web App de captura de leads (Apps Script)
 *
 * Base real tomada de gsheet/code.gs (el script que ya está desplegado
 * para /masterclass) — NO se cambia su comportamiento: misma hoja activa
 * (getActiveSheet, sin pestañas nombradas), mismas columnas, mismo correo
 * "Nuevo registro — Masterclass CLARVO" a NOTIFY_EMAIL en cada lead.
 *
 * Se agrega una rama nueva, distinguida por `data.origen === "cotizador"`:
 * esa sí usa una hoja con nombre propio ("Cotizaciones - A la medida",
 * se crea sola la primera vez) y un correo con asunto distinto.
 *
 * Instalación: pega esto en el MISMO proyecto de Apps Script ya publicado
 * como Web App para /masterclass (mismo Sheet, misma URL implementada).
 * Después: Implementar > Administrar implementaciones > editar la
 * implementación existente > Nueva versión > Implementar. No hace falta
 * cambiar PUBLIC_LEADS_ENDPOINT en el sitio — sigue siendo la misma URL.
 */

const CONFIG = {
  NOTIFY_EMAIL: "antonio.prado@addv.mx",
};

const COTIZADOR_SHEET_NAME = "Cotizaciones - A la medida";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.origen === "cotizador") {
      handleCotizador(data);
    } else {
      handleMasterclassLead(data);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/** Comportamiento original, sin cambios — ver gsheet/code.gs. */
function handleMasterclassLead(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  sheet.appendRow([
    data.fecha,
    data.nombre,
    data.correo,
    data.negocio,
    data.telefono,
    data.origen,
  ]);

  MailApp.sendEmail({
    to: CONFIG.NOTIFY_EMAIL,
    subject: "Nuevo registro — Masterclass CLARVO",
    body:
      "Nombre: " + data.nombre + "\n" +
      "Correo: " + data.correo + "\n" +
      "Negocio: " + data.negocio + "\n" +
      "Teléfono: " + data.telefono + "\n" +
      "Fecha: " + data.fecha,
  });
}

/** Nuevo: cotizador "Clarvo a la medida" — su propia pestaña + correo distinto. */
function handleCotizador(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(COTIZADOR_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(COTIZADOR_SHEET_NAME);
    sheet.appendRow([
      "Fecha", "Empresa", "Contacto", "Correo", "Teléfono", "Módulos/necesidades", "Notas",
    ]);
    sheet.setFrozenRows(1);
  }

  const modulos = Array.isArray(data.modulos) ? data.modulos.join(", ") : (data.modulos || "");

  sheet.appendRow([
    data.fecha || new Date().toISOString(),
    data.empresa || "",
    data.nombreContacto || "",
    data.correo || "",
    data.telefono || "",
    modulos,
    data.notas || "",
  ]);

  MailApp.sendEmail({
    to: CONFIG.NOTIFY_EMAIL,
    subject: "Clarvo - Cotización",
    body:
      "Nueva solicitud de cotización a la medida desde el sitio de Clarvo.\n\n" +
      "Empresa: " + (data.empresa || "—") + "\n" +
      "Contacto: " + (data.nombreContacto || "—") + "\n" +
      "Correo: " + (data.correo || "—") + "\n" +
      "Teléfono: " + (data.telefono || "—") + "\n" +
      "Módulos / necesidades seleccionadas: " + (modulos || "—") + "\n" +
      "Notas: " + (data.notas || "—") + "\n\n" +
      "Fecha: " + (data.fecha || new Date().toISOString()) + "\n\n" +
      '— Registrado automáticamente en la hoja "' + COTIZADOR_SHEET_NAME + '".',
  });
}
