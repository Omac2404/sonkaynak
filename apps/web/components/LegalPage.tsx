export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated?: string;
  intro?: string;
  sections: { h: string; p: string[] }[];
}) {
  return (
    <div className="mx-auto max-w-[820px] px-4 py-10">
      <h1 className="mb-2 text-3xl font-black text-sk-ink">{title}</h1>
      {updated && <p className="mb-6 text-sm text-neutral-400">Son güncelleme: {updated}</p>}
      {intro && <p className="mb-6 text-[15px] leading-relaxed text-neutral-700">{intro}</p>}
      <div className="space-y-6">
        {sections.map((s, i) => (
          <section key={i}>
            <h2 className="mb-2 text-lg font-black text-sk-ink">{s.h}</h2>
            {s.p.map((para, j) => (
              <p key={j} className="mb-2 text-[15px] leading-relaxed text-neutral-700">
                {para}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
