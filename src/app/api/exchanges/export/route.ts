import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

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

  const exchanges = await prisma.businessCardExchange.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      card: { select: { business: true, name: true, slug: true } },
    },
  });

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

  const rows = exchanges.map((e) =>
    [
      csvEscape(e.name),
      csvEscape(e.phone ?? ""),
      csvEscape(e.email ?? ""),
      csvEscape(e.company ?? ""),
      csvEscape(e.jobTitle ?? ""),
      csvEscape(e.card.business || e.card.name || e.card.slug),
      csvEscape(e.createdAt.toISOString()),
      csvEscape(e.notes ?? ""),
    ].join(",")
  );

  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=oryx-exchanges.csv",
    },
  });
}
