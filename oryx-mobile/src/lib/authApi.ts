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

function wrapFetchError(err: unknown): Error {
  if (err instanceof TypeError) {
    const base = getApiBaseUrl();
    if (base.includes("localhost") || base.includes("127.0.0.1")) {
      return new Error(
        "Cannot reach the API from this device. localhost only works in the simulator — set EXPO_PUBLIC_APP_URL to your production URL or your Mac's LAN IP (e.g. http://192.168.1.x:3000), then rebuild the app."
      );
    }
    return new Error(
      "Network request failed. Check your internet connection and that EXPO_PUBLIC_APP_URL points to a running Oryx API."
    );
  }
  return err instanceof Error ? err : new Error("Request failed");
}

export async function sendVerificationCode(
  email: string,
  purpose: VerificationPurpose = "signup"
): Promise<{ maskedEmail: string }> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      "EXPO_PUBLIC_APP_URL is not set. Point it at your Next.js API (e.g. https://oryx-apple-wallet-cards.vercel.app)."
    );
  }

  try {
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
  } catch (err) {
    throw wrapFetchError(err);
  }
}

export async function verifyEmailCode(
  email: string,
  code: string
): Promise<void> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error("EXPO_PUBLIC_APP_URL is not set.");
  }

  try {
    const response = await fetch(`${base}/api/auth/verify-email-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), code: code.trim() }),
    });

    if (!response.ok) {
      throw new Error(await parseError(response));
    }
  } catch (err) {
    throw wrapFetchError(err);
  }
}
