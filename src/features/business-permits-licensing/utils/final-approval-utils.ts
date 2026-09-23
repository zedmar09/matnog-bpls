import type { MayorReviewOverride } from "../types/application-detail";
import type {
  ApplicationDirectoryRecord,
  FinalApprovalFilters,
  FinalApprovalQueueRecord,
  FinalApprovalSortKey,
} from "../types/application-directory";
import { applyMayorReviewOverride } from "./application-detail-utils";

export const EMPTY_FINAL_APPROVAL_FILTERS: FinalApprovalFilters = {
  search: "",
  type: "",
  barangay: "",
  riskLevel: "",
  priority: "",
  decisionState: "",
  targetFrom: "",
  targetTo: "",
};

function dateDifferenceInDays(from: string, to: string) {
  const start = new Date(`${from.slice(0, 10)}T00:00:00`).getTime();
  const end = new Date(`${to.slice(0, 10)}T00:00:00`).getTime();
  return Math.max(0, Math.floor((end - start) / 86_400_000));
}

export function createFinalApprovalQueue(
  records: readonly ApplicationDirectoryRecord[],
  overrides: readonly MayorReviewOverride[],
  referenceDate = "2026-09-23",
): FinalApprovalQueueRecord[] {
  const overrideMap = new Map(overrides.map((override) => [override.applicationId, override]));
  return records.flatMap((record) => {
    const override = overrideMap.get(record.id);
    const projected = override ? applyMayorReviewOverride(record, override) : record;
    const eligible =
      projected.currentStage === "Mayor's final approval" &&
      projected.paymentStatus === "Paid" &&
      projected.requirementsComplete === projected.requirementsTotal &&
      (!override || override.status === "In review");
    if (!eligible) return [];
    return [
      {
        ...projected,
        decisionState: override?.status === "In review" ? "Deferred" : "Ready for decision",
        daysWaiting: dateDifferenceInDays(projected.updatedAt, referenceDate),
        overdue: projected.targetRelease < referenceDate,
        deferralReason: override?.status === "In review" ? override.remarks : "",
      } satisfies FinalApprovalQueueRecord,
    ];
  });
}

export function filterFinalApprovalQueue(records: readonly FinalApprovalQueueRecord[], filters: FinalApprovalFilters) {
  const query = filters.search.trim().toLocaleLowerCase();
  return records.filter((record) => {
    if (
      query &&
      ![record.id, record.businessId, record.businessName, record.registeredName, record.ownerName, record.barangay]
        .join(" ")
        .toLocaleLowerCase()
        .includes(query)
    )
      return false;
    if (filters.type && record.type !== filters.type) return false;
    if (filters.barangay && record.barangay !== filters.barangay) return false;
    if (filters.riskLevel && record.riskLevel !== filters.riskLevel) return false;
    if (filters.priority && record.priority !== filters.priority) return false;
    if (filters.decisionState && record.decisionState !== filters.decisionState) return false;
    if (filters.targetFrom && record.targetRelease < filters.targetFrom) return false;
    if (filters.targetTo && record.targetRelease > filters.targetTo) return false;
    return true;
  });
}

function sortValue(record: FinalApprovalQueueRecord, key: FinalApprovalSortKey) {
  return record[key];
}

export function sortFinalApprovalQueue(
  records: readonly FinalApprovalQueueRecord[],
  key: FinalApprovalSortKey,
  direction: "asc" | "desc",
) {
  const multiplier = direction === "asc" ? 1 : -1;
  return [...records].sort((a, b) => {
    const left = sortValue(a, key);
    const right = sortValue(b, key);
    if (typeof left === "number" && typeof right === "number") return (left - right) * multiplier;
    return String(left).localeCompare(String(right)) * multiplier;
  });
}

export function summarizeFinalApprovalQueue(records: readonly FinalApprovalQueueRecord[]) {
  return {
    total: records.length,
    urgent: records.filter((record) => record.priority === "Urgent").length,
    overdue: records.filter((record) => record.overdue).length,
    closures: records.filter((record) => record.type === "Closure").length,
    deferred: records.filter((record) => record.decisionState === "Deferred").length,
  };
}
