import type { PermitSignatureStatus } from "./application-detail";
import type { ApplicationDirectoryRecord } from "./application-directory";
import type { PermitRegistryDocumentType } from "./permit-registry";

export type SignatureQueueRecord = ApplicationDirectoryRecord & {
  documentNumber: string;
  documentType: PermitRegistryDocumentType;
  documentVersion: number;
  provider: string;
  signerEmail: string;
  envelopeReference: string;
  signatureStatus: PermitSignatureStatus;
  releaseStatus: "Not released" | "Ready for release";
  daysInStage: number;
  overdue: boolean;
  exceptionReason: string;
  workflowUpdatedAt: string;
};

export type SignatureQueueFilters = {
  search: string;
  documentType: string;
  provider: string;
  signatureStatus: string;
  barangay: string;
  riskLevel: string;
  targetFrom: string;
  targetTo: string;
};

export type SignatureQueueSortKey =
  | "applicationId"
  | "businessName"
  | "documentNumber"
  | "documentType"
  | "provider"
  | "signatureStatus"
  | "targetRelease"
  | "daysInStage"
  | "riskLevel";
