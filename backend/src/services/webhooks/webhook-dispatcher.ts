export type WebhookEventType =
  | "translation.job.queued"
  | "translation.job.processing"
  | "translation.job.completed"
  | "translation.job.failed";

export type WebhookEvent = {
  type: WebhookEventType;
  jobId: string;
  timestamp: string;
  payload: Record<string, unknown>;
};

export class WebhookDispatcher {
  async dispatch(event: WebhookEvent): Promise<void> {
    // TODO: Persist webhook attempts and deliver signed callbacks to plugin endpoints.
    void event;
  }
}
