import Link from "next/link";

export const metadata = {
  title: "NFC setup guide",
  description: "How to program NFC tags for your digital card. What tags to buy, how to write the URL on iPhone and Android, and common issues.",
  openGraph: {
    title: "NFC setup guide | Oryx - Apple Wallet Cards",
    description: "How to program NFC tags for your digital card. iPhone and Android instructions.",
  },
};

export default function NFCHelpPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <Link href="/" className="text-gray-600 hover:text-gray-900">
        ← Home
      </Link>
      <h1 className="mt-6 text-3xl font-bold text-gray-900">NFC setup guide</h1>
      <p className="mt-2 text-gray-600">
        How to program an NFC tag so it opens your card when tapped.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-gray-900">What NFC tags to buy</h2>
        <p className="mt-2 text-gray-600">
          Use NTAG213, NTAG215, or NTAG216 (or compatible). They are cheap and work with iPhone and Android.
          Avoid tags that are read-only or locked. Stick-on or card-style tags both work.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-gray-900">How to write the URL on iPhone</h2>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-gray-600">
          <li>Open the <strong>Shortcuts</strong> app.</li>
          <li>Create a new shortcut or use Automation.</li>
          <li>Add action: <strong>NFC</strong> → <strong>Scan NFC Tag</strong> (or set up an automation that runs when you scan a tag).</li>
          <li>When prompted, hold your iPhone to the tag to link it.</li>
          <li>Add action: <strong>Open URL</strong> and paste your card URL (e.g. https://yourapp.com/c/your-slug).</li>
          <li>Run the shortcut once and hold the phone to the tag to write.</li>
        </ol>
        <p className="mt-4 text-sm text-gray-500">
          [Screenshot placeholder: Shortcuts app NFC + Open URL]
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-gray-900">How to write the URL on Android</h2>
        <p className="mt-2 text-gray-600">
          Use an NFC writing app such as &quot;NFC Tools&quot; or &quot;TagWriter&quot;. Open the app, choose &quot;Write&quot;,
          add a record type &quot;URL/URI&quot;, paste your card URL, then hold the phone to the tag to write.
        </p>
        <p className="mt-4 text-sm text-gray-500">
          [Screenshot placeholder: NFC Tools write URL]
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-gray-900">Common issues</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-600">
          <li><strong>Tag not detected:</strong> Hold the phone flat against the tag for 1–2 seconds. Try the other side of the tag.</li>
          <li><strong>Wrong URL opens:</strong> Re-write the tag with the correct card URL (no typos, include https://).</li>
          <li><strong>iPhone asks to run shortcut:</strong> You can enable &quot;Run without asking&quot; for that automation so the URL opens directly.</li>
        </ul>
      </section>

      <p className="mt-10">
        <Link href="/dashboard" className="text-indigo-600 hover:underline">
          Back to dashboard
        </Link>
      </p>
    </main>
  );
}
