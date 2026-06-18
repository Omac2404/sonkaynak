import type { Access, FieldAccess } from "payload";

/**
 * Rol & Yetki (RBAC) yardımcıları.
 * Roller: admin > editor > editor_limited > yazar
 */

export type Role = "admin" | "editor" | "editor_limited" | "yazar";

const roleOf = (user: any): Role | null => (user?.role as Role) ?? null;

export const isAdmin = (user: any): boolean => roleOf(user) === "admin";

export const isEditorial = (user: any): boolean =>
  ["admin", "editor", "editor_limited"].includes(roleOf(user) ?? "");

/** Yayına alma / onaylama yetkisi olan roller */
export const canPublish = (user: any): boolean => isEditorial(user);

// ── Collection-level Access ──

/** Sadece giriş yapmış herkes (yazar dahil) */
export const loggedIn: Access = ({ req: { user } }) => Boolean(user);

/** Sadece editöryel kadro (admin/editor/editor_limited) */
export const editorialOnly: Access = ({ req: { user } }) => isEditorial(user);

/** Sadece admin */
export const adminOnly: Access = ({ req: { user } }) => isAdmin(user);

/**
 * Herkese açık okuma yalnızca yayınlanmış içerik için;
 * giriş yapmış kullanıcılar taslakları da görür.
 */
export const publishedOrLoggedIn: Access = ({ req: { user } }) => {
  if (user) return true;
  return {
    _status: { equals: "published" },
  };
};

// ── Field-level Access ──

/** Alanı yalnızca admin değiştirebilir */
export const adminFieldOnly: FieldAccess = ({ req: { user } }) => isAdmin(user);

/** Alanı yalnızca editöryel kadro değiştirebilir */
export const editorialFieldOnly: FieldAccess = ({ req: { user } }) =>
  isEditorial(user);
