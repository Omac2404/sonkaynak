import { getMe } from "@/lib/payload";
import { updateProfile } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";

export const dynamic = "force-dynamic";

const inputCls = "w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm outline-none focus:border-sk-red focus:ring-4 focus:ring-sk-red/10";

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  editor: "Editör",
  editor_limited: "Sınırlı Editör",
  yazar: "Yazar",
};

export default async function ProfilPage() {
  const me = await getMe();

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-5 text-2xl font-black tracking-tight text-ink">Profilim</h1>

      <form action={updateProfile} className="sk-card space-y-5 p-6">
        <div className="flex items-center gap-3 border-b border-line pb-4">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-sk-red text-base font-bold text-white">
            {(me?.name ?? "?").split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()}
          </span>
          <div>
            <div className="font-bold text-ink">{me?.name}</div>
            <div className="text-xs font-semibold text-neutral-400">{ROLE_LABEL[me?.role ?? ""] ?? me?.role}</div>
          </div>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-[13px] font-bold text-neutral-700">Ad Soyad</span>
          <input name="name" defaultValue={me?.name ?? ""} className={inputCls} />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[13px] font-bold text-neutral-700">E-posta</span>
          <input value={me?.email ?? ""} readOnly className={`${inputCls} bg-neutral-100`} />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[13px] font-bold text-neutral-700">Yeni Şifre</span>
          <input name="password" type="password" placeholder="Değiştirmek istemiyorsan boş bırak" className={inputCls} />
        </label>

        <div className="flex justify-end">
          <SubmitButton className="rounded-lg bg-sk-red px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-sk-red-dark disabled:opacity-60">
            Kaydet
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
