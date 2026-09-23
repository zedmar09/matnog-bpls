import type { ApplicationDirectoryRecord } from "@/features/business-permits-licensing/types/application-directory";

import type {
  ProcessingPerformanceFilters,
  ProcessingPerformanceGroup,
  ProcessingPerformanceRecord,
  ProcessingPerformanceSummary,
  ProcessingSlaState,
} from "../types/processing-performance-report";

export const PROCESSING_REFERENCE_DATE = "2026-09-23";

export const EMPTY_PROCESSING_FILTERS: ProcessingPerformanceFilters = {
  query: "",
  filedFrom: "2026-05-01",
  filedTo: "2026-09-23",
  fiscalPeriod: "",
  type: "",
  status: "",
  stage: "",
  assignedOfficer: "",
  barangay: "",
  riskLevel: "",
  priority: "",
  slaState: "",
};

function utcDay(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

export function calendarDays(from: string, to: string) {
  return Math.max(0, Math.round((utcDay(to) - utcDay(from)) / 86_400_000));
}

export function classifyProcessingSla(
  record: ApplicationDirectoryRecord,
  referenceDate = PROCESSING_REFERENCE_DATE,
): ProcessingSlaState {
  const terminal = record.status === "Issued" || record.status === "Closed";
  if (terminal) return record.updatedAt.slice(0, 10) <= record.targetRelease ? "Completed on time" : "Completed late";
  if (record.targetRelease < referenceDate) return "Overdue";
  if (calendarDays(referenceDate, record.targetRelease) <= 3) return "Due soon";
  return "On track";
}

export function projectProcessingPerformance(
  records: readonly ApplicationDirectoryRecord[],
  referenceDate = PROCESSING_REFERENCE_DATE,
): ProcessingPerformanceRecord[] {
  return records.map((record) => {
    const terminal = record.status === "Issued" || record.status === "Closed";
    const endpointDate = terminal ? record.updatedAt.slice(0, 10) : referenceDate;
    const elapsedDays = calendarDays(record.filedAt, endpointDate);
    const targetDays = calendarDays(record.filedAt, record.targetRelease);
    return {
      ...record,
      terminal,
      endpointDate,
      elapsedDays,
      targetDays,
      varianceDays: elapsedDays - targetDays,
      slaState: classifyProcessingSla(record, referenceDate),
    };
  });
}

export function filterProcessingPerformance(
  rows: readonly ProcessingPerformanceRecord[],
  filters: ProcessingPerformanceFilters,
) {
  const query = filters.query.trim().toLocaleLowerCase();
  return rows.filter((row) => {
    const haystack =
      `${row.id} ${row.businessId} ${row.businessName} ${row.ownerName} ${row.permitNumber} ${row.assignedOfficer}`.toLocaleLowerCase();
    return (
      (!query || haystack.includes(query)) &&
      (!filters.filedFrom || row.filedAt.slice(0, 10) >= filters.filedFrom) &&
      (!filters.filedTo || row.filedAt.slice(0, 10) <= filters.filedTo) &&
      (!filters.fiscalPeriod || row.fiscalPeriod === filters.fiscalPeriod) &&
      (!filters.type || row.type === filters.type) &&
      (!filters.status || row.status === filters.status) &&
      (!filters.stage || row.currentStage === filters.stage) &&
      (!filters.assignedOfficer || row.assignedOfficer === filters.assignedOfficer) &&
      (!filters.barangay || row.barangay === filters.barangay) &&
      (!filters.riskLevel || row.riskLevel === filters.riskLevel) &&
      (!filters.priority || row.priority === filters.priority) &&
      (!filters.slaState || row.slaState === filters.slaState)
    );
  });
}

export function summarizeProcessingPerformance(
  rows: readonly ProcessingPerformanceRecord[],
): ProcessingPerformanceSummary {
  const completed = rows.filter((row) => row.terminal);
  const durations = completed.map((row) => row.elapsedDays).sort((a, b) => a - b);
  const middle = Math.floor(durations.length / 2);
  const median = durations.length
    ? durations.length % 2
      ? durations[middle]
      : (durations[middle - 1] + durations[middle]) / 2
    : 0;
  const onTime = completed.filter((row) => row.slaState === "Completed on time").length;
  return {
    total: rows.length,
    completed: completed.length,
    averageTurnaround: completed.length
      ? completed.reduce((total, row) => total + row.elapsedDays, 0) / completed.length
      : 0,
    medianTurnaround: median,
    onTimeRate: completed.length ? (onTime / completed.length) * 100 : 0,
    overdueOpen: rows.filter((row) => row.slaState === "Overdue").length,
    correctionWorkload: rows.filter((row) => row.status === "For correction").length,
  };
}

export function groupProcessingPerformance(
  rows: readonly ProcessingPerformanceRecord[],
  readKey: (row: ProcessingPerformanceRecord) => string,
  readSecondary?: (row: ProcessingPerformanceRecord) => boolean,
): ProcessingPerformanceGroup[] {
  const groups = new Map<string, { count: number; secondary: number }>();
  for (const row of rows) {
    const key = readKey(row);
    const group = groups.get(key) ?? { count: 0, secondary: 0 };
    group.count += 1;
    if (readSecondary?.(row)) group.secondary += 1;
    groups.set(key, group);
  }
  return [...groups]
    .map(([label, values]) => ({ label, count: values.count, secondary: values.secondary }))
    .sort((left, right) => right.count - left.count);
}

export function averageTurnaroundByType(rows: readonly ProcessingPerformanceRecord[]) {
  const groups = new Map<string, number[]>();
  for (const row of rows) {
    if (!row.terminal) continue;
    const durations = groups.get(row.type) ?? [];
    durations.push(row.elapsedDays);
    groups.set(row.type, durations);
  }
  return [...groups]
    .map(([label, durations]) => ({
      label,
      count: Math.round(durations.reduce((total, value) => total + value, 0) / durations.length),
      secondary: durations.length,
    }))
    .sort((left, right) => right.count - left.count);
}

function escapeCsv(value: string | number) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function processingPerformanceToCsv(rows: readonly ProcessingPerformanceRecord[]) {
  const headings = [
    "Application",
    "Business",
    "Owner",
    "Barangay",
    "Type",
    "Status",
    "Current stage",
    "Assigned officer",
    "Filed date",
    "Target release",
    "End/reference date",
    "Elapsed days",
    "Target days",
    "Variance days",
    "SLA state",
    "Risk",
    "Priority",
    "Requirements",
  ];
  const values = rows.map((row) => [
    row.id,
    row.businessName,
    row.ownerName,
    row.barangay,
    row.type,
    row.status,
    row.currentStage,
    row.assignedOfficer,
    row.filedAt.slice(0, 10),
    row.targetRelease,
    row.endpointDate,
    row.elapsedDays,
    row.targetDays,
    row.varianceDays,
    row.slaState,
    row.riskLevel,
    row.priority,
    `${row.requirementsComplete}/${row.requirementsTotal}`,
  ]);
  return [headings, ...values].map((line) => line.map(escapeCsv).join(",")).join("\n");
}
