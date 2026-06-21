import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { findOwnerCard } from "@/lib/firestore/cards";
import { getStorageBucket } from "@/lib/firebaseAdmin";
import { getFirestoreAdmin } from "@/lib/firebaseAdmin";

type Params = { params: Promise<{ id: string }> };

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: Request, { params }: Params) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const card = await findOwnerCard(user.uid, id);
  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  const uploadFile = file as {
    size: number;
    type: string;
    name: string;
    arrayBuffer: () => Promise<ArrayBuffer>;
  };

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
  const path = `cards/${user.uid}/${id}/logo-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await uploadFile.arrayBuffer());

  try {
    const bucket = getStorageBucket();
    const gcsFile = bucket.file(path);
    await gcsFile.save(buffer, {
      contentType: uploadFile.type,
      metadata: { cacheControl: "public, max-age=86400" },
    });
    await gcsFile.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${path}`;

    const db = getFirestoreAdmin();
    await db.collection("users").doc(user.uid).collection("cards").doc(id).update({
      logoUrl: publicUrl,
      updatedAt: new Date(),
    });

    const updated = await findOwnerCard(user.uid, id);
    return NextResponse.json({ url: publicUrl, card: updated });
  } catch (err) {
    console.error("Firebase upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
