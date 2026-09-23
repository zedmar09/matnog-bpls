import type { BusinessRiskLevel } from "./business-directory";

export type ApplicationDirectoryType = "New" | "Renewal" | "Amendment" | "Closure";
export type ApplicationDirectoryStatus =
  | "Draft"
  | "Submitted"
  | "For correction"
  | "Under review"
  | "Ready to issue"
  | "Issued"
  | "Closed";
export type ApplicationPaymentStatus = "Not assessed" | "Pending payment" | "Paid" | "Reversed";
export type ApplicationPriority = "Normal" | "Urgent";

export type ApplicationDirectoryRecord = {
  id: string;
  businessId: string;
  businessName: string;
  registeredName: string;
  ownerName: string;
  barangay: string;
  riskLevel: BusinessRiskLevel;
  type: ApplicationDirectoryType;
  status: ApplicationDirectoryStatus;
  fiscalPeriod: string;
  filedAt: string;
  targetRelease: string;
  assignedOfficer: string;
  currentStage: string;
  requirementsComplete: number;
  requirementsTotal: number;
  assessmentAmount: number;
  paymentStatus: ApplicationPaymentStatus;
  permitNumber: string;
  priority: ApplicationPriority;
  updatedAt: string;
};

export type ApplicationDirectoryFilters = {
  search: string;
  type: string;
  status: string;
  fiscalPeriod: string;
  barangay: string;
  assignedOfficer: string;
  filedFrom: string;
  filedTo: string;
  targetFrom: string;
  targetTo: string;
  stage: string;
  completeness: string;
  paymentStatus: string;
  riskLevel: string;
  overdue: string;
  priority: string;
};

export type ApplicationDirectorySortKey =
  | "id"
  | "businessName"
  | "type"
  | "status"
  | "fiscalPeriod"
  | "barangay"
  | "assignedOfficer"
  | "currentStage"
  | "filedAt"
  | "targetRelease"
  | "completeness"
  | "assessmentAmount"
  | "paymentStatus"
  | "priority"
  | "updatedAt";

export type FinalApprovalDecisionState = "Ready for decision" | "Deferred";

export type FinalApprovalQueueRecord = ApplicationDirectoryRecord & {
  decisionState: FinalApprovalDecisionState;
  daysWaiting: number;
  overdue: boolean;
  deferralReason: string;
};

export type FinalApprovalFilters = {
  search: string;
  type: string;
  barangay: string;
  riskLevel: string;
  priority: string;
  decisionState: string;
  targetFrom: string;
  targetTo: string;
};

export type FinalApprovalSortKey =
  | "id"
  | "businessName"
  | "type"
  | "barangay"
  | "riskLevel"
  | "assessmentAmount"
  | "targetRelease"
  | "daysWaiting"
  | "priority"
  | "decisionState";
