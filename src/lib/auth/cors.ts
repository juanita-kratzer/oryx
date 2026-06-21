export function authApiCorsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export function jsonWithCors(body: unknown, init?: { status?: number }) {
  return Response.json(body, {
    status: init?.status ?? 200,
    headers: authApiCorsHeaders(),
  });
}
