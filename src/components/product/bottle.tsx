export function Bottle({
  accent,
  mark,
  size = 220,
  title,
}: {
  accent: string;
  mark: string;
  size?: number;
  title?: string;
}) {
  const width = Math.round(size * 0.56);
  return (
    <svg
      width={width}
      height={size}
      viewBox="0 0 140 250"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <rect x="52" y="6" width="36" height="22" rx="3" fill="#161411" />
      <rect x="58" y="26" width="24" height="12" fill="#161411" />
      <path
        d="M34 46h72l10 18v150a16 16 0 0 1-16 16H40a16 16 0 0 1-16-16V64z"
        fill={accent}
      />
      <path d="M40 64h60l6 12v8H34v-8z" fill="#161411" opacity="0.12" />
      <rect x="42" y="118" width="56" height="62" fill="#F7F5F1" />
      <text
        x="70"
        y="146"
        textAnchor="middle"
        fill="#161411"
        fontFamily="Georgia, serif"
        fontSize={mark.length > 5 ? 11 : 16}
      >
        {mark}
      </text>
      <text
        x="70"
        y="166"
        textAnchor="middle"
        fill="#7A736A"
        fontFamily="system-ui, sans-serif"
        fontSize="8"
        letterSpacing="1.5"
      >
        SERAVIA
      </text>
    </svg>
  );
}
