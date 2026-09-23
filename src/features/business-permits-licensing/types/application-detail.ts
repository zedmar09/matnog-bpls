export type ApplicationRequirementStatus = "Verified" | "Pending review" | "Missing" | "Returned";
export type ApplicationReviewStatus = "Approved" | "In review" | "Not started" | "For correction" | "Not applicable";
export type ApplicationGateStatus = "Complete" | "In progress" | "Blocked" | "Pending";
export type BploReviewAction = "approve" | "return" | "note";
export type ZoningReviewAction = "approve" | "return" | "not-applicable" | "note";
export type HealthReviewAction = "approve" | "return" | "not-applicable" | "note";
export type FireReviewAction = "approve" | "return" | "not-applicable" | "note";
export type TreasurerAssessmentAction = "save" | "return" | "post";
export type PaymentConfirmationAction = "save" | "confirm" | "reject";
export type MayorReviewAction = "approve" | "return" | "defer";
export type PaymentTransactionStatus = "Confirmed" | "Rejected" | "Reversed";

export type AssessmentFeeItem = {
  id: string;
  label: string;
  amount: number;
};

export type ApplicationRequirementDetail = {
  id: string;
  name: string;
  office: string;
  reference: string;
  status: ApplicationRequirementStatus;
  submittedAt: string;
  expiresAt: string;
  mandatory: boolean;
};

export type ApplicationOfficeReview = {
  id: string;
  office: string;
  assignee: string;
  status: ApplicationReviewStatus;
  receivedAt: string;
  completedAt: string;
  remarks: string;
};

export type ApplicationProcessingGate = {
  id: string;
  label: string;
  status: ApplicationGateStatus;
  detail: string;
};

export type ApplicationTimelineEvent = {
  id: string;
  action: string;
  detail: string;
  actor: string;
  office: string;
  occurredAt: string;
};

export type BploReviewOverride = {
  applicationId: string;
  sourceStatus: import("./application-directory").ApplicationDirectoryStatus;
  status: ApplicationReviewStatus;
  remarks: string;
  affectedRequirementIds: string[];
  actor: string;
  updatedAt: string;
  events: ApplicationTimelineEvent[];
};

export type BploDecisionResult = {
  record: import("./application-directory").ApplicationDirectoryRecord;
  override: BploReviewOverride;
  event: ApplicationTimelineEvent;
};

export type ZoningReviewOverride = {
  applicationId: string;
  sourceStatus: import("./application-directory").ApplicationDirectoryStatus;
  status: ApplicationReviewStatus;
  classification: string;
  compatibility: string;
  occupancyType: string;
  referenceNumber: string;
  remarks: string;
  affectedRequirementIds: string[];
  actor: string;
  updatedAt: string;
  events: ApplicationTimelineEvent[];
};

export type ZoningDecisionResult = {
  record: import("./application-directory").ApplicationDirectoryRecord;
  override: ZoningReviewOverride;
  event: ApplicationTimelineEvent;
};

export type HealthReviewOverride = {
  applicationId: string;
  sourceStatus: import("./application-directory").ApplicationDirectoryStatus;
  status: ApplicationReviewStatus;
  inspectionRequirement: string;
  inspectionDate: string;
  sanitaryCategory: string;
  inspectionResult: string;
  permitReference: string;
  complianceAreas: string[];
  remarks: string;
  affectedRequirementIds: string[];
  actor: string;
  updatedAt: string;
  events: ApplicationTimelineEvent[];
};

export type HealthDecisionResult = {
  record: import("./application-directory").ApplicationDirectoryRecord;
  override: HealthReviewOverride;
  event: ApplicationTimelineEvent;
};

export type FireReviewOverride = {
  applicationId: string;
  sourceStatus: import("./application-directory").ApplicationDirectoryStatus;
  status: ApplicationReviewStatus;
  inspectionRequirement: string;
  scheduledDate: string;
  inspectionDate: string;
  inspectionResult: string;
  fsicNumber: string;
  validUntil: string;
  safetyControls: string[];
  remarks: string;
  affectedRequirementIds: string[];
  actor: string;
  updatedAt: string;
  events: ApplicationTimelineEvent[];
};

export type FireDecisionResult = {
  record: import("./application-directory").ApplicationDirectoryRecord;
  override: FireReviewOverride;
  event: ApplicationTimelineEvent;
};

export type TreasurerAssessmentOverride = {
  applicationId: string;
  sourceStatus: import("./application-directory").ApplicationDirectoryStatus;
  status: ApplicationReviewStatus;
  assessmentReference: string;
  ruleVersion: string;
  assessmentDate: string;
  dueDate: string;
  basisType: string;
  declaredAmount: number;
  assessmentType: "Standard" | "Zero / exempt";
  exemptionBasis: string;
  feeItems: AssessmentFeeItem[];
  discount: number;
  surcharge: number;
  adjustment: number;
  adjustmentReason: string;
  remarks: string;
  affectedRequirementIds: string[];
  actor: string;
  updatedAt: string;
  events: ApplicationTimelineEvent[];
};

export type TreasurerAssessmentResult = {
  record: import("./application-directory").ApplicationDirectoryRecord;
  override: TreasurerAssessmentOverride;
  event: ApplicationTimelineEvent;
};

export type PaymentTransaction = {
  id: string;
  channel: string;
  payerName: string;
  paymentDate: string;
  amount: number;
  referenceNumber: string;
  gatewayStatus: string;
  collectingOfficer: string;
  officialReceiptNumber: string;
  status: PaymentTransactionStatus;
  notes: string;
  recordedAt: string;
  reversedAt: string;
  reversalReason: string;
};

export type PaymentConfirmationOverride = {
  applicationId: string;
  sourceStatus: import("./application-directory").ApplicationDirectoryStatus;
  assessmentReference: string;
  assessmentAmount: number;
  channel: string;
  payerName: string;
  paymentDate: string;
  amount: number;
  referenceNumber: string;
  gatewayStatus: string;
  collectingOfficer: string;
  notes: string;
  transactions: PaymentTransaction[];
  actor: string;
  updatedAt: string;
  events: ApplicationTimelineEvent[];
};

export type PaymentConfirmationResult = {
  record: import("./application-directory").ApplicationDirectoryRecord;
  override: PaymentConfirmationOverride;
  event: ApplicationTimelineEvent;
};

export type MayorReviewOverride = {
  applicationId: string;
  sourceStatus: import("./application-directory").ApplicationDirectoryStatus;
  status: ApplicationReviewStatus;
  decisionReference: string;
  decisionDate: string;
  effectiveFrom: string;
  effectiveUntil: string;
  permitClassification: string;
  returnDestination: string;
  conditions: string;
  remarks: string;
  actor: string;
  updatedAt: string;
  events: ApplicationTimelineEvent[];
};

export type MayorDecisionResult = {
  record: import("./application-directory").ApplicationDirectoryRecord;
  override: MayorReviewOverride;
  event: ApplicationTimelineEvent;
};
