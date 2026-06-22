/** Web stub — Wallet passes are iOS-only in this app. */
export async function canAddAppleWalletPass(): Promise<boolean> {
  return false;
}

export async function addPassToAppleWallet(
  _passUrl: string,
  _authToken: string
): Promise<void> {
  throw new Error("Apple Wallet is only available in the iOS app.");
}
