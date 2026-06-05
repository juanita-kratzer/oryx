import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM ?? "onboarding@resend.dev";
const fromName = process.env.NEXT_PUBLIC_APP_NAME ?? "Oryx - Apple Wallet Cards";

export function getResendClient(): Resend | null {
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export function getFromAddress(): string {
  return fromName ? `${fromName} <${fromEmail}>` : fromEmail;
}

export function isEmailConfigured(): boolean {
  return !!apiKey;
}
