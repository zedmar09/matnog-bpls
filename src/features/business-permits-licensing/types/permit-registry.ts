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
