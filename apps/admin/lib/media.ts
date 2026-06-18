const CMS = process.env.NEXT_PUBLIC_CMS_URL ?? "http://localhost:3101";

export function mediaUrl(m: any, size?: string): string | undefined {
  if (!m || typeof m !== "object") return undefined;
  const rel = size && m.sizes?.[size]?.url ? m.sizes[size].url : m.url;
  if (!rel) return undefined;
  return rel.startsWith("http") ? rel : `${CMS}${rel}`;
}

export function fmtDate(d?: string, withTime = false): string {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    }).format(new Date(d));
  } catch {
    return "—";
  }
}
