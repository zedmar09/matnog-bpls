export type PermitRegistryDocumentType = "Business Permit" | "Closure Certificate";

export type PermitRegistryStatus = "Active" | "Expiring soon" | "Expired" | "Closed" | "Suspended" | "Revoked";

export type PermitVerificationStatus = "Active" | "Inactive" | "Pending";

export type PermitRegistryRecord = {
  documentNumber: string;
  applicationId: string;
  businessId: string;
  businessName: string;
  registeredName: string;
  ownerName: string;
  barangay: string;
  documentType: PermitRegistryDocumentType;
  applicationType: "New" | "Renewal" | "Amendment" | "Closure";
  fiscalPeriod: string;
  issueDate: string;
  effectiveFrom: string;
  effectiveUntil: string;
  releaseDate: string;
  releaseChannel: string;
  status: PermitRegistryStatus;
  signatureStatus: "Pending" | "Sent" | "Signed" | "Declined" | "Failed";
  releaseStatus: "Not released" | "Ready for release" | "Released";
  verificationStatus: PermitVerificationStatus;
  qrToken: string;
  version: number;
  releasingOfficer: string;
  lastUpdated: string;
};

export type PermitRegistryFilters = {
  search: string;
  documentType: string;
  status: string;
  fiscalPeriod: string;
  barangay: string;
  verificationStatus: string;
  releaseChannel: string;
};

export type PermitRegistrySortKey =
  | "documentNumber"
  | "businessName"
  | "documentType"
  | "fiscalPeriod"
  | "issueDate"
  | "effectiveUntil"
  | "status"
  | "barangay"
  | "verificationStatus"
  | "lastUpdated";

export type PublicPermitVerificationState =
  | "Verified"
  | "Expiring soon"
  | "Expired"
  | "Suspended"
  | "Revoked"
  | "Inactive";

export type PublicPermitVerificationRecord = {
  verificationState: PublicPermitVerificationState;
  documentNumber: string;
  documentType: PermitRegistryDocumentType;
  businessName: string;
  barangay: string;
  fiscalPeriod: string;
  issueDate: string;
  effectiveFrom: string;
  effectiveUntil: string;
  documentStatus: PermitRegistryStatus;
  qrToken: string;
  version: number;
  issuingAuthority: string;
  signatoryTitle: string;
  lastVerifiedAt: string;
};

export type PermitLifecycleAction = "suspend" | "reinstate" | "revoke";

export type PermitLifecycleFields = {
  grounds: string;
  orderReference: string;
  effectiveDate: string;
  endDate: string;
  reason: string;
  approvingOfficer: string;
};

export type PermitLifecycleEvent = {
  id: string;
  action: "Issued" | "Suspended" | "Reinstated" | "Revoked";
  resultingStatus: PermitRegistryStatus;
  orderReference: string;
  grounds: string;
  reason: string;
  effectiveDate: string;
  endDate: string;
  actor: string;
  occurredAt: string;
};

export type PermitLifecycleOverride = {
  documentNumber: string;
  sourceStatus: PermitRegistryStatus;
  status: PermitRegistryStatus;
  verificationStatus: PermitVerificationStatus;
  events: PermitLifecycleEvent[];
  updatedAt: string;
};

export type PermitLifecycleResult = {
  record: PermitRegistryRecord;
  override: PermitLifecycleOverride;
  event: PermitLifecycleEvent;
};
