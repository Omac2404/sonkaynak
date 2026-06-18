export function Placeholder({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-black text-ink">{title}</h1>
      <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center">
        <div className="text-4xl">🚧</div>
        <p className="mt-3 font-bold text-ink">Bu bölüm yapım aşamasında</p>
        <p className="mt-1 text-sm text-neutral-500">
          {note ?? "Sonraki adımda bu ekranı tamamlayacağız."}
        </p>
      </div>
    </div>
  );
}
