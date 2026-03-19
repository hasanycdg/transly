import type { FileStatus, ProjectStatus } from "@/types/projects";
import { getStatusLabel } from "@/lib/projects/display";

type StatusBadgeProps = {
  status: ProjectStatus | FileStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = getBadgeStyles(status);
  const label = getStatusLabel(status);

  return (
    <span
      className={[
        "inline-flex items-center gap-[5px] rounded-[5px] border px-2 py-[3px] text-[11.5px] font-medium",
        styles.className
      ].join(" ")}
    >
      <span className={["h-[5px] w-[5px] rounded-full", styles.dotClassName].join(" ")} />
      {label}
    </span>
  );
}

function getBadgeStyles(status: ProjectStatus | FileStatus) {
  switch (status) {
    case "Active":
      return {
        className: "border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success)]",
        dotClassName: "bg-[var(--success)]"
      };
    case "Processing":
      return {
        className:
          "border-[var(--processing-border)] bg-[var(--processing-bg)] text-[var(--processing)]",
        dotClassName: "bg-[var(--processing)]"
      };
    case "In Review":
    case "Review":
      return {
        className: "border-[var(--review-border)] bg-[var(--review-bg)] text-[var(--review)]",
        dotClassName: "bg-[var(--review)]"
      };
    case "Completed":
    case "Done":
      return {
        className:
          "border-[var(--processing-border)] bg-[var(--processing-bg)] text-[var(--processing)]",
        dotClassName: "bg-[var(--processing)]"
      };
    case "Error":
      return {
        className: "border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger)]",
        dotClassName: "bg-[var(--danger)]"
      };
    case "Queued":
    default:
      return {
        className: "border-[var(--border)] bg-[var(--background)] text-[var(--muted)]",
        dotClassName: "bg-[var(--muted-soft)]"
      };
  }
}
