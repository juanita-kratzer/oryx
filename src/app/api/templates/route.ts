import { NextResponse } from "next/server";
import { listActiveTemplates } from "@/lib/templates";

export const dynamic = "force-dynamic";

export async function GET() {
  const templates = listActiveTemplates().map(
    ({ id, slug, name, description, category, thumbnailUrl, previewImageUrl, editableFields, colorOptions, defaultBgColor, premium }) => ({
      id,
      slug,
      name,
      description,
      category,
      thumbnailUrl,
      previewImageUrl,
      editableFields,
      colorOptions,
      defaultBgColor,
      premium,
    })
  );

  return NextResponse.json(templates);
}
