"use client";

import { useState, Suspense } from "react";
import { Sidebar } from "./Sidebar";
import { Icon } from "./Icon";
import { ThemeToggle } from "./ThemeToggle";
import { Toaster } from "./Toaster";
import { logoutAction } from "@/lib/actions";

type User = { name?: string; email?: string; role?: string };

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  editor: "Editör",
  editor_limited: "Sınırlı Editör",
  yazar: "Yazar",
};

export function Shell({ user, perms, children }: { user: User; perms: string[]; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const initials = (user.name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen">
      <Sidebar open={open} onClose={() => setOpen(false)} perms={perms} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-white/80 px-4 backdrop-blur-md lg:px-7">
          <button
            className="grid h-9 w-9 place-items-center rounded-lg text-neutral-600 transition hover:bg-neutral-100 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Menü"
          >
            <Icon name="menu" size={20} />
          </button>

          <a
            href={process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100"}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[12.5px] font-semibold text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50 sm:flex"
          >
            Siteyi Gör ↗
          </a>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <a href="/profil" className="flex items-center gap-2.5 rounded-full border border-line py-1 pl-1 pr-3 transition hover:border-sk-red/40 hover:bg-neutral-50">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-sk-red to-sk-red-dark text-[11px] font-bold text-white">
                {initials}
              </span>
              <div className="hidden leading-tight sm:block">
                <div className="text-[13px] font-bold text-ink">{user.name}</div>
                <div className="text-[10.5px] font-semibold uppercase tracking-wide text-neutral-400">
                  {ROLE_LABEL[user.role ?? ""] ?? user.role}
                </div>
              </div>
            </a>
            <form action={logoutAction}>
              <button
                className="grid h-9 w-9 place-items-center rounded-lg text-neutral-400 transition hover:bg-red-50 hover:text-sk-red"
                title="Çıkış"
              >
                <Icon name="logout" size={18} />
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
      <Suspense fallback={null}>
        <Toaster />
      </Suspense>
    </div>
  );
}
