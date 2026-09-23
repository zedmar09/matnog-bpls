import type {
  BusinessActivityCategory,
  BusinessDirectoryOrganization,
  BusinessEstablishmentType,
  BusinessRegistrationAuthority,
  BusinessRiskLevel,
} from "./business-directory";

export type BusinessRegistrationValues = {
  registeredName: string;
  tradeName: string;
  organizationType: BusinessDirectoryOrganization;
  registrationAuthority: BusinessRegistrationAuthority;
  registrationNumber: string;
  registrationDate: string;
  establishmentType: BusinessEstablishmentType;
  tin: string;
  ownerName: string;
  ownerPosition: string;
  contactNumber: string;
  alternateContact: string;
  email: string;
  activityCategory: BusinessActivityCategory | "";
  primaryActivity: string;
  psicCode: string;
  riskLevel: BusinessRiskLevel;
  barangay: string;
  street: string;
  building: string;
  sitio: string;
  postalCode: string;
  landmark: string;
  employeeCount: string;
  maleEmployees: string;
  femaleEmployees: string;
  capitalization: string;
  grossSales: string;
  startOfOperations: string;
  accountingPeriod: string;
  declarationAccepted: boolean;
};

export type BusinessRegistrationErrors = Partial<Record<keyof BusinessRegistrationValues, string>>;

export const EMPTY_BUSINESS_REGISTRATION: BusinessRegistrationValues = {
  registeredName: "",
  tradeName: "",
  organizationType: "Sole proprietorship",
  registrationAuthority: "DTI",
  registrationNumber: "",
  registrationDate: "",
  establishmentType: "Main office",
  tin: "",
  ownerName: "",
  ownerPosition: "Owner / Proprietor",
  contactNumber: "",
  alternateContact: "",
  email: "",
  activityCategory: "",
  primaryActivity: "",
  psicCode: "",
  riskLevel: "Low",
  barangay: "",
  street: "",
  building: "",
  sitio: "",
  postalCode: "4708",
  landmark: "",
  employeeCount: "",
  maleEmployees: "",
  femaleEmployees: "",
  capitalization: "",
  grossSales: "",
  startOfOperations: "",
  accountingPeriod: "Calendar year",
  declarationAccepted: false,
};
