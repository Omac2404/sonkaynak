"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { News } from "@/lib/shared";
import { mediaUrl, newsUrl, categoryUrl, categoryColor, authorName } from "@/lib/shared";

const MAX_MORE = 4; // ilk haber dahil toplam 5

function fmtDateTime(d?: string): string {
  if (!d) return "";
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(d));
  } catch {
    return "";
  }
}

export function ContinuousReader({
  firstId,
  firstUrl,
  firstTitle,
  tagIds,
  categoryId,
}: {
  firstId: number;
  firstUrl: string;
  firstTitle: string;
  tagIds: number[];
  categoryId: number | null;
}) {
  const [items, setItems] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const loadNext = useCallback(async () => {
    if (loadingRef.current || done) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const exclude = [firstId, ...items.map((a) => a.id)];
      const params = new URLSearchParams({
        tags: tagIds.join(","),
        category: categoryId ? String(categoryId) : "",
        exclude: exclude.join(","),
      });
      const res = await fetch(`/api/next-article?${params}`);
      const data = await res.json();
      const next: News | null = data?.article ?? null;
      if (!next) {
        setDone(true);
      } else {
        setItems((prev) => {
          const arr = [...prev, next];
          if (arr.length >= MAX_MORE) setDone(true);
          return arr;
        });
      }
    } catch {
      setDone(true); // hata → sessizce dur, haber bozulmaz
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [done, firstId, items, tagIds, categoryId]);

  // Alta gelince yükle
  useEffect(() => {
    if (done) return;
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadNext();
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadNext, done]);

  // Kaydırınca URL + sekme başlığını aktif habere göre güncelle
  useEffect(() => {
    if (!items.length) return;
    const markers = Array.from(document.querySelectorAll<HTMLElement>("[data-article-url]"));
    if (!markers.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const url = (e.target as HTMLElement).dataset.articleUrl;
            const title = (e.target as HTMLElement).dataset.articleTitle;
            if (url) window.history.replaceState(null, "", url);
            if (title) document.title = title;
          }
        }
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );
    markers.forEach((m) => io.observe(m));
    return () => io.disconnect();
  }, [items.length]);

  return (
    <div>
      {/* İlk haberin URL'ini geri getirmek için üst işaretçi */}
      <div data-article-url={firstUrl} data-article-title={firstTitle} className="h-px w-full" aria-hidden />

      {items.map((a) => {
        const cover = mediaUrl(a.coverImage, "feature");
        return (
          <article key={a.id} className="mt-10 border-t-4 border-sk-red pt-8">
            {/* Ayraç işareti (URL güncelleme için) */}
            <div
              data-article-url={newsUrl(a)}
              data-article-title={a.title}
              className="mb-3 text-[11px] font-extrabold uppercase tracking-widest text-sk-red"
            >
              Sıradaki Haber
            </div>

            {a.category && (
              <a
                href={categoryUrl(a.category)}
                className="inline-block rounded px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white"
                style={{ background: categoryColor(a.category) }}
              >
                {a.category.name}
              </a>
            )}

            <h2 className="mt-3 text-[26px] font-black leading-[1.2] text-sk-ink md:text-[36px]">
              <a href={newsUrl(a)} className="hover:text-sk-red">
                {a.title}
              </a>
            </h2>

            {a.excerpt && (
              <p className="mt-3 text-lg font-medium leading-relaxed text-neutral-600 md:text-xl">{a.excerpt}</p>
            )}

            <div className="mt-4 flex items-center gap-2 border-y border-sk-line py-3 text-xs text-neutral-400">
              <span className="font-bold text-sk-ink">{a.author ? authorName(a.author) : "Son Kaynak"}</span>
              <span>·</span>
              <span>{fmtDateTime(a.publishedAt ?? a.createdAt)}</span>
            </div>

            {cover && (
              <figure className="mt-6">
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cover} alt={a.title} className="absolute inset-0 h-full w-full object-cover" />
                </div>
              </figure>
            )}

            {a.body && (
              <div
                className="sk-article-body mt-7 max-w-[760px]"
                dangerouslySetInnerHTML={{ __html: a.body.replace(/<script[\s\S]*?<\/script>/gi, "") }}
              />
            )}
          </article>
        );
      })}

      {/* Yükleme tetikleyici (görünmez) */}
      {!done && (
        <div ref={sentinel} className="py-10 text-center text-sm text-neutral-400">
          {loading ? "Sonraki haber yükleniyor…" : ""}
        </div>
      )}
    </div>
  );
}
