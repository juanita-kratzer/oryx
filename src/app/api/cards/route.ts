import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listOwnerCards } from "@/lib/firestore/cards";

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cards = await listOwnerCards(user.uid);
  return NextResponse.json(cards);
}

export async function POST() {
  return NextResponse.json(
    { error: "Create cards in the Oryx mobile app." },
    { status: 410 }
  );
}
