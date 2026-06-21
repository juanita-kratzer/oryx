export async function isNfcWriteAvailable(): Promise<boolean> {
  return false;
}

export async function writeUrlToNfcTag(_url: string): Promise<{ ok: boolean; error?: string }> {
  return {
    ok: false,
    error: "Use the Oryx app on your phone to write NFC tags. Web preview cannot access NFC hardware.",
  };
}
