import Image from "next/image";

/**
 * Son Kaynak resmi logosu (public/logo.png — şeffaf zemin).
 * variant="white": koyu zeminlerde (sidebar, login paneli) beyaza çevirir.
 */
export function Logo({
  className = "h-9 w-auto",
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
