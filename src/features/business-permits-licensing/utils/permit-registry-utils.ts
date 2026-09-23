import type { PermitDocumentOverride, PermitReleaseOverride } from "../types/application-detail";
import type { ApplicationDirectoryRecord } from "../types/application-directory";
import type {
  PermitLifecycleAction,
  PermitLifecycleEvent,
  PermitLifecycleFields,
  PermitLifecycleOverride,
  PermitLifecycleResult,
  PermitRegistryFilters,
  PermitRegistryRecord,
  PermitRegistrySortKey,
  PermitRegistryStatus,
  PublicPermitVerificationRecord,
  PublicPermitVerificationState,
} from "../types/permit-registry";

export const PERMIT_LIFECYCLE_STORAGE_KEY = "matnog-bpls-permit-lifecycle-overrides-v1";
export const PERMIT_LIFECYCLE_ACTOR = "Maricel A. Gacosta";
export const PERMIT_RESTRICTION_GROUNDS = [
  "Violation of permit conditions",
  "Expired regulatory clearance",
  "Public health or safety finding",
  "Material misrepresentation",
  "Non-payment of assessed obligation",
  "Closure order or legal directive",
] as const;

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
  lifecycleOverrides: readonly PermitLifecycleOverride[] = [],
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
  return applyPermitLifecycleOverrides(
    [...generated, ...seeded.filter((record) => !generatedApplications.has(record.applicationId))],
    lifecycleOverrides,
  );
}

export function applyPermitLifecycleOverrides(
  records: readonly PermitRegistryRecord[],
  overrides: readonly PermitLifecycleOverride[],
) {
  const overrideMap = new Map(overrides.map((override) => [override.documentNumber, override]));
  return records.map((record) => {
    const override = overrideMap.get(record.documentNumber);
    return override
      ? {
          ...record,
          status: override.status,
          verificationStatus: override.verificationStatus,
          lastUpdated: override.updatedAt,
        }
      : record;
  });
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

export function getPublicPermitVerificationState(record: PermitRegistryRecord): PublicPermitVerificationState {
  if (record.status === "Suspended") return "Suspended";
  if (record.status === "Revoked") return "Revoked";
  if (record.status === "Expired") return "Expired";
  if (record.verificationStatus !== "Active") return "Inactive";
  if (record.status === "Expiring soon") return "Expiring soon";
  return "Verified";
}

export function resolvePublicPermitVerification(
  records: readonly PermitRegistryRecord[],
  token: string,
): PublicPermitVerificationRecord | undefined {
  const normalized = decodeURIComponent(token).trim().toLocaleUpperCase();
  const record = records.find((item) => item.qrToken.toLocaleUpperCase() === normalized);
  if (!record) return undefined;
  return {
    verificationState: getPublicPermitVerificationState(record),
    documentNumber: record.documentNumber,
    documentType: record.documentType,
    businessName: record.businessName,
    barangay: record.barangay,
    fiscalPeriod: record.fiscalPeriod,
    issueDate: record.issueDate,
    effectiveFrom: record.effectiveFrom,
    effectiveUntil: record.effectiveUntil,
    documentStatus: record.status,
    qrToken: record.qrToken,
    version: record.version,
    issuingAuthority: "Municipality of Matnog · Business Permits and Licensing Office",
    signatoryTitle: "Municipal Mayor",
    lastVerifiedAt: "2026-09-23 22:30",
  };
}

export function createDefaultPermitLifecycleFields(): PermitLifecycleFields {
  return {
    grounds: "",
    orderReference: "",
    effectiveDate: "2026-09-23",
    endDate: "",
    reason: "",
    approvingOfficer: PERMIT_LIFECYCLE_ACTOR,
  };
}

export function validatePermitLifecycleAction(
  record: PermitRegistryRecord,
  action: PermitLifecycleAction,
  fields: PermitLifecycleFields,
) {
  if (record.documentType === "Closure Certificate") return "Closure certificates do not support permit restrictions.";
  if (record.status === "Revoked") return "A revoked permit is terminal and cannot receive another lifecycle action.";
  if (action === "reinstate" && record.status !== "Suspended") return "Only a suspended permit can be reinstated.";
  if (action === "suspend" && record.status === "Suspended") return "This permit is already suspended.";
  if (action !== "reinstate" && !fields.grounds.trim()) return "Select the legal or administrative grounds.";
  if (!fields.orderReference.trim()) return "Enter the controlling order or resolution reference.";
  if (!fields.effectiveDate) return "Enter the effective date.";
  if (fields.effectiveDate > "2026-09-23") return "The effective date cannot be in the future.";
  if (fields.endDate && fields.endDate < fields.effectiveDate)
    return "The restriction end date cannot precede its start.";
  if (fields.reason.trim().length < 15) return "Enter an operational reason of at least 15 characters.";
  if (!fields.approvingOfficer.trim()) return "Enter the approving officer.";
  return "";
}

function restoredPermitStatus(record: PermitRegistryRecord, sourceStatus: PermitRegistryStatus): PermitRegistryStatus {
  if (record.effectiveUntil && record.effectiveUntil < "2026-09-23") return "Expired";
  return sourceStatus === "Suspended" || sourceStatus === "Revoked" ? "Active" : sourceStatus;
}

export function applyPermitLifecycleAction(
  record: PermitRegistryRecord,
  current: PermitLifecycleOverride | undefined,
  action: PermitLifecycleAction,
  fields: PermitLifecycleFields,
  occurredAt = "2026-09-23 23:00",
): PermitLifecycleResult {
  const sourceStatus = current?.sourceStatus ?? record.status;
  const status: PermitRegistryStatus =
    action === "suspend" ? "Suspended" : action === "revoke" ? "Revoked" : restoredPermitStatus(record, sourceStatus);
  const actionLabel = action === "suspend" ? "Suspended" : action === "revoke" ? "Revoked" : "Reinstated";
  const event: PermitLifecycleEvent = {
    id: `PLC-${record.documentNumber.slice(-5)}-${(current?.events.length ?? 0) + 1}`,
    action: actionLabel,
    resultingStatus: status,
    orderReference: fields.orderReference.trim(),
    grounds: action === "reinstate" ? "Restriction lifted" : fields.grounds.trim(),
    reason: fields.reason.trim(),
    effectiveDate: fields.effectiveDate,
    endDate: fields.endDate,
    actor: fields.approvingOfficer.trim(),
    occurredAt,
  };
  const override: PermitLifecycleOverride = {
    documentNumber: record.documentNumber,
    sourceStatus,
    status,
    verificationStatus: action === "reinstate" ? "Active" : "Inactive",
    events: [...(current?.events ?? []), event],
    updatedAt: occurredAt,
  };
  return {
    record: { ...record, status, verificationStatus: override.verificationStatus, lastUpdated: occurredAt },
    override,
    event,
  };
}

export function mergePermitLifecycleOverrides(
  overrides: readonly PermitLifecycleOverride[],
  next: PermitLifecycleOverride,
) {
  return [next, ...overrides.filter((override) => override.documentNumber !== next.documentNumber)];
}

export function createPermitLifecycleHistory(
  record: PermitRegistryRecord,
  override?: PermitLifecycleOverride,
): PermitLifecycleEvent[] {
  const issued: PermitLifecycleEvent = {
    id: `PLC-${record.documentNumber.slice(-5)}-ISSUED`,
    action: "Issued",
    resultingStatus: record.documentType === "Closure Certificate" ? "Closed" : "Active",
    orderReference: record.applicationId,
    grounds: "Approved permit application",
    reason: `${record.documentType} signed and released through ${record.releaseChannel}.`,
    effectiveDate: record.issueDate,
    endDate: record.effectiveUntil,
    actor: record.releasingOfficer,
    occurredAt: `${record.issueDate} 16:00`,
  };
  if (override) return [issued, ...override.events].toReversed();
  if (record.status !== "Suspended" && record.status !== "Revoked") return [issued];
  return [
    {
      id: `PLC-${record.documentNumber.slice(-5)}-RESTRICTION`,
      action: record.status,
      resultingStatus: record.status,
      orderReference: `MO-${record.fiscalPeriod}-${record.documentNumber.slice(-5)}`,
      grounds: record.status === "Revoked" ? "Material misrepresentation" : "Violation of permit conditions",
      reason: `Registry restriction recorded after compliance review by the Matnog BPLO.`,
      effectiveDate: record.lastUpdated.slice(0, 10),
      endDate: "",
      actor: PERMIT_LIFECYCLE_ACTOR,
      occurredAt: record.lastUpdated,
    },
    issued,
  ];
}
