import { Platform } from "react-native";
import WalletManager from "react-native-wallet-manager";

type WalletNativeError = Error & { code?: string };

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_PASS:
    "Apple could not read this pass. The Pass Type ID or signing certificate may not match your app.",
  HTTP_ERROR: "The server could not generate your pass. Try again in a moment.",
  NETWORK_ERROR: "Could not reach the server. Check your connection and retry.",
  INVALID_DATA: "The server returned an empty pass file.",
  INVALID_URL: "Pass download URL is invalid.",
  NO_VIEW_CONTROLLER: "Could not open Wallet from this screen. Try again.",
  CONTROLLER_ERROR: "Apple Wallet could not open. Try again.",
  PASS_ALREADY_EXISTS: "This pass is already in your Wallet.",
};

function walletErrorMessage(error: unknown): string | null {
  const e = error as WalletNativeError;
  const code = e?.code ?? "";
  if (code === "USER_CANCELLED") return null;
  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  if (e?.message?.trim()) return e.message.trim();
  return "Could not add pass to Apple Wallet.";
}

export async function canAddAppleWalletPass(): Promise<boolean> {
  if (Platform.OS !== "ios") return false;
  try {
    return await WalletManager.canAddPasses();
  } catch {
    return false;
  }
}

/**
 * Download a signed .pkpass from the API (with auth) and present Apple's add-pass sheet.
 * Uses native URLSession + PKAddPassesViewController — no file:// Linking hacks.
 */
export async function addPassToAppleWallet(
  passUrl: string,
  authToken: string
): Promise<void> {
  if (Platform.OS !== "ios") {
    throw new Error("Apple Wallet is only available on iOS.");
  }

  const canAdd = await WalletManager.canAddPasses();
  if (!canAdd) {
    throw new Error("This device cannot add Wallet passes.");
  }

  try {
    await WalletManager.addPassFromUrl(passUrl, {
      Authorization: `Bearer ${authToken}`,
    });
  } catch (error) {
    const message = walletErrorMessage(error);
    if (!message) return; // user cancelled
    throw new Error(message);
  }
}
