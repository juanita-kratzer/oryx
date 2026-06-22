/** Web stub — Wallet passes are iOS-only in this app. */
export async function downloadAndPresentAppleWalletPass(
  _cardId: string,
  _slug: string
): Promise<void> {
  throw new Error("Apple Wallet is only available in the iOS app.");
}
