export type BusinessProfileApplication = {
  id: string;
  type: "New" | "Renewal" | "Amendment";
  period: string;
  filedAt: string;
  status: "Draft" | "Under review" | "For correction" | "Issued";
  currentStage: string;
  assessmentAmount: number;
  permitNumber: string;
};

export type BusinessProfileDocument = {
  id: string;
  name: string;
  office: string;
  reference: string;
  uploadedAt: string;
  expiresAt: string;
  status: "Verified" | "Pending review" | "Expiring soon" | "Not submitted";
};

export type BusinessProfileAuditEvent = {
  id: string;
  action: string;
  detail: string;
  actor: string;
  office: string;
  occurredAt: string;
};
