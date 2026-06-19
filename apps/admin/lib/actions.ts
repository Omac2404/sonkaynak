"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { TOKEN_COOKIE, pf, getMe } from "./payload";

const API = process.env.PAYLOAD_URL ?? "http://localhost:3101";

/** Profil güncelle (ad + isteğe bağlı şifre). */
export async function updateProfile(formData: FormData) {
  const me = await getMe();
  if (!me) redirect("/login");
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const data: Record<string, any> = {};
  if (name) data.name = name;
  if (password) data.password = password;
  if (Object.keys(data).length) await pf(`/users/${me.id}`, { method: "PATCH", body: JSON.stringify(data) });
  revalidatePath("/profil");
  redirect("/profil?m=saved");
}

// trash destekleyen koleksiyonlar (soft-delete)
const TRASH_SLUGS = new Set(["news", "ilanlar", "firmalar", "galeriler", "vefat"]);

/** Genel silme — trash'li koleksiyonlarda çöp kutusuna taşır, değilse kalıcı siler. */
export async function deleteResource(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const id = String(formData.get("id") ?? "");
  const back = String(formData.get("back") ?? "/");
  if (slug && id) {
    if (TRASH_SLUGS.has(slug)) {
      // Soft-delete: deletedAt set → varsayılan listelerde gizlenir (FK sorunu yok)
      await pf(`/${slug}/${id}`, { method: "PATCH", body: JSON.stringify({ deletedAt: new Date().toISOString() }) });
    } else {
      await pf(`/${slug}/${id}`, { method: "DELETE" });
    }
    revalidatePath(back);
    redirect(`${back}?m=${TRASH_SLUGS.has(slug) ? "deleted" : "removed"}`);
  }
}

/** Çöp kutusundan geri yükle (deletedAt = null). */
export async function restoreResource(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const id = String(formData.get("id") ?? "");
  if (slug && id) {
    await pf(`/${slug}/${id}?trash=true`, { method: "PATCH", body: JSON.stringify({ deletedAt: null }) });
    revalidatePath("/arsiv");
  }
  redirect("/arsiv?m=restored");
}

/** Kalıcı sil (trash param'sız → hard delete). */
export async function purgeResource(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const id = String(formData.get("id") ?? "");
  if (slug && id) {
    await pf(`/${slug}/${id}`, { method: "DELETE" });
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

  // Geçici teşhis: yayınla butonunun intent'i gerçekten geliyor mu?
  console.log(`[saveNews] intent=${JSON.stringify(intent)} → _status=${_status}`);

  const data: Record<string, any> = {
    title,
    excerpt,
    body,
    _status,
    reviewState,
    author: authorVal ?? null,
    tags: tagIds,
    seo: { focusKeyword, metaDescription },
  };
  if (category) data.category = category;
  if (coverImage) data.coverImage = coverImage;

  const res = id
    ? await pf(`/news/${id}`, { method: "PATCH", body: JSON.stringify(data) })
    : await pf(`/news`, { method: "POST", body: JSON.stringify(data) });

  // Kayıt başarısızsa (örn. zorunlu kategori eksik) sessizce "kaydedildi" deme
  if (!res.ok) {
    const apiErr = res.data?.errors?.[0];
    const fieldMsg = apiErr?.data?.errors?.[0]
      ? `${apiErr.data.errors[0].label ?? apiErr.data.errors[0].path}: ${apiErr.data.errors[0].message}`
      : apiErr?.message;
    const msg = fieldMsg || "Kayıt başarısız — zorunlu alanları (özellikle Kategori) kontrol edin.";
    redirect(`${id ? `/haberler/${id}` : "/haberler/yeni"}?error=${encodeURIComponent(msg)}`);
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
  users: "/kullanicilar",
};

/** Şema-güdümlü genel kaydet (kategori/yazar/firma/ilan/galeri/vefat/kullanıcı). */
export async function saveResource(formData: FormData) {
  const slug = String(formData.get("__slug") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!slug) redirect("/");

  const numFields = new Set<string>();
  const boolFields = new Set<string>();
  const curImg: Record<string, string> = {};
  for (const k of formData.keys()) {
    if (k.startsWith("__num__")) numFields.add(k.slice(7));
    else if (k.startsWith("__bool__")) boolFields.add(k.slice(8));
    else if (k.startsWith("__cur__")) curImg[k.slice(7)] = String(formData.get(k));
  }

  const data: Record<string, any> = {};

  // Skalar alanlar
  for (const [k, v] of formData.entries()) {
    if (k.startsWith("__") || k === "id") continue;
    if (typeof v !== "string") continue;
    if (boolFields.has(k)) continue;
    data[k] = numFields.has(k) ? (v === "" ? 0 : Number(v)) : v;
  }
  // Boolean (checkbox)
  for (const b of boolFields) data[b] = formData.get(b) === "on";

  // Tekli görseller
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

  // Çoklu görseller (galeri items)
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

  // Düzenlemede boş şifreyi gönderme
  if ("password" in data && !data.password) delete data.password;
  // Boş ilişki alanını null yap (örn. roleRef)
  if (data.roleRef === "") data.roleRef = null;

  if (id) {
    await pf(`/${slug}/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  } else {
    await pf(`/${slug}`, { method: "POST", body: JSON.stringify(data) });
  }

  const back = SLUG_ROUTE[slug] ?? "/";
  revalidatePath(back);
  redirect(`${back}?m=saved`);
}

/** Haber onayı (yayına al). */
export async function approveNews(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (id) await pf(`/news/${id}`, { method: "PATCH", body: JSON.stringify({ _status: "published", reviewState: "hazirlaniyor" }) });
  revalidatePath("/onay-bekleyenler");
  redirect("/onay-bekleyenler?m=approved");
}

/** Toplu haber onayı. */
export async function bulkApproveNews(formData: FormData) {
  const ids = formData.getAll("ids").map(String).filter(Boolean);
  for (const id of ids)
    await pf(`/news/${id}`, { method: "PATCH", body: JSON.stringify({ _status: "published", reviewState: "hazirlaniyor" }) });
  revalidatePath("/onay-bekleyenler");
  redirect("/onay-bekleyenler?m=approved");
}

/** Toplu kayıt silme. */
export async function bulkDeleteResource(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const back = String(formData.get("back") ?? "/");
  const ids = formData.getAll("ids").map(String).filter(Boolean);
  const isTrash = TRASH_SLUGS.has(slug);
  for (const id of ids) {
    if (isTrash) {
      await pf(`/${slug}/${id}`, { method: "PATCH", body: JSON.stringify({ deletedAt: new Date().toISOString() }) });
    } else {
      await pf(`/${slug}/${id}`, { method: "DELETE" });
    }
  }
  revalidatePath(back);
  redirect(`${back}?m=deleted`);
}

/** Haber reddi. */
export async function rejectNews(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (id) await pf(`/news/${id}`, { method: "PATCH", body: JSON.stringify({ reviewState: "reddedildi" }) });
  revalidatePath("/onay-bekleyenler");
  redirect("/onay-bekleyenler?m=rejected");
}

/* ── Kürasyon (Global'ler) ── */

/** Sıralı ilişki listesi (Manşet/Sıcak Gündem/Ana Menü). */
export async function saveCuration(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const relKey = String(formData.get("relKey") ?? "news");
  const route = String(formData.get("route") ?? "/");
  let ids: number[] = [];
  try {
    ids = JSON.parse(String(formData.get("ids") ?? "[]"));
  } catch {}
  const items = ids.map((id) => ({ [relKey]: id }));
  await pf(`/globals/${slug}`, { method: "POST", body: JSON.stringify({ items }) });
  revalidatePath(route);
  redirect(`${route}?m=saved`);
}

/** Kategori Vitrini — 5 slot. */
export async function saveVitrin(formData: FormData) {
  const slots: any[] = [];
  for (let i = 0; i < 5; i++) {
    const c = Number(formData.get(`cat${i}`));
    if (!c) continue;
    const p = Number(formData.get(`pin${i}`));
    slots.push({ category: c, ...(p ? { pinnedNews: p } : {}) });
  }
  await pf(`/globals/vitrin`, { method: "POST", body: JSON.stringify({ slots }) });
  revalidatePath("/vitrin");
  redirect("/vitrin?m=saved");
}

/** Kayan şeritler (Ticker). */
export async function saveTicker(formData: FormData) {
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
  await pf(`/globals/ticker`, { method: "POST", body: JSON.stringify(data) });
  revalidatePath("/ticker");
  redirect("/ticker?m=saved");
}

/** Medya: çoklu görsel yükle. */
export async function uploadMediaFiles(formData: FormData) {
  const files = (formData.getAll("files") as File[]).filter((f) => f && typeof f === "object" && f.size > 0);
  let ok = 0;
  let fail = 0;
  for (const f of files) {
    const id = await uploadMedia(f);
    if (id) ok++;
    else fail++;
  }
  revalidatePath("/medya");
  // Gerçekten yüklenip yüklenmediğini bildir (sahte "yüklendi" toast'ı yok)
  redirect(fail > 0 ? `/medya?m=uploaderror&ok=${ok}&fail=${fail}` : "/medya?m=uploaded");
}

/** Medya: sil. */
export async function deleteMedia(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (id) await pf(`/media/${id}`, { method: "DELETE" });
  revalidatePath("/medya");
  redirect("/medya?m=removed");
}

/** Story'leri seçilen haberlerle eşitle (sil + yeniden oluştur). */
export async function saveStories(formData: FormData) {
  let ids: number[] = [];
  try {
    ids = JSON.parse(String(formData.get("ids") ?? "[]"));
  } catch {}
  const existing = await pf("/stories?limit=200&depth=0");
  for (const s of existing.data?.docs ?? []) await pf(`/stories/${s.id}`, { method: "DELETE" });
  let order = 0;
  for (const nid of ids) await pf("/stories", { method: "POST", body: JSON.stringify({ news: nid, order: order++ }) });
  revalidatePath("/storyler");
  redirect("/storyler?m=saved");
}

/** Rol oluştur/güncelle (dinamik roller). */
export async function saveRole(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const permissions = formData.getAll("perms").map(String).filter(Boolean);
  if (!label) redirect("/roller?error=eksik");

  if (id) {
    // Mevcut rol: yalnız label + izinler güncellenir (name/isSystem korunur)
    await pf(`/roles/${id}`, { method: "PATCH", body: JSON.stringify({ label, permissions }) });
  } else {
    if (!name) redirect("/roller?error=eksik");
    await pf(`/roles`, { method: "POST", body: JSON.stringify({ name, label, permissions, isSystem: false }) });
  }
  revalidatePath("/roller");
  redirect("/roller?m=saved");
}

/** Rol sil (sistem rolleri silinemez). */
export async function deleteRole(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (id) {
    const r = await pf(`/roles/${id}`);
    if (!r.data?.isSystem) await pf(`/roles/${id}`, { method: "DELETE" });
  }
  revalidatePath("/roller");
  redirect("/roller?m=removed");
}

/** Site Ayarları. */
export async function saveSettings(formData: FormData) {
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
  const file = formData.get("__img__logo") as File | null;
  if (file && typeof file === "object" && file.size > 0) {
    const mid = await uploadMedia(file);
    if (mid) data.logo = mid;
  } else {
    const cur = Number(formData.get("__cur__logo"));
    if (cur) data.logo = cur;
  }
  await pf(`/globals/site-settings`, { method: "POST", body: JSON.stringify(data) });
  revalidatePath("/ayarlar");
  redirect("/ayarlar?m=saved");
}
