import type { BusinessDirectoryRecord } from "../types/business-directory";
import type { BusinessRegistrationErrors, BusinessRegistrationValues } from "../types/business-registration";

export const BUSINESS_DRAFT_STORAGE_KEY = "matnog-bpls-business-registration-draft-v1";
export const REGISTERED_BUSINESSES_STORAGE_KEY = "matnog-bpls-registered-businesses-v1";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^(?:\+63|0)\d{10}$/;
const TIN_PATTERN = /^\d{3}-?\d{3}-?\d{3}(?:-?\d{3})?$/;

export function validateBusinessRegistration(values: BusinessRegistrationValues): BusinessRegistrationErrors {
  const errors: BusinessRegistrationErrors = {};
  if (values.registeredName.trim().length < 2) errors.registeredName = "Enter the registered business name.";
  if (values.tradeName.trim().length < 2) errors.tradeName = "Enter the trade or establishment name.";
  if (!values.registrationNumber.trim()) errors.registrationNumber = "Enter the DTI, SEC, or CDA registration number.";
  if (!values.registrationDate) errors.registrationDate = "Select the registration date.";
  if (!TIN_PATTERN.test(values.tin.replaceAll(" ", ""))) errors.tin = "Use a valid 9 or 12-digit TIN.";
  if (values.ownerName.trim().length < 2) errors.ownerName = "Enter the owner or authorized representative.";
  if (!PHONE_PATTERN.test(values.contactNumber.replaceAll(/[\s-]/g, ""))) {
    errors.contactNumber = "Use an 11-digit Philippine mobile number.";
  }
  if (values.email && !EMAIL_PATTERN.test(values.email)) errors.email = "Enter a valid email address.";
  if (!values.activityCategory) errors.activityCategory = "Select an activity category.";
  if (values.primaryActivity.trim().length < 5) errors.primaryActivity = "Describe the primary business activity.";
  if (!/^\d{5}$/.test(values.psicCode)) errors.psicCode = "Enter a 5-digit PSIC code.";
  if (!values.barangay) errors.barangay = "Select the establishment barangay.";
  if (values.street.trim().length < 2) errors.street = "Enter the street or road.";
  const employees = Number(values.employeeCount);
  if (!values.employeeCount || !Number.isInteger(employees) || employees < 1)
    errors.employeeCount = "Enter at least one employee.";
  const male = Number(values.maleEmployees || 0);
  const female = Number(values.femaleEmployees || 0);
  if (male + female > employees) errors.employeeCount = "Male and female employee counts cannot exceed the total.";
  if (Number(values.capitalization) <= 0) errors.capitalization = "Enter the declared capitalization.";
  if (Number(values.grossSales) < 0 || values.grossSales === "")
    errors.grossSales = "Enter declared gross sales, including zero.";
  if (!values.startOfOperations) errors.startOfOperations = "Select the start of operations.";
  if (!values.declarationAccepted) errors.declarationAccepted = "Confirm the registration declaration.";
  return errors;
}

export function getStepErrors(errors: BusinessRegistrationErrors, step: number) {
  const fieldsByStep: (keyof BusinessRegistrationValues)[][] = [
    ["registeredName", "tradeName", "registrationNumber", "registrationDate", "tin"],
    ["ownerName", "contactNumber", "email"],
    ["activityCategory", "primaryActivity", "psicCode", "barangay", "street"],
    ["employeeCount", "capitalization", "grossSales", "startOfOperations"],
    ["declarationAccepted"],
  ];
  return fieldsByStep[step].filter((field) => errors[field]);
}

export function createRegisteredBusiness(
  values: BusinessRegistrationValues,
  sequence: number,
): BusinessDirectoryRecord {
  const today = new Date().toISOString().slice(0, 10);
  const addressParts = [
    values.building,
    values.street,
    values.sitio,
    `Barangay ${values.barangay}`,
    "Matnog",
    "Sorsogon",
  ]
    .map((part) => part.trim())
    .filter(Boolean);
  return {
    id: `BIZ-${new Date().getFullYear()}-${String(sequence).padStart(4, "0")}`,
    registeredName: values.registeredName.trim(),
    tradeName: values.tradeName.trim(),
    organizationType: values.organizationType,
    registrationAuthority: values.registrationAuthority,
    registrationNumber: values.registrationNumber.trim(),
    registrationDate: values.registrationDate,
    establishmentType: values.establishmentType,
    ownerName: values.ownerName.trim(),
    contactNumber: values.contactNumber.trim(),
    email: values.email.trim(),
    tin: values.tin.trim(),
    activityCategory: values.activityCategory || "Other services",
    primaryActivity: values.primaryActivity.trim(),
    psicCode: values.psicCode.trim(),
    riskLevel: values.riskLevel,
    barangay: values.barangay,
    address: addressParts.join(", "),
    employeeCount: Number(values.employeeCount),
    capitalization: Number(values.capitalization),
    grossSales: Number(values.grossSales),
    status: "For application",
    permitNumber: "Not issued",
    permitIssuedAt: "",
    permitValidUntil: "",
    createdAt: `${today} 08:00`,
    updatedAt: `${today} 08:00`,
  };
}
