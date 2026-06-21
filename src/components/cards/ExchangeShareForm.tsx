"use client";

import { useState } from "react";
import { ownerFirstName } from "@/lib/cardVisitSource";
import type { CardVisitSource } from "@/lib/cardVisitSource";
import { ReciprocalWalletOffer } from "@/components/cards/ReciprocalWalletOffer";

type Props = {
  slug: string;
  visitSource: CardVisitSource;
  ownerName: string | null;
  ownerBusiness: string | null;
  vcardHref: string;
  canSaveContact: boolean;
};

export function ExchangeShareForm({
  slug,
  visitSource,
  ownerName,
  ownerBusiness,
  vcardHref,
  canSaveContact,
}: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const ownerLabel = ownerFirstName(ownerName, ownerBusiness);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!consent) {
      setError("Please agree to share your details with the card owner.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/public/cards/${slug}/exchange`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          company,
          jobTitle,
          notes,
          consentGiven: true,
          source: visitSource,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Could not submit your details.");
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4">
        <div className="space-y-4 rounded-xl border border-green-200 bg-green-50 p-5">
          <h2 className="text-lg font-semibold text-green-900">
            Thanks for sharing your details.
          </h2>
          <p className="flex items-start gap-2 text-sm text-green-800">
            <span className="mt-0.5 font-bold" aria-hidden="true">✓</span>
            <span>Your details were sent to {ownerLabel}.</span>
          </p>
          {canSaveContact && (
            <a
              href={vcardHref}
              download={`${ownerName || ownerBusiness || "contact"}.vcf`}
              className="block w-full rounded-xl bg-gray-900 py-3 text-center text-sm font-semibold text-white hover:bg-gray-800"
            >
              Save {ownerLabel}&apos;s Contact
            </a>
          )}
        </div>

        <ReciprocalWalletOffer slug={slug} ownerLabel={ownerLabel} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
      <h2 className="text-lg font-semibold text-gray-900">Want to share your details back?</h2>
      <p className="text-sm text-gray-600">
        Send your contact info to the card owner as a lead.
      </p>

      <input
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        placeholder="Your name *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        placeholder="Mobile"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        type="tel"
      />
      <input
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
      />
      <input
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        placeholder="Company"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />
      <input
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        placeholder="Job title"
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
      />
      <textarea
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
      />

      <label className="flex items-start gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1"
        />
        <span>I agree to share these details with the card owner.</span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
      >
        {loading ? "Sending…" : "Share My Details"}
      </button>
    </form>
  );
}
