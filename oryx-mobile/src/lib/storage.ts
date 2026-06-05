import { getStorage, getAuth } from "./firebase";

export async function uploadCardImage(
  cardId: string,
  uri: string
): Promise<string> {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Not authenticated");

  const filename = uri.split("/").pop() || "image.jpg";
  const storagePath = `cards/${user.uid}/${cardId}/${filename}`;
  const ref = getStorage().ref(storagePath);

  await ref.putFile(uri);
  const downloadUrl = await ref.getDownloadURL();
  return downloadUrl;
}

export async function uploadLogo(
  cardId: string,
  uri: string
): Promise<{ url: string }> {
  const url = await uploadCardImage(cardId, uri);
  return { url };
}

export async function deleteCardImage(storagePath: string): Promise<void> {
  const ref = getStorage().ref(storagePath);
  await ref.delete();
}
