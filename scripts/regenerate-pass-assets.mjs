#!/usr/bin/env node
/** Regenerate src/lib/passkit/passAssets.ts from src/lib/passkit/assets/*.png */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "src/lib/passkit/assets");
const names = ["icon.png", "icon@2x.png", "icon@3x.png", "logo.png", "logo@2x.png"];

let out =
  "/** Auto-generated pass icon buffers for serverless (Vercel). Run: node scripts/regenerate-pass-assets.mjs */\n\n";

for (const n of names) {
  const b64 = fs.readFileSync(path.join(dir, n)).toString("base64");
  out += `const ${n.replace(/[@.]/g, "_")} = "${b64}";\n`;
}

out += "\nexport function loadDefaultPassAssets() {\n  return {\n";
for (const n of names) {
  out += `    "${n}": Buffer.from(${n.replace(/[@.]/g, "_")}, "base64"),\n`;
}
out += "  };\n}\n";

fs.writeFileSync(path.join(root, "src/lib/passkit/passAssets.ts"), out);
console.log("Updated src/lib/passkit/passAssets.ts");
