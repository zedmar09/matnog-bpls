import type {
  ApplicationOfficeReview,
  ApplicationProcessingGate,
  ApplicationRequirementDetail,
  ApplicationReviewStatus,
  ApplicationTimelineEvent,
  BploDecisionResult,
  BploReviewAction,
  BploReviewOverride,
} from "../types/application-detail";
import type { ApplicationDirectoryRecord } from "../types/application-directory";

const REQUIREMENTS = [
  ["DTI / SEC / CDA registration", "BPLO", false],
  ["Barangay business clearance", "Barangay", true],
  ["Zoning / locational clearance", "MPDO / Zoning", true],
  ["Sanitary permit", "Municipal Health Office", true],
  ["Fire safety inspection certificate", "Bureau of Fire Protection", true],
  ["Community tax certificate", "Municipal Treasurer's Office", true],
  ["Occupancy permit", "Municipal Engineering Office", false],
  ["Lease contract / proof of ownership", "BPLO", false],
  ["Valid government-issued identification", "BPLO", false],
] as const;

const REVIEW_OFFICES = [
  ["BPLO completeness review", "Maricel A. Gacosta"],
  ["Zoning and locational review", "Angela F. Dela Cruz"],
  ["Health and sanitary review", "Dr. Elena M. Frilles"],
  ["Fire safety review", "FO2 Catherine O. Fortes"],
  ["Treasurer assessment", "Rogelio M. Funes"],
  ["Mayor's final approval", "Roberto P. Hababag"],
] as const;

export const BPLO_REVIEW_STORAGE_KEY = "matnog-bpls-bplo-review-overrides-v1";
export const BPLO_REVIEW_ACTOR = "Maricel A. Gacosta";

function sequence(record: ApplicationDirectoryRecord) {
  const digits = Number(record.id.replace(/\D/g, "").slice(-5));
  return Number.isFinite(digits) ? digits : 1;
}

export function resolveApplicationRecord(
  seeded: readonly ApplicationDirectoryRecord[],
  saved: readonly ApplicationDirectoryRecord[],
  id: string,
) {
  const normalized = id.toUpperCase();
  return (
    saved.find((record) => record.id.toUpperCase() === normalized) ?? seeded.find((record) => record.id === normalized)
  );
}

export function createApplicationRequirements(
  record: ApplicationDirectoryRecord,
  override?: BploReviewOverride,
): ApplicationRequirementDetail[] {
  const seed = sequence(record);
  const total = Math.min(REQUIREMENTS.length, Math.max(1, record.requirementsTotal));
  return REQUIREMENTS.slice(0, total).map(([name, office, expires], index) => {
    let status: ApplicationRequirementDetail["status"] = "Verified";
    if (index >= record.requirementsComplete) status = "Missing";
    else if (record.status === "Draft" && index === record.requirementsComplete - 1) status = "Pending review";
    else if (record.status === "Submitted" && index >= Math.max(0, record.requirementsComplete - 2))
      status = "Pending review";
    else if (!override && record.status === "For correction" && index === record.requirementsComplete - 1)
      status = "Returned";
    if (
      override?.status === "For correction" &&
      override.affectedRequirementIds.includes(`REQ-${record.id.slice(-5)}-${index + 1}`)
    )
      status = "Returned";
    return {
      id: `REQ-${record.id.slice(-5)}-${index + 1}`,
      name,
      office,
      reference:
        status === "Missing"
          ? "—"
          : `${office.slice(0, 3).toUpperCase()}-2026-${String(seed + index * 17).padStart(5, "0")}`,
      status,
      submittedAt:
        status === "Missing"
          ? ""
          : `2026-09-${String(4 + ((seed + index) % 17)).padStart(2, "0")} ${String(8 + (index % 7)).padStart(2, "0")}:20`,
      expiresAt: expires ? `2026-12-${String(15 + (index % 12)).padStart(2, "0")}` : "",
      mandatory: index !== 6,
    };
  });
}

function reviewStatuses(record: ApplicationDirectoryRecord): ApplicationReviewStatus[] {
  if (["Ready to issue", "Issued", "Closed"].includes(record.status)) return REVIEW_OFFICES.map(() => "Approved");
  if (record.status === "Draft") return REVIEW_OFFICES.map(() => "Not started");
  if (record.status === "Submitted")
    return ["In review", "Not started", "Not started", "Not started", "Not started", "Not started"];
  if (record.status === "For correction")
    return ["Approved", "For correction", "Not started", "Not started", "Not started", "Not started"];
  const progress = Math.max(1, Math.min(5, (sequence(record) % 5) + 1));
  return REVIEW_OFFICES.map((_, index) =>
    index < progress ? "Approved" : index === progress ? "In review" : "Not started",
  );
}

export function createOfficeReviews(
  record: ApplicationDirectoryRecord,
  override?: BploReviewOverride,
): ApplicationOfficeReview[] {
  const statuses: ApplicationReviewStatus[] = override
    ? override.status === "Approved"
      ? ["Approved", "In review", "Not started", "Not started", "Not started", "Not started"]
      : override.status === "For correction"
        ? ["For correction", "Not started", "Not started", "Not started", "Not started", "Not started"]
        : reviewStatuses(record)
    : reviewStatuses(record);
  const seed = sequence(record);
  return REVIEW_OFFICES.map(([office, assignee], index) => {
    const status = index === 0 && override ? override.status : statuses[index];
    return {
      id: `REV-${record.id.slice(-5)}-${index + 1}`,
      office,
      assignee,
      status,
      receivedAt: status === "Not started" ? "" : `2026-09-${String(11 + ((seed + index) % 9)).padStart(2, "0")} 09:15`,
      completedAt:
        status === "Approved"
          ? index === 0 && override
            ? override.updatedAt
            : `2026-09-${String(12 + ((seed + index) % 9)).padStart(2, "0")} 14:30`
          : "",
      remarks:
        index === 0 && override
          ? override.remarks
          : status === "Approved"
            ? "Review completed; no unresolved findings recorded."
            : status === "For correction"
              ? "Updated supporting evidence is required before review can resume."
              : status === "In review"
                ? "Assigned office is validating the submitted application packet."
                : "Waiting for the preceding processing gate.",
    };
  });
}

export function createProcessingGates(
  record: ApplicationDirectoryRecord,
  requirements: readonly ApplicationRequirementDetail[],
  reviews: readonly ApplicationOfficeReview[],
): ApplicationProcessingGate[] {
  const requirementsComplete = requirements.every((item) => !item.mandatory || item.status === "Verified");
  const reviewsComplete = reviews.every((item) => ["Approved", "Not applicable"].includes(item.status));
  const assessed = record.assessmentAmount > 0;
  const paid = record.paymentStatus === "Paid";
  return [
    {
      id: "requirements",
      label: "Requirements validation",
      status: requirementsComplete ? "Complete" : record.status === "For correction" ? "Blocked" : "In progress",
      detail: requirementsComplete ? "All mandatory evidence verified" : "Mandatory evidence still requires action",
    },
    {
      id: "reviews",
      label: "Office reviews",
      status: reviewsComplete ? "Complete" : requirementsComplete ? "In progress" : "Pending",
      detail: reviewsComplete ? "All applicable offices approved" : "Parallel office decisions are incomplete",
    },
    {
      id: "assessment",
      label: "Assessment",
      status: assessed ? "Complete" : reviewsComplete ? "In progress" : "Pending",
      detail: assessed
        ? `Assessment posted for ₱${record.assessmentAmount.toLocaleString("en-PH")}`
        : "Treasurer assessment not yet posted",
    },
    {
      id: "payment",
      label: "Payment confirmation",
      status: paid ? "Complete" : assessed ? "In progress" : "Pending",
      detail: paid ? "Official payment confirmation recorded" : "Payment gate is not yet satisfied",
    },
    {
      id: "issuance",
      label: record.type === "Closure" ? "Closure approval" : "Permit issuance",
      status: ["Issued", "Closed"].includes(record.status)
        ? "Complete"
        : paid && reviewsComplete
          ? "In progress"
          : "Pending",
      detail: ["Issued", "Closed"].includes(record.status)
        ? "Final municipal decision recorded"
        : "Final approval remains unavailable",
    },
  ];
}

export function createApplicationTimeline(
  record: ApplicationDirectoryRecord,
  override?: BploReviewOverride,
): ApplicationTimelineEvent[] {
  const seed = sequence(record);
  const events = [
    [
      "Application filed",
      `${record.type} application received through the ${seed % 2 ? "onsite" : "online"} channel.`,
      record.ownerName,
      "Applicant",
    ],
    ["Reference generated", `${record.id} created for fiscal period ${record.fiscalPeriod}.`, "System", "Matnog BPLS"],
    [
      "Requirements indexed",
      `${record.requirementsComplete} of ${record.requirementsTotal} submitted requirements indexed.`,
      record.assignedOfficer,
      "BPLO",
    ],
    [
      "Completeness review recorded",
      "Initial validation result recorded and routed to applicable offices.",
      "Maricel A. Gacosta",
      "BPLO",
    ],
    [
      "Zoning review updated",
      "Locational information checked against the establishment record.",
      "Angela F. Dela Cruz",
      "MPDO / Zoning",
    ],
    ["Joint review synchronized", "Health, fire, and treasury work items synchronized.", "System", "Matnog BPLS"],
    [
      "Assessment status updated",
      record.assessmentAmount ? "Treasurer assessment posted to the application." : "Assessment remains queued.",
      "Rogelio M. Funes",
      "Treasurer's Office",
    ],
    ["Application updated", `Workflow status set to ${record.status}.`, record.assignedOfficer, "BPLO"],
  ] as const;
  const count =
    record.status === "Draft" ? 2 : record.status === "Submitted" ? 3 : record.status === "For correction" ? 5 : 8;
  const sourceStatus = override?.sourceStatus ?? record.status;
  if (override && sourceStatus !== record.status)
    return [...createApplicationTimeline({ ...record, status: sourceStatus }), ...override.events];
  const generated = events.slice(0, count).map(([action, detail, actor, office], index) => ({
    id: `EVT-${record.id.slice(-5)}-${index + 1}`,
    action,
    detail,
    actor: actor === "Unassigned" ? "System queue" : actor,
    office,
    occurredAt:
      index === 0
        ? record.filedAt
        : `2026-09-${String(12 + ((seed + index) % 10)).padStart(2, "0")} ${String(9 + (index % 7)).padStart(2, "0")}:${index % 2 ? "40" : "15"}`,
  }));
  return override ? [...generated, ...override.events] : generated;
}

export function validateBploDecision(
  action: BploReviewAction,
  remarks: string,
  affectedRequirementIds: readonly string[],
) {
  if (action === "return" && remarks.trim().length < 10) return "Enter a correction reason of at least 10 characters.";
  if (action === "return" && affectedRequirementIds.length === 0) return "Select at least one affected requirement.";
  if (action === "note" && remarks.trim().length < 3) return "Enter an internal note.";
  return "";
}

export function applyBploDecision(
  record: ApplicationDirectoryRecord,
  current: BploReviewOverride | undefined,
  action: BploReviewAction,
  remarks: string,
  affectedRequirementIds: string[],
  occurredAt = "2026-09-23 16:45",
): BploDecisionResult {
  const normalizedRemarks = remarks.trim();
  const status =
    action === "approve" ? "Approved" : action === "return" ? "For correction" : (current?.status ?? "In review");
  const label =
    action === "approve"
      ? "BPLO completeness review approved"
      : action === "return"
        ? "BPLO review returned for correction"
        : "BPLO internal note added";
  const detail =
    action === "approve"
      ? normalizedRemarks || "Completeness requirements approved and application routed to zoning review."
      : action === "return"
        ? `${normalizedRemarks} (${affectedRequirementIds.length} affected ${affectedRequirementIds.length === 1 ? "requirement" : "requirements"}).`
        : normalizedRemarks;
  const event: ApplicationTimelineEvent = {
    id: `EVT-${record.id.slice(-5)}-BPLO-${(current?.events.length ?? 0) + 1}`,
    action: label,
    detail,
    actor: BPLO_REVIEW_ACTOR,
    office: "BPLO",
    occurredAt,
  };
  const override: BploReviewOverride = {
    applicationId: record.id,
    sourceStatus: current?.sourceStatus ?? record.status,
    status,
    remarks:
      normalizedRemarks ||
      (action === "approve" ? "Completeness review approved; no unresolved findings." : (current?.remarks ?? "")),
    affectedRequirementIds:
      action === "return"
        ? [...affectedRequirementIds]
        : action === "approve"
          ? []
          : (current?.affectedRequirementIds ?? []),
    actor: BPLO_REVIEW_ACTOR,
    updatedAt: occurredAt,
    events: [...(current?.events ?? []), event],
  };
  const updatedRecord: ApplicationDirectoryRecord =
    action === "approve"
      ? {
          ...record,
          status: "Under review",
          currentStage: "Zoning review",
          assignedOfficer: BPLO_REVIEW_ACTOR,
          updatedAt: occurredAt,
        }
      : action === "return"
        ? {
            ...record,
            status: "For correction",
            currentStage: "Data validation",
            assignedOfficer: BPLO_REVIEW_ACTOR,
            updatedAt: occurredAt,
          }
        : { ...record, updatedAt: occurredAt };
  return { record: updatedRecord, override, event };
}

export function mergeBploReviewOverrides(overrides: readonly BploReviewOverride[], next: BploReviewOverride) {
  return [next, ...overrides.filter((item) => item.applicationId !== next.applicationId)];
}
