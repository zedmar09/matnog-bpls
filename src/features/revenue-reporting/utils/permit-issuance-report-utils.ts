import type {
  PermitIssuanceFilters,
  PermitIssuanceGroup,
  PermitIssuanceRecord,
  PermitIssuanceSummary,
} from "../types/permit-issuance-report";

export const EMPTY_PERMIT_ISSUANCE_FILTERS: PermitIssuanceFilters = {
  query: "",
  dateFrom: "2024-01-01",
  dateTo: "2026-12-31",
  fiscalPeriod: "",
  documentType: "",
  applicationType: "",
  barangay: "",
  status: "",
  releaseChannel: "",
  verificationStatus: "",
  releasingOfficer: "",
};

export function filterPermitIssuance(rows: readonly PermitIssuanceRecord[], filters: PermitIssuanceFilters) {
  const query = filters.query.trim().toLocaleLowerCase();
  return rows.filter((row) => {
    const haystack =
      `${row.documentNumber} ${row.applicationId} ${row.businessId} ${row.businessName} ${row.registeredName} ${row.ownerName} ${row.qrToken}`.toLocaleLowerCase();
    return (
      (!query || haystack.includes(query)) &&
      (!filters.dateFrom || row.issueDate >= filters.dateFrom) &&
      (!filters.dateTo || row.issueDate <= filters.dateTo) &&
      (!filters.fiscalPeriod || row.fiscalPeriod === filters.fiscalPeriod) &&
      (!filters.documentType || row.documentType === filters.documentType) &&
      (!filters.applicationType || row.applicationType === filters.applicationType) &&
      (!filters.barangay || row.barangay === filters.barangay) &&
      (!filters.status || row.status === filters.status) &&
      (!filters.releaseChannel || row.releaseChannel === filters.releaseChannel) &&
      (!filters.verificationStatus || row.verificationStatus === filters.verificationStatus) &&
      (!filters.releasingOfficer || row.releasingOfficer === filters.releasingOfficer)
    );
  });
}

export function summarizePermitIssuance(rows: readonly PermitIssuanceRecord[]): PermitIssuanceSummary {
  const summary = {
    total: rows.length,
    active: 0,
    closureCertificates: 0,
    expiring: 0,
    restricted: 0,
    qrVerifiable: 0,
  };
  for (const row of rows) {
    if (row.status === "Active") summary.active += 1;
    if (row.documentType === "Closure Certificate") summary.closureCertificates += 1;
    if (row.status === "Expiring soon") summary.expiring += 1;
    if (row.status === "Suspended" || row.status === "Revoked") summary.restricted += 1;
    if (row.qrToken && row.verificationStatus === "Active") summary.qrVerifiable += 1;
  }
  return summary;
}

export function groupPermitIssuance(
  rows: readonly PermitIssuanceRecord[],
  readKey: (row: PermitIssuanceRecord) => string,
): PermitIssuanceGroup[] {
  const groups = new Map<string, number>();
  for (const row of rows) groups.set(readKey(row), (groups.get(readKey(row)) ?? 0) + 1);
  return [...groups].map(([label, count]) => ({ label, count })).sort((left, right) => right.count - left.count);
}

function escapeCsv(value: string | number) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function permitIssuanceToCsv(rows: readonly PermitIssuanceRecord[]) {
  const headings = [
    "Permit number",
    "Application",
    "Business",
    "Owner",
    "Barangay",
    "Document type",
    "Application type",
    "Fiscal period",
    "Issue date",
    "Effective from",
    "Effective until",
    "Status",
    "Release channel",
    "Release date",
    "Releasing officer",
    "Signature",
    "Release",
    "Verification",
    "QR token",
    "Version",
  ];
  const values = rows.map((row) => [
    row.documentNumber,
    row.applicationId,
    row.businessName,
    row.ownerName,
    row.barangay,
    row.documentType,
    row.applicationType,
    row.fiscalPeriod,
    row.issueDate,
    row.effectiveFrom,
    row.effectiveUntil,
    row.status,
    row.releaseChannel,
    row.releaseDate,
    row.releasingOfficer,
    row.signatureStatus,
    row.releaseStatus,
    row.verificationStatus,
    row.qrToken,
    row.version,
  ]);
  return [headings, ...values].map((line) => line.map(escapeCsv).join(",")).join("\n");
}
