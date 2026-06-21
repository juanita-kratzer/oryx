import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const exchanges = await prisma.businessCardExchange.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      card: {
        select: {
          id: true,
          slug: true,
          name: true,
          business: true,
        },
      },
    },
  });

  return NextResponse.json(exchanges);
}
