export function Stars({ value, count }: { value: number; count?: number }) {
  const rounded = Math.round(value);
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex" aria-label={`${value.toFixed(1)} out of 5`}>
        {Array.from({ length: 5 }).map((_, index) => (
          <svg key={index} width="13" height="13" viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M10 1.6 12.5 7l5.9.5-4.5 3.9 1.4 5.8L10 14.6 4.7 17.2 6.1 11.4 1.6 7.5 7.5 7z"
              fill={index < rounded ? "#9C4221" : "none"}
              stroke="#9C4221"
              strokeWidth="1.2"
            />
          </svg>
        ))}
      </span>
      {typeof count === "number" ? (
        <span className="text-xs text-stone">
          {value.toFixed(1)} · {count}
        </span>
      ) : null}
    </span>
  );
}
