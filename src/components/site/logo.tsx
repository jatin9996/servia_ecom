import Link from "next/link";

export function Logo({ tone = "ink" }: { tone?: "ink" | "ivory" }) {
  const color = tone === "ivory" ? "#F7F5F1" : "#161411";
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Seravia home">
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
        <circle cx="11" cy="11" r="10" fill="none" stroke={color} strokeWidth="1" />
        <path d="M11 5.5v11M5.5 11h11" stroke={color} strokeWidth="1.2" />
      </svg>
      <span className="font-serif text-[1.65rem] leading-none tracking-tight" style={{ color }}>
        Seravia
      </span>
    </Link>
  );
}
