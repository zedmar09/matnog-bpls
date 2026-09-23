import type {
  ApplicationDirectoryRecord,
  ApplicationDirectoryStatus,
  ApplicationDirectoryType,
  ApplicationPaymentStatus,
} from "../types/application-directory";
import { MATNOG_BUSINESS_DIRECTORY } from "./matnog-business-directory";

export const APPLICATION_REFERENCE_DATE = "2026-09-23";

export const APPLICATION_OFFICERS = [
  "Maricel A. Gacosta",
  "Rogelio M. Funes",
  "Angela F. Dela Cruz",
  "Roberto P. Hababag",
  "Catherine O. Fortes",
  "Unassigned",
] as const;

export const APPLICATION_STAGES = [
  "Data validation",
  "Requirements review",
  "Zoning review",
  "Joint inspection",
  "Treasurer assessment",
  "Payment confirmation",
  "Final approval",
  "Permit generation",
] as const;

const TYPES: readonly ApplicationDirectoryType[] = ["Renewal", "Renewal", "New", "Amendment", "Renewal", "Closure"];
const FINAL_APPROVAL_TYPES: readonly ApplicationDirectoryType[] = ["Renewal", "New", "Amendment", "Closure"];
const STATUSES: readonly ApplicationDirectoryStatus[] = [
  "Under review",
  "Submitted",
  "For correction",
  "Ready to issue",
  "Draft",
  "Issued",
  "Under review",
  "Closed",
];

function pad(value: number, length = 2) {
  return String(value).padStart(length, "0");
}

function createApplication(index: number): ApplicationDirectoryRecord {
  const sequence = index + 1;
  const business = MATNOG_BUSINESS_DIRECTORY[(index * 11) % MATNOG_BUSINESS_DIRECTORY.length];
  const generatedType = TYPES[index % TYPES.length];
  const status = STATUSES[index % STATUSES.length];
  const month = 5 + (index % 5);
  const day = 2 + ((index * 7) % 25);
  const filedAt = `2026-${pad(month)}-${pad(day)} ${pad(8 + (index % 9))}:${index % 2 === 0 ? "15" : "40"}`;
  const targetDay = Math.min(28, day + 7 + (index % 5));
  const targetRelease = `2026-${pad(month)}-${pad(targetDay)}`;
  const seededStage = APPLICATION_STAGES[index % APPLICATION_STAGES.length];
  const finalApproval = status !== "Issued" && status !== "Closed" && seededStage === "Final approval";
  const type = finalApproval
    ? FINAL_APPROVAL_TYPES[Math.floor(index / 8) % FINAL_APPROVAL_TYPES.length]
    : generatedType;
  const requirementsTotal = 6 + (index % 4);
  const requirementsComplete = finalApproval
    ? requirementsTotal
    : status === "Draft"
      ? 2 + (index % 3)
      : status === "For correction"
        ? requirementsTotal - 1
        : requirementsTotal;
  const paymentStatus: ApplicationPaymentStatus = finalApproval
    ? "Paid"
    : status === "Draft" || status === "Submitted"
      ? "Not assessed"
      : status === "Issued" || status === "Closed" || status === "Ready to issue"
        ? "Paid"
        : index % 9 === 0
          ? "Reversed"
          : "Pending payment";
  const assessmentAmount = paymentStatus === "Not assessed" ? 0 : 2_250 + (index % 17) * 475;
  return {
    id: `APP-2026-${pad(300 + sequence, 5)}`,
    businessId: business.id,
    businessName: business.tradeName,
    registeredName: business.registeredName,
    ownerName: business.ownerName,
    barangay: business.barangay,
    riskLevel: business.riskLevel,
    type,
    status,
    fiscalPeriod: type === "Renewal" && index % 3 === 0 ? "2027" : "2026",
    filedAt,
    targetRelease,
    assignedOfficer: finalApproval ? "Roberto P. Hababag" : APPLICATION_OFFICERS[index % APPLICATION_OFFICERS.length],
    currentStage:
      status === "Issued" || status === "Closed" ? "Completed" : finalApproval ? "Mayor's final approval" : seededStage,
    requirementsComplete,
    requirementsTotal,
    assessmentAmount,
    paymentStatus,
    permitNumber: status === "Issued" || status === "Closed" ? `BP-2026-${pad(500 + sequence, 5)}` : "Pending",
    priority: index % 13 === 0 ? "Urgent" : "Normal",
    updatedAt: `2026-09-${pad(3 + (index % 20))} ${pad(8 + (index % 9))}:${index % 2 === 0 ? "20" : "45"}`,
  };
}

export const MATNOG_APPLICATION_DIRECTORY: readonly ApplicationDirectoryRecord[] = Array.from(
  { length: 184 },
  (_, index) => createApplication(index),
);
