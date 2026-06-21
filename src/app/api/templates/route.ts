import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const templates = await prisma.template.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      category: true,
      thumbnailUrl: true,
      previewImageUrl: true,
      editableFields: true,
      colorOptions: true,
      defaultBgColor: true,
      premium: true,
    },
  });

  return NextResponse.json(templates);
}
