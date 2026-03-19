import type { FileStatus, ProjectStatus } from "@/types/projects";

type StatusBadgeProps = {
  status: ProjectStatus | FileStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = getBadgeStyles(status);
  const label = getStatusLabel(status);

  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-[12px] border px-3 py-1.5 text-xs font-medium",
        styles.className
      ].join(" ")}
    >
      <span className={["h-1.5 w-1.5 rounded-full", styles.dotClassName].join(" ")} />
      {label}
    </span>
  );
}

function getBadgeStyles(status: ProjectStatus | FileStatus) {
  switch (status) {
    case "Active":
      return {
        className:
          "border-[rgba(40,145,96,0.18)] bg-[rgba(232,247,237,0.9)] text-[rgb(33,122,79)]",
        dotClassName: "bg-[rgb(33,122,79)]"
      };
    case "Processing":
      return {
        className:
          "border-[rgba(56,98,203,0.16)] bg-[rgba(236,241,255,0.95)] text-[rgb(52,92,188)]",
        dotClassName: "bg-[rgb(52,92,188)]"
      };
    case "In Review":
    case "Review":
      return {
        className:
          "border-[rgba(207,161,53,0.22)] bg-[rgba(255,249,235,0.98)] text-[rgb(150,106,18)]",
        dotClassName: "bg-[rgb(150,106,18)]"
      };
    case "Completed":
    case "Done":
      return {
        className:
          "border-[rgba(40,145,96,0.18)] bg-[rgba(232,247,237,0.9)] text-[rgb(33,122,79)]",
        dotClassName: "bg-[rgb(33,122,79)]"
      };
    case "Error":
      return {
        className:
          "border-[rgba(196,87,66,0.18)] bg-[rgba(253,240,238,0.95)] text-[rgb(173,63,42)]",
        dotClassName: "bg-[rgb(173,63,42)]"
      };
    case "Queued":
    default:
      return {
        className:
          "border-[rgba(20,20,20,0.09)] bg-[rgba(248,248,246,0.95)] text-[rgb(102,102,102)]",
        dotClassName: "bg-[rgb(102,102,102)]"
      };
  }
}

function getStatusLabel(status: ProjectStatus | FileStatus) {
  if (status === "Completed") {
    return "Done";
  }

  return status;
}
