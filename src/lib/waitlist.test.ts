import { describe, expect, it } from "vitest";
import {
  isEmailJsConfigured,
  isValidEmail,
  validateWaitlistSubmission,
} from "./waitlist";

describe("isEmailJsConfigured", () => {
  it("returns true when all three values are present", () => {
    expect(
      isEmailJsConfigured({
        serviceId: "service_x",
        templateId: "template_x",
        publicKey: "key_x",
      })
    ).toBe(true);
  });

  it("returns false when any value is missing", () => {
    expect(
      isEmailJsConfigured({ serviceId: undefined, templateId: "t", publicKey: "k" })
    ).toBe(false);
    expect(
      isEmailJsConfigured({ serviceId: "s", templateId: undefined, publicKey: "k" })
    ).toBe(false);
    expect(
      isEmailJsConfigured({ serviceId: "s", templateId: "t", publicKey: undefined })
    ).toBe(false);
  });

  it("returns false when values are empty strings", () => {
    expect(
      isEmailJsConfigured({ serviceId: "", templateId: "t", publicKey: "k" })
    ).toBe(false);
  });
});

describe("isValidEmail", () => {
  it("accepts well-formed emails", () => {
    expect(isValidEmail("persona@example.com")).toBe(true);
    expect(isValidEmail("a.b+c@sub.example.mx")).toBe(true);
  });

  it("rejects malformed emails", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("sin-arroba.com")).toBe(false);
    expect(isValidEmail("sin-dominio@")).toBe(false);
    expect(isValidEmail("@sin-usuario.com")).toBe(false);
    expect(isValidEmail("con espacio@example.com")).toBe(false);
  });

  it("trims surrounding whitespace before validating", () => {
    expect(isValidEmail("  persona@example.com  ")).toBe(true);
  });
});

describe("validateWaitlistSubmission", () => {
  it("returns null for a valid submission", () => {
    expect(
      validateWaitlistSubmission({ email: "persona@example.com", honeypot: "" })
    ).toBeNull();
  });

  it("flags spam when the honeypot field is filled", () => {
    expect(
      validateWaitlistSubmission({ email: "persona@example.com", honeypot: "bot" })
    ).toBe("spam_detected");
  });

  it("checks honeypot before email content", () => {
    expect(
      validateWaitlistSubmission({ email: "", honeypot: "bot" })
    ).toBe("spam_detected");
  });

  it("flags empty email", () => {
    expect(validateWaitlistSubmission({ email: "  ", honeypot: "" })).toBe("empty");
  });

  it("flags malformed email", () => {
    expect(
      validateWaitlistSubmission({ email: "no-es-correo", honeypot: "" })
    ).toBe("invalid_format");
  });
});
