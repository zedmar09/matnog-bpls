import type { PermitRegistryRecord } from "../types/permit-registry";
import type {
  PermitVerificationActivity,
  PermitVerificationFilters,
  PermitVerificationLookupResult,
  PermitVerificationOutcome,
  PermitVerificationSortKey,
  PermitVerificationSource,
} from "../types/permit-verification";
import { getPublicPermitVerificationState } from "./permit-registry-utils";

export const PERMIT_VERIFICATION_ACTIVITY_STORAGE_KEY = "matnog-bpls-permit-verification-activity-v1";

export const EMPTY_PERMIT_VERIFICATION_FILTERS: PermitVerificationFilters = {
  search: "",
  outcome: "",
  source: "",
  officer: "",
  checkedFrom: "",
  checkedTo: "",
};

export const PERMIT_VERIFICATION_SOURCES: readonly PermitVerificationSource[] = [
  "QR scanner",
  "Manual lookup",
  "Public portal",
  "Counter validation",
];

export const PERMIT_VERIFICATION_OFFICERS = ["Maricel A. Gacosta", "Jocelyn B. Fajardo", "Nelson C. Gubat"] as const;

export function resolveStaffPermitVerification(
  records: readonly PermitRegistryRecord[],
  reference: string,
): PermitVerificationLookupResult {
  const normalized = decodeURIComponent(reference).trim().toLocaleUpperCase();
  if (!normalized) return { outcome: "Not found" };
  const matches = records.filter((record) =>
    [record.qrToken, record.documentNumber, record.applicationId, record.businessId].some(
      (value) => value.toLocaleUpperCase() === normalized,
    ),
  );
  const record = matches.toSorted((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))[0];
  return record ? { record, outcome: getPublicPermitVerificationState(record) } : { outcome: "Not found" };
}

export function createPermitVerificationActivity({
  id,
  checkedAt,
  officer,
  source,
  submittedReference,
  result,
}: {
  id: string;
  checkedAt: string;
  officer: string;
  source: PermitVerificationSource;
  submittedReference: string;
  result: PermitVerificationLookupResult;
}): PermitVerificationActivity {
  const record = result.record;
  return {
    id,
    checkedAt,
    officer,
    source,
    submittedReference,
    outcome: result.outcome,
    documentNumber: record?.documentNumber ?? "—",
    documentType: record?.documentType ?? "Unknown",
    businessName: record?.businessName ?? "No matching registry record",
    barangay: record?.barangay ?? "—",
    permitStatus: record?.status ?? "Unknown",
  };
}

export function createSeededPermitVerificationActivity(
  records: readonly PermitRegistryRecord[],
): PermitVerificationActivity[] {
  return Array.from({ length: 42 }, (_, index) => {
    const failed = index % 11 === 8;
    const record = records[index % records.length];
    const hour = 8 + (index % 9);
    const day = index < 18 ? 23 : index < 30 ? 22 : 21;
    const reference = failed
      ? `MTG-2026-UNKNOWN-${String(index + 1).padStart(3, "0")}`
      : index % 4 === 0
        ? record.documentNumber
        : index % 4 === 1
          ? record.applicationId
          : index % 4 === 2
            ? record.businessId
            : record.qrToken;
    const result = failed ? ({ outcome: "Not found" } as const) : resolveStaffPermitVerification(records, reference);
    return createPermitVerificationActivity({
      id: `VERIFY-202609${String(day).padStart(2, "0")}-${String(index + 1).padStart(4, "0")}`,
      checkedAt: `2026-09-${String(day).padStart(2, "0")} ${String(hour).padStart(2, "0")}:${index % 2 ? "35" : "10"}`,
      officer: PERMIT_VERIFICATION_OFFICERS[index % PERMIT_VERIFICATION_OFFICERS.length],
      source: PERMIT_VERIFICATION_SOURCES[index % PERMIT_VERIFICATION_SOURCES.length],
      submittedReference: reference,
      result,
    });
  });
}

export function filterPermitVerificationActivity(
  records: readonly PermitVerificationActivity[],
  filters: PermitVerificationFilters,
) {
  const query = filters.search.trim().toLocaleLowerCase();
  return records.filter((record) => {
    if (
      query &&
      ![record.submittedReference, record.documentNumber, record.businessName, record.barangay, record.officer]
        .join(" ")
        .toLocaleLowerCase()
        .includes(query)
    )
      return false;
    if (filters.outcome && record.outcome !== filters.outcome) return false;
    if (filters.source && record.source !== filters.source) return false;
    if (filters.officer && record.officer !== filters.officer) return false;
    const checkedDate = record.checkedAt.slice(0, 10);
    if (filters.checkedFrom && checkedDate < filters.checkedFrom) return false;
    if (filters.checkedTo && checkedDate > filters.checkedTo) return false;
    return true;
  });
}

export function sortPermitVerificationActivity(
  records: readonly PermitVerificationActivity[],
  key: PermitVerificationSortKey,
  direction: "asc" | "desc",
) {
  const multiplier = direction === "asc" ? 1 : -1;
  return [...records].sort((a, b) => a[key].localeCompare(b[key]) * multiplier);
}

export function summarizePermitVerificationActivity(records: readonly PermitVerificationActivity[]) {
  const today = records.filter((record) => record.checkedAt.startsWith("2026-09-23"));
  const warnings = new Set<PermitVerificationOutcome>(["Expiring soon", "Expired", "Inactive"]);
  const restricted = new Set<PermitVerificationOutcome>(["Suspended", "Revoked"]);
  return {
    today: today.length,
    verified: today.filter((record) => record.outcome === "Verified").length,
    warnings: today.filter((record) => warnings.has(record.outcome)).length,
    restricted: today.filter((record) => restricted.has(record.outcome)).length,
    failed: today.filter((record) => record.outcome === "Not found").length,
  };
}
