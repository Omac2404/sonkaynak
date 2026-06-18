"use client";

import { useEffect, useRef, useState } from "react";

type MediaItem = { id: number; url?: string; alt?: string };

export function ImageField({
  label,
  fileName,
  idName,
  currentId,
  currentUrl,
  onChange,
}: {
  label: string;
  fileName: string;
  idName: string;
  currentId?: number | string | "";
  currentUrl?: string;
  onChange?: (hasImage: boolean) => void;
}) {
  const [preview, setPreview] = useState<string | undefined>(currentUrl);
  const [libId, setLibId] = useState<string>(""); // kütüphaneden seçilen id
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || items.length) return;
    setLoading(true);
    fetch("/api/media-list")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, items.length]);

  const idValue = libId !== "" ? libId : currentId ?? "";

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setPreview(URL.createObjectURL(f));
      setLibId(""); // yeni dosya seçildi → kütüphane seçimini sıfırla
      onChange?.(true);
    }
  };

  const pick = (m: MediaItem) => {
    setLibId(String(m.id));
    setPreview(m.url);
    if (fileRef.current) fileRef.current.value = ""; // varsa dosyayı temizle
    setOpen(false);
    onChange?.(true);
  };

  return (
    <div>
      {label && <span className="mb-1.5 block text-[13px] font-bold text-neutral-700">{label}</span>}
      <input type="hidden" name={idName} value={idValue} />

      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="mb-2 aspect-[16/9] w-full rounded-lg border border-neutral-200 object-cover" />
      ) : (
        <div className="mb-2 grid aspect-[16/9] w-full place-items-center rounded-lg bg-neutral-100 text-xs text-neutral-300">görsel yok</div>
      )}

      <div className="flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          name={fileName}
          accept="image/*"
          onChange={onUpload}
          className="block w-full text-xs text-neutral-500 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-xs file:font-bold hover:file:bg-neutral-200"
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 rounded-md border border-neutral-300 px-2.5 py-1.5 text-xs font-bold text-neutral-600 hover:border-sk-red hover:text-sk-red"
        >
          Kütüphane
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <div className="max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3">
              <h3 className="text-sm font-extrabold text-ink">Medya Kütüphanesi</h3>
              <button type="button" onClick={() => setOpen(false)} className="text-neutral-400 hover:text-sk-red">✕</button>
            </div>
            <div className="max-h-[65vh] overflow-y-auto p-4">
              {loading ? (
                <p className="py-10 text-center text-sm text-neutral-400">Yükleniyor…</p>
              ) : items.length === 0 ? (
                <p className="py-10 text-center text-sm text-neutral-400">Görsel yok.</p>
              ) : (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {items.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => pick(m)}
                      className="group overflow-hidden rounded-lg border-2 border-transparent hover:border-sk-red"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.url} alt={m.alt ?? ""} className="aspect-square w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
