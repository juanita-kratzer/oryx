import { Platform } from "react-native";
import NfcManager, { NfcTech, Ndef } from "react-native-nfc-manager";

export async function isNfcWriteAvailable(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    return await NfcManager.isSupported();
  } catch {
    return false;
  }
}

/**
 * Write the card URL to a blank NFC tag (NTAG213/215/216). Requires a physical tag.
 */
export async function writeUrlToNfcTag(url: string): Promise<{ ok: boolean; error?: string }> {
  if (Platform.OS === "web") {
    return { ok: false, error: "NFC writing is only available on a phone." };
  }

  try {
    await NfcManager.start();
    await NfcManager.requestTechnology(NfcTech.Ndef, {
      alertMessage: "Hold your phone near the NFC tag to write your card link.",
    });

    const bytes = Ndef.encodeMessage([Ndef.uriRecord(url)]);
    if (!bytes) {
      return { ok: false, error: "Could not encode the URL for this tag." };
    }

    await NfcManager.ndefHandler.writeNdefMessage(bytes);
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not write to the tag.";
    return { ok: false, error: message };
  } finally {
    try {
      await NfcManager.cancelTechnologyRequest();
    } catch {
      // ignore
    }
  }
}
