"use client";

import { useEffect, useState } from "react";

type Props = {
  slug: string;
  ownerLabel: string;
};

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/.test(navigator.userAgent);
}

export function ReciprocalWalletOffer({ slug, ownerLabel }: Props) {
  const [googleNotice, setGoogleNotice] = useState(false);
  const passUrl = `/api/public/cards/${slug}/pass`;

  useEffect(() => {
    fetch(`/api/public/cards/${slug}/analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "reciprocal_pass_offer" }),
    }).catch(() => {});
  }, [slug]);

  const showApple = isIOS() || !isAndroid();
  const showGoogle = isAndroid() || !isIOS();

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="text-base font-semibold text-gray-900">
        Would you like to receive {ownerLabel}&apos;s card too?
      </h3>
      <p className="text-sm text-gray-600">
        Add their digital card to your wallet so you both leave with each other&apos;s details.
      </p>

      <div className="flex flex-col gap-2">
        {(showApple || !isAndroid()) && (
          <a
            href={passUrl}
            className="block w-full rounded-xl bg-gray-900 py-3 text-center text-sm font-semibold text-white hover:bg-gray-800"
          >
            Save to Apple Wallet
          </a>
        )}
        {(showGoogle || !isIOS()) && (
          <button
            type="button"
            onClick={() => setGoogleNotice(true)}
            className="block w-full rounded-xl border border-gray-300 bg-white py-3 text-center text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            Add to Google Wallet
          </button>
        )}
      </div>

      {googleNotice && (
        <p className="text-sm text-gray-600">
          Google Wallet support is coming soon. Use Save to Apple Wallet on iPhone, or save their
          contact above.
        </p>
      )}
    </div>
  );
}
