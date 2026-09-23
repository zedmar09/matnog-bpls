import type { PermitRegistryRecord, PermitRegistryStatus } from "../types/permit-registry";
import { MATNOG_APPLICATION_DIRECTORY } from "./matnog-application-directory";

const RELEASE_CHANNELS = ["Digital email", "Onsite pickup", "Printed counter release"] as const;
const OFFICERS = ["Maricel A. Gacosta", "Jocelyn B. Fajardo", "Nelson C. Gubat"] as const;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function permitStatus(index: number, closure: boolean): PermitRegistryStatus {
  if (closure) return "Closed";
  if (index % 19 === 0) return "Revoked";
  if (index % 13 === 0) return "Suspended";
  if (index % 7 === 0) return "Expired";
  if (index % 5 === 0) return "Expiring soon";
  return "Active";
}

export const MATNOG_PERMIT_REGISTRY: readonly PermitRegistryRecord[] = MATNOG_APPLICATION_DIRECTORY.filter(
  (application) => application.status === "Issued" || application.status === "Closed",
).map((application, index) => {
  const closure = application.type === "Closure" || application.status === "Closed";
  const sequence = application.id.slice(-5);
  const issueMonth = 1 + (index % 8);
  const issueDay = 4 + ((index * 3) % 22);
  const issueDate = `2026-${pad(issueMonth)}-${pad(issueDay)}`;
  const status = permitStatus(index, closure);
  const verificationStatus = status === "Revoked" ? "Inactive" : "Active";
  return {
    documentNumber: `MATNOG-${closure ? "CC" : "BP"}-${application.fiscalPeriod}-${sequence}`,
    applicationId: application.id,
    businessId: application.businessId,
    businessName: application.businessName,
    registeredName: application.registeredName,
    ownerName: application.ownerName,
    barangay: application.barangay,
    documentType: closure ? "Closure Certificate" : "Business Permit",
    applicationType: application.type,
    fiscalPeriod: application.fiscalPeriod,
    issueDate,
    effectiveFrom: issueDate,
    effectiveUntil: closure ? "" : status === "Expired" ? "2026-08-31" : "2026-12-31",
    releaseDate: issueDate,
    releaseChannel: RELEASE_CHANNELS[index % RELEASE_CHANNELS.length],
    status,
    signatureStatus: "Signed",
    releaseStatus: "Released",
    verificationStatus,
    qrToken: `MTG-${application.fiscalPeriod}-${sequence}-${application.businessId.slice(-4)}`,
    version: 1 + (index % 3 === 0 ? 1 : 0),
    releasingOfficer: OFFICERS[index % OFFICERS.length],
    lastUpdated: `${issueDate} ${pad(9 + (index % 7))}:${index % 2 === 0 ? "15" : "40"}`,
  } satisfies PermitRegistryRecord;
});
