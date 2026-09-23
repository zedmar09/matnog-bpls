import type {
  ApplicationOfficeReview,
  ApplicationProcessingGate,
  ApplicationRequirementDetail,
  ApplicationReviewStatus,
  ApplicationTimelineEvent,
  AssessmentFeeItem,
  BploDecisionResult,
  BploReviewAction,
  BploReviewOverride,
  FireDecisionResult,
  FireReviewAction,
  FireReviewOverride,
  HealthDecisionResult,
  HealthReviewAction,
  HealthReviewOverride,
  PaymentConfirmationAction,
  PaymentConfirmationOverride,
  PaymentConfirmationResult,
  PaymentTransaction,
  TreasurerAssessmentAction,
  TreasurerAssessmentOverride,
  TreasurerAssessmentResult,
  ZoningDecisionResult,
  ZoningReviewAction,
  ZoningReviewOverride,
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
export const ZONING_REVIEW_STORAGE_KEY = "matnog-bpls-zoning-review-overrides-v1";
export const ZONING_REVIEW_ACTOR = "Angela F. Dela Cruz";
export const HEALTH_REVIEW_STORAGE_KEY = "matnog-bpls-health-review-overrides-v1";
export const HEALTH_REVIEW_ACTOR = "Dr. Elena M. Frilles";
export const HEALTH_COMPLIANCE_AREAS = [
  "Sanitation",
  "Water supply",
  "Waste disposal",
  "Food handling",
  "Employee health",
] as const;
export const FIRE_REVIEW_STORAGE_KEY = "matnog-bpls-fire-review-overrides-v1";
export const FIRE_REVIEW_ACTOR = "FO2 Catherine O. Fortes";
export const FIRE_SAFETY_CONTROLS = [
  "Fire extinguishers",
  "Emergency exits",
  "Alarm and detection",
  "Electrical safety",
  "Emergency plan",
] as const;
export const TREASURER_ASSESSMENT_STORAGE_KEY = "matnog-bpls-treasurer-assessment-overrides-v1";
export const TREASURER_ASSESSMENT_ACTOR = "Rogelio M. Funes";
export const DEFAULT_ASSESSMENT_RULE = "Matnog Revenue Code 2025 · Configured sample";
export const PAYMENT_CONFIRMATION_STORAGE_KEY = "matnog-bpls-payment-confirmation-overrides-v1";
export const PAYMENT_CONFIRMATION_ACTOR = "Rogelio M. Funes";
export const PAYMENT_CHANNELS = [
  "Municipal Treasurer cash / counter",
  "GCash",
  "Maya",
  "LandBank Link.Biz",
  "Bank e-channel",
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

export function createApplicationRequirements(
  record: ApplicationDirectoryRecord,
  override?: BploReviewOverride,
  zoningOverride?: ZoningReviewOverride,
  healthOverride?: HealthReviewOverride,
  fireOverride?: FireReviewOverride,
  treasurerOverride?: TreasurerAssessmentOverride,
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
    if (
      zoningOverride?.status === "For correction" &&
      zoningOverride.affectedRequirementIds.includes(`REQ-${record.id.slice(-5)}-${index + 1}`)
    )
      status = "Returned";
    if (
      healthOverride?.status === "For correction" &&
      healthOverride.affectedRequirementIds.includes(`REQ-${record.id.slice(-5)}-${index + 1}`)
    )
      status = "Returned";
    if (
      fireOverride?.status === "For correction" &&
      fireOverride.affectedRequirementIds.includes(`REQ-${record.id.slice(-5)}-${index + 1}`)
    )
      status = "Returned";
    if (
      treasurerOverride?.status === "For correction" &&
      treasurerOverride.affectedRequirementIds.includes(`REQ-${record.id.slice(-5)}-${index + 1}`)
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
  zoningOverride?: ZoningReviewOverride,
  healthOverride?: HealthReviewOverride,
  fireOverride?: FireReviewOverride,
  treasurerOverride?: TreasurerAssessmentOverride,
): ApplicationOfficeReview[] {
  let statuses: ApplicationReviewStatus[] = reviewStatuses(record);
  if (override?.status === "Approved")
    statuses = ["Approved", "In review", "Not started", "Not started", "Not started", "Not started"];
  else if (override?.status === "For correction")
    statuses = ["For correction", "Not started", "Not started", "Not started", "Not started", "Not started"];
  if (zoningOverride) {
    const nextStatus = ["Approved", "Not applicable"].includes(zoningOverride.status) ? "In review" : "Not started";
    statuses = ["Approved", zoningOverride.status, nextStatus, "Not started", "Not started", "Not started"];
  }
  if (healthOverride) {
    const nextStatus = ["Approved", "Not applicable"].includes(healthOverride.status) ? "In review" : "Not started";
    statuses = [
      "Approved",
      zoningOverride?.status === "Not applicable" ? "Not applicable" : "Approved",
      healthOverride.status,
      nextStatus,
      "Not started",
      "Not started",
    ];
  }
  if (fireOverride) {
    const nextStatus = ["Approved", "Not applicable"].includes(fireOverride.status) ? "In review" : "Not started";
    statuses = [
      "Approved",
      zoningOverride?.status === "Not applicable" ? "Not applicable" : "Approved",
      healthOverride?.status === "Not applicable" ? "Not applicable" : "Approved",
      fireOverride.status,
      nextStatus,
      "Not started",
    ];
  }
  if (treasurerOverride) {
    const nextStatus =
      treasurerOverride.status === "Approved" && record.paymentStatus === "Paid" ? "In review" : "Not started";
    statuses = [
      "Approved",
      zoningOverride?.status === "Not applicable" ? "Not applicable" : "Approved",
      healthOverride?.status === "Not applicable" ? "Not applicable" : "Approved",
      fireOverride?.status === "Not applicable" ? "Not applicable" : "Approved",
      treasurerOverride.status,
      nextStatus,
    ];
  }
  const seed = sequence(record);
  return REVIEW_OFFICES.map(([office, assignee], index) => {
    const officeOverride =
      index === 0
        ? override
        : index === 1
          ? zoningOverride
          : index === 2
            ? healthOverride
            : index === 3
              ? fireOverride
              : index === 4
                ? treasurerOverride
                : undefined;
    const status = officeOverride?.status ?? statuses[index];
    return {
      id: `REV-${record.id.slice(-5)}-${index + 1}`,
      office,
      assignee,
      status,
      receivedAt: status === "Not started" ? "" : `2026-09-${String(11 + ((seed + index) % 9)).padStart(2, "0")} 09:15`,
      completedAt:
        status === "Approved"
          ? officeOverride
            ? officeOverride.updatedAt
            : `2026-09-${String(12 + ((seed + index) % 9)).padStart(2, "0")} 14:30`
          : "",
      remarks: officeOverride
        ? officeOverride.remarks
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
  const preAssessmentReviewsComplete = reviews
    .slice(0, 4)
    .every((item) => ["Approved", "Not applicable"].includes(item.status));
  const reviewsComplete = reviews.every((item) => ["Approved", "Not applicable"].includes(item.status));
  const assessed =
    ["Approved", "Not applicable"].includes(reviews[4]?.status) &&
    (record.assessmentAmount > 0 || record.paymentStatus === "Paid");
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
      status: assessed ? "Complete" : preAssessmentReviewsComplete ? "In progress" : "Pending",
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
  zoningOverride?: ZoningReviewOverride,
  healthOverride?: HealthReviewOverride,
  fireOverride?: FireReviewOverride,
  treasurerOverride?: TreasurerAssessmentOverride,
  paymentOverride?: PaymentConfirmationOverride,
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
      "Maricel A. Gacosta",
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
  if (override && sourceStatus !== record.status) {
    const base = createApplicationTimeline({ ...record, status: sourceStatus });
    return [
      ...base,
      ...override.events,
      ...(zoningOverride?.events ?? []),
      ...(healthOverride?.events ?? []),
      ...(fireOverride?.events ?? []),
      ...(treasurerOverride?.events ?? []),
      ...(paymentOverride?.events ?? []),
    ];
  }
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
  return [
    ...generated,
    ...(override?.events ?? []),
    ...(zoningOverride?.events ?? []),
    ...(healthOverride?.events ?? []),
    ...(fireOverride?.events ?? []),
    ...(treasurerOverride?.events ?? []),
    ...(paymentOverride?.events ?? []),
  ];
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

type ZoningDecisionFields = Pick<
  ZoningReviewOverride,
  "classification" | "compatibility" | "occupancyType" | "referenceNumber" | "remarks"
>;

export function validateZoningDecision(
  action: ZoningReviewAction,
  fields: ZoningDecisionFields,
  affectedRequirementIds: readonly string[],
) {
  if (action === "note" && fields.remarks.trim().length < 3) return "Enter an internal zoning note.";
  if (action === "return" && fields.remarks.trim().length < 10)
    return "Enter a correction reason of at least 10 characters.";
  if (action === "return" && affectedRequirementIds.length === 0) return "Select at least one affected requirement.";
  if (action === "not-applicable" && fields.remarks.trim().length < 10)
    return "Explain why zoning review is not applicable.";
  if (["approve", "not-applicable"].includes(action)) {
    if (!fields.classification.trim()) return "Select a zoning classification.";
    if (!fields.compatibility.trim()) return "Select the land-use compatibility result.";
    if (!fields.occupancyType.trim()) return "Select an occupancy type.";
    if (!fields.referenceNumber.trim()) return "Enter the locational review reference number.";
  }
  return "";
}

export function applyZoningDecision(
  record: ApplicationDirectoryRecord,
  current: ZoningReviewOverride | undefined,
  action: ZoningReviewAction,
  fields: ZoningDecisionFields,
  affectedRequirementIds: string[],
  occurredAt = "2026-09-23 17:20",
): ZoningDecisionResult {
  const status: ApplicationReviewStatus =
    action === "approve"
      ? "Approved"
      : action === "return"
        ? "For correction"
        : action === "not-applicable"
          ? "Not applicable"
          : (current?.status ?? "In review");
  const actionLabels: Record<ZoningReviewAction, string> = {
    approve: "Zoning and locational review approved",
    return: "Zoning review returned for correction",
    "not-applicable": "Zoning review marked not applicable",
    note: "Zoning internal note added",
  };
  const event: ApplicationTimelineEvent = {
    id: `EVT-${record.id.slice(-5)}-ZONING-${(current?.events.length ?? 0) + 1}`,
    action: actionLabels[action],
    detail:
      action === "return"
        ? `${fields.remarks.trim()} (${affectedRequirementIds.length} affected ${affectedRequirementIds.length === 1 ? "requirement" : "requirements"}).`
        : fields.remarks.trim() || "Zoning findings recorded with no unresolved land-use issues.",
    actor: ZONING_REVIEW_ACTOR,
    office: "MPDO / Zoning",
    occurredAt,
  };
  const override: ZoningReviewOverride = {
    applicationId: record.id,
    sourceStatus: current?.sourceStatus ?? record.status,
    status,
    classification: fields.classification.trim(),
    compatibility: fields.compatibility.trim(),
    occupancyType: fields.occupancyType.trim(),
    referenceNumber: fields.referenceNumber.trim(),
    remarks: fields.remarks.trim() || current?.remarks || "Zoning review completed with no unresolved findings.",
    affectedRequirementIds: action === "return" ? [...affectedRequirementIds] : [],
    actor: ZONING_REVIEW_ACTOR,
    updatedAt: occurredAt,
    events: [...(current?.events ?? []), event],
  };
  const completed = action === "approve" || action === "not-applicable";
  const updatedRecord: ApplicationDirectoryRecord = completed
    ? {
        ...record,
        status: "Under review",
        currentStage: "Health and sanitary review",
        assignedOfficer: "Dr. Elena M. Frilles",
        updatedAt: occurredAt,
      }
    : action === "return"
      ? {
          ...record,
          status: "For correction",
          currentStage: "Zoning review",
          assignedOfficer: ZONING_REVIEW_ACTOR,
          updatedAt: occurredAt,
        }
      : { ...record, updatedAt: occurredAt };
  return { record: updatedRecord, override, event };
}

export function mergeZoningReviewOverrides(overrides: readonly ZoningReviewOverride[], next: ZoningReviewOverride) {
  return [next, ...overrides.filter((item) => item.applicationId !== next.applicationId)];
}

type HealthDecisionFields = Pick<
  HealthReviewOverride,
  | "inspectionRequirement"
  | "inspectionDate"
  | "sanitaryCategory"
  | "inspectionResult"
  | "permitReference"
  | "complianceAreas"
  | "remarks"
>;

export function validateHealthDecision(
  action: HealthReviewAction,
  fields: HealthDecisionFields,
  affectedRequirementIds: readonly string[],
) {
  if (action === "note" && fields.remarks.trim().length < 3) return "Enter an internal health review note.";
  if (action === "return" && fields.remarks.trim().length < 10)
    return "Enter a correction reason of at least 10 characters.";
  if (action === "return" && affectedRequirementIds.length === 0) return "Select at least one affected requirement.";
  if (action === "not-applicable" && fields.remarks.trim().length < 10)
    return "Explain why health and sanitary review is not applicable.";
  if (["approve", "not-applicable"].includes(action)) {
    if (!fields.inspectionRequirement.trim()) return "Select an inspection requirement.";
    if (fields.inspectionRequirement === "On-site inspection required" && !fields.inspectionDate)
      return "Enter the completed inspection date.";
    if (!fields.sanitaryCategory.trim()) return "Select a sanitary classification.";
    if (!fields.inspectionResult.trim()) return "Select an inspection result.";
    if (!fields.permitReference.trim()) return "Enter the sanitary permit or review reference.";
  }
  if (action === "approve" && fields.inspectionResult === "Failed")
    return "A failed inspection cannot be approved. Return the application for correction.";
  if (action === "approve" && fields.complianceAreas.length !== HEALTH_COMPLIANCE_AREAS.length)
    return "Verify every sanitary compliance area before approval.";
  return "";
}

export function applyHealthDecision(
  record: ApplicationDirectoryRecord,
  current: HealthReviewOverride | undefined,
  action: HealthReviewAction,
  fields: HealthDecisionFields,
  affectedRequirementIds: string[],
  occurredAt = "2026-09-23 18:05",
): HealthDecisionResult {
  const status: ApplicationReviewStatus =
    action === "approve"
      ? "Approved"
      : action === "return"
        ? "For correction"
        : action === "not-applicable"
          ? "Not applicable"
          : (current?.status ?? "In review");
  const actionLabels: Record<HealthReviewAction, string> = {
    approve: "Health and sanitary review approved",
    return: "Health review returned for correction",
    "not-applicable": "Health review marked not applicable",
    note: "Health review internal note added",
  };
  const event: ApplicationTimelineEvent = {
    id: `EVT-${record.id.slice(-5)}-HEALTH-${(current?.events.length ?? 0) + 1}`,
    action: actionLabels[action],
    detail:
      action === "return"
        ? `${fields.remarks.trim()} (${affectedRequirementIds.length} affected ${affectedRequirementIds.length === 1 ? "requirement" : "requirements"}).`
        : fields.remarks.trim() || "Health and sanitary findings recorded with no unresolved deficiencies.",
    actor: HEALTH_REVIEW_ACTOR,
    office: "Municipal Health Office",
    occurredAt,
  };
  const override: HealthReviewOverride = {
    applicationId: record.id,
    sourceStatus: current?.sourceStatus ?? record.status,
    status,
    inspectionRequirement: fields.inspectionRequirement.trim(),
    inspectionDate: fields.inspectionDate,
    sanitaryCategory: fields.sanitaryCategory.trim(),
    inspectionResult: fields.inspectionResult.trim(),
    permitReference: fields.permitReference.trim(),
    complianceAreas: [...fields.complianceAreas],
    remarks: fields.remarks.trim() || current?.remarks || "Health and sanitary review completed without findings.",
    affectedRequirementIds: action === "return" ? [...affectedRequirementIds] : [],
    actor: HEALTH_REVIEW_ACTOR,
    updatedAt: occurredAt,
    events: [...(current?.events ?? []), event],
  };
  const completed = action === "approve" || action === "not-applicable";
  const updatedRecord: ApplicationDirectoryRecord = completed
    ? {
        ...record,
        status: "Under review",
        currentStage: "Fire safety review",
        assignedOfficer: "FO2 Catherine O. Fortes",
        updatedAt: occurredAt,
      }
    : action === "return"
      ? {
          ...record,
          status: "For correction",
          currentStage: "Health and sanitary review",
          assignedOfficer: HEALTH_REVIEW_ACTOR,
          updatedAt: occurredAt,
        }
      : { ...record, updatedAt: occurredAt };
  return { record: updatedRecord, override, event };
}

export function mergeHealthReviewOverrides(overrides: readonly HealthReviewOverride[], next: HealthReviewOverride) {
  return [next, ...overrides.filter((item) => item.applicationId !== next.applicationId)];
}

type FireDecisionFields = Pick<
  FireReviewOverride,
  | "inspectionRequirement"
  | "scheduledDate"
  | "inspectionDate"
  | "inspectionResult"
  | "fsicNumber"
  | "validUntil"
  | "safetyControls"
  | "remarks"
>;

export function validateFireDecision(
  action: FireReviewAction,
  fields: FireDecisionFields,
  affectedRequirementIds: readonly string[],
) {
  if (action === "note" && fields.remarks.trim().length < 3) return "Enter an internal fire review note.";
  if (action === "return" && fields.remarks.trim().length < 10)
    return "Enter a correction reason of at least 10 characters.";
  if (action === "return" && affectedRequirementIds.length === 0) return "Select at least one affected requirement.";
  if (action === "not-applicable" && fields.remarks.trim().length < 10)
    return "Explain why fire safety review is not applicable.";
  if (["approve", "not-applicable"].includes(action)) {
    if (!fields.inspectionRequirement.trim()) return "Select a fire inspection requirement.";
    if (fields.inspectionRequirement === "On-site inspection required" && !fields.scheduledDate)
      return "Enter the scheduled fire inspection date.";
    if (fields.inspectionRequirement === "On-site inspection required" && !fields.inspectionDate)
      return "Enter the completed fire inspection date.";
    if (fields.scheduledDate && fields.inspectionDate && fields.inspectionDate < fields.scheduledDate)
      return "The completed inspection date cannot be earlier than the scheduled date.";
    if (!fields.inspectionResult.trim()) return "Select a fire inspection result.";
    if (!fields.fsicNumber.trim()) return "Enter the FSIC or BFP review reference.";
    if (!fields.validUntil) return "Enter the FSIC validity date.";
    if (fields.inspectionDate && fields.validUntil <= fields.inspectionDate)
      return "The FSIC validity date must be after the inspection date.";
  }
  if (action === "approve" && fields.inspectionResult === "Failed")
    return "A failed fire inspection cannot be approved. Return the application for correction.";
  if (action === "approve" && fields.safetyControls.length !== FIRE_SAFETY_CONTROLS.length)
    return "Verify every required fire-safety control before approval.";
  return "";
}

export function applyFireDecision(
  record: ApplicationDirectoryRecord,
  current: FireReviewOverride | undefined,
  action: FireReviewAction,
  fields: FireDecisionFields,
  affectedRequirementIds: string[],
  occurredAt = "2026-09-23 18:40",
): FireDecisionResult {
  const status: ApplicationReviewStatus =
    action === "approve"
      ? "Approved"
      : action === "return"
        ? "For correction"
        : action === "not-applicable"
          ? "Not applicable"
          : (current?.status ?? "In review");
  const actionLabels: Record<FireReviewAction, string> = {
    approve: "Fire safety review approved",
    return: "Fire safety review returned for correction",
    "not-applicable": "Fire safety review marked not applicable",
    note: "Fire safety internal note added",
  };
  const event: ApplicationTimelineEvent = {
    id: `EVT-${record.id.slice(-5)}-FIRE-${(current?.events.length ?? 0) + 1}`,
    action: actionLabels[action],
    detail:
      action === "return"
        ? `${fields.remarks.trim()} (${affectedRequirementIds.length} affected ${affectedRequirementIds.length === 1 ? "requirement" : "requirements"}).`
        : fields.remarks.trim() || "Fire inspection completed with no unresolved safety deficiencies.",
    actor: FIRE_REVIEW_ACTOR,
    office: "Bureau of Fire Protection",
    occurredAt,
  };
  const override: FireReviewOverride = {
    applicationId: record.id,
    sourceStatus: current?.sourceStatus ?? record.status,
    status,
    inspectionRequirement: fields.inspectionRequirement.trim(),
    scheduledDate: fields.scheduledDate,
    inspectionDate: fields.inspectionDate,
    inspectionResult: fields.inspectionResult.trim(),
    fsicNumber: fields.fsicNumber.trim(),
    validUntil: fields.validUntil,
    safetyControls: [...fields.safetyControls],
    remarks: fields.remarks.trim() || current?.remarks || "Fire safety review completed without findings.",
    affectedRequirementIds: action === "return" ? [...affectedRequirementIds] : [],
    actor: FIRE_REVIEW_ACTOR,
    updatedAt: occurredAt,
    events: [...(current?.events ?? []), event],
  };
  const completed = action === "approve" || action === "not-applicable";
  const updatedRecord: ApplicationDirectoryRecord = completed
    ? {
        ...record,
        status: "Under review",
        currentStage: "Treasurer assessment",
        assignedOfficer: "Rogelio M. Funes",
        updatedAt: occurredAt,
      }
    : action === "return"
      ? {
          ...record,
          status: "For correction",
          currentStage: "Fire safety review",
          assignedOfficer: FIRE_REVIEW_ACTOR,
          updatedAt: occurredAt,
        }
      : { ...record, updatedAt: occurredAt };
  return { record: updatedRecord, override, event };
}

export function mergeFireReviewOverrides(overrides: readonly FireReviewOverride[], next: FireReviewOverride) {
  return [next, ...overrides.filter((item) => item.applicationId !== next.applicationId)];
}

export type TreasurerAssessmentFields = Pick<
  TreasurerAssessmentOverride,
  | "assessmentReference"
  | "ruleVersion"
  | "assessmentDate"
  | "dueDate"
  | "basisType"
  | "declaredAmount"
  | "assessmentType"
  | "exemptionBasis"
  | "feeItems"
  | "discount"
  | "surcharge"
  | "adjustment"
  | "adjustmentReason"
  | "remarks"
>;

export function calculateAssessmentFeeItems(declaredAmount: number): AssessmentFeeItem[] {
  const safeAmount = Math.max(0, declaredAmount);
  return [
    { id: "business-tax", label: "Business tax", amount: Math.round(safeAmount * 0.01) },
    { id: "mayors-permit", label: "Mayor's permit fee", amount: 1_200 },
    { id: "sanitary", label: "Sanitary inspection fee", amount: 300 },
    { id: "fire", label: "Fire inspection fee", amount: 500 },
    { id: "environmental", label: "Garbage / environmental fee", amount: 600 },
    { id: "signage", label: "Signage fee", amount: 250 },
    { id: "other", label: "Other local charges", amount: 0 },
  ];
}

export function createDefaultAssessmentFields(record: ApplicationDirectoryRecord): TreasurerAssessmentFields {
  const declaredAmount = 650_000 + (sequence(record) % 20) * 25_000;
  return {
    assessmentReference: `ASM-2026-${record.id.slice(-5)}`,
    ruleVersion: DEFAULT_ASSESSMENT_RULE,
    assessmentDate: "2026-09-23",
    dueDate: "2026-10-23",
    basisType: record.type === "New" ? "Declared capital investment" : "Prior-year gross receipts",
    declaredAmount,
    assessmentType: "Standard",
    exemptionBasis: "",
    feeItems: calculateAssessmentFeeItems(declaredAmount),
    discount: 0,
    surcharge: 0,
    adjustment: 0,
    adjustmentReason: "",
    remarks: "",
  };
}

export function calculateAssessmentTotals(fields: TreasurerAssessmentFields) {
  if (fields.assessmentType === "Zero / exempt") {
    return { subtotal: 0, deductions: 0, additions: 0, total: 0 };
  }
  const subtotal = fields.feeItems.reduce((sum, item) => sum + Math.max(0, item.amount), 0);
  const deductions = Math.max(0, fields.discount);
  const additions = Math.max(0, fields.surcharge) + fields.adjustment;
  return { subtotal, deductions, additions, total: Math.max(0, subtotal - deductions + additions) };
}

export function validateTreasurerAssessment(
  action: TreasurerAssessmentAction,
  fields: TreasurerAssessmentFields,
  affectedRequirementIds: readonly string[],
) {
  if (action === "save") return "";
  if (action === "return" && fields.remarks.trim().length < 10)
    return "Enter a correction reason of at least 10 characters.";
  if (action === "return" && affectedRequirementIds.length === 0) return "Select at least one affected requirement.";
  if (action === "post") {
    if (!fields.assessmentReference.trim()) return "Enter an assessment reference number.";
    if (!fields.ruleVersion.trim()) return "Select or enter the applicable revenue-code rule version.";
    if (!fields.assessmentDate) return "Enter the assessment date.";
    if (!fields.dueDate) return "Enter the payment due date.";
    if (fields.dueDate < fields.assessmentDate) return "The payment due date cannot be before the assessment date.";
    if (!fields.basisType.trim()) return "Select the assessment basis.";
    if (fields.declaredAmount < 0) return "The declared assessment basis cannot be negative.";
    if (fields.assessmentType === "Zero / exempt") {
      if (!fields.exemptionBasis.trim()) return "Enter the legal or administrative exemption basis.";
      if (fields.remarks.trim().length < 10) return "Enter a zero-assessment justification of at least 10 characters.";
    } else {
      if (fields.feeItems.length === 0) return "Add at least one assessment line item.";
      if (fields.feeItems.some((item) => !item.label.trim() || item.amount < 0))
        return "Every fee line requires a label and a non-negative amount.";
      if (calculateAssessmentTotals(fields).total <= 0)
        return "The standard assessment total must be greater than zero.";
    }
    if (fields.discount < 0 || fields.surcharge < 0) return "Discounts and surcharges cannot be negative.";
    if (fields.adjustment !== 0 && fields.adjustmentReason.trim().length < 10)
      return "Explain the manual adjustment using at least 10 characters.";
  }
  return "";
}

export function applyTreasurerAssessment(
  record: ApplicationDirectoryRecord,
  current: TreasurerAssessmentOverride | undefined,
  action: TreasurerAssessmentAction,
  fields: TreasurerAssessmentFields,
  affectedRequirementIds: string[],
  occurredAt = "2026-09-23 19:15",
): TreasurerAssessmentResult {
  const totals = calculateAssessmentTotals(fields);
  const status: ApplicationReviewStatus =
    action === "post" ? "Approved" : action === "return" ? "For correction" : (current?.status ?? "In review");
  const labels: Record<TreasurerAssessmentAction, string> = {
    save: "Treasurer assessment draft saved",
    return: "Treasurer assessment returned for correction",
    post: fields.assessmentType === "Zero / exempt" ? "Zero assessment posted" : "Treasurer assessment posted",
  };
  const event: ApplicationTimelineEvent = {
    id: `EVT-${record.id.slice(-5)}-TREASURER-${(current?.events.length ?? 0) + 1}`,
    action: labels[action],
    detail:
      action === "return"
        ? `${fields.remarks.trim()} (${affectedRequirementIds.length} affected ${affectedRequirementIds.length === 1 ? "requirement" : "requirements"}).`
        : action === "post"
          ? `${fields.assessmentReference.trim()} posted for ₱${totals.total.toLocaleString("en-PH")} under ${fields.ruleVersion.trim()}.`
          : "Assessment inputs and fee lines saved as a working draft.",
    actor: TREASURER_ASSESSMENT_ACTOR,
    office: "Municipal Treasurer's Office",
    occurredAt,
  };
  const override: TreasurerAssessmentOverride = {
    applicationId: record.id,
    sourceStatus: current?.sourceStatus ?? record.status,
    status,
    ...fields,
    assessmentReference: fields.assessmentReference.trim(),
    ruleVersion: fields.ruleVersion.trim(),
    basisType: fields.basisType.trim(),
    exemptionBasis: fields.exemptionBasis.trim(),
    feeItems: fields.feeItems.map((item) => ({ ...item, label: item.label.trim() })),
    adjustmentReason: fields.adjustmentReason.trim(),
    remarks:
      fields.remarks.trim() ||
      (action === "post" ? "Assessment posted with no unresolved Treasurer findings." : (current?.remarks ?? "")),
    affectedRequirementIds: action === "return" ? [...affectedRequirementIds] : [],
    actor: TREASURER_ASSESSMENT_ACTOR,
    updatedAt: occurredAt,
    events: [...(current?.events ?? []), event],
  };
  const zeroAssessment = fields.assessmentType === "Zero / exempt";
  const updatedRecord: ApplicationDirectoryRecord =
    action === "post"
      ? {
          ...record,
          status: "Under review",
          currentStage: zeroAssessment ? "Mayor's final approval" : "Payment confirmation",
          assignedOfficer: zeroAssessment ? "Roberto P. Hababag" : TREASURER_ASSESSMENT_ACTOR,
          assessmentAmount: totals.total,
          paymentStatus: zeroAssessment ? "Paid" : "Pending payment",
          updatedAt: occurredAt,
        }
      : action === "return"
        ? {
            ...record,
            status: "For correction",
            currentStage: "Treasurer assessment",
            assignedOfficer: TREASURER_ASSESSMENT_ACTOR,
            paymentStatus: "Not assessed",
            assessmentAmount: 0,
            updatedAt: occurredAt,
          }
        : { ...record, updatedAt: occurredAt };
  return { record: updatedRecord, override, event };
}

export function mergeTreasurerAssessmentOverrides(
  overrides: readonly TreasurerAssessmentOverride[],
  next: TreasurerAssessmentOverride,
) {
  return [next, ...overrides.filter((item) => item.applicationId !== next.applicationId)];
}

export type PaymentConfirmationFields = Pick<
  PaymentConfirmationOverride,
  | "channel"
  | "payerName"
  | "paymentDate"
  | "amount"
  | "referenceNumber"
  | "gatewayStatus"
  | "collectingOfficer"
  | "notes"
>;

export function createDefaultPaymentFields(record: ApplicationDirectoryRecord): PaymentConfirmationFields {
  return {
    channel: "",
    payerName: record.ownerName,
    paymentDate: "2026-09-23",
    amount: record.assessmentAmount,
    referenceNumber: "",
    gatewayStatus: "Pending verification",
    collectingOfficer: PAYMENT_CONFIRMATION_ACTOR,
    notes: "",
  };
}

export function calculatePaymentSummary(assessmentAmount: number, transactions: readonly PaymentTransaction[]) {
  const confirmedAmount = transactions.reduce(
    (sum, transaction) => sum + (transaction.status === "Confirmed" ? transaction.amount : 0),
    0,
  );
  return {
    confirmedAmount,
    outstandingBalance: Math.max(0, assessmentAmount - confirmedAmount),
  };
}

export function validatePaymentConfirmation(
  action: PaymentConfirmationAction,
  fields: PaymentConfirmationFields,
  assessmentAmount: number,
  transactions: readonly PaymentTransaction[],
) {
  if (action === "save") return fields.notes.trim().length >= 3 ? "" : "Enter a verification note.";
  if (!fields.channel.trim()) return "Select a payment channel.";
  if (!fields.payerName.trim()) return "Enter the payer name.";
  if (!fields.paymentDate) return "Enter the payment date.";
  if (fields.paymentDate > "2026-09-23") return "The payment date cannot be in the future.";
  if (fields.amount <= 0) return "Enter a payment amount greater than zero.";
  if (!fields.referenceNumber.trim()) return "Enter the counter or transaction reference.";
  if (
    transactions.some(
      (transaction) => transaction.referenceNumber.toLowerCase() === fields.referenceNumber.trim().toLowerCase(),
    )
  )
    return "This payment reference is already recorded.";
  if (!fields.collectingOfficer.trim()) return "Enter the collecting or verifying officer.";
  if (action === "reject") {
    if (fields.notes.trim().length < 10) return "Enter a rejection reason of at least 10 characters.";
    if (!["Failed", "Rejected"].includes(fields.gatewayStatus)) return "Set the gateway status to Failed or Rejected.";
    return "";
  }
  const online = fields.channel !== "Municipal Treasurer cash / counter";
  if (online && fields.gatewayStatus !== "Successful")
    return "A successful gateway status is required before confirming an online payment.";
  const { outstandingBalance } = calculatePaymentSummary(assessmentAmount, transactions);
  if (fields.amount > outstandingBalance) return "The payment amount cannot exceed the outstanding balance.";
  return "";
}

export function validatePaymentReversal(
  transactionId: string,
  reason: string,
  transactions: readonly PaymentTransaction[],
) {
  const transaction = transactions.find((item) => item.id === transactionId);
  if (transaction?.status !== "Confirmed") return "Select a confirmed payment to reverse.";
  if (reason.trim().length < 10) return "Enter a reversal reason of at least 10 characters.";
  return "";
}

export function applyPaymentConfirmation(
  record: ApplicationDirectoryRecord,
  assessmentReference: string,
  current: PaymentConfirmationOverride | undefined,
  action: PaymentConfirmationAction,
  fields: PaymentConfirmationFields,
  occurredAt = "2026-09-23 20:10",
): PaymentConfirmationResult {
  const transactionNumber = (current?.transactions.length ?? 0) + 1;
  const status = action === "confirm" ? "Confirmed" : "Rejected";
  const transaction: PaymentTransaction | undefined =
    action === "save"
      ? undefined
      : {
          id: `PAY-${record.id.slice(-5)}-${transactionNumber}`,
          ...fields,
          referenceNumber: fields.referenceNumber.trim(),
          payerName: fields.payerName.trim(),
          collectingOfficer: fields.collectingOfficer.trim(),
          officialReceiptNumber:
            action === "confirm"
              ? `OR-2026-${record.id.slice(-5)}-${String(
                  (current?.transactions.filter((item) => item.status === "Confirmed").length ?? 0) + 1,
                ).padStart(2, "0")}`
              : "",
          status,
          notes: fields.notes.trim(),
          recordedAt: occurredAt,
          reversedAt: "",
          reversalReason: "",
        };
  const transactions = transaction ? [...(current?.transactions ?? []), transaction] : (current?.transactions ?? []);
  const summary = calculatePaymentSummary(record.assessmentAmount, transactions);
  const paid = action === "confirm" && summary.outstandingBalance === 0;
  const labels: Record<PaymentConfirmationAction, string> = {
    save: "Payment verification note saved",
    confirm: paid ? "Payment completed and confirmed" : "Partial payment confirmed",
    reject: "Payment transaction rejected",
  };
  const event: ApplicationTimelineEvent = {
    id: `EVT-${record.id.slice(-5)}-PAYMENT-${(current?.events.length ?? 0) + 1}`,
    action: labels[action],
    detail:
      action === "save"
        ? fields.notes.trim()
        : action === "confirm"
          ? `${transaction?.officialReceiptNumber} issued for ₱${fields.amount.toLocaleString("en-PH")} via ${fields.channel}. ₱${summary.outstandingBalance.toLocaleString("en-PH")} remains outstanding.`
          : `${fields.referenceNumber.trim()} rejected: ${fields.notes.trim()}`,
    actor: PAYMENT_CONFIRMATION_ACTOR,
    office: "Municipal Treasurer's Office",
    occurredAt,
  };
  const resetFields = createDefaultPaymentFields({
    ...record,
    assessmentAmount: summary.outstandingBalance,
  });
  const override: PaymentConfirmationOverride = {
    applicationId: record.id,
    sourceStatus: current?.sourceStatus ?? record.status,
    assessmentReference,
    assessmentAmount: record.assessmentAmount,
    ...(action === "save" ? fields : resetFields),
    amount: action === "save" ? fields.amount : summary.outstandingBalance,
    transactions,
    actor: PAYMENT_CONFIRMATION_ACTOR,
    updatedAt: occurredAt,
    events: [...(current?.events ?? []), event],
  };
  const updatedRecord: ApplicationDirectoryRecord =
    action === "confirm"
      ? {
          ...record,
          status: "Under review",
          currentStage: paid ? "Mayor's final approval" : "Payment confirmation",
          assignedOfficer: paid ? "Roberto P. Hababag" : PAYMENT_CONFIRMATION_ACTOR,
          paymentStatus: paid ? "Paid" : "Pending payment",
          updatedAt: occurredAt,
        }
      : { ...record, updatedAt: occurredAt };
  return { record: updatedRecord, override, event };
}

export function applyPaymentReversal(
  record: ApplicationDirectoryRecord,
  current: PaymentConfirmationOverride,
  transactionId: string,
  reason: string,
  occurredAt = "2026-09-23 20:30",
): PaymentConfirmationResult {
  const target = current.transactions.find((item) => item.id === transactionId);
  if (!target) throw new Error("Payment transaction not found.");
  const transactions = current.transactions.map((item) =>
    item.id === transactionId
      ? { ...item, status: "Reversed" as const, reversedAt: occurredAt, reversalReason: reason.trim() }
      : item,
  );
  const summary = calculatePaymentSummary(record.assessmentAmount, transactions);
  const event: ApplicationTimelineEvent = {
    id: `EVT-${record.id.slice(-5)}-PAYMENT-${current.events.length + 1}`,
    action: "Payment transaction reversed",
    detail: `${target.officialReceiptNumber} reversed: ${reason.trim()}`,
    actor: PAYMENT_CONFIRMATION_ACTOR,
    office: "Municipal Treasurer's Office",
    occurredAt,
  };
  const paid = summary.outstandingBalance === 0;
  const override: PaymentConfirmationOverride = {
    ...current,
    amount: summary.outstandingBalance,
    transactions,
    updatedAt: occurredAt,
    events: [...current.events, event],
  };
  const updatedRecord: ApplicationDirectoryRecord = {
    ...record,
    status: "Under review",
    currentStage: paid ? "Mayor's final approval" : "Payment confirmation",
    assignedOfficer: paid ? "Roberto P. Hababag" : PAYMENT_CONFIRMATION_ACTOR,
    paymentStatus: paid ? "Paid" : "Reversed",
    updatedAt: occurredAt,
  };
  return { record: updatedRecord, override, event };
}

export function mergePaymentConfirmationOverrides(
  overrides: readonly PaymentConfirmationOverride[],
  next: PaymentConfirmationOverride,
) {
  return [next, ...overrides.filter((item) => item.applicationId !== next.applicationId)];
}
