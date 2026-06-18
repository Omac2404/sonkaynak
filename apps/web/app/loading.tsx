export default function Loading() {
  return (
    <div className="mx-auto max-w-[1240px] animate-pulse px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="aspect-[16/9] w-full rounded-xl bg-neutral-200" />
          <div className="mt-4 h-7 w-3/4 rounded bg-neutral-200" />
          <div className="mt-2 h-4 w-1/2 rounded bg-neutral-100" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-16 w-24 shrink-0 rounded-md bg-neutral-200" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 w-16 rounded bg-neutral-100" />
                <div className="h-4 w-full rounded bg-neutral-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-sk-line">
            <div className="aspect-[16/9] w-full bg-neutral-200" />
            <div className="space-y-2 p-4">
              <div className="h-3 w-16 rounded bg-neutral-100" />
              <div className="h-4 w-full rounded bg-neutral-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
