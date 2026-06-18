import { pf } from "@/lib/payload";
import { SubmitButton } from "@/components/SubmitButton";
import { ConfirmSubmit } from "@/components/ConfirmSubmit";
import { saveRole, deleteRole } from "@/lib/actions";
import { SECTION_GROUPS } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const inputCls = "w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm outline-none focus:border-sk-red focus:ring-4 focus:ring-sk-red/10";

export default async function RollerPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  const res = await pf("/roles?limit=100&sort=-isSystem&depth=0");
  const roles: any[] = res.data?.docs ?? [];
  const editing = edit ? roles.find((r) => String(r.id) === edit) : null;
  const editPerms: string[] = editing?.permissions ?? [];
  const isAll = editPerms.includes("*");

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-5 text-2xl font-black tracking-tight text-ink">Roller</h1>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Rol listesi */}
        <div className="space-y-2">
          <a href="/roller" className="block rounded-lg border border-dashed border-neutral-300 px-4 py-2.5 text-center text-sm font-bold text-sk-red hover:bg-red-50">
            + Yeni Rol
          </a>
          {roles.map((r) => (
            <div key={r.id} className={`sk-card flex items-center justify-between p-3 ${String(r.id) === edit ? "ring-2 ring-sk-red" : ""}`}>
              <div>
                <div className="text-sm font-bold text-ink">
                  {r.label}
                  {r.isSystem && <span className="ml-2 rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold text-neutral-500">SİSTEM</span>}
                </div>
                <div className="text-[11px] text-neutral-400">
                  {r.permissions?.includes("*") ? "Tüm izinler" : `${r.permissions?.length ?? 0} izin`}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <a href={`/roller?edit=${r.id}`} className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-bold text-neutral-600 hover:border-sk-red hover:text-sk-red">
                  Düzenle
                </a>
                {!r.isSystem && (
                  <form action={deleteRole}>
                    <input type="hidden" name="id" value={r.id} />
                    <ConfirmSubmit message={`"${r.label}" rolünü silmek istediğinize emin misiniz?`} className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-bold text-neutral-500 hover:border-red-300 hover:bg-red-50 hover:text-sk-red">
                      Sil
                    </ConfirmSubmit>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <form action={saveRole} className="sk-card space-y-5 p-5">
          <input type="hidden" name="id" value={editing?.id ?? ""} />
          <h2 className="text-base font-extrabold text-ink">{editing ? `Rolü Düzenle: ${editing.label}` : "Yeni Rol"}</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-bold text-neutral-700">Anahtar (slug)</span>
              <input name="name" defaultValue={editing?.name ?? ""} readOnly={Boolean(editing)} placeholder="ornek_rol" className={`${inputCls} ${editing ? "bg-neutral-100" : ""}`} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-bold text-neutral-700">Görünen Ad</span>
              <input name="label" defaultValue={editing?.label ?? ""} placeholder="Örnek Rol" className={inputCls} />
            </label>
          </div>

          {isAll && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
              Bu rol tüm izinlere sahip (*). Aşağıdan tek tek izin seçerek sınırlandırabilirsiniz.
            </p>
          )}

          <div>
            <span className="mb-2 block text-[13px] font-bold text-neutral-700">İzinler</span>
            <div className="grid gap-4 sm:grid-cols-2">
              {SECTION_GROUPS.map((g) => (
                <div key={g.title} className="rounded-lg border border-neutral-200 p-3">
                  <div className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-neutral-400">{g.title}</div>
                  <div className="space-y-1.5">
                    {g.perms.map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" name="perms" value={key} defaultChecked={isAll || editPerms.includes(key)} className="h-4 w-4 accent-sk-red" />
                        <span className="text-neutral-600">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <SubmitButton className="rounded-lg bg-sk-red px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-sk-red-dark disabled:opacity-60">Kaydet</SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
