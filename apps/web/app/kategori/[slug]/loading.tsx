export default function Loading() {
  return (
    <div className="mx-auto max-w-[1360px] px-4 py-6">
      <div className="sk-img-skel mb-6 h-8 w-48 rounded" />
      <div className="sk-img-skel mb-8 aspect-[16/7] w-full rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-sk-line bg-white">
            <div className="sk-img-skel aspect-[16/9]" />
            <div className="space-y-2 p-3">
              <div className="sk-img-skel h-4 w-full rounded" />
              <div className="sk-img-skel h-4 w-2/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
