import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_PERMS } from "./permissions";

const API = process.env.PAYLOAD_URL ?? "http://localhost:3101";
export const TOKEN_COOKIE = "sk_admin_token";

type PfResult<T> = { ok: boolean; status: number; data: T };

/** Sunucu tarafı Payload REST çağrısı (token cookie'sini ekler). */
export async function pf<T = any>(path: string, init?: RequestInit): Promise<PfResult<T>> {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  let res: Response;
  try {
    res = await fetch(`${API}/api${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `JWT ${token}` } : {}),
        ...(init?.headers as Record<string, string>),
      },
      cache: "no-store",
    });
  } catch {
    return { ok: false, status: 0, data: null as T };
  }
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* boş gövde */
  }
  return { ok: res.ok, status: res.status, data };
}

/** Bir koleksiyondaki kayıt sayısı (where ham query string ile, ör. "&where[x][equals]=y"). */
export async function pfCount(slug: string, whereQs = ""): Promise<number> {
  const r = await pf(`/${slug}?limit=1&depth=0${whereQs}`);
  return r.data?.totalDocs ?? 0;
}

/** Oturum sahibi kullanıcı (geçersizse null). */
export async function getMe() {
  const r = await pf("/users/me");
  return r.ok ? (r.data?.user ?? null) : null;
}

export function apiBase() {
  return API;
}

/** Kullanıcının etkin panel izinleri: özel rol (roleRef) varsa ondan, yoksa temel rolden. */
export async function getEffectivePerms(user: any): Promise<string[]> {
  if (!user) return [];
  const ref = user.roleRef;
  const roleId = ref ? (typeof ref === "object" ? ref.id : ref) : null;
  if (roleId) {
    const r = await pf(`/roles/${roleId}`);
    const perms = r.data?.permissions;
    if (Array.isArray(perms) && perms.length) return perms;
  }
  return DEFAULT_PERMS[user.role] ?? DEFAULT_PERMS.yazar;
}
