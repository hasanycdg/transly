export type ProductRoadmapStatus = "live" | "in_progress" | "planned";

export type ProductRoadmapPhase = {
  id: string;
  title: string;
  horizon: string;
  status: ProductRoadmapStatus;
  summary: string;
  deliverables: string[];
};

export const PRODUCT_ROADMAP_PHASES: ProductRoadmapPhase[] = [
  {
    id: "phase-1",
    title: "Broaden The Translation Surface",
    horizon: "Now",
    status: "in_progress",
    summary:
      "Expand from XLIFF-first file handling to a daily translation workspace with direct text input and a clearer operational home screen.",
    deliverables: [
      "Text translation workspace",
      "Roadmap-aware dashboard",
      "Clear split between file and text flows"
    ]
  },
  {
    id: "phase-2",
    title: "Multi-Format Translation Engine",
    horizon: "Next",
    status: "planned",
    summary:
      "Turn accepted uploads into real translation pipelines for PO, STRINGS, RESX, DOCX, CSV, and the review states around them.",
    deliverables: [
      "PO, STRINGS, RESX writeback",
      "DOCX, CSV, TXT pipeline",
      "Format-safe export and review"
    ]
  },
  {
    id: "phase-3",
    title: "Memory, API, And Automation",
    horizon: "After",
    status: "planned",
    summary:
      "Add reusable translation memory, public API access, notifications, and usage controls so the product becomes part of a team's delivery system.",
    deliverables: [
      "Translation memory",
      "API keys and /v1 endpoints",
      "Notifications and spending controls"
    ]
  }
];

export function getRoadmapStatusCounts() {
  return PRODUCT_ROADMAP_PHASES.reduce(
    (counts, phase) => {
      counts[phase.status] += 1;
      return counts;
    },
    {
      live: 0,
      in_progress: 0,
      planned: 0
    } satisfies Record<ProductRoadmapStatus, number>
  );
}
