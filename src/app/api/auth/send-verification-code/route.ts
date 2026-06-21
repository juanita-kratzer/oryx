import { NextResponse } from "next/server";
import {
  generateVerificationCode,
  getCodeExpiryDate,
  hashVerificationCode,
  isValidEmail,
  maskEmail,
  MAX_SENDS_PER_HOUR,
  normalizeEmail,
} from "@/lib/auth/verificationCodes";
import {
  countRecentSends,
  createVerificationCode,
} from "@/lib/auth/verificationStore";
import { authApiCorsHeaders, jsonWithCors } from "@/lib/auth/cors";
import {
  sendVerificationCodeEmail,
  type VerificationPurpose,
} from "@/lib/email/verification";

const VALID_PURPOSES = new Set<VerificationPurpose>([
  "signup",
  "change-email",
  "change-password",
]);

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: authApiCorsHeaders() });
}

export async function POST(request: Request) {
  let body: { email?: string; purpose?: string };
  try {
    body = await request.json();
  } catch {
    return jsonWithCors({ error: "Invalid JSON" }, { status: 400 });
  }

  const purposeRaw = body.purpose ?? "signup";
  const purpose = VALID_PURPOSES.has(purposeRaw as VerificationPurpose)
    ? (purposeRaw as VerificationPurpose)
    : "signup";

  const email = normalizeEmail(body.email ?? "");
  if (!isValidEmail(email)) {
    return jsonWithCors({ error: "Invalid email address" }, { status: 400 });
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentSends = await countRecentSends(email, oneHourAgo);

  if (recentSends >= MAX_SENDS_PER_HOUR) {
    return jsonWithCors(
      { error: "Too many codes sent. Please try again in an hour." },
      { status: 429 }
    );
  }

  const code = generateVerificationCode();
  const expiresAt = getCodeExpiryDate();

  await createVerificationCode({
    email,
    codeHash: hashVerificationCode(code),
    expiresAt,
  });

  try {
    await sendVerificationCodeEmail({ to: email, code, purpose });
  } catch (err) {
    console.error("send-verification-code:", err);
    return jsonWithCors(
      { error: "Could not send verification email. Try again later." },
      { status: 503 }
    );
  }

  return jsonWithCors({
    ok: true,
    maskedEmail: maskEmail(email),
    message: "Verification code sent. Check your inbox and spam folder.",
  });
}
