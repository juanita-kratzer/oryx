/**
 * Load PassKit certificates from env (base64) and return the object
 * expected by passkit-generator PKPass constructor.
 */

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === "") {
    throw new Error(`Missing env: ${name}`);
  }
  return v;
}

function decodeBase64(encoded: string): Buffer {
  const cleaned = encoded.replace(/\s/g, "");
  return Buffer.from(cleaned, "base64");
}

export interface PassKitCertificates {
  wwdr: Buffer;
  signerCert: Buffer;
  signerKey: Buffer;
  signerKeyPassphrase: string;
}

/**
 * Load and decode cert/key/WWDR from env. Use in buildPass.
 */
export function getPassKitCertificates(): PassKitCertificates {
  return {
    wwdr: decodeBase64(getEnv("PASSKIT_WWDR_BASE64")),
    signerCert: decodeBase64(getEnv("PASSKIT_CERT_BASE64")),
    signerKey: decodeBase64(getEnv("PASSKIT_KEY_BASE64")),
    signerKeyPassphrase: process.env.PASSKIT_KEY_PASSWORD ?? "",
  };
}

export function getPassKitIds(): {
  passTypeIdentifier: string;
  teamIdentifier: string;
  organizationName: string;
} {
  return {
    passTypeIdentifier: getEnv("PASSKIT_PASS_TYPE_ID"),
    teamIdentifier: getEnv("PASSKIT_TEAM_ID"),
    organizationName: getEnv("PASSKIT_ORG_NAME"),
  };
}
