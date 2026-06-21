import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { findOwnerCard } from "@/lib/firestore/cards";
import { listOwnerExchanges } from "@/lib/firestore/exchanges";

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const exchanges = await listOwnerExchanges(user.uid);
  const header = [
    "Name",
    "Phone",
    "Email",
    "Company",
    "Job Title",
    "Card",
    "Created",
    "Notes",
  ].join(",");

  const rows = await Promise.all(
    exchanges.map(async (e) => {
      const card = await findOwnerCard(user.uid, e.cardId);
      const cardLabel = card?.business || card?.name || e.cardSlug;
      return [
        csvEscape(e.name),
        csvEscape(e.phone ?? ""),
        csvEscape(e.email ?? ""),
        csvEscape(e.company ?? ""),
        csvEscape(e.jobTitle ?? ""),
        csvEscape(cardLabel),
        csvEscape(e.createdAt),
        csvEscape(e.notes ?? ""),
      ].join(",");
    })
  );

  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=oryx-exchanges.csv",
    },
  });
}
