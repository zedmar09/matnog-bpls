import type { ApplicationDirectoryRecord } from "@/features/business-permits-licensing/types/application-directory";
import type {
  PermitRegistryStatus,
  PermitVerificationStatus,
} from "@/features/business-permits-licensing/types/permit-registry";

export type ComplianceState =
  | "Compliant"
  | "Monitoring required"
  | "Action required"
  | "Critical"
  | "Closed or archived";
export type ComplianceSeverity = "Critical" | "High" | "Medium" | "Low" | "Informational";
export type ComplianceIssueCategory =
  | "Permit restriction"
  | "Payment exception"
  | "Permit validity"
  | "Requirements"
  | "Application review"
  | "No open finding"
  | "Closed record";
export type ComplianceReviewUrgency = "Overdue" | "Due now" | "Due within 30 days" | "Scheduled" | "Not applicable";

export type ComplianceRecord = ApplicationDirectoryRecord & {
  permitStatus: PermitRegistryStatus | "Not issued";
  verificationStatus: PermitVerificationStatus | "Not available";
  complianceState: ComplianceState;
  severity: ComplianceSeverity;
  issueCategory: ComplianceIssueCategory;
  finding: string;
  recommendedAction: string;
  reviewDueDate: string;
  reviewUrgency: ComplianceReviewUrgency;
  missingRequirements: number;
};

export type ComplianceFilters = {
  query: string;
  complianceState: string;
  issueCategory: string;
  barangay: string;
  riskLevel: string;
  type: string;
  permitStatus: string;
  requirementState: string;
  paymentStatus: string;
  assignedOfficer: string;
  reviewUrgency: string;
};

export type ComplianceSummary = {
  businessesMonitored: number;
  compliant: number;
  requirementIssues: number;
  paymentExceptions: number;
  permitExpiry: number;
  restrictions: number;
  critical: number;
};

export type ComplianceGroup = { label: string; count: number; secondary?: number };
