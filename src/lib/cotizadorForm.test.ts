import { describe, expect, it } from "vitest";
import { buildCotizadorPayload, validateCotizador, type CotizadorFormData } from "./cotizadorForm";

const validData: CotizadorFormData = {
  empresa: "Panadería La Espiga",
  nombreContacto: "Antonio Prado",
  correo: "antonio@laespiga.com",
  telefono: "55 1234 5678",
  modulos: ["Facturación", "Inventario"],
  notas: "",
};

describe("validateCotizador", () => {
  it("acepta datos completos y válidos", () => {
    const result = validateCotizador(validData);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("rechaza empresa vacía", () => {
    const result = validateCotizador({ ...validData, empresa: "   " });
    expect(result.valid).toBe(false);
    expect(result.errors.empresa).toBeDefined();
  });

  it("rechaza nombre de contacto vacío", () => {
    const result = validateCotizador({ ...validData, nombreContacto: "" });
    expect(result.errors.nombreContacto).toBeDefined();
  });

  it("rechaza correo sin arroba ni dominio", () => {
    const result = validateCotizador({ ...validData, correo: "no-es-correo" });
    expect(result.errors.correo).toBeDefined();
  });

  it("rechaza teléfono con letras o demasiado corto", () => {
    expect(validateCotizador({ ...validData, telefono: "abc" }).errors.telefono).toBeDefined();
    expect(validateCotizador({ ...validData, telefono: "123" }).errors.telefono).toBeDefined();
  });

  it("rechaza cero módulos seleccionados", () => {
    const result = validateCotizador({ ...validData, modulos: [] });
    expect(result.valid).toBe(false);
    expect(result.errors.modulos).toBeDefined();
  });

  it("acepta notas vacías (campo opcional)", () => {
    const result = validateCotizador({ ...validData, notas: "" });
    expect(result.valid).toBe(true);
  });

  it("reporta todos los errores simultáneamente", () => {
    const result = validateCotizador({
      empresa: "",
      nombreContacto: "",
      correo: "x",
      telefono: "",
      modulos: [],
      notas: "",
    });
    expect(Object.keys(result.errors)).toEqual(
      expect.arrayContaining(["empresa", "nombreContacto", "correo", "telefono", "modulos"]),
    );
  });
});

describe("buildCotizadorPayload", () => {
  it("recorta espacios y arma el payload con origen=cotizador y fecha ISO", () => {
    const payload = buildCotizadorPayload({
      ...validData,
      empresa: "  Panadería La Espiga  ",
      notas: "  Necesitamos 3 sucursales  ",
    });

    expect(payload).toMatchObject({
      origen: "cotizador",
      empresa: "Panadería La Espiga",
      nombreContacto: "Antonio Prado",
      correo: "antonio@laespiga.com",
      telefono: "55 1234 5678",
      modulos: ["Facturación", "Inventario"],
      notas: "Necesitamos 3 sucursales",
    });
    expect(() => new Date(payload.fecha).toISOString()).not.toThrow();
  });
});
