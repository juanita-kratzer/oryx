import { NextResponse } from "next/server";
import {
  hashVerificationCode,
  isCodeExpired,
  isValidEmail,
  normalizeEmail,
} from "@/lib/auth/verificationCodes";
import {
  deleteRecord,
  findLatestUnverified,
  incrementAttempts,
  markVerified,
} from "@/lib/auth/verificationStore";
import { authApiCorsHeaders, jsonWithCors } from "@/lib/auth/cors";

const MAX_ATTEMPTS = 5;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: authApiCorsHeaders() });
}

export async function POST(request: Request) {
  let body: { email?: string; code?: string };
  try {
    body = await request.json();
  } catch {
    return jsonWithCors({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = normalizeEmail(body.email ?? "");
  const code = (body.code ?? "").trim();

  if (!isValidEmail(email)) {
    return jsonWithCors({ error: "Invalid email address" }, { status: 400 });
  }

  if (!/^\d{6}$/.test(code)) {
    return jsonWithCors({ error: "Enter the 6-digit code" }, { status: 400 });
  }

  const record = await findLatestUnverified(email);

  if (!record) {
    return jsonWithCors(
      { error: "No verification code found. Request a new one." },
      { status: 400 }
    );
  }

  if (record.verified) {
    return jsonWithCors({ ok: true, verified: true, alreadyVerified: true });
  }

  if (isCodeExpired(new Date(record.expiresAt))) {
    return jsonWithCors(
      { error: "Verification code expired. Request a new one." },
      { status: 400 }
    );
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await deleteRecord(record.id);
    return jsonWithCors(
      { error: "Too many attempts. Request a new code." },
      { status: 400 }
    );
  }

  if (record.codeHash !== hashVerificationCode(code)) {
    await incrementAttempts(record.id);
    return jsonWithCors({ error: "Incorrect code. Try again." }, { status: 400 });
  }

  await markVerified(record.id);

  return jsonWithCors({ ok: true, verified: true });
}
