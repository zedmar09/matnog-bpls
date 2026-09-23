export type BusinessDirectoryStatus = "Active" | "Expiring soon" | "Expired" | "Suspended" | "Closed";

export type BusinessDirectoryOrganization =
  | "Sole proprietorship"
  | "Partnership"
  | "Corporation"
  | "One person corporation"
  | "Cooperative";

export type BusinessRegistrationAuthority = "DTI" | "SEC" | "CDA";
export type BusinessRiskLevel = "Low" | "Medium" | "High";
export type BusinessEstablishmentType = "Main office" | "Branch";

export type BusinessActivityCategory =
  | "Accommodation and food"
  | "Agriculture and fisheries"
  | "Construction and hardware"
  | "Financial and professional services"
  | "Health and personal care"
  | "Manufacturing"
  | "Retail and wholesale"
  | "Transportation and logistics"
  | "Travel and tourism"
  | "Other services";

export type BusinessDirectoryRecord = {
  id: string;
  registeredName: string;
  tradeName: string;
  organizationType: BusinessDirectoryOrganization;
  registrationAuthority: BusinessRegistrationAuthority;
  registrationNumber: string;
  registrationDate: string;
  establishmentType: BusinessEstablishmentType;
  ownerName: string;
  contactNumber: string;
  email: string;
  tin: string;
  activityCategory: BusinessActivityCategory;
  primaryActivity: string;
  psicCode: string;
  riskLevel: BusinessRiskLevel;
  barangay: string;
  address: string;
  employeeCount: number;
  capitalization: number;
  grossSales: number;
  status: BusinessDirectoryStatus;
  permitNumber: string;
  permitIssuedAt: string;
  permitValidUntil: string;
  createdAt: string;
  updatedAt: string;
};

export type BusinessDirectoryFilters = {
  search: string;
  barangay: string;
  organizationType: string;
  status: string;
  activityCategory: string;
  riskLevel: string;
  tradeName: string;
  ownerName: string;
  registrationAuthority: string;
  registrationNumber: string;
  permitNumber: string;
  establishmentType: string;
  address: string;
  contactNumber: string;
  email: string;
  employeeFrom: string;
  employeeTo: string;
  capitalizationFrom: string;
  capitalizationTo: string;
  registrationDateFrom: string;
  registrationDateTo: string;
  permitExpiryFrom: string;
  permitExpiryTo: string;
  updatedFrom: string;
  updatedTo: string;
  hasEmail: string;
};

export type BusinessDirectorySortKey =
  | "id"
  | "business"
  | "organizationType"
  | "ownerName"
  | "barangay"
  | "activityCategory"
  | "riskLevel"
  | "employeeCount"
  | "capitalization"
  | "status"
  | "permitNumber"
  | "permitValidUntil"
  | "updatedAt";
