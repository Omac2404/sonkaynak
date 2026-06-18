import { pf, pfCount, getMe } from "@/lib/payload";
import { fmtDate } from "@/lib/media";

export const dynamic = "force-dynamic";

const newsBase = "/haberler";

export default async function Dashboard() {
  const me = await getMe();
  const role = me?.role ?? "yazar";
  const isEditorial = ["admin", "editor", "editor_limited"].includes(role);
  const isSenior = ["admin", "editor"].includes(role);

  const [published, pending, drafts, authors, firmalar, galeriler] = await Promise.all([
    pfCount("news", "&where[_status][equals]=published"),
    pfCount("news", "&where[reviewState][equals]=onaya_gonderildi"),
    pfCount("news", "&where[_status][equals]=draft"),
    pfCount("authors"),
    pfCount("firmalar"),
    pfCount("galeriler"),
  ]);

  const recentRes = await pf("/news?sort=-createdAt&limit=6&depth=1");
  const pendingRes = await pf("/news?where[reviewState][equals]=onaya_gonderildi&sort=-createdAt&limit=5&depth=1");
  const recent: any[] = recentRes.data?.docs ?? [];
  const pendingList: any[] = pendingRes.data?.docs ?? [];

  // Son 14 gün yayın trendi
  const since = new Date(Date.now() - 14 * 86400000).toISOString();
  const trendRes = await pf(`/news?where[publishedAt][greater_than_equal]=${since}&where[_status][equals]=published&limit=500&depth=0&sort=publishedAt`);
  const trendDocs: any[] = trendRes.data?.docs ?? [];
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86400000);
    return { key: d.toISOString().slice(0, 10), label: new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit" }).format(d), count: 0 };
  });
  for (const n of trendDocs) {
    const k = (n.publishedAt ?? "").slice(0, 10);
    const day = days.find((d) => d.key === k);
    if (day) day.count++;
  }
  const maxCount = Math.max(1, ...days.map((d) => d.count));

  const today = new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const stats = [
    { label: "Yayında Haber", value: published, href: "/haberler", accent: "#16a34a" },
    { label: "Onay Bekleyen", value: pending, href: "/onay-bekleyenler", accent: "#d4141c" },
    { label: "Taslak", value: drafts, href: "/haberler", accent: "#ca8a04" },
    { label: "Yazar", value: authors, href: "/yazarlar", accent: "#2563eb" },
    { label: "Firma", value: firmalar, href: "/firmalar", accent: "#7c3aed" },
    { label: "Galeri", value: galeriler, href: "/galeriler", accent: "#0891b2" },
  ];

  const actions = [
    { label: "Yeni Haber", href: "/haberler/yeni", primary: true, show: true },
    { label: "Manşet Düzenle", href: "/manset", show: isSenior },
    { label: "Site Ayarları", href: "/ayarlar", show: role === "admin" },
  ].filter((a) => a.show);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink">Merhaba, {me?.name ?? "Editör"} 👋</h1>
          <p className="mt-1 text-sm capitalize text-neutral-400">{today}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {actions.map((a) => (
            <a
              key={a.href}
              href={a.href}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                a.primary
                  ? "bg-sk-red text-white shadow-sm hover:bg-sk-red-dark"
                  : "border border-neutral-200 bg-white text-ink hover:bg-neutral-50"
              }`}
            >
              {a.label}
            </a>
          ))}
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <a key={s.label} href={s.href} className="sk-card sk-card-hover relative overflow-hidden p-5">
            <span
              className="mb-3 inline-block h-2 w-2 rounded-full"
              style={{ background: s.accent, boxShadow: `0 0 0 4px ${s.accent}1a` }}
            />
            <div className="text-[32px] font-extrabold leading-none tracking-tight text-ink">{s.value}</div>
            <div className="mt-2 text-[11px] font-bold uppercase tracking-wide text-neutral-400">{s.label}</div>
          </a>
        ))}
      </div>

      {/* Son 14 gün yayın trendi */}
      <section className="sk-card p-5">
        <h2 className="mb-4 text-[15px] font-extrabold tracking-tight text-ink">Son 14 Gün — Yayınlanan Haber</h2>
        <div className="flex items-end gap-1.5" style={{ height: 120 }}>
          {days.map((d) => (
            <div key={d.key} className="group flex flex-1 flex-col items-center justify-end gap-1">
              <span className="text-[10px] font-bold text-neutral-400 opacity-0 group-hover:opacity-100">{d.count}</span>
              <div
                className="w-full rounded-t bg-sk-red/80 transition hover:bg-sk-red"
                style={{ height: `${Math.max(4, (d.count / maxCount) * 96)}px` }}
                title={`${d.label}: ${d.count}`}
              />
              <span className="text-[9px] text-neutral-400">{d.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className={`grid gap-5 ${isEditorial ? "lg:grid-cols-2" : ""}`}>
        {isEditorial && (
        <Panel title="Onay Bekleyenler" badge={pending}>
          {pendingList.length === 0 ? (
            <Empty>Bekleyen haber yok 🎉</Empty>
          ) : (
            <List
              items={pendingList.map((n) => ({
                href: `/haberler/${n.id}`,
                title: n.title,
                meta: `${n.category?.name ?? ""} · ${fmtDate(n.createdAt, true)}`,
              }))}
            />
          )}
        </Panel>
        )}

        <Panel title="Son Eklenen Haberler" link={{ href: newsBase, label: "Tümü →" }}>
          {recent.length === 0 ? (
            <Empty>Henüz haber yok.</Empty>
          ) : (
            <List
              items={recent.map((n) => ({
                href: `/haberler/${n.id}`,
                title: n.title,
                meta: `${n._status === "published" ? "🟢 Yayında" : "🟡 Taslak"} · ${fmtDate(n.createdAt, true)}`,
              }))}
            />
          )}
        </Panel>
      </div>
    </div>
  );
}

function Panel({
  title,
  badge,
  link,
  children,
}: {
  title: string;
  badge?: number;
  link?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section className="sk-card p-5">
      <div className="mb-2 flex items-center gap-2">
        <h2 className="text-[15px] font-extrabold tracking-tight text-ink">{title}</h2>
        {badge ? (
          <span className="rounded-full bg-sk-red px-2 py-0.5 text-[11px] font-bold text-white">{badge}</span>
        ) : null}
        {link && (
          <a href={link.href} className="ml-auto text-xs font-bold text-sk-red">
            {link.label}
          </a>
        )}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-sm text-neutral-400">{children}</p>;
}

function List({ items }: { items: { href: string; title: string; meta: string }[] }) {
  return (
    <ul className="-mx-2">
      {items.map((it, i) => (
        <li key={i}>
          <a href={it.href} className="block rounded-lg px-2 py-2.5 transition hover:bg-neutral-50">
            <div className="truncate text-sm font-semibold text-ink">{it.title}</div>
            <div className="mt-0.5 text-[11.5px] text-neutral-400">{it.meta}</div>
          </a>
        </li>
      ))}
    </ul>
  );
}
