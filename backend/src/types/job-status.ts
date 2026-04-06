export const JOB_STATUSES = {
  queued: "queued",
  processing: "processing",
  completed: "completed",
  completedWithWarnings: "completed_with_warnings",
  failed: "failed"
} as const;

export type JobStatus = (typeof JOB_STATUSES)[keyof typeof JOB_STATUSES];
