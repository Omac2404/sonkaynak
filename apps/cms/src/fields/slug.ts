import type { Field } from "payload";

const TR = ["ş", "ğ", "ü", "ö", "ı", "ç", "İ", "Ş", "Ğ", "Ü", "Ö", "Ç"];
const LAT = ["s", "g", "u", "o", "i", "c", "i", "s", "g", "u", "o", "c"];

export function slugify(input: string): string {
  let s = input ?? "";
  TR.forEach((ch, i) => {
    s = s.split(ch).join(LAT[i]);
  });
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

/**
 * Kaynak alandan otomatik slug üreten alan.
 * Boş bırakılırsa `source` alanından türetir; elle yazılırsa onu temizler.
 */
export const slugField = (source = "title"): Field[] => [
  {
    name: "slug",
    label: "Slug (URL)",
    type: "text",
    index: true,
    unique: true,
    admin: {
      position: "sidebar",
      description: "Boş bırakılırsa başlıktan otomatik üretilir.",
    },
    hooks: {
      beforeValidate: [
        ({ value, data }) => {
          if (value) return slugify(String(value));
          if (data?.[source]) return slugify(String(data[source]));
          return value;
        },
      ],
    },
  },
];
