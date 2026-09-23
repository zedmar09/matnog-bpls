import type { PermitRegistryDocumentType, PermitRegistryRecord } from "./permit-registry";

export type PermitVerificationOutcome =
  | "Verified"
  | "Expiring soon"
  | "Expired"
  | "Suspended"
  | "Revoked"
  | "Inactive"
  | "Not found";

export type PermitVerificationSource = "QR scanner" | "Manual lookup" | "Public portal" | "Counter validation";

export type PermitVerificationActivity = {
  id: string;
  checkedAt: string;
  officer: string;
  source: PermitVerificationSource;
  submittedReference: string;
  outcome: PermitVerificationOutcome;
  documentNumber: string;
  documentType: PermitRegistryDocumentType | "Unknown";
  businessName: string;
  barangay: string;
  permitStatus: string;
};

export type PermitVerificationFilters = {
  search: string;
  outcome: string;
  source: string;
  officer: string;
  checkedFrom: string;
  checkedTo: string;
};

export type PermitVerificationSortKey =
  | "checkedAt"
  | "submittedReference"
  | "documentNumber"
  | "businessName"
  | "outcome"
  | "source"
  | "officer";

export type PermitVerificationLookupResult = {
  record?: PermitRegistryRecord;
  outcome: PermitVerificationOutcome;
};
