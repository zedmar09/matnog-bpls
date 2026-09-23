import type { BusinessDirectoryRecord } from "../types/business-directory";
import type {
  BusinessProfileApplication,
  BusinessProfileAuditEvent,
  BusinessProfileDocument,
} from "../types/business-profile";

function sequence(record: BusinessDirectoryRecord) {
  const digits = Number(record.id.replace(/\D/g, "").slice(-4));
  return Number.isFinite(digits) ? digits : 1;
}

export function createApplicationHistory(record: BusinessDirectoryRecord): BusinessProfileApplication[] {
  if (record.status === "For application") return [];
  const seed = sequence(record);
  const currentStatus =
    record.status === "Expired" || record.status === "Closed" ? "Issued" : seed % 7 === 0 ? "Under review" : "Issued";
  return [0, 1, 2].map((offset) => {
    const year = 2026 - offset;
    const status = offset === 0 ? currentStatus : "Issued";
    return {
      id: `APP-${year}-${String(seed + offset * 193).padStart(5, "0")}`,
      type: offset === 2 ? "New" : "Renewal",
      period: String(year),
      filedAt: `${year}-01-${String(8 + ((seed + offset) % 18)).padStart(2, "0")}`,
      status,
      currentStage: status === "Issued" ? "Completed" : seed % 2 === 0 ? "Treasurer assessment" : "Joint inspection",
      assessmentAmount: 3_750 + (seed % 18) * 625 + offset * 180,
      permitNumber: status === "Issued" ? `BP-${year}-${String(seed + 100).padStart(5, "0")}` : "Pending",
    };
  });
}

export function createDocumentChecklist(record: BusinessDirectoryRecord): BusinessProfileDocument[] {
  const seed = sequence(record);
  const names = [
    ["DTI / SEC / CDA registration", "BPLO"],
    ["Barangay business clearance", "Barangay"],
    ["Zoning clearance", "MPDO / Zoning"],
    ["Sanitary permit", "Municipal Health Office"],
    ["Fire safety inspection certificate", "BFP"],
    ["Community tax certificate", "Treasurer's Office"],
    ["Occupancy permit", "Engineering Office"],
    ["Lease contract / proof of ownership", "BPLO"],
  ] as const;
  return names.map(([name, office], index) => {
    const status: BusinessProfileDocument["status"] =
      record.status === "For application"
        ? index < 2
          ? "Pending review"
          : "Not submitted"
        : index === 4 && seed % 4 === 0
          ? "Expiring soon"
          : index === 6 && seed % 5 === 0
            ? "Pending review"
            : "Verified";
    return {
      id: `DOC-${String(seed).padStart(4, "0")}-${index + 1}`,
      name,
      office,
      reference:
        status === "Not submitted"
          ? "—"
          : `${office.slice(0, 3).toUpperCase()}-${2026}-${String(seed + index * 7).padStart(5, "0")}`,
      uploadedAt: status === "Not submitted" ? "" : `2026-01-${String(4 + ((seed + index) % 23)).padStart(2, "0")}`,
      expiresAt:
        status === "Not submitted" || index === 0 || index === 7
          ? ""
          : `2026-12-${String(12 + (index % 16)).padStart(2, "0")}`,
      status,
    };
  });
}

export function createAuditTrail(record: BusinessDirectoryRecord): BusinessProfileAuditEvent[] {
  const seed = sequence(record);
  const events = [
    ["Business record updated", "Contact and establishment information reviewed.", "Angela F. Dela Cruz", "BPLO"],
    ["Document verified", "Barangay business clearance marked as verified.", "Ramon E. Fajardo", "BPLO"],
    ["Assessment posted", "Regulatory and business tax assessment recorded.", "Maria L. Frilles", "Treasurer's Office"],
    [
      "Joint inspection completed",
      "Inspection findings submitted by participating offices.",
      "Joel M. Guban",
      "Inspection Team",
    ],
    ["Fire clearance validated", "FSIC reference confirmed with the issuing office.", "Catherine O. Fortes", "BFP"],
    ["Application endorsed", "Application endorsed for final approval.", "Roberto P. Hababag", "BPLO"],
    ["Permit generated", "Digital permit generated with verification QR code.", "System", "Matnog BPLS"],
    ["Notification sent", "Permit release notice sent by SMS and email.", "System", "Notification Service"],
  ] as const;
  return events.slice(0, record.status === "For application" ? 2 : 8).map(([action, detail, actor, office], index) => ({
    id: `AUD-${seed}-${index + 1}`,
    action,
    detail,
    actor,
    office,
    occurredAt: `2026-${String(9 - Math.floor(index / 2)).padStart(2, "0")}-${String(22 - ((seed + index) % 12)).padStart(2, "0")} ${String(9 + (index % 7)).padStart(2, "0")}:${index % 2 === 0 ? "15" : "40"}`,
  }));
}
