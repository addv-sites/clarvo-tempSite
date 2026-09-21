import { describe, expect, it } from "vitest";
import { buildLeadPayload, validateLead, type LeadFormData } from "./leadForm";

const validData: LeadFormData = {
  name: "Antonio Prado",
  email: "antonio@tunegocio.com",
  business: "comercio",
  phone: "55 1234 5678",
};

describe("validateLead", () => {
  it("acepta datos completos y válidos", () => {
    const result = validateLead(validData);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("rechaza nombre vacío", () => {
    const result = validateLead({ ...validData, name: "   " });
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  it("rechaza correo sin arroba ni dominio", () => {
    const result = validateLead({ ...validData, email: "no-es-correo" });
    expect(result.valid).toBe(false);
    expect(result.errors.email).toBeDefined();
  });

  it("rechaza negocio sin seleccionar", () => {
    const result = validateLead({ ...validData, business: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.business).toBeDefined();
  });

  it("rechaza teléfono con letras o demasiado corto", () => {
    expect(validateLead({ ...validData, phone: "abc" }).errors.phone).toBeDefined();
    expect(validateLead({ ...validData, phone: "123" }).errors.phone).toBeDefined();
  });

  it("acepta teléfono con formato con paréntesis y guiones", () => {
    const result = validateLead({ ...validData, phone: "+52 (55) 1234-5678" });
    expect(result.valid).toBe(true);
  });

  it("reporta todos los errores simultáneamente", () => {
    const result = validateLead({ name: "", email: "x", business: "", phone: "" });
    expect(Object.keys(result.errors)).toEqual(
      expect.arrayContaining(["name", "email", "business", "phone"]),
    );
  });
});

describe("buildLeadPayload", () => {
  it("recorta espacios y arma el payload con origen y fecha ISO", () => {
    const payload = buildLeadPayload({
      name: "  Antonio Prado  ",
      email: "  antonio@tunegocio.com ",
      business: "comercio",
      phone: " 55 1234 5678 ",
    });

    expect(payload).toMatchObject({
      nombre: "Antonio Prado",
      correo: "antonio@tunegocio.com",
      negocio: "comercio",
      telefono: "55 1234 5678",
      origen: "masterclass",
    });
    expect(() => new Date(payload.fecha).toISOString()).not.toThrow();
  });
});
