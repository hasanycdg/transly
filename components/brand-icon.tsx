type BrandGlyphProps = {
  className?: string;
};

type BrandIconBadgeProps = {
  className?: string;
  glyphClassName?: string;
};

export function BrandGlyph({ className = "" }: BrandGlyphProps) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M1 3h10M1 6h7M1 9h5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BrandIconBadge({
  className = "",
  glyphClassName = ""
}: BrandIconBadgeProps) {
  return (
    <span
      className={[
        "inline-flex h-8 w-8 items-center justify-center rounded-[6px] bg-[var(--foreground)] text-white",
        className
      ].join(" ")}
    >
      <BrandGlyph className={glyphClassName} />
    </span>
  );
}
