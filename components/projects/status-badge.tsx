import type { FileStatus, ProjectStatus } from "@/types/projects";

type StatusBadgeProps = {
  status: ProjectStatus | FileStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = getBadgeStyles(status);

  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        styles.className
      ].join(" ")}
    >
      <span className={["h-1.5 w-1.5 rounded-full", styles.dotClassName].join(" ")} />
      {status}
    </span>
  );
}

function getBadgeStyles(status: ProjectStatus | FileStatus) {
  switch (status) {
    case "Active":
    case "Processing":
      return {
        className:
          "border-[rgba(36,91,144,0.12)] bg-[rgba(36,91,144,0.08)] text-[rgb(36,91,144)]",
        dotClassName: "bg-[rgb(36,91,144)]"
      };
    case "In Review":
    case "Review":
      return {
        className:
          "border-[rgba(135,101,28,0.12)] bg-[rgba(135,101,28,0.08)] text-[rgb(135,101,28)]",
        dotClassName: "bg-[rgb(135,101,28)]"
      };
    case "Completed":
    case "Done":
      return {
        className:
          "border-[rgba(34,98,73,0.12)] bg-[rgba(34,98,73,0.08)] text-[rgb(34,98,73)]",
        dotClassName: "bg-[rgb(34,98,73)]"
      };
    case "Error":
      return {
        className:
          "border-[rgba(157,62,47,0.12)] bg-[rgba(157,62,47,0.08)] text-[rgb(157,62,47)]",
        dotClassName: "bg-[rgb(157,62,47)]"
      };
    case "Queued":
    default:
      return {
        className:
          "border-[rgba(78,82,74,0.12)] bg-[rgba(78,82,74,0.08)] text-[rgb(78,82,74)]",
        dotClassName: "bg-[rgb(78,82,74)]"
      };
  }
}
