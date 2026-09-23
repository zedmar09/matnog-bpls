import type { ApplicationDirectoryRecord, ApplicationDirectoryType } from "../types/application-directory";
import type {
  ApplicationWizardErrors,
  ApplicationWizardRequirement,
  ApplicationWizardValues,
} from "../types/application-wizard";
import type { BusinessDirectoryRecord } from "../types/business-directory";

export const APPLICATION_DRAFT_STORAGE_KEY = "matnog-bpls-application-draft-v1";
export const SAVED_APPLICATIONS_STORAGE_KEY = "matnog-bpls-saved-applications-v1";

export const EMPTY_APPLICATION_WIZARD: ApplicationWizardValues = {
  type: "New",
  businessId: "",
  representativeRole: "Owner",
  representativeName: "",
  representativePosition: "Owner / Proprietor",
  contactNumber: "",
  email: "",
  fiscalPeriod: "2026",
  filingChannel: "Onsite",
  priority: "Normal",
  assignedOfficer: "Unassigned",
  activity: "",
  location: "",
  amendmentType: "",
  effectiveDate: "",
  transactionReason: "",
  closureDate: "",
  outstandingDeclared: false,
  requirements: {},
  declarationAccepted: false,
};

const REQUIREMENTS: readonly ApplicationWizardRequirement[] = [
  {
    id: "registration",
    name: "DTI / SEC / CDA registration",
    office: "BPLO",
    mandatory: true,
    reusable: true,
    expiresAt: "",
  },
  {
    id: "barangay",
    name: "Barangay business clearance",
    office: "Barangay",
    mandatory: true,
    reusable: false,
    expiresAt: "2026-12-31",
  },
  {
    id: "zoning",
    name: "Zoning / locational clearance",
    office: "MPDO / Zoning",
    mandatory: true,
    reusable: true,
    expiresAt: "2026-12-31",
  },
  {
    id: "sanitary",
    name: "Sanitary permit",
    office: "Municipal Health Office",
    mandatory: true,
    reusable: false,
    expiresAt: "2026-12-31",
  },
  {
    id: "fire",
    name: "Fire safety inspection certificate",
    office: "BFP",
    mandatory: true,
    reusable: false,
    expiresAt: "2026-12-31",
  },
  {
    id: "community-tax",
    name: "Community tax certificate",
    office: "Treasurer's Office",
    mandatory: true,
    reusable: false,
    expiresAt: "2026-12-31",
  },
  {
    id: "occupancy",
    name: "Occupancy permit",
    office: "Engineering Office",
    mandatory: false,
    reusable: true,
    expiresAt: "",
  },
  {
    id: "lease",
    name: "Lease contract / proof of ownership",
    office: "BPLO",
    mandatory: true,
    reusable: true,
    expiresAt: "",
  },
];

export function requirementsFor(type: ApplicationDirectoryType, business?: BusinessDirectoryRecord) {
  if (type === "Closure")
    return REQUIREMENTS.filter((item) => ["registration", "barangay", "community-tax", "lease"].includes(item.id));
  if (type === "Amendment") return REQUIREMENTS.filter((item) => item.id !== "community-tax");
  if (business?.riskLevel === "Low")
    return REQUIREMENTS.map((item) => (item.id === "sanitary" ? { ...item, mandatory: false } : item));
  return [...REQUIREMENTS];
}

export function initialRequirementChoices(
  requirements: readonly ApplicationWizardRequirement[],
): ApplicationWizardValues["requirements"] {
  return Object.fromEntries(
    requirements.map((item, index) => [item.id, item.reusable && index % 2 === 0 ? "reuse" : "missing"]),
  );
}

export function applicationValuesForBusiness(
  type: ApplicationDirectoryType,
  business?: BusinessDirectoryRecord,
): ApplicationWizardValues {
  const requirements = requirementsFor(type, business);
  return {
    ...EMPTY_APPLICATION_WIZARD,
    type,
    businessId: business?.id ?? "",
    representativeName: business?.ownerName ?? "",
    contactNumber: business?.contactNumber.replaceAll(" ", "") ?? "",
    email: business?.email ?? "",
    activity: business?.primaryActivity ?? "",
    location: business?.address ?? "",
    requirements: initialRequirementChoices(requirements),
  };
}

export function validateApplicationWizard(
  values: ApplicationWizardValues,
  requirements: readonly ApplicationWizardRequirement[],
) {
  const errors: ApplicationWizardErrors = {};
  if (!values.businessId) errors.businessId = "Select a registered business.";
  if (values.representativeName.trim().length < 2) errors.representativeName = "Enter the applicant or representative.";
  if (!/^(?:\+63|0)\d{10}$/.test(values.contactNumber.replaceAll(/[\s-]/g, "")))
    errors.contactNumber = "Use an 11-digit Philippine mobile number.";
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Enter a valid email address.";
  if (!/^20\d{2}$/.test(values.fiscalPeriod)) errors.fiscalPeriod = "Enter a valid four-digit fiscal period.";
  if (values.activity.trim().length < 5) errors.activity = "Confirm the primary business activity.";
  if (values.location.trim().length < 5) errors.location = "Confirm the establishment location.";
  if (values.type === "Amendment") {
    if (!values.amendmentType) errors.amendmentType = "Select the information being amended.";
    if (!values.effectiveDate) errors.effectiveDate = "Select the amendment effective date.";
    if (values.transactionReason.trim().length < 10) errors.transactionReason = "Describe the amendment reason.";
  }
  if (values.type === "Closure") {
    if (!values.closureDate) errors.closureDate = "Select the requested closure date.";
    if (values.transactionReason.trim().length < 10) errors.transactionReason = "Describe the closure reason.";
    if (!values.outstandingDeclared) errors.outstandingDeclared = "Confirm the outstanding-obligation declaration.";
  }
  const missing = requirements.filter(
    (item) => item.mandatory && (!values.requirements[item.id] || values.requirements[item.id] === "missing"),
  );
  if (missing.length)
    errors.requirements = `${missing.length} mandatory ${missing.length === 1 ? "requirement is" : "requirements are"} incomplete.`;
  if (!values.declarationAccepted) errors.declarationAccepted = "Confirm the application declaration.";
  return errors;
}

export function getApplicationStepErrors(errors: ApplicationWizardErrors, step: number) {
  const steps: (keyof ApplicationWizardValues)[][] = [
    ["businessId"],
    ["representativeName", "contactNumber", "email", "fiscalPeriod"],
    [
      "activity",
      "location",
      "amendmentType",
      "effectiveDate",
      "transactionReason",
      "closureDate",
      "outstandingDeclared",
    ],
    ["requirements"],
    ["declarationAccepted"],
  ];
  return steps[step].filter((field) => errors[field]);
}

export function createApplicationRecord(
  values: ApplicationWizardValues,
  business: BusinessDirectoryRecord,
  sequence: number,
  mode: "draft" | "submit",
): ApplicationDirectoryRecord {
  const complete = Object.values(values.requirements).filter((value) => value !== "missing").length;
  const total = requirementsFor(values.type, business).length;
  return {
    id: `APP-2026-${String(900 + sequence).padStart(5, "0")}`,
    businessId: business.id,
    businessName: business.tradeName,
    registeredName: business.registeredName,
    ownerName: business.ownerName,
    barangay: business.barangay,
    riskLevel: business.riskLevel,
    type: values.type,
    status: mode === "draft" ? "Draft" : "Submitted",
    fiscalPeriod: values.fiscalPeriod,
    filedAt: "2026-09-23 15:30",
    targetRelease: values.priority === "Urgent" ? "2026-09-28" : "2026-10-02",
    assignedOfficer: values.assignedOfficer,
    currentStage: mode === "draft" ? "Data validation" : "Requirements review",
    requirementsComplete: complete,
    requirementsTotal: total,
    assessmentAmount: 0,
    paymentStatus: "Not assessed",
    permitNumber: "Pending",
    priority: values.priority,
    updatedAt: "2026-09-23 15:30",
  };
}

export function mergeApplicationRecords(
  seeded: readonly ApplicationDirectoryRecord[],
  saved: readonly ApplicationDirectoryRecord[],
) {
  const savedIds = new Set(saved.map((record) => record.id));
  return [...saved, ...seeded.filter((record) => !savedIds.has(record.id))];
}
