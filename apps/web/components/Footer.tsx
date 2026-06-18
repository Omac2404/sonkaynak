import { getCategories, getSettings } from "@/lib/cms";

export async function Footer() {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);

  const columns =
    settings.footerColumns && settings.footerColumns.length
      ? settings.footerColumns
      : [
          {
            title: "Haberler",
            links: categories.slice(0, 6).map((c) => ({ label: c.name, url: `/kategori/${c.slug}` })),
          },
          {
            title: "Kurumsal",
            links: [
              { label: "Hakkımızda", url: "/hakkimizda" },
              { label: "İletişim", url: "/iletisim" },
            ],
          },
        ];

  const social = [
    { url: settings.twitter, label: "X" },
    { url: settings.facebook, label: "Facebook" },
    { url: settings.instagram, label: "Instagram" },
    { url: settings.youtube, label: "YouTube" },
    { url: settings.linkedin, label: "LinkedIn" },
  ].filter((s) => s.url);

  return (
    <footer className="mt-16 border-t border-sk-line bg-sk-ink text-neutral-300">
      <div className="mx-auto max-w-[1240px] px-4 py-10">
        <div className="grid gap-8 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white">SON</span>
              <span className="text-2xl font-black text-sk-red">KAYNAK</span>
            </div>
            <p className="mt-3 max-w-md text-sm text-neutral-400">
              {settings.footerAbout ?? "Son Kaynak Haber — yeni nesil haber platformu."}
            </p>
            {social.length > 0 && (
              <div className="mt-4 flex gap-3 text-xs text-neutral-400">
                {social.map((s) => (
                  <a key={s.label} href={s.url} className="hover:text-white" target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {columns.map((col, i) => (
            <div key={i}>
              <h4 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-white">{col.title}</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                {(col.links ?? []).map((l, j) => (
                  <li key={j}>
                    <a href={l.url} className="hover:text-white">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-xs text-neutral-500">
          {settings.footerCopyright ?? `© ${new Date().getFullYear()} Son Kaynak. Tüm hakları saklıdır.`}
        </div>
      </div>
    </footer>
  );
}
