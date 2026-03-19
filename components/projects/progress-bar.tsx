type ProgressBarProps = {
  value: number;
  tone?: "neutral" | "success" | "review" | "danger" | "processing";
  size?: "sm" | "md";
};

export function ProgressBar({
  value,
  tone = "success",
  size = "md"
}: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div
      className={[
        "w-full overflow-hidden rounded-full bg-[var(--border)]",
        size === "sm" ? "h-[3px]" : "h-1"
      ].join(" ")}
    >
      <div
        className={[
          "h-full rounded-full transition-[width]",
          tone === "danger"
            ? "bg-[var(--danger)]"
            : tone === "success"
              ? "bg-[var(--success)]"
              : tone === "review"
                ? "bg-[var(--review)]"
                : tone === "processing"
                  ? "bg-[var(--processing)]"
                  : "bg-[var(--muted-soft)]"
        ].join(" ")}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}
