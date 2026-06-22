export async function canAddAppleWalletPass(): Promise<boolean> {
  return false;
}

export async function presentAppleWalletPass(_fileUri: string): Promise<void> {
  throw new Error("Apple Wallet is only available on iOS.");
}
