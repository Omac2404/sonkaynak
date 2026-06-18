import { getPayload } from "payload";
import config from "@payload-config";

const newsBase = "/admin/collections/news";

async function getStats() {
  const payload = await getPayload({ config });
  const count = async (collection: any, where?: any) => {
    try {
      return (await payload.count({ collection, where, overrideAccess: true })).totalDocs;
    } catch {
      return 0;
    }
  };

  const [published, pending, drafts, authors, categories, ilanlar, firmalar, galeriler] =
    await Promise.all([
      count("news", { _status: { equals: "published" } }),
      count("news", { reviewState: { equals: "onaya_gonderildi" } }),
      count("news", { _status: { equals: "draft" } }),
      count("authors"),
      count("categories"),
      count("ilanlar"),
      count("firmalar"),
      count("galeriler"),
    ]);

  let recent: any[] = [];
  let pendingList: any[] = [];
  try {
    const r = await payload.find({
      collection: "news",
      sort: "-createdAt",
      limit: 6,
      depth: 1,
      overrideAccess: true,
    });
    recent = r.docs;
    const p = await payload.find({
      collection: "news",
      where: { reviewState: { equals: "onaya_gonderildi" } },
      sort: "-createdAt",
      limit: 5,
      depth: 1,
      overrideAccess: true,
    });
    pendingList = p.docs;
  } catch {
    /* yoksay */
  }

  return { published, pending, drafts, authors, categories, ilanlar, firmalar, galeriler, recent, pendingList };
}

const STAT_ICONS: Record<string, string> = {
  news: "📰",
  pending: "⏳",
  draft: "✏️",
  author: "✍️",
  firma: "🏢",
  galeri: "🖼️",
};

function fmt(d?: string) {
  if (!d) return "";
  try {
    return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(d));
  } catch {
    return "";
  }
}

export async function DashboardHome(props: any) {
  const s = await getStats();
  const userName = props?.user?.name ?? "Editör";
  const today = new Intl.DateTimeFormat("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());

  const stats = [
    { label: "Yayında Haber", value: s.published, icon: STAT_ICONS.news, href: `${newsBase}?where[_status][equals]=published`, accent: "#16a34a" },
    { label: "Onay Bekleyen", value: s.pending, icon: STAT_ICONS.pending, href: `${newsBase}?where[reviewState][equals]=onaya_gonderildi`, accent: "#d4141c" },
    { label: "Taslak", value: s.drafts, icon: STAT_ICONS.draft, href: `${newsBase}?where[_status][equals]=draft`, accent: "#ca8a04" },
    { label: "Yazar", value: s.authors, icon: STAT_ICONS.author, href: "/admin/collections/authors", accent: "#2563eb" },
    { label: "Firma", value: s.firmalar, icon: STAT_ICONS.firma, href: "/admin/collections/firmalar", accent: "#7c3aed" },
    { label: "Galeri", value: s.galeriler, icon: STAT_ICONS.galeri, href: "/admin/collections/galeriler", accent: "#0891b2" },
  ];

  const actions = [
    { label: "Yeni Haber", href: `${newsBase}/create`, primary: true },
    { label: "Yeni Galeri", href: "/admin/collections/galeriler/create" },
    { label: "Manşet Düzenle", href: "/admin/globals/manset" },
    { label: "Site Ayarları", href: "/admin/globals/site-settings" },
  ];

  return (
    <div className="sk-dash">
      <div className="sk-dash__head">
        <div>
          <h1 className="sk-dash__hello">Merhaba, {userName} 👋</h1>
          <p className="sk-dash__date">{today}</p>
        </div>
        <div className="sk-dash__actions">
          {actions.map((a) => (
            <a key={a.href} href={a.href} className={`sk-dash__btn ${a.primary ? "sk-dash__btn--primary" : ""}`}>
              {a.label}
            </a>
          ))}
        </div>
      </div>

      <div className="sk-dash__stats">
        {stats.map((st) => (
          <a key={st.label} href={st.href} className="sk-stat" style={{ ["--accent" as any]: st.accent }}>
            <span className="sk-stat__icon">{st.icon}</span>
            <span className="sk-stat__value">{st.value}</span>
            <span className="sk-stat__label">{st.label}</span>
          </a>
        ))}
      </div>

      <div className="sk-dash__cols">
        {/* Onay bekleyenler */}
        <section className="sk-panel">
          <div className="sk-panel__head">
            <h2>Onay Bekleyenler</h2>
            {s.pending > 0 && <span className="sk-panel__badge">{s.pending}</span>}
          </div>
          {s.pendingList.length === 0 ? (
            <p className="sk-panel__empty">Bekleyen haber yok. 🎉</p>
          ) : (
            <ul className="sk-list">
              {s.pendingList.map((n) => (
                <li key={n.id}>
                  <a href={`${newsBase}/${n.id}`}>
                    <span className="sk-list__title">{n.title}</span>
                    <span className="sk-list__meta">{n.category?.name ?? ""} · {fmt(n.createdAt)}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Son haberler */}
        <section className="sk-panel">
          <div className="sk-panel__head">
            <h2>Son Eklenen Haberler</h2>
            <a href={newsBase} className="sk-panel__link">Tümü →</a>
          </div>
          {s.recent.length === 0 ? (
            <p className="sk-panel__empty">Henüz haber yok.</p>
          ) : (
            <ul className="sk-list">
              {s.recent.map((n) => (
                <li key={n.id}>
                  <a href={`${newsBase}/${n.id}`}>
                    <span className="sk-list__title">{n.title}</span>
                    <span className="sk-list__meta">
                      <span className={`sk-dot sk-dot--${n._status === "published" ? "green" : "amber"}`} />
                      {n._status === "published" ? "Yayında" : "Taslak"} · {fmt(n.createdAt)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
