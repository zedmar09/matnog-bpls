import type {
  BusinessDirectoryFilters,
  BusinessDirectoryRecord,
  BusinessDirectorySortKey,
} from "../types/business-directory";

export const EMPTY_BUSINESS_FILTERS: BusinessDirectoryFilters = {
  search: "",
  barangay: "",
  organizationType: "",
  status: "",
  activityCategory: "",
  riskLevel: "",
  tradeName: "",
  ownerName: "",
  registrationAuthority: "",
  registrationNumber: "",
  permitNumber: "",
  establishmentType: "",
  address: "",
  contactNumber: "",
  email: "",
  employeeFrom: "",
  employeeTo: "",
  capitalizationFrom: "",
  capitalizationTo: "",
  registrationDateFrom: "",
  registrationDateTo: "",
  permitExpiryFrom: "",
  permitExpiryTo: "",
  updatedFrom: "",
  updatedTo: "",
  hasEmail: "",
};

function includes(value: string, query: string) {
  return value.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
}

function withinNumeric(value: number, from: string, to: string) {
  return (!from || value >= Number(from)) && (!to || value <= Number(to));
}

function withinDate(value: string, from: string, to: string) {
  const date = value.slice(0, 10);
  return (!from || date >= from) && (!to || date <= to);
}

export function filterBusinesses(records: readonly BusinessDirectoryRecord[], filters: BusinessDirectoryFilters) {
  const query = filters.search.trim().toLocaleLowerCase();

  return records.filter((record) => {
    const searchable = [
      record.id,
      record.registeredName,
      record.tradeName,
      record.ownerName,
      record.registrationNumber,
      record.permitNumber,
      record.primaryActivity,
      record.activityCategory,
      record.address,
      record.contactNumber,
      record.email,
      record.tin,
    ]
      .join(" ")
      .toLocaleLowerCase();

    return (
      (!query || searchable.includes(query)) &&
      (!filters.barangay || record.barangay === filters.barangay) &&
      (!filters.organizationType || record.organizationType === filters.organizationType) &&
      (!filters.status || record.status === filters.status) &&
      (!filters.activityCategory || record.activityCategory === filters.activityCategory) &&
      (!filters.riskLevel || record.riskLevel === filters.riskLevel) &&
      (!filters.tradeName || includes(record.tradeName, filters.tradeName)) &&
      (!filters.ownerName || includes(record.ownerName, filters.ownerName)) &&
      (!filters.registrationAuthority || record.registrationAuthority === filters.registrationAuthority) &&
      (!filters.registrationNumber || includes(record.registrationNumber, filters.registrationNumber)) &&
      (!filters.permitNumber || includes(record.permitNumber, filters.permitNumber)) &&
      (!filters.establishmentType || record.establishmentType === filters.establishmentType) &&
      (!filters.address || includes(record.address, filters.address)) &&
      (!filters.contactNumber || includes(record.contactNumber, filters.contactNumber)) &&
      (!filters.email || includes(record.email, filters.email)) &&
      (!filters.hasEmail || (filters.hasEmail === "yes" ? Boolean(record.email) : !record.email)) &&
      withinNumeric(record.employeeCount, filters.employeeFrom, filters.employeeTo) &&
      withinNumeric(record.capitalization, filters.capitalizationFrom, filters.capitalizationTo) &&
      withinDate(record.registrationDate, filters.registrationDateFrom, filters.registrationDateTo) &&
      withinDate(record.permitValidUntil, filters.permitExpiryFrom, filters.permitExpiryTo) &&
      withinDate(record.updatedAt, filters.updatedFrom, filters.updatedTo)
    );
  });
}

function sortValue(record: BusinessDirectoryRecord, key: BusinessDirectorySortKey): string | number {
  if (key === "business") return record.tradeName;
  return record[key];
}

export function sortBusinesses(
  records: readonly BusinessDirectoryRecord[],
  key: BusinessDirectorySortKey,
  direction: "asc" | "desc",
) {
  const multiplier = direction === "asc" ? 1 : -1;
  return [...records].sort((left, right) => {
    const leftValue = sortValue(left, key);
    const rightValue = sortValue(right, key);
    if (typeof leftValue === "number" && typeof rightValue === "number") return (leftValue - rightValue) * multiplier;
    return String(leftValue).localeCompare(String(rightValue), "en-PH", { numeric: true }) * multiplier;
  });
}

export function formatPeso(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
}
