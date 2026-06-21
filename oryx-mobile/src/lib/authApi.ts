export type VerificationPurpose = "signup" | "change-email" | "change-password";

function getApiBaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_APP_URL?.trim();
  if (!url) return "";
  return url.replace(/\/$/, "");
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data?.error === "string") return data.error;
  } catch {
    // ignore
  }
  return `Request failed (${response.status})`;
}

export async function sendVerificationCode(
  email: string,
  purpose: VerificationPurpose = "signup"
): Promise<{ maskedEmail: string }> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      "EXPO_PUBLIC_APP_URL is not set. Point it at your Next.js API (e.g. http://localhost:3000)."
    );
  }

  const response = await fetch(`${base}/api/auth/send-verification-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), purpose }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = await response.json();
  return { maskedEmail: data.maskedEmail ?? email };
}

export async function verifyEmailCode(
  email: string,
  code: string
): Promise<void> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error("EXPO_PUBLIC_APP_URL is not set.");
  }

  const response = await fetch(`${base}/api/auth/verify-email-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), code: code.trim() }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}
