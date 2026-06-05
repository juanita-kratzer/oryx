export default function CardLandingLoading() {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-md">
        <div className="animate-pulse rounded-2xl border border-gray-200 bg-white shadow-lg">
          <div className="aspect-[3/2] bg-gray-200" />
          <div className="space-y-3 p-5">
            <div className="h-6 w-2/3 rounded bg-gray-200" />
            <div className="h-4 w-1/2 rounded bg-gray-200" />
            <div className="mt-4 space-y-2">
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-4 w-1/2 rounded bg-gray-200" />
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <div className="h-14 rounded-xl bg-gray-200" />
          <div className="h-14 rounded-xl bg-gray-200" />
        </div>
      </div>
    </main>
  );
}
