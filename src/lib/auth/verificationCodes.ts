import { createHash, randomInt } from "crypto";

const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_SENDS_PER_HOUR = 5;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

export function generateVerificationCode(): string {
  return String(randomInt(100000, 1000000));
}

export function hashVerificationCode(code: string): string {
  return createHash("sha256").update(code.trim()).digest("hex");
}

export function getCodeExpiryDate(): Date {
  return new Date(Date.now() + CODE_TTL_MS);
}

export function isCodeExpired(expiresAt: Date): boolean {
  return expiresAt.getTime() < Date.now();
}

export { CODE_TTL_MS, MAX_SENDS_PER_HOUR };

export function maskEmail(email: string): string {
  const norm = normalizeEmail(email);
  if (!norm.includes("@")) return "your email";
  const [local, domain] = norm.split("@");
  if (!local || !domain) return "your email";
  const visible = local.length <= 2 ? local[0] || "•" : `${local.slice(0, 2)}•••`;
  return `${visible}@${domain}`;
}
