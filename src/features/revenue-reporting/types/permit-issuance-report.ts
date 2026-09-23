import type { PermitRegistryRecord } from "@/features/business-permits-licensing/types/permit-registry";

export type PermitIssuanceFilters = {
  query: string;
  dateFrom: string;
  dateTo: string;
  fiscalPeriod: string;
  documentType: string;
  applicationType: string;
  barangay: string;
  status: string;
  releaseChannel: string;
  verificationStatus: string;
  releasingOfficer: string;
};

export type PermitIssuanceSummary = {
  total: number;
  active: number;
  closureCertificates: number;
  expiring: number;
  restricted: number;
  qrVerifiable: number;
};

export type PermitIssuanceGroup = { label: string; count: number };
export type PermitIssuanceRecord = PermitRegistryRecord;
