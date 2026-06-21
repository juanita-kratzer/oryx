import { NextResponse } from "next/server";

/**
 * Minimal middleware — no auth gating on web routes.
 * API routes handle their own auth via Firebase ID tokens.
 * Public routes (/c/[slug], /api/public/*) need no auth.
 */
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ico|woff2?|map)).*)",
  ],
};
