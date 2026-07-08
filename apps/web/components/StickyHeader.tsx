"use client";

import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

type Cat = { id: number; slug: string; name: string };
type Link = { href: string; label: string };

export function StickyHeader({ categories, secondary }: { categories: Cat[]; secondary: Link[] }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 top-0 z-40 border-b border-sk-line bg-white/95 shadow-sm backdrop-blur transition-transform duration-300 ${
        show ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-[1360px] items-center gap-3 px-4 py-1.5">
        <a href="/" aria-label="Anasayfa" className="shrink-0">
          <Logo className="h-7 w-auto" />
        </a>
        <nav className="hidden flex-1 items-center gap-0.5 overflow-x-auto lg:flex">
          <a href="/" className="whitespace-nowrap px-2.5 py-1.5 text-[13px] font-bold text-sk-ink transition hover:text-sk-red">
            Anasayfa
          </a>
          {categories.map((c) => (
            <a
              key={c.id}
              href={`/kategori/${c.slug}`}
              className="whitespace-nowrap px-2.5 py-1.5 text-[13px] font-bold text-sk-ink transition hover:text-sk-red"
            >
              {c.name}
            </a>
          ))}
          {secondary.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="whitespace-nowrap px-2.5 py-1.5 text-[13px] font-semibold text-sk-muted transition hover:text-sk-red"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
          <ThemeToggle />
          <a
            href="/ara"
            aria-label="Ara"
            className="grid h-8 w-8 place-items-center rounded-lg text-sk-ink transition hover:bg-neutral-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
