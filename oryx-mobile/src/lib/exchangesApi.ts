import { getAuth } from "./firebase";

function getApiBaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_APP_URL?.trim();
  if (!url) return "";
  return url.replace(/\/$/, "");
}

export type BusinessCardExchangeLead = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  company: string | null;
  jobTitle: string | null;
  notes: string | null;
  source: string;
  createdAt: string;
  card: {
    business: string | null;
    name: string | null;
    slug: string;
  };
};

export async function fetchBusinessCardExchanges(): Promise<BusinessCardExchangeLead[]> {
  const base = getApiBaseUrl();
  if (!base) return [];

  const user = getAuth().currentUser;
  if (!user) return [];

  const token = await user.getIdToken();
  const res = await fetch(`${base}/api/exchanges`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return [];
  return res.json() as Promise<BusinessCardExchangeLead[]>;
}
