import type { ApplicationDirectoryRecord } from "@/features/business-permits-licensing/types/application-directory";
import type { PermitRegistryRecord } from "@/features/business-permits-licensing/types/permit-registry";

import type {
  ComplianceFilters,
  ComplianceGroup,
  ComplianceRecord,
  ComplianceSummary,
} from "../types/compliance-report";
import { calendarDays, PROCESSING_REFERENCE_DATE } from "./processing-performance-utils";

export const EMPTY_COMPLIANCE_FILTERS: ComplianceFilters = {
  query: "",
  complianceState: "",
  issueCategory: "",
  barangay: "",
  riskLevel: "",
  type: "",
  permitStatus: "",
  requirementState: "",
  paymentStatus: "",
  assignedOfficer: "",
  reviewUrgency: "",
};

function reviewUrgency(reviewDueDate: string) {
  if (!reviewDueDate) return "Not applicable" as const;
  if (reviewDueDate < PROCESSING_REFERENCE_DATE) return "Overdue" as const;
  if (reviewDueDate === PROCESSING_REFERENCE_DATE) return "Due now" as const;
  if (calendarDays(PROCESSING_REFERENCE_DATE, reviewDueDate) <= 30) return "Due within 30 days" as const;
  return "Scheduled" as const;
}

export function projectComplianceRecord(
  application: ApplicationDirectoryRecord,
  permit?: PermitRegistryRecord,
): ComplianceRecord {
  const missingRequirements = Math.max(0, application.requirementsTotal - application.requirementsComplete);
  let complianceState: ComplianceRecord["complianceState"] = "Monitoring required";
  let severity: ComplianceRecord["severity"] = "Low";
  let issueCategory: ComplianceRecord["issueCategory"] = "Application review";
  let finding = `Application remains at ${application.currentStage}.`;
  let recommendedAction = "Continue the assigned review and update the application record.";
  let reviewDueDate = application.targetRelease;

  if (permit?.status === "Revoked" || permit?.status === "Suspended") {
    complianceState = "Critical";
    severity = "Critical";
    issueCategory = "Permit restriction";
    finding = `${permit.status} permit with inactive public verification.`;
    recommendedAction = "Review the controlling order, restriction conditions, and enforcement follow-up.";
    reviewDueDate = PROCESSING_REFERENCE_DATE;
  } else if (application.paymentStatus === "Reversed") {
    complianceState = "Critical";
    severity = "Critical";
    issueCategory = "Payment exception";
    finding = "Confirmed payment was reversed and the application balance requires validation.";
    recommendedAction = "Reconcile the reversal with Treasury before further permit action.";
    reviewDueDate = PROCESSING_REFERENCE_DATE;
  } else if (permit?.status === "Expired") {
    complianceState = "Action required";
    severity = "High";
    issueCategory = "Permit validity";
    finding = "Business permit has passed its recorded validity date.";
    recommendedAction = "Confirm renewal, cessation, or enforcement status with BPLO.";
    reviewDueDate = permit.effectiveUntil;
  } else if (application.status === "For correction" || missingRequirements > 0) {
    complianceState = "Action required";
    severity = "High";
    issueCategory = "Requirements";
    finding = `${missingRequirements || 1} requirement${missingRequirements === 1 ? "" : "s"} incomplete or returned for correction.`;
    recommendedAction = "Obtain and verify the corrected mandatory evidence.";
  } else if (application.paymentStatus === "Pending payment") {
    complianceState = "Action required";
    severity = "High";
    issueCategory = "Payment exception";
    finding = "Assessed obligation remains pending payment confirmation.";
    recommendedAction = "Confirm settlement or advise the applicant of the outstanding balance.";
  } else if (permit?.status === "Expiring soon") {
    complianceState = "Monitoring required";
    severity = "Medium";
    issueCategory = "Permit validity";
    finding = "Active permit is approaching its recorded validity end date.";
    recommendedAction = "Notify the business and monitor renewal submission.";
    reviewDueDate = permit.effectiveUntil;
  } else if (application.status === "Closed" || permit?.documentType === "Closure Certificate") {
    complianceState = "Closed or archived";
    severity = "Informational";
    issueCategory = "Closed record";
    finding = "Business closure is recorded with a released closure document.";
    recommendedAction = "Retain the record for statutory and audit reference.";
    reviewDueDate = "";
  } else if (permit?.status === "Active" || application.status === "Issued") {
    complianceState = "Compliant";
    severity = "Informational";
    issueCategory = "No open finding";
    finding = "No open compliance exception is indicated by current system records.";
    recommendedAction = "Maintain routine monitoring through the next validity review.";
    reviewDueDate = permit?.effectiveUntil ?? "2026-12-31";
  }

  return {
    ...application,
    permitNumber: permit?.documentNumber ?? application.permitNumber,
    permitStatus: permit?.status ?? "Not issued",
    verificationStatus: permit?.verificationStatus ?? "Not available",
    complianceState,
    severity,
    issueCategory,
    finding,
    recommendedAction,
    reviewDueDate,
    reviewUrgency: reviewUrgency(reviewDueDate),
    missingRequirements,
  };
}

export function projectComplianceRegister(
  applications: readonly ApplicationDirectoryRecord[],
  permits: readonly PermitRegistryRecord[],
) {
  const permitMap = new Map(permits.map((permit) => [permit.applicationId, permit]));
  return applications.map((application) => projectComplianceRecord(application, permitMap.get(application.id)));
}

export function filterComplianceRecords(rows: readonly ComplianceRecord[], filters: ComplianceFilters) {
  const query = filters.query.trim().toLocaleLowerCase();
  return rows.filter((row) => {
    const haystack =
      `${row.id} ${row.businessId} ${row.businessName} ${row.ownerName} ${row.permitNumber} ${row.finding} ${row.assignedOfficer}`.toLocaleLowerCase();
    const requirementState = row.missingRequirements > 0 || row.status === "For correction" ? "Issue" : "Complete";
    return (
      (!query || haystack.includes(query)) &&
      (!filters.complianceState || row.complianceState === filters.complianceState) &&
      (!filters.issueCategory || row.issueCategory === filters.issueCategory) &&
      (!filters.barangay || row.barangay === filters.barangay) &&
      (!filters.riskLevel || row.riskLevel === filters.riskLevel) &&
      (!filters.type || row.type === filters.type) &&
      (!filters.permitStatus || row.permitStatus === filters.permitStatus) &&
      (!filters.requirementState || requirementState === filters.requirementState) &&
      (!filters.paymentStatus || row.paymentStatus === filters.paymentStatus) &&
      (!filters.assignedOfficer || row.assignedOfficer === filters.assignedOfficer) &&
      (!filters.reviewUrgency || row.reviewUrgency === filters.reviewUrgency)
    );
  });
}

export function summarizeCompliance(rows: readonly ComplianceRecord[]): ComplianceSummary {
  return {
    businessesMonitored: new Set(rows.map((row) => row.businessId)).size,
    compliant: rows.filter((row) => row.complianceState === "Compliant").length,
    requirementIssues: rows.filter((row) => row.missingRequirements > 0 || row.status === "For correction").length,
    paymentExceptions: rows.filter((row) => row.paymentStatus === "Pending payment" || row.paymentStatus === "Reversed")
      .length,
    permitExpiry: rows.filter((row) => row.permitStatus === "Expired" || row.permitStatus === "Expiring soon").length,
    restrictions: rows.filter((row) => row.permitStatus === "Suspended" || row.permitStatus === "Revoked").length,
    critical: rows.filter((row) => row.complianceState === "Critical").length,
  };
}

export function groupCompliance(
  rows: readonly ComplianceRecord[],
  readKey: (row: ComplianceRecord) => string,
  readSecondary?: (row: ComplianceRecord) => boolean,
): ComplianceGroup[] {
  const groups = new Map<string, { count: number; secondary: number }>();
  for (const row of rows) {
    const key = readKey(row);
    const group = groups.get(key) ?? { count: 0, secondary: 0 };
    group.count += 1;
    if (readSecondary?.(row)) group.secondary += 1;
    groups.set(key, group);
  }
  return [...groups]
    .map(([label, values]) => ({ label, count: values.count, secondary: values.secondary }))
    .sort((left, right) => right.count - left.count);
}

function escapeCsv(value: string | number) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function complianceRecordsToCsv(rows: readonly ComplianceRecord[]) {
  const headings = [
    "Application",
    "Business",
    "Owner",
    "Barangay",
    "Risk",
    "Application type",
    "Application status",
    "Permit number",
    "Permit status",
    "Verification",
    "Requirements complete",
    "Requirements total",
    "Payment status",
    "Stage",
    "Officer",
    "Compliance state",
    "Severity",
    "Issue category",
    "Finding",
    "Recommended action",
    "Review due",
    "Review urgency",
  ];
  const values = rows.map((row) => [
    row.id,
    row.businessName,
    row.ownerName,
    row.barangay,
    row.riskLevel,
    row.type,
    row.status,
    row.permitNumber,
    row.permitStatus,
    row.verificationStatus,
    row.requirementsComplete,
    row.requirementsTotal,
    row.paymentStatus,
    row.currentStage,
    row.assignedOfficer,
    row.complianceState,
    row.severity,
    row.issueCategory,
    row.finding,
    row.recommendedAction,
    row.reviewDueDate,
    row.reviewUrgency,
  ]);
  return [headings, ...values].map((line) => line.map(escapeCsv).join(",")).join("\n");
}
