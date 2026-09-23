import type { PermitDocumentOverride, PermitReleaseOverride } from "../types/application-detail";
import type { ApplicationDirectoryRecord } from "../types/application-directory";
import type { SignatureQueueFilters, SignatureQueueRecord, SignatureQueueSortKey } from "../types/signature-queue";

export const EMPTY_SIGNATURE_QUEUE_FILTERS: SignatureQueueFilters = {
  search: "",
  documentType: "",
  provider: "",
  signatureStatus: "",
  barangay: "",
  riskLevel: "",
  targetFrom: "",
  targetTo: "",
};

function dateDifferenceInDays(from: string, to: string) {
  const start = new Date(`${from.slice(0, 10)}T00:00:00`).getTime();
  const end = new Date(`${to.slice(0, 10)}T00:00:00`).getTime();
  return Math.max(0, Math.floor((end - start) / 86_400_000));
}

export function mergeSignatureDocuments(
  seeded: readonly PermitDocumentOverride[],
  saved: readonly PermitDocumentOverride[],
) {
  const savedIds = new Set(saved.map((item) => item.applicationId));
  return [...saved, ...seeded.filter((item) => !savedIds.has(item.applicationId))];
}

export function mergeSignatureReleases(
  seeded: readonly PermitReleaseOverride[],
  saved: readonly PermitReleaseOverride[],
) {
  const savedIds = new Set(saved.map((item) => item.applicationId));
  return [...saved, ...seeded.filter((item) => !savedIds.has(item.applicationId))];
}

export function createSignatureQueue(
  applications: readonly ApplicationDirectoryRecord[],
  documents: readonly PermitDocumentOverride[],
  releases: readonly PermitReleaseOverride[],
  referenceDate = "2026-09-23",
): SignatureQueueRecord[] {
  const applicationMap = new Map(applications.map((application) => [application.id, application]));
  const releaseMap = new Map(releases.map((release) => [release.applicationId, release]));
  return documents.flatMap((document) => {
    const application = applicationMap.get(document.applicationId);
    const release = releaseMap.get(document.applicationId);
    if (
      !application ||
      document.status !== "For signature" ||
      release?.releaseStatus === "Released" ||
      ["Issued", "Closed"].includes(application.status)
    )
      return [];
    const signatureStatus = release?.signatureStatus ?? "Pending";
    const workflowUpdatedAt = release?.updatedAt ?? document.updatedAt;
    return [
      {
        ...application,
        documentNumber: document.documentNumber,
        documentType: application.type === "Closure" ? "Closure Certificate" : "Business Permit",
        documentVersion: document.versions.at(-1)?.version ?? 1,
        provider: release?.provider ?? document.signatureProvider.replace(" · Pending connection", ""),
        signerEmail: release?.signerEmail ?? "mayor@matnog.gov.ph",
        envelopeReference: release?.envelopeReference ?? "Not sent",
        signatureStatus,
        releaseStatus: signatureStatus === "Signed" ? "Ready for release" : "Not released",
        daysInStage: dateDifferenceInDays(workflowUpdatedAt, referenceDate),
        overdue: application.targetRelease < referenceDate,
        exceptionReason: ["Declined", "Failed"].includes(signatureStatus) ? (release?.signatureNotes ?? "") : "",
        workflowUpdatedAt,
      } satisfies SignatureQueueRecord,
    ];
  });
}

export function filterSignatureQueue(records: readonly SignatureQueueRecord[], filters: SignatureQueueFilters) {
  const query = filters.search.trim().toLocaleLowerCase();
  return records.filter((record) => {
    if (
      query &&
      ![
        record.id,
        record.businessId,
        record.businessName,
        record.registeredName,
        record.ownerName,
        record.documentNumber,
        record.envelopeReference,
        record.signerEmail,
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(query)
    )
      return false;
    if (filters.documentType && record.documentType !== filters.documentType) return false;
    if (filters.provider && record.provider !== filters.provider) return false;
    if (filters.signatureStatus && record.signatureStatus !== filters.signatureStatus) return false;
    if (filters.barangay && record.barangay !== filters.barangay) return false;
    if (filters.riskLevel && record.riskLevel !== filters.riskLevel) return false;
    if (filters.targetFrom && record.targetRelease < filters.targetFrom) return false;
    if (filters.targetTo && record.targetRelease > filters.targetTo) return false;
    return true;
  });
}

function sortValue(record: SignatureQueueRecord, key: SignatureQueueSortKey) {
  if (key === "applicationId") return record.id;
  return record[key];
}

export function sortSignatureQueue(
  records: readonly SignatureQueueRecord[],
  key: SignatureQueueSortKey,
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

export function summarizeSignatureQueue(records: readonly SignatureQueueRecord[]) {
  return {
    total: records.length,
    pending: records.filter((record) => record.signatureStatus === "Pending").length,
    sent: records.filter((record) => record.signatureStatus === "Sent").length,
    signed: records.filter((record) => record.signatureStatus === "Signed").length,
    exceptions: records.filter((record) => ["Declined", "Failed"].includes(record.signatureStatus)).length,
    overdue: records.filter((record) => record.overdue).length,
  };
}
