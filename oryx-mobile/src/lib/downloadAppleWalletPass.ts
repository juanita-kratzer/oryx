import { FileSystem } from "./fileSystem";
import { getAuth } from "./firebase";
import { getPassDownloadUrl } from "./firestore";
import { presentAppleWalletPass } from "./appleWallet";

export async function downloadAndPresentAppleWalletPass(
  cardId: string,
  slug: string
): Promise<void> {
  const currentUser = getAuth().currentUser;
  if (!currentUser) throw new Error("Not authenticated. Sign in again and retry.");

  const token = await currentUser.getIdToken();
  const url = getPassDownloadUrl(cardId);
  const localPath = `${FileSystem.cacheDirectory}${slug}.pkpass`;

  const download = await FileSystem.downloadAsync(url, localPath, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (download.status !== 200) {
    let serverMessage = "";
    try {
      const errRes = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = (await errRes.json()) as { error?: string };
      serverMessage = body.error?.trim() ?? "";
    } catch {
      // ignore non-JSON error bodies
    }
    const hint =
      download.status === 401
        ? "Sign in again and retry."
        : download.status === 404
          ? "Card not found on the server. Try opening the card again."
          : download.status === 503
            ? serverMessage ||
              "Server is not fully configured yet (Firebase or PassKit)."
            : download.status >= 500
              ? serverMessage || "Pass could not be generated. Check server logs."
              : `Server returned ${download.status}.`;
    throw new Error(`Download failed. ${hint}`);
  }

  const fileUri = download.uri || localPath;
  const info = await FileSystem.getInfoAsync(fileUri);
  if (!info.exists || (info.size ?? 0) < 64) {
    throw new Error("Download failed. Pass file was empty or invalid.");
  }

  await presentAppleWalletPass(fileUri);
}
