import type {
  ApplicationOfficeReview,
  ApplicationProcessingGate,
  ApplicationRequirementDetail,
  ApplicationReviewStatus,
  ApplicationTimelineEvent,
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

export function createApplicationRequirements(record: ApplicationDirectoryRecord): ApplicationRequirementDetail[] {
  const seed = sequence(record);
  const total = Math.min(REQUIREMENTS.length, Math.max(1, record.requirementsTotal));
  return REQUIREMENTS.slice(0, total).map(([name, office, expires], index) => {
    let status: ApplicationRequirementDetail["status"] = "Verified";
    if (index >= record.requirementsComplete) status = "Missing";
    else if (record.status === "Draft" && index === record.requirementsComplete - 1) status = "Pending review";
    else if (record.status === "Submitted" && index >= Math.max(0, record.requirementsComplete - 2))
      status = "Pending review";
    else if (record.status === "For correction" && index === record.requirementsComplete - 1) status = "Returned";
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

export function createOfficeReviews(record: ApplicationDirectoryRecord): ApplicationOfficeReview[] {
  const statuses = reviewStatuses(record);
  const seed = sequence(record);
  return REVIEW_OFFICES.map(([office, assignee], index) => {
    const status = statuses[index];
    return {
      id: `REV-${record.id.slice(-5)}-${index + 1}`,
      office,
      assignee,
      status,
      receivedAt: status === "Not started" ? "" : `2026-09-${String(11 + ((seed + index) % 9)).padStart(2, "0")} 09:15`,
      completedAt: status === "Approved" ? `2026-09-${String(12 + ((seed + index) % 9)).padStart(2, "0")} 14:30` : "",
      remarks:
        status === "Approved"
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

export function createApplicationTimeline(record: ApplicationDirectoryRecord): ApplicationTimelineEvent[] {
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
  return events.slice(0, count).map(([action, detail, actor, office], index) => ({
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
}
