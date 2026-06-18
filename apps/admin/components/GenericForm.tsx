"use client";

import { useState } from "react";
import { RichEditor } from "./editor/RichEditor";
import { saveResource } from "@/lib/actions";
import { SubmitButton } from "./SubmitButton";
import { ImageField } from "./ImageField";
import { lexicalToHtml } from "@/lib/lexical";
import { mediaUrl } from "@/lib/media";
import type { FormField, FormSchema } from "@/lib/forms";

const inputCls =
  "w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-sk-red focus:ring-4 focus:ring-sk-red/10";

function Label({ field }: { field: FormField }) {
  return (
    <span className="mb-1.5 block text-[13px] font-bold text-neutral-700">
      {field.label}
      {field.required && <span className="text-sk-red"> *</span>}
    </span>
  );
}

export function GenericForm({
  schema,
  doc,
  options,
}: {
  schema: FormSchema;
  doc?: any;
  options?: Record<string, { id: number; label: string }[]>;
}) {
  const [rich, setRich] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of schema.fields) {
      if (f.type === "richtext") init[f.name] = doc?.[f.name] || (doc?.content ? lexicalToHtml(doc.content) : "");
    }
    return init;
  });
  const main = schema.fields.filter((f) => !f.side);
  const side = schema.fields.filter((f) => f.side);

  const renderField = (f: FormField) => {
    const val = doc?.[f.name];
    switch (f.type) {
      case "textarea":
        return <textarea name={f.name} rows={3} defaultValue={val ?? ""} className={inputCls} />;
      case "richtext":
        return (
          <>
            <input type="hidden" name={f.name} value={rich[f.name] ?? ""} />
            <RichEditor value={rich[f.name] ?? ""} onChange={(html) => setRich((p) => ({ ...p, [f.name]: html }))} />
          </>
        );
      case "number":
        return (
          <>
            <input type="hidden" name={`__num__${f.name}`} value="1" />
            <input type="number" name={f.name} defaultValue={val ?? 0} className={inputCls} />
          </>
        );
      case "checkbox":
        return (
          <label className="flex items-center gap-2.5">
            <input type="hidden" name={`__bool__${f.name}`} value="1" />
            <input type="checkbox" name={f.name} defaultChecked={val !== false} className="h-5 w-5 accent-sk-red" />
            <span className="text-sm text-neutral-600">Etkin</span>
          </label>
        );
      case "reldropdown": {
        const opts = options?.[f.name] ?? [];
        const dv = val && typeof val === "object" ? String(val.id) : val ? String(val) : "";
        return (
          <select name={f.name} defaultValue={dv} className={inputCls}>
            <option value="">— Yok —</option>
            {opts.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        );
      }
      case "select":
      case "status": {
        const dv = f.type === "status" ? (doc?._status ?? "published") : (val ?? "");
        return (
          <select name={f.type === "status" ? "_status" : f.name} defaultValue={dv} className={inputCls}>
            {f.type === "select" && <option value="">— Seç —</option>}
            {(f.options ?? []).map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        );
      }
      case "image": {
        return (
          <ImageField
            label=""
            fileName={`__img__${f.name}`}
            idName={`__cur__${f.name}`}
            currentId={val && typeof val === "object" ? val.id : (val ?? "")}
            currentUrl={mediaUrl(val, "card")}
          />
        );
      }
      case "images": {
        const existing = Array.isArray(val) ? val.length : 0;
        return (
          <>
            {existing > 0 && <p className="mb-2 text-xs text-neutral-500">Mevcut: {existing} fotoğraf (yeni yüklersen değiştirilir)</p>}
            <input
              type="file"
              name={`__imgs__${f.name}`}
              accept="image/*"
              multiple
              className="block w-full text-xs text-neutral-500 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-xs file:font-bold hover:file:bg-neutral-200"
            />
          </>
        );
      }
      default:
        return <input type={f.type === "password" ? "password" : "text"} name={f.name} required={f.required} defaultValue={val ?? ""} className={inputCls} />;
    }
  };

  return (
    <form action={saveResource} className="mx-auto max-w-5xl">
      <input type="hidden" name="__slug" value={schema.slug} />
      <input type="hidden" name="id" value={doc?.id ?? ""} />

      <div className="mb-5 flex items-center justify-between">
        <a href={backHref(schema.slug)} className="text-sm font-bold text-neutral-500 hover:text-sk-red">← {schema.title}</a>
        <SubmitButton className="rounded-lg bg-sk-red px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-sk-red-dark disabled:opacity-60">Kaydet</SubmitButton>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5 rounded-xl border border-neutral-200 bg-white p-5">
          {main.map((f) => (
            <div key={f.name}>
              <Label field={f} />
              {renderField(f)}
              {f.hint && <span className="mt-1 block text-[11px] text-neutral-400">{f.hint}</span>}
            </div>
          ))}
        </div>
        {side.length > 0 && (
          <div className="space-y-5 rounded-xl border border-neutral-200 bg-white p-5">
            {side.map((f) => (
              <div key={f.name}>
                <Label field={f} />
                {renderField(f)}
                {f.hint && <span className="mt-1 block text-[11px] text-neutral-400">{f.hint}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}

const SLUG_TO_ROUTE: Record<string, string> = {
  categories: "/kategoriler",
  tags: "/etiketler",
  authors: "/yazarlar",
  firmalar: "/firmalar",
  ilanlar: "/ilanlar",
  galeriler: "/galeriler",
  vefat: "/vefat",
  users: "/kullanicilar",
};
function backHref(slug: string) {
  return SLUG_TO_ROUTE[slug] ?? "/";
}
