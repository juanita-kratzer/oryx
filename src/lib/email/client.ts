import sgMail from "@sendgrid/mail";

const apiKey = process.env.SENDGRID_API_KEY;

/** Same env names as AMBTN Firebase Functions (`functions/index.js`). */
export const SENDER_EMAIL =
  process.env.SENDGRID_SENDER_EMAIL ?? "contact@kratzerco.app";
export const REPLY_TO_EMAIL =
  process.env.SENDGRID_REPLY_TO ?? "contact@kratzerco.app";
export const SENDER_NAME = process.env.SENDGRID_SENDER_NAME ?? "Oryx";

export function isEmailConfigured(): boolean {
  return !!apiKey;
}

export function sendGridClient() {
  if (!apiKey) return null;
  sgMail.setApiKey(apiKey);
  return sgMail;
}

export function getSendGridErrorDetail(err: unknown): string {
  const e = err as {
    message?: string;
    code?: number | string;
    response?: { body?: { errors?: { message?: string }[] } };
  };
  const errors = e?.response?.body?.errors;
  if (Array.isArray(errors) && errors.length) {
    const msgs = errors.map((x) => x?.message).filter(Boolean);
    if (msgs.length) return msgs.join("; ");
  }
  const msg = e?.message?.trim() ?? "";
  const code = e?.code != null ? String(e.code) : "";
  if (msg && code) return `${msg} (HTTP ${code})`;
  return msg || (code ? `HTTP ${code}` : "SendGrid send failed");
}
