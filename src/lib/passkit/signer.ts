/**
 * Load PassKit certificates from env (base64) and return PEM buffers for
 * passkit-generator (node-forge requires valid PEM, not Keychain bag text or raw DER).
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

const CERT_PEM =
  /-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/;
const KEY_PEM =
  /-----BEGIN (?:RSA )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA )?PRIVATE KEY-----/;

function derCertToPem(buffer: Buffer): string {
  const body = buffer
    .toString("base64")
    .match(/.{1,64}/g)
    ?.join("\n");
  if (!body) {
    throw new Error("PassKit certificate DER payload is empty");
  }
  return `-----BEGIN CERTIFICATE-----\n${body}\n-----END CERTIFICATE-----`;
}

/** Strip Keychain "Bag Attributes" wrappers; convert Apple WWDR .cer (DER) to PEM. */
function normalizeCertificatePem(buffer: Buffer): Buffer {
  const text = buffer.toString("utf8");
  const match = text.match(CERT_PEM);
  const pem = match ? match[0] : derCertToPem(buffer);
  return Buffer.from(pem, "utf8");
}

function normalizePrivateKeyPem(buffer: Buffer): Buffer {
  const text = buffer.toString("utf8");
  const match = text.match(KEY_PEM);
  if (!match) {
    throw new Error(
      "PassKit private key is not PEM. Export from Keychain as .p12 and run: openssl pkcs12 -in cert.p12 -nocerts -out key.pem -nodes"
    );
  }
  return Buffer.from(match[0], "utf8");
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
    wwdr: normalizeCertificatePem(decodeBase64(getEnv("PASSKIT_WWDR_BASE64"))),
    signerCert: normalizeCertificatePem(
      decodeBase64(getEnv("PASSKIT_CERT_BASE64"))
    ),
    signerKey: normalizePrivateKeyPem(
      decodeBase64(getEnv("PASSKIT_KEY_BASE64"))
    ),
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
