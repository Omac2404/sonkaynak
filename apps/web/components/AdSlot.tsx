import { mediaUrl } from "@/lib/shared";
import type { Ad } from "@/lib/cms";

/** Sponsorlu reklam alanı. variant: banner (geniş) veya tower (yan kule). */
export function AdSlot({
  ads,
  variant = "banner",
  className = "",
}: {
  ads: Ad[];
  variant?: "banner" | "tower";
  className?: string;
}) {
  if (!ads?.length) return null;
  return (
    <div className={className}>
      {ads.map((ad) => {
        const src = mediaUrl(ad.image, "feature");
        if (!src) return null;
        const img = (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={ad.name}
            loading="lazy"
            className={variant === "tower" ? "w-full rounded-lg" : "mx-auto max-w-full rounded-lg"}
          />
        );
        return (
          <div key={ad.id} className="mb-4 last:mb-0">
            <span className="mb-1 block text-center text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-300">
              Reklam
            </span>
            {ad.targetUrl ? (
              <a href={ad.targetUrl} target="_blank" rel="noopener sponsored nofollow">
                {img}
              </a>
            ) : (
              img
            )}
          </div>
        );
      })}
    </div>
  );
}
