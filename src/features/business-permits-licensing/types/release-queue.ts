import type { ApplicationDirectoryRecord } from "./application-directory";
import type { PermitRegistryDocumentType } from "./permit-registry";

export type ReleaseReadiness = "Ready to finalize" | "Needs recipient details" | "Needs acknowledgment";

export type ReleaseQueueRecord = ApplicationDirectoryRecord & {
  documentNumber: string;
  documentType: PermitRegistryDocumentType;
  documentVersion: number;
  signedDate: string;
  provider: string;
  envelopeReference: string;
  releaseChannel: string;
  recipientName: string;
  recipientIdentification: string;
  recipientContact: string;
  acknowledgmentReference: string;
  acknowledgmentConfirmed: boolean;
  readiness: ReleaseReadiness;
  readinessComplete: number;
  readinessTotal: number;
  daysWaiting: number;
  overdue: boolean;
  workflowUpdatedAt: string;
};

export type ReleaseQueueFilters = {
  search: string;
  documentType: string;
  releaseChannel: string;
  barangay: string;
  riskLevel: string;
  priority: string;
  readiness: string;
  signedFrom: string;
  signedTo: string;
};

export type ReleaseQueueSortKey =
  | "applicationId"
  | "businessName"
  | "documentNumber"
  | "documentType"
  | "releaseChannel"
  | "signedDate"
  | "readiness"
  | "targetRelease"
  | "daysWaiting"
  | "priority";
