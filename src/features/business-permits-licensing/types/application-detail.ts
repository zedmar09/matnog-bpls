export type ApplicationRequirementStatus = "Verified" | "Pending review" | "Missing" | "Returned";
export type ApplicationReviewStatus = "Approved" | "In review" | "Not started" | "For correction" | "Not applicable";
export type ApplicationGateStatus = "Complete" | "In progress" | "Blocked" | "Pending";
export type BploReviewAction = "approve" | "return" | "note";

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
