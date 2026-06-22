import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { findOwnerCard } from "@/lib/firestore/cards";
import { deliverApplePass } from "@/lib/passkit/deliverApplePass";

type Params = { params: Promise<{ cardId: string }> };

function passkitConfigured(): boolean {
  return Boolean(
    process.env.PASSKIT_CERT_BASE64 &&
      process.env.PASSKIT_KEY_BASE64 &&
      process.env.PASSKIT_WWDR_BASE64 &&
      process.env.PASSKIT_PASS_TYPE_ID &&
      process.env.PASSKIT_TEAM_ID &&
      process.env.PASSKIT_ORG_NAME
  );
}

export async function GET(request: Request, { params }: Params) {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return NextResponse.json(
      { error: "Server missing FIREBASE_SERVICE_ACCOUNT_JSON" },
      { status: 503 }
    );
  }

  if (!passkitConfigured()) {
    return NextResponse.json(
      { error: "Server missing PassKit configuration (PASSKIT_* env vars)" },
      { status: 503 }
    );
  }

  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cardId } = await params;

  try {
    const card = await findOwnerCard(user.uid, cardId);

    if (!card || card.status !== "PAID") {
      return NextResponse.json(
        { error: "Card not found or not yet purchased" },
        { status: 404 }
      );
    }

    return await deliverApplePass(card, { analyticsContext: "owner" });
  } catch (e) {
    console.error("Pass generation failed:", e);
    const message =
      e instanceof Error ? e.message : "Pass generation failed";
    if (
      message.includes("Firestore API") ||
      message.includes("SERVICE_DISABLED")
    ) {
      return NextResponse.json(
        {
          error:
            "Firestore is not enabled. Create Firestore in Firebase Console, then enable the Cloud Firestore API in Google Cloud.",
        },
        { status: 503 }
      );
    }
    if (
      message.includes("PassKit private key") ||
      message.includes("not PEM") ||
      message.includes("Invalid PEM")
    ) {
      return NextResponse.json(
        { error: "PassKit certificates are misconfigured on the server." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
