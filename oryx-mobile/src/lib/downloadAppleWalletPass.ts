import { getAuth } from "./firebase";
import { getPassDownloadUrl } from "./firestore";
import { addPassToAppleWallet } from "./appleWallet";

export async function downloadAndPresentAppleWalletPass(
  cardId: string,
  _slug: string
): Promise<void> {
  const currentUser = getAuth().currentUser;
  if (!currentUser) {
    throw new Error("Not authenticated. Sign in again and retry.");
  }

  const token = await currentUser.getIdToken();
  const url = getPassDownloadUrl(cardId);
  await addPassToAppleWallet(url, token);
}
