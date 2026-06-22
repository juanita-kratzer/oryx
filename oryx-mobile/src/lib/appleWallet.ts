import { Platform } from "react-native";
import WalletManager from "react-native-wallet-manager";

function stripFileScheme(uri: string): string {
  return uri.startsWith("file://") ? uri.slice(7) : uri;
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
 * Present Apple's native "Add to Wallet" sheet for a downloaded .pkpass file.
 */
export async function presentAppleWalletPass(fileUri: string): Promise<void> {
  if (Platform.OS !== "ios") {
    throw new Error("Apple Wallet is only available on iOS.");
  }

  const canAdd = await WalletManager.canAddPasses();
  if (!canAdd) {
    throw new Error("This device cannot add Wallet passes.");
  }

  const filePath = stripFileScheme(fileUri);
  const added = await WalletManager.showAddPassControllerFromFile(filePath);
  if (added === false) {
    // User dismissed the sheet — not an error.
    return;
  }
}
