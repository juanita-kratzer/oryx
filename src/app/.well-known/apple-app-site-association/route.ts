import { NextResponse } from "next/server";

/**
 * Apple App Site Association (AASA).
 * Served so Wallet and Apple services can verify the domain.
 * Optional: add appIDs to webcredentials/applinks if you have a companion app.
 */
export async function GET() {
  const teamId = process.env.PASSKIT_TEAM_ID;
  const passTypeId = process.env.PASSKIT_PASS_TYPE_ID;

  const body: {
    applinks: { apps: string[]; details: { appID: string; paths: string[] }[] };
    webcredentials?: { apps: string[] };
  } = {
    applinks: {
      apps: [],
      details: [],
    },
  };

  if (teamId && passTypeId) {
    body.webcredentials = {
      apps: [`${teamId}.${passTypeId}`],
    };
  }

  return new NextResponse(JSON.stringify(body), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
