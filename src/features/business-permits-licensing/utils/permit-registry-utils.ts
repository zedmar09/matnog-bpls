import type { PermitDocumentOverride, PermitReleaseOverride } from "../types/application-detail";
import type { ApplicationDirectoryRecord } from "../types/application-directory";
import type {
  PermitRegistryFilters,
  PermitRegistryRecord,
  PermitRegistrySortKey,
  PermitRegistryStatus,
} from "../types/permit-registry";

export const EMPTY_PERMIT_REGISTRY_FILTERS: PermitRegistryFilters = {
  search: "",
  documentType: "",
  status: "",
  fiscalPeriod: "",
  barangay: "",
  verificationStatus: "",
  releaseChannel: "",
};

export function projectGeneratedPermit(
  application: ApplicationDirectoryRecord,
  document: PermitDocumentOverride,
  release?: PermitReleaseOverride,
): PermitRegistryRecord {
  const closure = application.type === "Closure";
  const released = release?.releaseStatus === "Released";
  return {
    documentNumber: document.documentNumber,
    applicationId: application.id,
    businessId: application.businessId,
    businessName: application.businessName,
    registeredName: application.registeredName,
    ownerName: application.ownerName,
    barangay: application.barangay,
    documentType: closure ? "Closure Certificate" : "Business Permit",
    applicationType: application.type,
    fiscalPeriod: application.fiscalPeriod,
    issueDate: document.issueDate,
    effectiveFrom: document.effectiveFrom,
    effectiveUntil: document.effectiveUntil,
    releaseDate: release?.releaseDate ?? "",
    releaseChannel: release?.releaseChannel ?? "Pending release",
    status: closure && released ? "Closed" : released ? "Active" : "Active",
    signatureStatus: release?.signatureStatus ?? "Pending",
    releaseStatus: release?.releaseStatus ?? "Not released",
    verificationStatus: release?.verificationStatus ?? "Pending",
    qrToken: document.qrToken,
    version: document.versions.at(-1)?.version ?? 1,
    releasingOfficer: release?.releasingOfficer ?? document.actor,
    lastUpdated: release?.updatedAt ?? document.updatedAt,
  };
}

export function mergePermitRegistryRecords(
  seeded: readonly PermitRegistryRecord[],
  applications: readonly ApplicationDirectoryRecord[],
  documents: readonly PermitDocumentOverride[],
  releases: readonly PermitReleaseOverride[],
) {
  const applicationMap = new Map(applications.map((application) => [application.id, application]));
  const releaseMap = new Map(releases.map((release) => [release.applicationId, release]));
  const generated = documents.flatMap((document) => {
    const application = applicationMap.get(document.applicationId);
    const release = releaseMap.get(document.applicationId);
    return application && release?.releaseStatus === "Released"
      ? [projectGeneratedPermit(application, document, release)]
      : [];
  });
  const generatedApplications = new Set(generated.map((record) => record.applicationId));
  return [...generated, ...seeded.filter((record) => !generatedApplications.has(record.applicationId))];
}

export function filterPermitRegistry(records: readonly PermitRegistryRecord[], filters: PermitRegistryFilters) {
  const query = filters.search.trim().toLocaleLowerCase();
  return records.filter((record) => {
    if (
      query &&
      ![
        record.documentNumber,
        record.applicationId,
        record.businessId,
        record.businessName,
        record.registeredName,
        record.ownerName,
        record.qrToken,
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(query)
    )
      return false;
    if (filters.documentType && record.documentType !== filters.documentType) return false;
    if (filters.status && record.status !== filters.status) return false;
    if (filters.fiscalPeriod && record.fiscalPeriod !== filters.fiscalPeriod) return false;
    if (filters.barangay && record.barangay !== filters.barangay) return false;
    if (filters.verificationStatus && record.verificationStatus !== filters.verificationStatus) return false;
    if (filters.releaseChannel && record.releaseChannel !== filters.releaseChannel) return false;
    return true;
  });
}

function sortValue(record: PermitRegistryRecord, key: PermitRegistrySortKey) {
  return record[key].toLocaleLowerCase();
}

export function sortPermitRegistry(
  records: readonly PermitRegistryRecord[],
  key: PermitRegistrySortKey,
  direction: "asc" | "desc",
) {
  const multiplier = direction === "asc" ? 1 : -1;
  return [...records].sort((a, b) => sortValue(a, key).localeCompare(sortValue(b, key)) * multiplier);
}

export function summarizePermitRegistry(records: readonly PermitRegistryRecord[]) {
  const activeStatuses = new Set<PermitRegistryStatus>(["Active", "Expiring soon"]);
  return {
    total: records.length,
    active: records.filter((record) => activeStatuses.has(record.status)).length,
    expiring: records.filter((record) => record.status === "Expiring soon").length,
    restricted: records.filter((record) => record.status === "Suspended" || record.status === "Revoked").length,
    verified: records.filter((record) => record.verificationStatus === "Active").length,
  };
}
