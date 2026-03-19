type ProjectSummaryCardProps = {
  label: string;
  value: string;
  hint: string;
};

export function ProjectSummaryCard({
  label,
  value,
  hint
}: ProjectSummaryCardProps) {
  return (
    <div className="rounded-[24px] border border-[rgba(36,39,32,0.09)] bg-white p-5 shadow-[0_12px_36px_rgba(27,31,24,0.04)]">
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">{label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[var(--foreground)]">
        {value}
      </p>
      <p className="mt-2 text-sm text-[var(--muted)]">{hint}</p>
    </div>
  );
}
