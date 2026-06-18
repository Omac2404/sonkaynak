const PATHS: Record<string, string> = {
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  news: "M4 4h16v16H4zM8 8h8M8 12h8M8 16h5",
  pen: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z",
  folder: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  tag: "M20.59 13.41 12 22l-9-9V3h10l7.59 7.59a2 2 0 0 1 0 2.82zM7 7h.01",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  users: "M17 21v-2a4 4 0 0 0-3-3.87M9 21v-2a4 4 0 0 0-4-4H4M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM21 11a4 4 0 0 0-3-3.87",
  image: "M3 5h18v14H3zM3 15l5-5 4 4 3-3 6 6M8.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  images: "M7 3h14v14H7zM3 7v14h14M11 9l3 3 2-2 3 3",
  doc: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h6",
  building: "M3 21h18M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M9 8h2M9 12h2M19 21V11h-4",
  star: "M12 2l3 7 7 .5-5.5 4.5L18 21l-6-4-6 4 1.5-7L2 9.5 9 9z",
  flame: "M12 2c1 4-3 5-3 9a3 3 0 0 0 6 0c0-1-.5-2-1-3 2 1 3 3 3 5a6 6 0 1 1-12 0c0-5 4-7 7-11z",
  layout: "M3 3h18v18H3zM3 9h18M9 21V9",
  ticker: "M3 12h18M3 6h18M3 18h12",
  menu: "M3 6h18M3 12h18M3 18h18",
  circle: "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0",
  dove: "M16 7c3 0 5 2 5 5l-7 1-3 5-2-4-6-1 5-3c0-3 2-5 5-5z",
  check: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  cog: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 7 19.4l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 3 12V12a2 2 0 0 1 4 0",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
};

export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const d = PATHS[name] ?? PATHS.circle;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}
