import type { ApplicationDirectoryType, ApplicationPriority } from "./application-directory";

export type RequirementChoice = "missing" | "reuse" | "selected";

export type ApplicationWizardValues = {
  type: ApplicationDirectoryType;
  businessId: string;
  representativeRole: "Owner" | "Authorized representative";
  representativeName: string;
  representativePosition: string;
  contactNumber: string;
  email: string;
  fiscalPeriod: string;
  filingChannel: "Onsite" | "Online";
  priority: ApplicationPriority;
  assignedOfficer: string;
  activity: string;
  location: string;
  amendmentType: string;
  effectiveDate: string;
  transactionReason: string;
  closureDate: string;
  outstandingDeclared: boolean;
  requirements: Record<string, RequirementChoice>;
  declarationAccepted: boolean;
};

export type ApplicationWizardErrors = Partial<Record<keyof ApplicationWizardValues, string>>;

export type ApplicationWizardRequirement = {
  id: string;
  name: string;
  office: string;
  mandatory: boolean;
  reusable: boolean;
  expiresAt: string;
};
