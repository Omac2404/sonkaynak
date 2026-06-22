import Image from "next/image";

/**
 * Son Kaynak resmi logosu (public/logo.png — şeffaf zemin).
 * Boyut className ile verilir (örn. "h-12 w-auto").
 * variant="white": koyu zeminlerde (footer) logoyu beyaza çevirir.
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
  return (
    <Image
      src="/logo.png"
      alt="Son Kaynak"
      width={1647}
      height={509}
      priority={priority}
      className={`${className} ${variant === "white" ? "[filter:brightness(0)_invert(1)]" : ""}`}
    />
  );
}
