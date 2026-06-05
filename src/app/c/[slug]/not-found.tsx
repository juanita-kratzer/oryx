import Link from "next/link";

export default function CardNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-gray-900">Card not found</h1>
        <p className="mt-2 text-gray-600">
          This link may be invalid or the card may have been removed.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-gray-900 px-6 py-3 text-white hover:bg-gray-800"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
