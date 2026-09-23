import { MATNOG_APPLICATION_DIRECTORY } from "../data/matnog-application-directory";
import { MATNOG_PERMIT_REGISTRY } from "../data/matnog-permit-registry";
import type { PermitDocumentOverride, PermitReleaseOverride } from "../types/application-detail";
import {
  EMPTY_PERMIT_REGISTRY_FILTERS,
  filterPermitRegistry,
  mergePermitRegistryRecords,
  resolvePublicPermitVerification,
  sortPermitRegistry,
  summarizePermitRegistry,
} from "./permit-registry-utils";
import assert from "node:assert/strict";
import test from "node:test";

const application = MATNOG_APPLICATION_DIRECTORY[0];
const document: PermitDocumentOverride = {
  applicationId: application.id,
  sourceStatus: application.status,
  status: "For signature",
  documentNumber: `MATNOG-BP-2026-${application.id.slice(-5)}`,
  templateName: "Matnog Business Permit · 2026",
  issueDate: "2026-09-23",
  effectiveFrom: "2026-09-23",
  effectiveUntil: "2026-12-31",
  signatoryName: "Roberto P. Hababag",
  signatoryTitle: "Municipal Mayor",
  signatureProvider: "DocuSign",
  conditions: "Subject to continuing municipal compliance.",
  productionNotes: "",
  qrToken: "MTG-2026-00301-0001",
  versions: [],
  actor: "Maricel A. Gacosta",
  updatedAt: "2026-09-23 21:30",
  events: [],
};
const release: PermitReleaseOverride = {
  applicationId: application.id,
  sourceStatus: application.status,
  documentNumber: document.documentNumber,
  documentVersion: 1,
  qrToken: document.qrToken,
  signatureStatus: "Signed",
  releaseStatus: "Released",
  provider: "DocuSign",
  envelopeReference: "DSE-2026-00301-V1",
  signerEmail: "mayor@matnog.gov.ph",
  sentDate: "2026-09-23",
  signedDate: "2026-09-23",
  signatureNotes: "",
  attempts: [],
  releaseChannel: "Digital email",
  releaseDate: "2026-09-23",
  recipientName: application.ownerName,
  recipientIdentification: "PhilSys ending 0301",
  recipientContact: "09170000000",
  releasingOfficer: "Maricel A. Gacosta",
  acknowledgmentReference: "ACK-2026-00301",
  acknowledgmentConfirmed: true,
  releaseNotes: "Released",
  verificationStatus: "Active",
  actor: "Maricel A. Gacosta",
  updatedAt: "2026-09-23 22:00",
  events: [],
};

test("generated documents replace seeded records from the same application", () => {
  const duplicateSeed = { ...MATNOG_PERMIT_REGISTRY[0], applicationId: application.id };
  const result = mergePermitRegistryRecords([duplicateSeed], [application], [document], [release]);
  assert.equal(result.length, 1);
  assert.equal(result[0].documentNumber, document.documentNumber);
  assert.equal(result[0].releaseStatus, "Released");
  assert.equal(result[0].verificationStatus, "Active");
});

test("unreleased generated documents remain outside the issued registry", () => {
  const result = mergePermitRegistryRecords([], [application], [document], []);
  assert.equal(result.length, 0);
});

test("registry filters search operational references and structured fields", () => {
  const records = mergePermitRegistryRecords([], [application], [document], [release]);
  assert.equal(filterPermitRegistry(records, { ...EMPTY_PERMIT_REGISTRY_FILTERS, search: document.qrToken }).length, 1);
  assert.equal(
    filterPermitRegistry(records, { ...EMPTY_PERMIT_REGISTRY_FILTERS, verificationStatus: "Inactive" }).length,
    0,
  );
});

test("registry sorting and summary are deterministic", () => {
  const records = MATNOG_PERMIT_REGISTRY.slice(0, 12);
  const sorted = sortPermitRegistry(records, "documentNumber", "asc");
  assert.ok(sorted[0].documentNumber.localeCompare(sorted.at(-1)?.documentNumber ?? "") <= 0);
  const summary = summarizePermitRegistry(records);
  assert.equal(summary.total, 12);
  assert.ok(summary.verified > 0);
});

test("public verification exposes only the approved public projection", () => {
  const record = { ...MATNOG_PERMIT_REGISTRY[1], status: "Active" as const, verificationStatus: "Active" as const };
  const result = resolvePublicPermitVerification([record], record.qrToken.toLocaleLowerCase());
  assert.equal(result?.verificationState, "Verified");
  assert.equal(result?.businessName, record.businessName);
  assert.equal("ownerName" in (result ?? {}), false);
  assert.equal("recipientContact" in (result ?? {}), false);
});

test("public verification distinguishes restricted, expired, and unknown documents", () => {
  const base = MATNOG_PERMIT_REGISTRY[1];
  assert.equal(
    resolvePublicPermitVerification([{ ...base, status: "Revoked", verificationStatus: "Inactive" }], base.qrToken)
      ?.verificationState,
    "Revoked",
  );
  assert.equal(
    resolvePublicPermitVerification([{ ...base, status: "Expired", verificationStatus: "Active" }], base.qrToken)
      ?.verificationState,
    "Expired",
  );
  assert.equal(resolvePublicPermitVerification([base], "UNKNOWN-TOKEN"), undefined);
});
