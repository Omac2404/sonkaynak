"use client";

export function ConfirmSubmit({
  children,
  className,
  message = "Bu işlemi yapmak istediğinize emin misiniz?",
  name,
  value,
}: {
  children: React.ReactNode;
  className?: string;
  message?: string;
  name?: string;
  value?: string;
}) {
  return (
    <button
      type="submit"
      name={name}
      value={value}
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
