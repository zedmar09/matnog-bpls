import type { PermitDocumentOverride, PermitReleaseOverride } from "../types/application-detail";
import type { ApplicationDirectoryRecord } from "../types/application-directory";
import type {
  ReleaseQueueFilters,
  ReleaseQueueRecord,
  ReleaseQueueSortKey,
  ReleaseReadiness,
} from "../types/release-queue";

export const EMPTY_RELEASE_QUEUE_FILTERS: ReleaseQueueFilters = {
  search: "",
  documentType: "",
  releaseChannel: "",
  barangay: "",
  riskLevel: "",
  priority: "",
  readiness: "",
  signedFrom: "",
  signedTo: "",
};

function dateDifferenceInDays(from: string, to: string) {
  const start = new Date(`${from.slice(0, 10)}T00:00:00`).getTime();
  const end = new Date(`${to.slice(0, 10)}T00:00:00`).getTime();
  return Math.max(0, Math.floor((end - start) / 86_400_000));
}

function releaseReadiness(release: PermitReleaseOverride): {
  readiness: ReleaseReadiness;
  complete: number;
  total: number;
} {
  const gates = [
    Boolean(release.releaseChannel.trim()),
    Boolean(release.releaseDate),
    Boolean(release.recipientName.trim()),
    Boolean(release.recipientIdentification.trim()),
    Boolean(release.releasingOfficer.trim()),
    Boolean(release.acknowledgmentReference.trim()),
    release.acknowledgmentConfirmed,
  ];
  const complete = gates.filter(Boolean).length;
  const readiness = !release.recipientIdentification.trim()
    ? "Needs recipient details"
    : !release.acknowledgmentConfirmed
      ? "Needs acknowledgment"
      : "Ready to finalize";
  return { readiness, complete, total: gates.length };
}

export function createReleaseQueue(
  applications: readonly ApplicationDirectoryRecord[],
  documents: readonly PermitDocumentOverride[],
  releases: readonly PermitReleaseOverride[],
  referenceDate = "2026-09-23",
): ReleaseQueueRecord[] {
  const applicationMap = new Map(applications.map((application) => [application.id, application]));
  const documentMap = new Map(documents.map((document) => [document.applicationId, document]));
  return releases.flatMap((release) => {
    const application = applicationMap.get(release.applicationId);
    const document = documentMap.get(release.applicationId);
    if (
      !application ||
      !document ||
      document.status !== "For signature" ||
      release.signatureStatus !== "Signed" ||
      release.releaseStatus !== "Ready for release" ||
      ["Issued", "Closed"].includes(application.status)
    )
      return [];
    const readiness = releaseReadiness(release);
    return [
      {
        ...application,
        documentNumber: document.documentNumber,
        documentType: application.type === "Closure" ? "Closure Certificate" : "Business Permit",
        documentVersion: document.versions.at(-1)?.version ?? 1,
        signedDate: release.signedDate,
        provider: release.provider,
        envelopeReference: release.envelopeReference,
        releaseChannel: release.releaseChannel,
        recipientName: release.recipientName,
        recipientIdentification: release.recipientIdentification,
        recipientContact: release.recipientContact,
        acknowledgmentReference: release.acknowledgmentReference,
        acknowledgmentConfirmed: release.acknowledgmentConfirmed,
        readiness: readiness.readiness,
        readinessComplete: readiness.complete,
        readinessTotal: readiness.total,
        daysWaiting: dateDifferenceInDays(release.signedDate || release.updatedAt, referenceDate),
        overdue: application.targetRelease < referenceDate,
        workflowUpdatedAt: release.updatedAt,
      } satisfies ReleaseQueueRecord,
    ];
  });
}

export function filterReleaseQueue(records: readonly ReleaseQueueRecord[], filters: ReleaseQueueFilters) {
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
        record.recipientName,
        record.acknowledgmentReference,
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(query)
    )
      return false;
    if (filters.documentType && record.documentType !== filters.documentType) return false;
    if (filters.releaseChannel && record.releaseChannel !== filters.releaseChannel) return false;
    if (filters.barangay && record.barangay !== filters.barangay) return false;
    if (filters.riskLevel && record.riskLevel !== filters.riskLevel) return false;
    if (filters.priority && record.priority !== filters.priority) return false;
    if (filters.readiness && record.readiness !== filters.readiness) return false;
    if (filters.signedFrom && record.signedDate < filters.signedFrom) return false;
    if (filters.signedTo && record.signedDate > filters.signedTo) return false;
    return true;
  });
}

function sortValue(record: ReleaseQueueRecord, key: ReleaseQueueSortKey) {
  if (key === "applicationId") return record.id;
  return record[key];
}

export function sortReleaseQueue(
  records: readonly ReleaseQueueRecord[],
  key: ReleaseQueueSortKey,
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

export function summarizeReleaseQueue(records: readonly ReleaseQueueRecord[]) {
  return {
    total: records.length,
    ready: records.filter((record) => record.readiness === "Ready to finalize").length,
    needsInformation: records.filter((record) => record.readiness === "Needs recipient details").length,
    needsAcknowledgment: records.filter((record) => record.readiness === "Needs acknowledgment").length,
    urgent: records.filter((record) => record.priority === "Urgent").length,
    overdue: records.filter((record) => record.overdue).length,
    closures: records.filter((record) => record.documentType === "Closure Certificate").length,
  };
}
