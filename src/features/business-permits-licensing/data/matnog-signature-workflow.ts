import type { PermitDocumentOverride, PermitReleaseOverride } from "../types/application-detail";
import type { ApplicationDirectoryRecord } from "../types/application-directory";
import { MATNOG_APPLICATION_DIRECTORY } from "./matnog-application-directory";
import { seededSignatureStatus } from "./signature-seed-rules";

const PROVIDERS = ["DocuSign", "DocuSign", "Manual digital signature"] as const;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function createDocument(application: ApplicationDirectoryRecord, queueIndex: number): PermitDocumentOverride {
  const sequence = application.id.slice(-5);
  const closure = application.type === "Closure";
  const filedDay = application.filedAt.startsWith("2026-09") ? Number(application.filedAt.slice(8, 10)) : 1;
  const generatedDay = Math.max(3 + (queueIndex % 19), filedDay);
  const generatedAt = `2026-09-${pad(generatedDay)} ${pad(8 + (queueIndex % 8))}:20`;
  const documentNumber = `MATNOG-${closure ? "CC" : "BP"}-${application.fiscalPeriod}-${sequence}`;
  const provider = PROVIDERS[queueIndex % PROVIDERS.length];
  const version = 1 + (queueIndex % 7 === 0 ? 1 : 0);
  const documentVersion = {
    version,
    documentNumber,
    qrToken: `MTG-${application.fiscalPeriod}-${sequence}-${application.businessId.slice(-4)}`,
    templateName: closure ? "Business Closure Certificate v2.1" : "Unified Business Permit v4.2",
    issueDate: "2026-09-23",
    effectiveFrom: "2026-09-23",
    effectiveUntil: closure ? "" : "2026-12-31",
    signatoryName: "Hon. Roberto P. Hababag",
    signatoryTitle: "Municipal Mayor",
    signatureProvider: provider,
    conditions: "Subject to continued compliance with applicable municipal and national regulations.",
    generatedAt,
    generatedBy: "Maricel A. Gacosta",
  };
  return {
    applicationId: application.id,
    sourceStatus: application.status,
    status: "For signature",
    documentNumber,
    templateName: documentVersion.templateName,
    issueDate: documentVersion.issueDate,
    effectiveFrom: documentVersion.effectiveFrom,
    effectiveUntil: documentVersion.effectiveUntil,
    signatoryName: documentVersion.signatoryName,
    signatoryTitle: documentVersion.signatoryTitle,
    signatureProvider: provider,
    conditions: documentVersion.conditions,
    productionNotes: "Controlled document validated against the approved application and queued for signature.",
    qrToken: documentVersion.qrToken,
    versions: [documentVersion],
    actor: "Maricel A. Gacosta",
    updatedAt: generatedAt,
    events: [],
  };
}

function createRelease(
  application: ApplicationDirectoryRecord,
  document: PermitDocumentOverride,
  queueIndex: number,
): PermitReleaseOverride | undefined {
  const signatureStatus = seededSignatureStatus(queueIndex);
  if (signatureStatus === "Pending") return undefined;
  const generatedDay = Number(document.updatedAt.slice(8, 10));
  const sentDay = Math.max(5 + (queueIndex % 16), generatedDay);
  const sentDate = `2026-09-${pad(sentDay)}`;
  const completedDate = signatureStatus === "Sent" ? "" : `2026-09-${pad(Math.min(23, sentDay + 1))}`;
  const provider = PROVIDERS[queueIndex % PROVIDERS.length];
  const envelopeReference = `DSE-${application.fiscalPeriod}-${application.id.slice(-5)}-V${document.versions.at(-1)?.version ?? 1}`;
  const exception = ["Declined", "Failed"].includes(signatureStatus);
  const notes =
    signatureStatus === "Declined"
      ? "Signer declined because the delegated signatory authority requires correction."
      : signatureStatus === "Failed"
        ? "Signature provider callback failed after the envelope authentication window expired."
        : "";
  return {
    applicationId: application.id,
    sourceStatus: application.status,
    documentNumber: document.documentNumber,
    documentVersion: document.versions.at(-1)?.version ?? 1,
    qrToken: document.qrToken,
    signatureStatus,
    releaseStatus: signatureStatus === "Signed" ? "Ready for release" : "Not released",
    provider,
    envelopeReference,
    signerEmail: "mayor@matnog.gov.ph",
    sentDate,
    signedDate: signatureStatus === "Signed" ? completedDate : "",
    signatureNotes: notes,
    attempts: [
      {
        id: `SIG-${application.id.slice(-5)}-1`,
        provider,
        envelopeReference,
        signerEmail: "mayor@matnog.gov.ph",
        status: signatureStatus,
        sentAt: `${sentDate} 09:30`,
        completedAt: completedDate ? `${completedDate} 14:10` : "",
        notes,
      },
    ],
    releaseChannel: "Digital email",
    releaseDate: "2026-09-23",
    recipientName: application.ownerName,
    recipientIdentification: "",
    recipientContact: "",
    releasingOfficer: "Maricel A. Gacosta",
    acknowledgmentReference: `ACK-${application.fiscalPeriod}-${application.id.slice(-5)}`,
    acknowledgmentConfirmed: false,
    releaseNotes: exception ? "Release remains locked until a successful signature is recorded." : "",
    verificationStatus: "Pending",
    actor: "Maricel A. Gacosta",
    updatedAt: completedDate ? `${completedDate} 14:10` : `${sentDate} 09:30`,
    events: [],
  };
}

const signatureApplications = MATNOG_APPLICATION_DIRECTORY.filter(
  (application) => application.status === "Ready to issue" && application.currentStage !== "Completed",
);

export const MATNOG_SIGNATURE_DOCUMENTS: readonly PermitDocumentOverride[] = signatureApplications.map(createDocument);

export const MATNOG_SIGNATURE_RELEASES: readonly PermitReleaseOverride[] = signatureApplications.flatMap(
  (application, queueIndex) => {
    const release = createRelease(application, MATNOG_SIGNATURE_DOCUMENTS[queueIndex], queueIndex);
    return release ? [release] : [];
  },
);
