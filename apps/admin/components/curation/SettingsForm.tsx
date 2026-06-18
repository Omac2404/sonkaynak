"use client";

import { SubmitButton } from "../SubmitButton";

import { useState } from "react";
import { saveSettings } from "@/lib/actions";
import { mediaUrl } from "@/lib/media";

const inp = "w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm outline-none focus:border-sk-red focus:ring-4 focus:ring-sk-red/10";

function F({ label, name, value, type = "text", textarea }: { label: string; name: string; value?: string; type?: string; textarea?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-bold text-neutral-700">{label}</span>
      {textarea ? (
        <textarea name={name} rows={3} defaultValue={value ?? ""} className={inp} />
      ) : (
        <input name={name} type={type} defaultValue={value ?? ""} className={inp} />
      )}
    </label>
  );
}

export function SettingsForm({ s }: { s: any }) {
  const [logoPrev, setLogoPrev] = useState<string | undefined>(mediaUrl(s?.logo, "card"));

  return (
    <form action={saveSettings} className="mx-auto max-w-4xl">
      <input type="hidden" name="__cur__logo" value={s?.logo && typeof s.logo === "object" ? s.logo.id : (s?.logo ?? "")} />

      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tight text-ink">Site Ayarları</h1>
        <SubmitButton className="rounded-lg bg-sk-red px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-sk-red-dark disabled:opacity-60">Kaydet</SubmitButton>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <section className="sk-card space-y-4 p-5">
            <h2 className="text-sm font-extrabold text-ink">Kimlik</h2>
            <F label="Site Adı" name="siteName" value={s?.siteName} />
            <F label="Site Açıklaması" name="siteDescription" value={s?.siteDescription} textarea />
            <F label="Varsayılan Kategori" name="defaultCategory" value={s?.defaultCategory} />
          </section>

          <section className="sk-card grid gap-4 p-5 sm:grid-cols-2">
            <h2 className="text-sm font-extrabold text-ink sm:col-span-2">Sosyal & Analitik</h2>
            <F label="X / Twitter" name="twitter" value={s?.twitter} />
            <F label="Facebook" name="facebook" value={s?.facebook} />
            <F label="Instagram" name="instagram" value={s?.instagram} />
            <F label="YouTube" name="youtube" value={s?.youtube} />
            <F label="LinkedIn" name="linkedin" value={s?.linkedin} />
            <F label="Google Analytics ID" name="gaId" value={s?.gaId} />
            <F label="Search Console Kodu" name="gscVerify" value={s?.gscVerify} />
          </section>

          <section className="sk-card space-y-4 p-5">
            <h2 className="text-sm font-extrabold text-ink">Footer</h2>
            <F label="Site Hakkında" name="footerAbout" value={s?.footerAbout} textarea />
            <F label="Telif Metni" name="footerCopyright" value={s?.footerCopyright} />
          </section>
        </div>

        <div className="space-y-5">
          <section className="sk-card p-5">
            <span className="mb-1.5 block text-[13px] font-bold text-neutral-700">Logo</span>
            {logoPrev ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoPrev} alt="" className="mb-2 w-full rounded-lg border border-neutral-200 object-contain" />
            ) : (
              <div className="mb-2 grid h-24 place-items-center rounded-lg bg-neutral-100 text-xs text-neutral-300">logo yok</div>
            )}
            <input
              type="file"
              name="__img__logo"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setLogoPrev(URL.createObjectURL(f));
              }}
              className="block w-full text-xs text-neutral-500 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-xs file:font-bold hover:file:bg-neutral-200"
            />
          </section>
        </div>
      </div>
    </form>
  );
}
