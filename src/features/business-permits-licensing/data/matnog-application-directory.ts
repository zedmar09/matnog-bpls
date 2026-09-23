import type {
  ApplicationDirectoryRecord,
  ApplicationDirectoryStatus,
  ApplicationDirectoryType,
  ApplicationPaymentStatus,
} from "../types/application-directory";
import { MATNOG_BUSINESS_DIRECTORY } from "./matnog-business-directory";
import { seededSignatureStatus, signatureStage } from "./signature-seed-rules";

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
const SIGNATURE_QUEUE_TYPES: readonly ApplicationDirectoryType[] = ["Renewal", "Closure", "New", "Amendment"];
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
  const generatedDay = 2 + ((index * 7) % 25);
  const day = month === 9 ? Math.min(23, generatedDay) : generatedDay;
  const filedAt = `2026-${pad(month)}-${pad(day)} ${pad(8 + (index % 9))}:${index % 2 === 0 ? "15" : "40"}`;
  const targetDay = Math.min(28, day + 7 + (index % 5));
  const targetRelease = `2026-${pad(month)}-${pad(targetDay)}`;
  const seededStage = APPLICATION_STAGES[index % APPLICATION_STAGES.length];
  const finalApproval = status !== "Issued" && status !== "Closed" && seededStage === "Final approval";
  const signatureQueueIndex = status === "Ready to issue" ? Math.floor(index / STATUSES.length) : -1;
  const signatureStatus = signatureQueueIndex >= 0 ? seededSignatureStatus(signatureQueueIndex) : undefined;
  const type = finalApproval
    ? FINAL_APPROVAL_TYPES[Math.floor(index / 8) % FINAL_APPROVAL_TYPES.length]
    : signatureStatus
      ? SIGNATURE_QUEUE_TYPES[signatureQueueIndex % SIGNATURE_QUEUE_TYPES.length]
      : generatedType;
  const fiscalPeriod = type === "Renewal" && index % 3 === 0 ? "2027" : "2026";
  const updatedDay = Math.max(3 + (index % 20), month === 9 ? day : 1);
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
    fiscalPeriod,
    filedAt,
    targetRelease,
    assignedOfficer:
      finalApproval || signatureStatus
        ? finalApproval
          ? "Roberto P. Hababag"
          : "Maricel A. Gacosta"
        : APPLICATION_OFFICERS[index % APPLICATION_OFFICERS.length],
    currentStage:
      status === "Issued" || status === "Closed"
        ? "Completed"
        : finalApproval
          ? "Mayor's final approval"
          : signatureStatus
            ? signatureStage(signatureStatus)
            : seededStage,
    requirementsComplete,
    requirementsTotal,
    assessmentAmount,
    paymentStatus,
    permitNumber:
      status === "Issued" || status === "Closed"
        ? `BP-2026-${pad(500 + sequence, 5)}`
        : signatureStatus
          ? `MATNOG-${type === "Closure" ? "CC" : "BP"}-${fiscalPeriod}-${pad(300 + sequence, 5)}`
          : "Pending",
    priority:
      (signatureStatus === "Signed" && signatureQueueIndex % 12 === 9) || index % 13 === 0 ? "Urgent" : "Normal",
    updatedAt: `2026-09-${pad(updatedDay)} ${pad(8 + (index % 9))}:${index % 2 === 0 ? "20" : "45"}`,
  };
}

export const MATNOG_APPLICATION_DIRECTORY: readonly ApplicationDirectoryRecord[] = Array.from(
  { length: 184 },
  (_, index) => createApplication(index),
);
