import { MATNOG_PERMIT_REGISTRY } from "@/features/business-permits-licensing/data/matnog-permit-registry";

import type { PermitIssuanceRecord } from "../types/permit-issuance-report";

function historicalRecord(record: PermitIssuanceRecord, index: number, year: "2024" | "2025") {
  const sequence = `${year.slice(2)}${String(index + 1).padStart(3, "0")}`;
  const issueDate = record.issueDate.replace(/^2026/, year);
  const closure = record.documentType === "Closure Certificate";
  return {
    ...record,
    documentNumber: `MATNOG-${closure ? "CC" : "BP"}-${year}-${sequence}`,
    applicationId: `APP-${year}-${sequence}`,
    fiscalPeriod: year,
    issueDate,
    effectiveFrom: issueDate,
    effectiveUntil: closure ? "" : `${year}-12-31`,
    releaseDate: issueDate,
    status: closure ? "Closed" : "Expired",
    verificationStatus: "Active",
    qrToken: `MTG-${year}-${sequence}-${record.businessId.slice(-4)}`,
    version: 1,
    lastUpdated: `${issueDate} 15:30`,
  } satisfies PermitIssuanceRecord;
}

const historic2025 = MATNOG_PERMIT_REGISTRY.slice(0, 34).map((record, index) =>
  historicalRecord(record, index, "2025"),
);
const historic2024 = MATNOG_PERMIT_REGISTRY.slice(8, 26).map((record, index) =>
  historicalRecord(record, index, "2024"),
);

export const MATNOG_PERMIT_ISSUANCE_RECORDS: readonly PermitIssuanceRecord[] = [
  ...MATNOG_PERMIT_REGISTRY,
  ...historic2025,
  ...historic2024,
];
