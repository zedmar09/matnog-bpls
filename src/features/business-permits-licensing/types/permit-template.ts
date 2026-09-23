export type PermitTemplateDocumentType = "Business Permit" | "Closure Certificate";
export type PermitTemplatePurpose = "Standard" | "Conditional" | "Amendment" | "Closure";
export type PermitTemplateStatus = "Active" | "Draft" | "Archived";
export type PermitTemplateOrientation = "Portrait" | "Landscape";
export type PermitTemplateQrPlacement = "Bottom right" | "Bottom left" | "Footer center";

export type PermitTemplateEvent = {
  id: string;
  action: "Created" | "Draft saved" | "Published" | "Archived" | "Duplicated";
  detail: string;
  actor: string;
  occurredAt: string;
};

export type PermitTemplateRecord = {
  id: string;
  code: string;
  name: string;
  documentType: PermitTemplateDocumentType;
  purpose: PermitTemplatePurpose;
  fiscalYear: string;
  version: number;
  status: PermitTemplateStatus;
  pageSize: "A4" | "Legal";
  orientation: PermitTemplateOrientation;
  numberingPattern: string;
  validityRule: string;
  defaultConditions: string;
  signatoryName: string;
  signatoryTitle: string;
  signatureProvider: string;
  qrPlacement: PermitTemplateQrPlacement;
  verificationLabel: string;
  reviewDate: string;
  changeNotes: string;
  usageCount: number;
  lastUsedAt: string;
  publishedAt: string;
  publishedBy: string;
  updatedAt: string;
  events: PermitTemplateEvent[];
};

export type PermitTemplateFormValues = Omit<
  PermitTemplateRecord,
  "id" | "status" | "usageCount" | "lastUsedAt" | "publishedAt" | "publishedBy" | "updatedAt" | "events"
>;

export type PermitTemplateFilters = {
  search: string;
  documentType: string;
  status: string;
  fiscalYear: string;
  signatureProvider: string;
  reviewState: string;
};

export type PermitTemplateSortKey =
  | "name"
  | "code"
  | "documentType"
  | "purpose"
  | "fiscalYear"
  | "version"
  | "status"
  | "reviewDate"
  | "usageCount"
  | "updatedAt";
