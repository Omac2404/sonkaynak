export default function Loading() {
  return (
    <div className="mx-auto grid max-w-[1180px] gap-10 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <div className="sk-img-skel mb-3 h-3 w-40 rounded" />
        <div className="sk-img-skel mb-4 h-10 w-full rounded" />
        <div className="sk-img-skel mb-6 h-6 w-3/4 rounded" />
        <div className="sk-img-skel mb-6 aspect-[16/9] w-full rounded-2xl" />
        <div className="max-w-[760px] space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="sk-img-skel h-4 w-full rounded" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="sk-img-skel h-44 rounded-xl" />
        <div className="sk-img-skel h-44 rounded-xl" />
      </div>
    </div>
  );
}
