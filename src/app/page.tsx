import Link from "next/link";

export const metadata = {
  title: "Oryx — Digital Cards for Apple Wallet",
  description: "Create beautiful digital cards for Apple Wallet. $5 per card. No subscriptions.",
};

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Oryx
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Create beautiful digital cards for Apple Wallet.
          <br />
          $5 per card. No subscriptions. Yours forever.
        </p>

        <div className="mt-10">
          {/* Replace with App Store link once published */}
          <a
            href="#"
            className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-8 py-4 text-lg font-medium text-white hover:bg-gray-800"
          >
            Download on the App Store
          </a>
        </div>

        <div className="mt-16 grid gap-4 text-left sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="font-semibold text-gray-900">5 Template Styles</p>
            <p className="mt-1 text-sm text-gray-600">Business, membership, gift, contact, and booking cards</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="font-semibold text-gray-900">Apple Wallet</p>
            <p className="mt-1 text-sm text-gray-600">Add your card directly to Wallet with one tap</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="font-semibold text-gray-900">NFC Ready</p>
            <p className="mt-1 text-sm text-gray-600">Write to any NFC tag — people tap and see your card</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="font-semibold text-gray-900">Edit Anytime</p>
            <p className="mt-1 text-sm text-gray-600">Update your details for free. Your card stays current.</p>
          </div>
        </div>

        <p className="mt-12 text-sm text-gray-400">
          <Link href="/help" className="hover:text-gray-600">Help</Link>
          {" · "}
          <Link href="/help/nfc" className="hover:text-gray-600">NFC Guide</Link>
        </p>
      </div>
    </main>
  );
}
