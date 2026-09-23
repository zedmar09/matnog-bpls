import type { PermitSignatureStatus } from "../types/application-detail";

export const SEEDED_SIGNATURE_STATUSES: readonly PermitSignatureStatus[] = [
  "Pending",
  "Sent",
  "Signed",
  "Signed",
  "Declined",
  "Failed",
];

export function seededSignatureStatus(queueIndex: number): PermitSignatureStatus {
  return SEEDED_SIGNATURE_STATUSES[queueIndex % SEEDED_SIGNATURE_STATUSES.length];
}

export function signatureStage(status: PermitSignatureStatus) {
  if (status === "Sent") return "Awaiting e-signature";
  if (status === "Signed") return "Ready for release";
  return "For e-signature";
}
