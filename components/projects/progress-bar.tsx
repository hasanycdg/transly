type ProgressBarProps = {
  value: number;
  tone?: "neutral" | "accent" | "danger";
  size?: "sm" | "md";
};

export function ProgressBar({
  value,
  tone = "accent",
  size = "md"
}: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div
      className={[
        "w-full overflow-hidden rounded-full bg-[rgba(32,40,28,0.08)]",
        size === "sm" ? "h-1.5" : "h-2.5"
      ].join(" ")}
    >
      <div
        className={[
          "h-full rounded-full transition-[width]",
          tone === "danger"
            ? "bg-[var(--danger)]"
            : tone === "neutral"
              ? "bg-[rgba(32,40,28,0.38)]"
              : "bg-[var(--accent)]"
        ].join(" ")}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}
