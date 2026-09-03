"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { TOKEN_COOKIE, pf, getMe } from "./payload";
import { mediaUrl } from "./media";
import * as fk from "./faker";

const API = process.env.PAYLOAD_URL ?? "http://localhost:3101";

/** pf() sonucundan okunabilir hata mesajı çıkarır. */
function firstErr(res: { data?: any }): string {
  const e = res?.data?.errors?.[0];
  const f = e?.data?.errors?.[0];
  return (f ? `${f.label ?? f.path}: ${f.message}` : e?.message) || "İşlem başarısız oldu";
}
/** İşlem başarısızsa hata mesajıyla geri yönlendir (redirect fırlatır). */
function failRedirect(route: string, res: { ok: boolean; data?: any }): void {
  const sep = route.includes("?") ? "&" : "?";
  redirect(`${route}${sep}m=error&msg=${encodeURIComponent(firstErr(res))}`);
}
/** Belirli rollerden biri değilse engelle (getMe ile). */
async function requireRole(roles: string[]): Promise<{ id: number; role: string }> {
  const me = await getMe();
  if (!me) redirect("/login");
  if (!roles.includes(me.role)) redirect("/?m=forbidden");
  return me as { id: number; role: string };
}
const EDITORIAL = ["admin", "editor", "editor_limited"];
const SENIOR = ["admin", "editor"];
const ADMIN_ONLY = ["admin"];

/** Profil güncelle (ad + isteğe bağlı şifre). */
export async function updateProfile(formData: FormData) {
  const me = await getMe();
  if (!me) redirect("/login");
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const data: Record<string, any> = {};
  if (name) data.name = name;
  if (password) data.password = password;
  if (Object.keys(data).length) {
    const res = await pf(`/users/${me.id}`, { method: "PATCH", body: JSON.stringify(data) });
    if (!res.ok) failRedirect("/profil", res);
  }
  revalidatePath("/profil");
  redirect("/profil?m=saved");
}

// trash destekleyen koleksiyonlar (soft-delete)
const TRASH_SLUGS = new Set(["news", "ilanlar", "firmalar", "galeriler", "vefat"]);

/** Genel silme — trash'li koleksiyonlarda çöp kutusuna taşır, değilse kalıcı siler. */
export async function deleteResource(formData: FormData) {
  await requireRole(EDITORIAL);
  const slug = String(formData.get("slug") ?? "");
  const id = String(formData.get("id") ?? "");
  const back = String(formData.get("back") ?? "/");
  if (slug && id) {
    const res = TRASH_SLUGS.has(slug)
      ? await pf(`/${slug}/${id}`, { method: "PATCH", body: JSON.stringify({ deletedAt: new Date().toISOString() }) })
      : await pf(`/${slug}/${id}`, { method: "DELETE" });
    if (!res.ok) failRedirect(back, res);
    revalidatePath(back);
    redirect(`${back}?m=${TRASH_SLUGS.has(slug) ? "deleted" : "removed"}`);
  }
  redirect(back);
}

/** Çöp kutusundan geri yükle (deletedAt = null). */
export async function restoreResource(formData: FormData) {
  await requireRole(EDITORIAL);
  const slug = String(formData.get("slug") ?? "");
  const id = String(formData.get("id") ?? "");
  if (slug && id) {
    const res = await pf(`/${slug}/${id}?trash=true`, { method: "PATCH", body: JSON.stringify({ deletedAt: null }) });
    if (!res.ok) failRedirect("/arsiv", res);
    revalidatePath("/arsiv");
  }
  redirect("/arsiv?m=restored");
}

/** Kalıcı sil (trash param'sız → hard delete). */
export async function purgeResource(formData: FormData) {
  await requireRole(EDITORIAL);
  const slug = String(formData.get("slug") ?? "");
  const id = String(formData.get("id") ?? "");
  if (slug && id) {
    const res = await pf(`/${slug}/${id}`, { method: "DELETE" });
    if (!res.ok) failRedirect("/arsiv", res);
    revalidatePath("/arsiv");
  }
  redirect("/arsiv?m=purged");
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) redirect("/login?error=missing");

  let token: string | undefined;
  try {
    const res = await fetch(`${API}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      token = data?.token;
    }
  } catch {
    redirect("/login?error=server");
  }

  if (!token) redirect("/login?error=invalid");

  (await cookies()).set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  revalidatePath("/", "layout");
  redirect("/");
}

export async function logoutAction() {
  (await cookies()).delete(TOKEN_COOKIE);
  redirect("/login");
}

/** Çok parçalı (multipart) görsel yükleme → media id döndürür. */
async function uploadMedia(file: File): Promise<number | undefined> {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  const fd = new FormData();
  fd.append("file", file, file.name);
  fd.append("alt", file.name);
  try {
    const res = await fetch(`${API}/api/media`, {
      method: "POST",
      headers: token ? { Authorization: `JWT ${token}` } : {},
      body: fd,
    });
    if (!res.ok) return undefined;
    const d = await res.json();
    return d?.doc?.id;
  } catch {
    return undefined;
  }
}

/** Metin editörü için görsel yükle → herkese açık (mutlak) URL döndürür. */
export async function uploadInlineImage(
  formData: FormData,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  const me = await getMe();
  if (!me) return { ok: false, error: "Oturum bulunamadı" };
  const file = formData.get("file") as File | null;
  if (!file || typeof file !== "object" || file.size === 0) return { ok: false, error: "Dosya yok" };
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  const fd = new FormData();
  fd.append("file", file, file.name);
  fd.append("alt", file.name);
  try {
    const res = await fetch(`${API}/api/media`, {
      method: "POST",
      headers: token ? { Authorization: `JWT ${token}` } : {},
      body: fd,
    });
    if (!res.ok) return { ok: false, error: "Yükleme başarısız" };
    const d = await res.json();
    const url = mediaUrl(d?.doc);
    return url ? { ok: true, url } : { ok: false, error: "Görsel URL'si alınamadı" };
  } catch {
    return { ok: false, error: "Bağlantı hatası" };
  }
}

/** Virgülle ayrılmış etiket adlarını bul/oluştur → id listesi. */
async function upsertTags(raw: string): Promise<number[]> {
  const names = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const ids: number[] = [];
  for (const name of names) {
    const found = await pf(`/tags?where[name][equals]=${encodeURIComponent(name)}&limit=1`);
    let id = found.data?.docs?.[0]?.id as number | undefined;
    if (!id) {
      const created = await pf(`/tags`, { method: "POST", body: JSON.stringify({ name }) });
      id = created.data?.doc?.id as number | undefined;
    }
    if (id) ids.push(id);
  }
  return ids;
}

/** Haber kaydet/güncelle (oluştur + düzenle). */
export async function saveNews(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const intent = String(formData.get("intent") ?? "draft");
  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect(id ? `/haberler/${id}?error=title` : "/haberler/yeni?error=title");

  const excerpt = String(formData.get("excerpt") ?? "");
  const body = String(formData.get("body") ?? "");
  const focusKeyword = String(formData.get("focusKeyword") ?? "");
  const metaDescription = String(formData.get("metaDescription") ?? "");
  const tagsRaw = String(formData.get("tags") ?? "");
  const category = Number(formData.get("category")) || undefined;
  const authorVal = Number(formData.get("author")) || undefined;

  // Kapak görseli: yeni dosya yüklendiyse onu kullan, yoksa mevcut
  let coverImage: number | undefined;
  const file = formData.get("cover") as File | null;
  if (file && typeof file === "object" && file.size > 0) {
    coverImage = await uploadMedia(file);
  }
  if (!coverImage) {
    const keep = Number(formData.get("currentCover"));
    if (keep) coverImage = keep;
  }

  const tagIds = await upsertTags(tagsRaw);

  let _status = "draft";
  let reviewState = "hazirlaniyor";
  if (intent === "publish") _status = "published";
  else if (intent === "submit") reviewState = "onaya_gonderildi";

  const data: Record<string, any> = {
    title,
    excerpt,
    body,
    _status,
    reviewState,
    sonDakika: formData.get("sonDakika") === "on",
    author: authorVal ?? null,
    tags: tagIds,
    seo: { focusKeyword, metaDescription },
  };
  if (category) data.category = category;
  if (coverImage) data.coverImage = coverImage;

  // Yayınlamıyorsak ?draft=true → taslak versiyonu yaz, yayındaki haberi kaldırma
  const draftQs = intent === "publish" ? "" : "?draft=true";
  const res = id
    ? await pf(`/news/${id}${draftQs}`, { method: "PATCH", body: JSON.stringify(data) })
    : await pf(`/news${draftQs}`, { method: "POST", body: JSON.stringify(data) });

  if (!res.ok) {
    const apiErr = res.data?.errors?.[0];
    const fieldMsg = apiErr?.data?.errors?.[0]
      ? `${apiErr.data.errors[0].label ?? apiErr.data.errors[0].path}: ${apiErr.data.errors[0].message}`
      : apiErr?.message;
    const msg = fieldMsg || "Kayıt başarısız — zorunlu alanları (özellikle Kategori) kontrol edin.";
    redirect(`${id ? `/haberler/${id}` : "/haberler/yeni"}?error=${encodeURIComponent(msg)}`);
  }

  // Hikayelere ekle/çıkar (editör onay kutusu) — başarısızsa kaydı bozmasın
  const newsId = id || res.data?.doc?.id;
  if (newsId) {
    const addToStory = formData.get("addToStory") === "on";
    const existing = await pf(`/stories?where[news][equals]=${newsId}&limit=1&depth=0`);
    const storyId = existing.data?.docs?.[0]?.id;
    if (addToStory && !storyId) {
      await pf(`/stories`, { method: "POST", body: JSON.stringify({ news: Number(newsId), order: 0 }) });
    } else if (!addToStory && storyId) {
      await pf(`/stories/${storyId}`, { method: "DELETE" });
    }
  }

  revalidatePath("/haberler");
  redirect("/haberler?m=saved");
}

const SLUG_ROUTE: Record<string, string> = {
  categories: "/kategoriler",
  tags: "/etiketler",
  authors: "/yazarlar",
  firmalar: "/firmalar",
  ilanlar: "/ilanlar",
  galeriler: "/galeriler",
  vefat: "/vefat",
  reklamlar: "/reklamlar",
  users: "/kullanicilar",
};

/** Şema-güdümlü genel kaydet (kategori/yazar/firma/ilan/galeri/vefat/kullanıcı). */
export async function saveResource(formData: FormData) {
  await requireRole(EDITORIAL);
  const slug = String(formData.get("__slug") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!slug) redirect("/");
  const back = SLUG_ROUTE[slug] ?? "/";
  // Kullanıcı yönetimi yalnız admin
  if (slug === "users") await requireRole(ADMIN_ONLY);

  const numFields = new Set<string>();
  const boolFields = new Set<string>();
  const curImg: Record<string, string> = {};
  for (const k of formData.keys()) {
    if (k.startsWith("__num__")) numFields.add(k.slice(7));
    else if (k.startsWith("__bool__")) boolFields.add(k.slice(8));
    else if (k.startsWith("__cur__")) curImg[k.slice(7)] = String(formData.get(k));
  }

  const data: Record<string, any> = {};

  for (const [k, v] of formData.entries()) {
    if (k.startsWith("__") || k === "id") continue;
    if (typeof v !== "string") continue;
    if (boolFields.has(k)) continue;
    data[k] = numFields.has(k) ? (v === "" ? 0 : Number(v)) : v;
  }
  for (const b of boolFields) data[b] = formData.get(b) === "on";

  for (const k of formData.keys()) {
    if (!k.startsWith("__img__")) continue;
    const name = k.slice(7);
    const file = formData.get(k) as File | null;
    if (file && typeof file === "object" && file.size > 0) {
      const mid = await uploadMedia(file);
      if (mid) data[name] = mid;
    } else if (curImg[name]) {
      data[name] = Number(curImg[name]) || curImg[name];
    }
  }

  for (const k of new Set(formData.keys())) {
    if (!k.startsWith("__imgs__")) continue;
    const name = k.slice(8);
    const files = (formData.getAll(k) as File[]).filter((f) => f && typeof f === "object" && f.size > 0);
    if (files.length) {
      const items: any[] = [];
      for (const f of files) {
        const mid = await uploadMedia(f);
        if (mid) items.push({ image: mid });
      }
      if (items.length) data[name] = items;
    }
  }

  if ("password" in data && !data.password) delete data.password;
  if (data.roleRef === "") data.roleRef = null;

  const res = id
    ? await pf(`/${slug}/${id}`, { method: "PATCH", body: JSON.stringify(data) })
    : await pf(`/${slug}`, { method: "POST", body: JSON.stringify(data) });
  if (!res.ok) failRedirect(id ? `${back}/${id}` : `${back}/yeni`, res);

  revalidatePath(back);
  redirect(`${back}?m=saved`);
}

/** Haber onayı (yayına al). */
export async function approveNews(formData: FormData) {
  await requireRole(EDITORIAL);
  const id = String(formData.get("id") ?? "");
  if (id) {
    const res = await pf(`/news/${id}`, { method: "PATCH", body: JSON.stringify({ _status: "published", reviewState: "hazirlaniyor" }) });
    if (!res.ok) failRedirect("/onay-bekleyenler", res);
  }
  revalidatePath("/onay-bekleyenler");
  redirect("/onay-bekleyenler?m=approved");
}

/** Toplu haber onayı. */
export async function bulkApproveNews(formData: FormData) {
  await requireRole(EDITORIAL);
  const ids = formData.getAll("ids").map(String).filter(Boolean);
  let failed = 0;
  for (const id of ids) {
    const res = await pf(`/news/${id}`, { method: "PATCH", body: JSON.stringify({ _status: "published", reviewState: "hazirlaniyor" }) });
    if (!res.ok) failed++;
  }
  revalidatePath("/onay-bekleyenler");
  if (failed) redirect(`/onay-bekleyenler?m=error&msg=${encodeURIComponent(`${failed} kayıt onaylanamadı`)}`);
  redirect("/onay-bekleyenler?m=approved");
}

/** Haberi hızlıca yayına al / pasife al (liste satırından tek tık). */
export async function togglePublish(formData: FormData) {
  await requireRole(EDITORIAL);
  const id = String(formData.get("id") ?? "");
  const next = String(formData.get("next") ?? "");
  const back = String(formData.get("back") ?? "/haberler");
  if (id && (next === "published" || next === "draft")) {
    // Not: ?draft=true KULLANMA — o yalnızca taslak versiyon yazar, yayındaki
    // belgeyi kaldırmaz. Ana belgeyi PATCH'leyerek gerçekten yayından kaldırıyoruz.
    const res = await pf(`/news/${id}`, { method: "PATCH", body: JSON.stringify({ _status: next }) });
    if (!res.ok) failRedirect(back, res);
  }
  revalidatePath(back);
  redirect(`${back}?m=${next === "published" ? "published" : "unpublished"}`);
}

/** Toplu kayıt silme. */
export async function bulkDeleteResource(formData: FormData) {
  await requireRole(EDITORIAL);
  const slug = String(formData.get("slug") ?? "");
  const back = String(formData.get("back") ?? "/");
  const ids = formData.getAll("ids").map(String).filter(Boolean);
  const isTrash = TRASH_SLUGS.has(slug);
  let failed = 0;
  for (const id of ids) {
    const res = isTrash
      ? await pf(`/${slug}/${id}`, { method: "PATCH", body: JSON.stringify({ deletedAt: new Date().toISOString() }) })
      : await pf(`/${slug}/${id}`, { method: "DELETE" });
    if (!res.ok) failed++;
  }
  revalidatePath(back);
  if (failed) redirect(`${back}?m=error&msg=${encodeURIComponent(`${failed} kayıt silinemedi`)}`);
  redirect(`${back}?m=deleted`);
}

/** Haber reddi. */
export async function rejectNews(formData: FormData) {
  await requireRole(EDITORIAL);
  const id = String(formData.get("id") ?? "");
  if (id) {
    const res = await pf(`/news/${id}`, { method: "PATCH", body: JSON.stringify({ reviewState: "reddedildi" }) });
    if (!res.ok) failRedirect("/onay-bekleyenler", res);
  }
  revalidatePath("/onay-bekleyenler");
  redirect("/onay-bekleyenler?m=rejected");
}

/* ── Kürasyon (Global'ler) ── */

/** Sıralı ilişki listesi (Manşet/Sıcak Gündem/Ana Menü). */
export async function saveCuration(formData: FormData) {
  await requireRole(SENIOR);
  const slug = String(formData.get("slug") ?? "");
  const relKey = String(formData.get("relKey") ?? "news");
  const route = String(formData.get("route") ?? "/");
  let ids: number[] = [];
  try {
    ids = JSON.parse(String(formData.get("ids") ?? "[]"));
  } catch {}
  const items = ids.map((id) => ({ [relKey]: id }));
  const res = await pf(`/globals/${slug}`, { method: "POST", body: JSON.stringify({ items }) });
  if (!res.ok) failRedirect(route, res);
  revalidatePath(route);
  redirect(`${route}?m=saved`);
}

/** Kategori Vitrini — 5 slot. */
export async function saveVitrin(formData: FormData) {
  await requireRole(SENIOR);
  const slots: any[] = [];
  for (let i = 0; i < 5; i++) {
    const c = Number(formData.get(`cat${i}`));
    if (!c) continue;
    const p = Number(formData.get(`pin${i}`));
    slots.push({ category: c, ...(p ? { pinnedNews: p } : {}) });
  }
  const res = await pf(`/globals/vitrin`, { method: "POST", body: JSON.stringify({ slots }) });
  if (!res.ok) failRedirect("/vitrin", res);
  revalidatePath("/vitrin");
  redirect("/vitrin?m=saved");
}

/** Kayan şeritler (Ticker). */
export async function saveTicker(formData: FormData) {
  await requireRole(SENIOR);
  const parse = (k: string) => {
    try {
      return JSON.parse(String(formData.get(k) ?? "[]"));
    } catch {
      return [];
    }
  };
  const data = {
    sonDakika: parse("sonDakika"),
    sonDakikaSpeed: Number(formData.get("sonDakikaSpeed")) || 10,
    editorSecimi: parse("editorSecimi"),
    editorSecimiSpeed: Number(formData.get("editorSecimiSpeed")) || 10,
  };
  const res = await pf(`/globals/ticker`, { method: "POST", body: JSON.stringify(data) });
  if (!res.ok) failRedirect("/ticker", res);
  revalidatePath("/ticker");
  redirect("/ticker?m=saved");
}

/** Medya: çoklu görsel yükle (giriş yapan herkes — yazar da kapak yükler). */
export async function uploadMediaFiles(formData: FormData) {
  const me = await getMe();
  if (!me) redirect("/login");
  const files = (formData.getAll("files") as File[]).filter((f) => f && typeof f === "object" && f.size > 0);
  let ok = 0;
  let fail = 0;
  for (const f of files) {
    const id = await uploadMedia(f);
    if (id) ok++;
    else fail++;
  }
  revalidatePath("/medya");
  redirect(fail > 0 ? `/medya?m=uploaderror&ok=${ok}&fail=${fail}` : "/medya?m=uploaded");
}

/** Medya: sil (editöryel). */
export async function deleteMedia(formData: FormData) {
  await requireRole(EDITORIAL);
  const id = String(formData.get("id") ?? "");
  if (id) {
    const res = await pf(`/media/${id}`, { method: "DELETE" });
    if (!res.ok) failRedirect("/medya", res);
  }
  revalidatePath("/medya");
  redirect("/medya?m=removed");
}

/** Story'leri seçilen haberlerle eşitle (sil + yeniden oluştur). */
export async function saveStories(formData: FormData) {
  await requireRole(SENIOR);
  let ids: number[] = [];
  try {
    ids = JSON.parse(String(formData.get("ids") ?? "[]"));
  } catch {}
  const existing = await pf("/stories?limit=200&depth=0");
  for (const s of existing.data?.docs ?? []) await pf(`/stories/${s.id}`, { method: "DELETE" });
  let order = 0;
  let failed = 0;
  for (const nid of ids) {
    const res = await pf("/stories", { method: "POST", body: JSON.stringify({ news: nid, order: order++ }) });
    if (!res.ok) failed++;
  }
  revalidatePath("/storyler");
  if (failed) redirect(`/storyler?m=error&msg=${encodeURIComponent(`${failed} story eklenemedi`)}`);
  redirect("/storyler?m=saved");
}

/** Rol oluştur/güncelle (yalnız admin). */
export async function saveRole(formData: FormData) {
  await requireRole(ADMIN_ONLY);
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  // "Tüm yetkiler" işaretliyse * ver; değilse seçili izinler
  const grantAll = formData.get("grantAll") === "on";
  const permissions = grantAll ? ["*"] : formData.getAll("perms").map(String).filter(Boolean);
  if (!label) redirect("/roller?error=eksik");

  if (id) {
    // Sistem rolleri düzenlenemez (yetkileri bozulmasın)
    const cur = await pf(`/roles/${id}`);
    if (cur.data?.isSystem) redirect(`/roller?m=error&msg=${encodeURIComponent("Sistem rolleri düzenlenemez")}`);
    const res = await pf(`/roles/${id}`, { method: "PATCH", body: JSON.stringify({ label, permissions }) });
    if (!res.ok) failRedirect("/roller", res);
  } else {
    if (!name) redirect("/roller?error=eksik");
    const res = await pf(`/roles`, { method: "POST", body: JSON.stringify({ name, label, permissions, isSystem: false }) });
    if (!res.ok) failRedirect("/roller", res);
  }
  revalidatePath("/roller");
  redirect("/roller?m=saved");
}

/** Rol sil (sistem rolleri silinemez, yalnız admin). */
export async function deleteRole(formData: FormData) {
  await requireRole(ADMIN_ONLY);
  const id = String(formData.get("id") ?? "");
  if (id) {
    const r = await pf(`/roles/${id}`);
    if (r.data?.isSystem) redirect(`/roller?m=error&msg=${encodeURIComponent("Sistem rolleri silinemez")}`);
    const res = await pf(`/roles/${id}`, { method: "DELETE" });
    if (!res.ok) failRedirect("/roller", res);
  }
  revalidatePath("/roller");
  redirect("/roller?m=removed");
}

/** Site Ayarları (yalnız admin). */
export async function saveSettings(formData: FormData) {
  await requireRole(ADMIN_ONLY);
  const data: Record<string, any> = {};
  for (const k of [
    "siteName",
    "siteDescription",
    "defaultCategory",
    "twitter",
    "facebook",
    "instagram",
    "youtube",
    "linkedin",
    "gaId",
    "gscVerify",
    "footerAbout",
    "footerCopyright",
  ]) {
    data[k] = String(formData.get(k) ?? "");
  }
  // Piyasa bandı: aç/kapa + elle değerler
  data.financeEnabled = formData.get("financeEnabled") === "on";
  data.financeOverride = {
    usd: String(formData.get("fin_usd") ?? ""),
    eur: String(formData.get("fin_eur") ?? ""),
    gbp: String(formData.get("fin_gbp") ?? ""),
    gold: String(formData.get("fin_gold") ?? ""),
    goldOz: String(formData.get("fin_goldOz") ?? ""),
    bist: String(formData.get("fin_bist") ?? ""),
    btc: String(formData.get("fin_btc") ?? ""),
    eth: String(formData.get("fin_eth") ?? ""),
  };
  const file = formData.get("__img__logo") as File | null;
  if (file && typeof file === "object" && file.size > 0) {
    const mid = await uploadMedia(file);
    if (mid) data.logo = mid;
  } else {
    const cur = Number(formData.get("__cur__logo"));
    if (cur) data.logo = cur;
  }
  const res = await pf(`/globals/site-settings`, { method: "POST", body: JSON.stringify(data) });
  if (!res.ok) failRedirect("/ayarlar", res);
  revalidatePath("/ayarlar");
  redirect("/ayarlar?m=saved");
}

/* ───────────────────────── Test İçerik Üreteci ───────────────────────── */
const TEST_TYPES = ["haber", "galeri", "ilan", "firma", "vefat", "story"] as const;
type TestType = (typeof TEST_TYPES)[number];

/**
 * Rastgele test içeriği üretip yayınlar (tasarımı görmek için).
 * Tür: tek bir tür ya da "hepsi"; adet 1–10.
 */
export async function generateTestContent(formData: FormData) {
  await requireRole(ADMIN_ONLY);

  const typeSel = String(formData.get("type") ?? "haber");
  let count = parseInt(String(formData.get("count") ?? "3"), 10);
  if (!Number.isFinite(count)) count = 3;
  count = Math.max(1, Math.min(10, count));

  const mediaRes = await pf("/media?limit=50&depth=0");
  const mediaIds: number[] = (mediaRes.data?.docs ?? []).map((m: any) => m.id);
  const randMedia = () => (mediaIds.length ? fk.pick(mediaIds) : undefined);

  const catRes = await pf("/categories?limit=100&depth=0");
  const catIds: number[] = (catRes.data?.docs ?? []).map((c: any) => c.id);
  if (catIds.length === 0) {
    for (const name of ["Gündem", "Ekonomi", "Spor", "Teknoloji", "Dünya"]) {
      const r = await pf("/categories", { method: "POST", body: JSON.stringify({ name }) });
      if (r.data?.doc?.id) catIds.push(r.data.doc.id);
    }
  }

  const want = (t: TestType) => typeSel === "hepsi" || typeSel === t;
  const done: Record<string, number> = {};
  const newsIds: number[] = [];
  const bump = (k: string) => (done[k] = (done[k] ?? 0) + 1);

  if (want("haber") && catIds.length) {
    for (let i = 0; i < count; i++) {
      const data: any = {
        title: fk.benzersiz(fk.baslik()),
        excerpt: fk.ozet(),
        body: fk.govdeHtml(),
        category: fk.pick(catIds),
        _status: "published",
      };
      const cover = randMedia();
      if (cover) data.coverImage = cover;
      const r = await pf("/news", { method: "POST", body: JSON.stringify(data) });
      if (r.ok && r.data?.doc?.id) {
        newsIds.push(r.data.doc.id);
        bump("haber");
      }
    }
  }

  if (want("galeri") && mediaIds.length) {
    for (let i = 0; i < count; i++) {
      const items = Array.from({ length: fk.rand(3, 8) }, () => ({ image: randMedia(), caption: fk.ozet().slice(0, 60) }));
      const data: any = {
        title: fk.benzersiz("Foto Galeri: " + fk.baslik()),
        excerpt: fk.ozet(),
        cover: randMedia(),
        items,
        _status: "published",
      };
      const r = await pf("/galeriler", { method: "POST", body: JSON.stringify(data) });
      if (r.ok) bump("galeri");
    }
  }

  if (want("ilan")) {
    for (let i = 0; i < count; i++) {
      const data: any = {
        title: fk.benzersiz("İlan: " + fk.firmaAdi()),
        body: fk.govdeHtml(),
        _status: "published",
      };
      const cover = randMedia();
      if (cover) data.coverImage = cover;
      const r = await pf("/ilanlar", { method: "POST", body: JSON.stringify(data) });
      if (r.ok) bump("ilan");
    }
  }

  if (want("firma")) {
    for (let i = 0; i < count; i++) {
      const data: any = {
        name: fk.benzersiz(fk.firmaAdi()),
        category: fk.sehir(),
        phone: fk.telefon(),
        email: "info@ornekfirma.com",
        website: "https://ornekfirma.com",
        address: fk.sehir() + ", örnek mahalle no:" + fk.rand(1, 99),
        description: fk.ozet(),
        _status: "published",
      };
      const logo = randMedia();
      if (logo) data.logo = logo;
      const r = await pf("/firmalar", { method: "POST", body: JSON.stringify(data) });
      if (r.ok) bump("firma");
    }
  }

  if (want("vefat")) {
    for (let i = 0; i < count; i++) {
      const data: any = { isim: fk.kisiAdi(), aciklama: "Vefat etmiştir. Ailesine başsağlığı dileriz.", aktif: true, order: i };
      const r = await pf("/vefat", { method: "POST", body: JSON.stringify(data) });
      if (r.ok) bump("vefat");
    }
  }

  if (want("story")) {
    let pool = newsIds;
    if (pool.length < count) {
      const ex = await pf("/news?where[_status][equals]=published&limit=20&depth=0");
      pool = [...pool, ...(ex.data?.docs ?? []).map((n: any) => n.id)];
    }
    for (let i = 0; i < count && pool.length; i++) {
      const r = await pf("/stories", { method: "POST", body: JSON.stringify({ news: fk.pick(pool), order: i }) });
      if (r.ok) bump("story");
    }
  }

  revalidatePath("/haberler");
  const summary = Object.entries(done).map(([k, v]) => `${k}:${v}`).join(",") || "yok";
  redirect(`/test-uret?m=generated&ozet=${encodeURIComponent(summary)}`);
}
