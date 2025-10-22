export type PendingJobStatus = 'pending' | 'processing' | 'failed' | 'done';

export enum PendingJobType {
  GIVING_STATUS_UPDATE = 'giving-status-update',
}
