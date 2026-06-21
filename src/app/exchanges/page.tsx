"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Exchange = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  company: string | null;
  jobTitle: string | null;
  notes: string | null;
  createdAt: string;
  card: { business: string | null; name: string | null; slug: string };
};

export default function ExchangesPage() {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState("");

  const load = useCallback(async (authToken?: string) => {
    setLoading(true);
    setError(null);
    try {
      const headers: HeadersInit = {};
      if (authToken) headers.Authorization = `Bearer ${authToken}`;
      const res = await fetch("/api/exchanges", { headers });
      if (!res.ok) {
        if (res.status === 401) {
          setError("Sign in required. Paste your app session token below to load exchanges.");
          setExchanges([]);
          return;
        }
        throw new Error("Could not load exchanges");
      }
      const data = await res.json();
      setExchanges(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? sessionStorage.getItem("oryx_api_token") : null;
    if (saved) {
      setToken(saved);
      load(saved);
    } else {
      load();
    }
  }, [load]);

  const handleTokenSubmit = () => {
    sessionStorage.setItem("oryx_api_token", token.trim());
    load(token.trim());
  };

  const exportCsv = async () => {
    const authToken = token.trim() || sessionStorage.getItem("oryx_api_token");
    const headers: HeadersInit = {};
    if (authToken) headers.Authorization = `Bearer ${authToken}`;
    const res = await fetch("/api/exchanges/export", { headers });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "oryx-exchanges.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exchanges</h1>
          <p className="text-sm text-gray-600">
            Contacts shared back from your public business card pages.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={exportCsv}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Export CSV
          </button>
          <Link href="/" className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white">
            Home
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {error}
        </div>
      )}

      {error && (
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Paste Firebase ID token from mobile app"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <button
            type="button"
            onClick={handleTokenSubmit}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
          >
            Load
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-gray-600">Loading…</p>
      ) : exchanges.length === 0 ? (
        <p className="text-gray-600">No exchanges yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Job title</th>
                <th className="px-4 py-3">Card</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {exchanges.map((e) => (
                <tr key={e.id} className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium">{e.name}</td>
                  <td className="px-4 py-3">{e.phone ?? "—"}</td>
                  <td className="px-4 py-3">{e.email ?? "—"}</td>
                  <td className="px-4 py-3">{e.company ?? "—"}</td>
                  <td className="px-4 py-3">{e.jobTitle ?? "—"}</td>
                  <td className="px-4 py-3">
                    {e.card.business || e.card.name || e.card.slug}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(e.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate">{e.notes ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
