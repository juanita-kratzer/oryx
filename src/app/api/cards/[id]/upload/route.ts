import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSupabaseAdmin, BUCKET_CARDS } from "@/lib/supabase";

type Params = { params: Promise<{ id: string }> };

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: Request, { params }: Params) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const card = await prisma.card.findFirst({
    where: { id, userId: user.id },
  });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formData = await request.formData() as any;
  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  const uploadFile = file as { size: number; type: string; name: string; arrayBuffer: () => Promise<ArrayBuffer> };

  if (uploadFile.size === 0) {
    return NextResponse.json({ error: "No file or empty file" }, { status: 400 });
  }

  if (uploadFile.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(uploadFile.type)) {
    return NextResponse.json({ error: "Invalid type. Use JPEG, PNG, WebP or GIF" }, { status: 400 });
  }

  const ext = uploadFile.name.split(".").pop() || "jpg";
  const path = `${user.id}/${card.id}/logo-${Date.now()}.${ext}`;

  const supabase = getSupabaseAdmin();
  const buffer = Buffer.from(await uploadFile.arrayBuffer());

  const { data, error } = await supabase.storage
    .from(BUCKET_CARDS)
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (error) {
    console.error("Supabase upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_CARDS)
    .getPublicUrl(data.path);

  const updated = await prisma.card.update({
    where: { id },
    data: { logoUrl: publicUrl },
  });

  return NextResponse.json({ url: publicUrl, card: updated });
}
