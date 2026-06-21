import Link from "next/link";

export const metadata = {
  title: "Oryx",
  description: "Digital cards for Apple Wallet.",
};

export default function HomePage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-gray-900">Oryx</h1>
      <p className="mt-2 text-gray-600">Digital cards for Apple Wallet.</p>
      <Link
        href="/exchanges"
        className="mt-8 inline-block rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
      >
        Exchanges dashboard
      </Link>
    </main>
  );
}
