export type ReviewStatus = "pending_review" | "approved" | "rejected";

export type ReviewRecord = {
  jobId: string;
  reviewerId: string;
  status: ReviewStatus;
  notes?: string;
  updatedAt: string;
};

export class ReviewWorkflowService {
  async markPending(jobId: string): Promise<void> {
    // TODO: Persist and expose review queues for human QA.
    void jobId;
  }

  async submitReview(record: ReviewRecord): Promise<void> {
    // TODO: Save review decisions and feed accepted changes into translation memory.
    void record;
  }
}
