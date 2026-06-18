"use client";

import { usePathname } from "next/navigation";
import { navForPerms } from "@/lib/nav";
import { Icon } from "./Icon";

export function Sidebar({ open, onClose, perms }: { open: boolean; onClose: () => void; perms: string[] }) {
  const pathname = usePathname();
  const NAV = navForPerms(perms);
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <aside
        className={`sk-scroll-dark fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col overflow-y-auto bg-panel text-panel-muted transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="sticky top-0 z-10 flex h-16 items-center gap-2.5 border-b border-panel-line bg-panel px-5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-sk-red text-[13px] font-black text-white shadow-sm">
            SK
          </span>
          <span className="text-[17px] font-extrabold tracking-tight text-white">
            SON<span className="text-sk-red">KAYNAK</span>
          </span>
        </div>

        <nav className="flex-1 px-3 py-4">
          {NAV.map((group) => (
            <div key={group.title} className="mb-6 last:mb-2">
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-panel-muted/60">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`group relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                        active
                          ? "bg-white/[0.06] text-white"
                          : "text-panel-muted hover:bg-white/[0.04] hover:text-neutral-200"
                      }`}
                    >
                      {active && (
                        <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-sk-red" />
                      )}
                      <span className={active ? "text-sk-red" : "text-panel-muted/70 transition-colors group-hover:text-neutral-300"}>
                        <Icon name={item.icon} size={17} />
                      </span>
                      {item.label}
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-panel-line px-5 py-3 text-[11px] text-panel-muted/50">
          v1.0 · Son Kaynak
        </div>
      </aside>
    </>
  );
}
