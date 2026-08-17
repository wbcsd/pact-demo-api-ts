import { randomUUID } from "crypto";

export type QueueStatus = "pending" | "fulfilled" | "rejected" | "failed";

export interface QueuedRequest {
  /** Internal queue id (used in admin URLs). */
  queueId: string;
  /** The original CloudEvent id — used as requestEventId in the callback. */
  requestEventId: string;
  /** PACT spec version this request came in on. */
  version: "v2" | "v3";
  /** Base URL of the requesting node — the callback target. */
  source: string;
  /** Requested product ids (best-effort extracted from the event). */
  productIds: string[];
  /** Optional comment supplied by the requester. */
  comment?: string;
  /** ISO timestamp of when the request was received. */
  receivedAt: string;
  /** Current lifecycle status. */
  status: QueueStatus;
  /** ISO timestamp of when the request was resolved (fulfilled/rejected). */
  resolvedAt?: string;
  /** Last error message when a callback attempt failed. */
  error?: string;
}

// In-memory store — cleared on restart, matching the demo's mock-data approach.
const queue: QueuedRequest[] = [];

export interface EnqueueInput {
  requestEventId: string;
  version: "v2" | "v3";
  source: string;
  productIds: string[];
  comment?: string;
}

export const enqueueRequest = (input: EnqueueInput): QueuedRequest => {
  const entry: QueuedRequest = {
    queueId: randomUUID(),
    requestEventId: input.requestEventId,
    version: input.version,
    source: input.source,
    productIds: input.productIds,
    comment: input.comment,
    receivedAt: new Date().toISOString(),
    status: "pending",
  };
  queue.unshift(entry);
  return entry;
};

export const listRequests = (): QueuedRequest[] => [...queue];

export const getRequest = (queueId: string): QueuedRequest | undefined =>
  queue.find((r) => r.queueId === queueId);

export const updateRequest = (
  queueId: string,
  patch: Partial<Omit<QueuedRequest, "queueId">>
): QueuedRequest | undefined => {
  const entry = queue.find((r) => r.queueId === queueId);
  if (!entry) return undefined;
  Object.assign(entry, patch);
  return entry;
};
