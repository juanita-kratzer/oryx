import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export type VerificationRecord = {
  id: string;
  email: string;
  codeHash: string;
  expiresAt: string;
  verified: boolean;
  attempts: number;
  createdAt: string;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "email-verification-codes.json");

async function readAll(): Promise<VerificationRecord[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as VerificationRecord[];
  } catch {
    return [];
  }
}

async function writeAll(records: VerificationRecord[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(records, null, 2), "utf8");
}

export async function createVerificationCode(data: {
  email: string;
  codeHash: string;
  expiresAt: Date;
}): Promise<VerificationRecord> {
  const records = await readAll();
  const record: VerificationRecord = {
    id: randomUUID(),
    email: data.email,
    codeHash: data.codeHash,
    expiresAt: data.expiresAt.toISOString(),
    verified: false,
    attempts: 0,
    createdAt: new Date().toISOString(),
  };
  records.push(record);
  await writeAll(records);
  return record;
}

export async function countRecentSends(email: string, since: Date): Promise<number> {
  const records = await readAll();
  return records.filter(
    (r) => r.email === email && new Date(r.createdAt) >= since
  ).length;
}

export async function findLatestUnverified(
  email: string
): Promise<VerificationRecord | null> {
  const records = await readAll();
  const matches = records
    .filter((r) => r.email === email && !r.verified)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return matches[0] ?? null;
}

export async function markVerified(id: string): Promise<void> {
  const records = await readAll();
  const index = records.findIndex((r) => r.id === id);
  if (index >= 0) {
    records[index] = { ...records[index], verified: true };
    await writeAll(records);
  }
}

export async function incrementAttempts(id: string): Promise<void> {
  const records = await readAll();
  const index = records.findIndex((r) => r.id === id);
  if (index >= 0) {
    records[index] = {
      ...records[index],
      attempts: records[index].attempts + 1,
    };
    await writeAll(records);
  }
}

export async function deleteRecord(id: string): Promise<void> {
  const records = await readAll();
  await writeAll(records.filter((r) => r.id !== id));
}
