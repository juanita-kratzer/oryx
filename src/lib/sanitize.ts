/** Strip control chars and trim; cap length for public form inputs. */
export function sanitizeText(input: string, maxLength = 500): string {
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeOptionalText(
  input: string | undefined | null,
  maxLength = 500
): string | null {
  if (!input) return null;
  const v = sanitizeText(input, maxLength);
  return v.length > 0 ? v : null;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
