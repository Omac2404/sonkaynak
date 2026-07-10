"use client";

import { useState } from "react";
import { GridCard } from "./NewsCard";
import type { News } from "@/lib/shared";

export function LoadMore({ categoryId, totalPages, sort = "-publishedAt" }: { categoryId: number; totalPages: number; sort?: string }) {
  const [items, setItems] = useState<News[]>([]);
  const [page, setPage] = useState(1); // sayfa 1 sunucuda render edildi
  const [loading, setLoading] = useState(false);
  const next = page + 1;
  const hasMore = next <= totalPages;

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/category-news?cat=${categoryId}&page=${next}&sort=${encodeURIComponent(sort)}`).then((x) => x.json());
      setItems((p) => [...p, ...((r.docs as News[]) ?? [])]);
      setPage(next);
    } catch {
      /* yoksay */
    } finally {
      setLoading(false);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <>
      {items.length > 0 && (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((n) => (
            <GridCard key={n.id} news={n} />
          ))}
        </div>
      )}
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={load}
            disabled={loading}
            className="rounded-lg border border-sk-line bg-white px-6 py-3 text-sm font-bold text-sk-ink transition hover:border-sk-red hover:text-sk-red disabled:opacity-60"
          >
            {loading ? "Yükleniyor…" : "Daha Fazla Yükle"}
          </button>
        </div>
      )}
    </>
  );
}
