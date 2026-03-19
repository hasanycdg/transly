import type { FileStatus, ProjectStatus } from "@/types/projects";

type StatusBadgeProps = {
  status: ProjectStatus | FileStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = getBadgeStyles(status);

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        styles.className
      ].join(" ")}
    >
      {status}
    </span>
  );
}

function getBadgeStyles(status: ProjectStatus | FileStatus) {
  switch (status) {
    case "Active":
    case "Processing":
      return {
        className: "bg-[rgba(84,131,185,0.14)] text-[rgb(72,112,158)]"
      };
    case "In Review":
    case "Review":
      return {
        className: "bg-[rgba(238,204,113,0.28)] text-[rgb(153,120,28)]"
      };
    case "Completed":
    case "Done":
      return {
        className: "bg-[rgba(164,226,174,0.26)] text-[rgb(61,133,74)]"
      };
    case "Error":
      return {
        className: "bg-[rgba(245,183,177,0.34)] text-[rgb(183,72,62)]"
      };
    case "Queued":
    default:
      return {
        className: "bg-[rgba(222,224,229,0.55)] text-[rgb(95,99,109)]"
      };
  }
}
