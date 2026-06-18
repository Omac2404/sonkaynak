"use client";

import { useState } from "react";
import { HeroCard, GridCard } from "./NewsCard";
import { categoryUrl, type News, type Category } from "@/lib/shared";

type Slot = { category: Category; featured?: News; rest: News[] };

export function VitrinTabs({ slots }: { slots: Slot[] }) {
  const valid = slots.filter((s) => s.featured);
  const [active, setActive] = useState(0);
  if (!valid.length) return null;
  const cur = valid[Math.min(active, valid.length - 1)];

  return (
    <section className="mt-12">
      <div className="mb-5 flex flex-wrap items-center gap-1 border-b-2 border-sk-line">
        {valid.map((s, i) => (
          <button
            key={s.category.id}
            onClick={() => setActive(i)}
            className={`-mb-0.5 border-b-[3px] px-4 py-2.5 text-sm font-extrabold uppercase tracking-wide transition ${
              i === active ? "border-sk-red text-sk-red" : "border-transparent text-sk-muted hover:text-sk-ink"
            }`}
          >
            {s.category.name}
          </button>
        ))}
        <a href={categoryUrl(cur.category)} className="ml-auto pb-2 text-xs font-bold text-sk-red hover:underline">
          Tümü →
        </a>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <HeroCard news={cur.featured!} />
        <div className="grid grid-cols-2 gap-4 self-start">
          {cur.rest.map((n) => (
            <GridCard key={n.id} news={n} />
          ))}
        </div>
      </div>
    </section>
  );
}
