import Image from "next/image";

/**
 * Son Kaynak logosu. Açık temada renkli logo, karanlık temada K harfi kırmızı
 * kalacak şekilde beyaz varyant (public/logo-dark.png) gösterilir — CSS ile değişir.
 * variant="white": koyu zeminde daima beyaz+kırmızı-K varyantı.
 */
export function Logo({
  className = "h-10 w-auto",
  priority = false,
  variant = "color",
}: {
  className?: string;
  priority?: boolean;
  variant?: "color" | "white";
}) {
  if (variant === "white") {
    return (
      <Image src="/logo-dark.png" alt="Son Kaynak" width={1647} height={509} priority={priority} className={className} />
    );
  }
  return (
    <>
      <Image src="/logo.png" alt="Son Kaynak" width={1647} height={509} priority={priority} className={`sk-logo-l ${className}`} />
      <Image src="/logo-dark.png" alt="" aria-hidden width={1647} height={509} className={`sk-logo-d ${className}`} />
    </>
  );
}
