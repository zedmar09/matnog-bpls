import { APPLICATION_REFERENCE_DATE } from "../data/matnog-application-directory";
import type {
  ApplicationDirectoryFilters,
  ApplicationDirectoryRecord,
  ApplicationDirectorySortKey,
} from "../types/application-directory";

export const EMPTY_APPLICATION_FILTERS: ApplicationDirectoryFilters = {
  search: "",
  type: "",
  status: "",
  fiscalPeriod: "",
  barangay: "",
  assignedOfficer: "",
  filedFrom: "",
  filedTo: "",
  targetFrom: "",
  targetTo: "",
  stage: "",
  completeness: "",
  paymentStatus: "",
  riskLevel: "",
  overdue: "",
  priority: "",
};

export function isApplicationOverdue(record: ApplicationDirectoryRecord) {
  return !["Issued", "Closed"].includes(record.status) && record.targetRelease < APPLICATION_REFERENCE_DATE;
}

export function filterApplications(
  records: readonly ApplicationDirectoryRecord[],
  filters: ApplicationDirectoryFilters,
) {
  const query = filters.search.trim().toLocaleLowerCase("en-PH");
  return records.filter((record) => {
    const haystack =
      `${record.id} ${record.businessId} ${record.businessName} ${record.registeredName} ${record.ownerName} ${record.assignedOfficer} ${record.barangay} ${record.permitNumber}`.toLocaleLowerCase(
        "en-PH",
      );
    const complete = record.requirementsComplete === record.requirementsTotal;
    return (
      (!query || haystack.includes(query)) &&
      (!filters.type || record.type === filters.type) &&
      (!filters.status || record.status === filters.status) &&
      (!filters.fiscalPeriod || record.fiscalPeriod === filters.fiscalPeriod) &&
      (!filters.barangay || record.barangay === filters.barangay) &&
      (!filters.assignedOfficer || record.assignedOfficer === filters.assignedOfficer) &&
      (!filters.filedFrom || record.filedAt.slice(0, 10) >= filters.filedFrom) &&
      (!filters.filedTo || record.filedAt.slice(0, 10) <= filters.filedTo) &&
      (!filters.targetFrom || record.targetRelease >= filters.targetFrom) &&
      (!filters.targetTo || record.targetRelease <= filters.targetTo) &&
      (!filters.stage || record.currentStage === filters.stage) &&
      (!filters.completeness || (filters.completeness === "complete" ? complete : !complete)) &&
      (!filters.paymentStatus || record.paymentStatus === filters.paymentStatus) &&
      (!filters.riskLevel || record.riskLevel === filters.riskLevel) &&
      (!filters.overdue ||
        (filters.overdue === "yes" ? isApplicationOverdue(record) : !isApplicationOverdue(record))) &&
      (!filters.priority || record.priority === filters.priority)
    );
  });
}

export function sortApplications(
  records: readonly ApplicationDirectoryRecord[],
  key: ApplicationDirectorySortKey,
  direction: "asc" | "desc",
) {
  const factor = direction === "asc" ? 1 : -1;
  return [...records].sort((left, right) => {
    const leftValue = key === "completeness" ? left.requirementsComplete / left.requirementsTotal : left[key];
    const rightValue = key === "completeness" ? right.requirementsComplete / right.requirementsTotal : right[key];
    if (typeof leftValue === "number" && typeof rightValue === "number") return (leftValue - rightValue) * factor;
    return String(leftValue).localeCompare(String(rightValue), "en-PH", { numeric: true }) * factor;
  });
}
