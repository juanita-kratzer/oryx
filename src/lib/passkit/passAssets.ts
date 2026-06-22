import fs from "fs";
import path from "path";

const ASSET_DIR = path.join(process.cwd(), "src/lib/passkit/assets");

/** Apple Wallet requires icon.png (+ @2x/@3x) or the pass cannot be opened on device. */
export function loadDefaultPassAssets(): Record<string, Buffer> {
  const names = [
    "icon.png",
    "icon@2x.png",
    "icon@3x.png",
    "logo.png",
    "logo@2x.png",
  ] as const;

  const buffers: Record<string, Buffer> = {};
  for (const name of names) {
    buffers[name] = fs.readFileSync(path.join(ASSET_DIR, name));
  }
  return buffers;
}
