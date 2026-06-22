"use client";

import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { SocialLinks } from "./SocialIcons";

type Cat = { id: number; slug: string; name: string };
type Link = { href: string; label: string };

export function MobileNav({
  categories,
  secondary,
  utility,
  social,
}: {
  categories: Cat[];
  secondary: Link[];
  utility: Link[];
  social: { key: string; url: string }[];
}) {
  const [open, setOpen] = useState(false);

  // Drawer açıkken arka plan kaymasın
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Menü"
        className="grid h-10 w-10 place-items-center rounded-lg text-sk-ink transition hover:bg-neutral-100"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {/* Karartma */}
      {open && <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}

      {/* Çekmece */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[85%] max-w-[340px] flex-col overflow-y-auto bg-white shadow-2xl transition-transform duration-300 lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-sk-line px-4 py-4">
          <Logo className="h-9 w-auto" />
          <button
            onClick={() => setOpen(false)}
            aria-label="Kapat"
            className="grid h-9 w-9 place-items-center rounded-lg text-sk-muted transition hover:bg-neutral-100"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Arama */}
        <form action="/ara" className="border-b border-sk-line p-4">
          <div className="flex items-center">
            <input
              name="q"
              placeholder="Haber ara…"
              autoComplete="off"
              className="w-full rounded-l-md border border-r-0 border-sk-line bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-sk-red"
            />
            <button type="submit" aria-label="Ara" className="rounded-r-md bg-sk-red px-3 py-2 text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
          </div>
        </form>

        <nav className="flex-1 px-2 py-3">
          <a
            href="/"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2.5 text-[15px] font-bold text-sk-ink transition hover:bg-neutral-50"
          >
            Anasayfa
          </a>
          {categories.map((c) => (
            <a
              key={c.id}
              href={`/kategori/${c.slug}`}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-[15px] font-bold text-sk-ink transition hover:bg-neutral-50"
            >
              {c.name}
            </a>
          ))}
          <div className="my-2 border-t border-sk-line" />
          {secondary.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-[14px] font-semibold text-sk-muted transition hover:bg-neutral-50"
            >
              {l.label}
            </a>
          ))}
          <div className="my-2 border-t border-sk-line" />
          {utility.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-[13px] font-medium text-sk-muted transition hover:bg-neutral-50"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {social.length > 0 && (
          <div className="border-t border-sk-line p-4">
            <SocialLinks
              items={social}
              itemClassName="grid h-9 w-9 place-items-center rounded-full bg-neutral-100 text-sk-muted transition hover:bg-sk-red hover:text-white"
              iconClassName="h-4 w-4"
            />
          </div>
        )}
      </aside>
    </>
  );
}
