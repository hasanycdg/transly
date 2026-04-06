import type { TranslateRequestDto } from "../../schemas/translation.schemas";

export type QueuePayload = {
  jobId: string;
  request: TranslateRequestDto;
};

export interface JobQueue {
  enqueue(payload: QueuePayload): Promise<void>;
}

export class InMemoryQueueStub implements JobQueue {
  async enqueue(payload: QueuePayload): Promise<void> {
    // TODO: Replace with a persistent queue (BullMQ/SQS/RabbitMQ).
    // The current stub intentionally does not process the job in background.
    // It only confirms that the API accepted the payload for queued execution.
    void payload;
  }
}
