import type { ApplicationDirectoryRecord } from "@/features/business-permits-licensing/types/application-directory";

export type ProcessingSlaState = "On track" | "Due soon" | "Overdue" | "Completed on time" | "Completed late";

export type ProcessingPerformanceRecord = ApplicationDirectoryRecord & {
  terminal: boolean;
  endpointDate: string;
  elapsedDays: number;
  targetDays: number;
  varianceDays: number;
  slaState: ProcessingSlaState;
};

export type ProcessingPerformanceFilters = {
  query: string;
  filedFrom: string;
  filedTo: string;
  fiscalPeriod: string;
  type: string;
  status: string;
  stage: string;
  assignedOfficer: string;
  barangay: string;
  riskLevel: string;
  priority: string;
  slaState: string;
};

export type ProcessingPerformanceSummary = {
  total: number;
  completed: number;
  averageTurnaround: number;
  medianTurnaround: number;
  onTimeRate: number;
  overdueOpen: number;
  correctionWorkload: number;
};

export type ProcessingPerformanceGroup = { label: string; count: number; secondary?: number };
