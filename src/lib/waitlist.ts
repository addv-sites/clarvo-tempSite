export interface EmailJsConfig {
  serviceId: string | undefined;
  templateId: string | undefined;
  publicKey: string | undefined;
}

export function isEmailJsConfigured(config: EmailJsConfig): boolean {
  return Boolean(config.serviceId && config.templateId && config.publicKey);
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export interface WaitlistSubmission {
  email: string;
  honeypot: string;
}

export type WaitlistValidationError = "empty" | "invalid_format" | "spam_detected";

export function validateWaitlistSubmission(
  submission: WaitlistSubmission
): WaitlistValidationError | null {
  if (submission.honeypot.trim().length > 0) {
    return "spam_detected";
  }
  if (submission.email.trim().length === 0) {
    return "empty";
  }
  if (!isValidEmail(submission.email)) {
    return "invalid_format";
  }
  return null;
}
