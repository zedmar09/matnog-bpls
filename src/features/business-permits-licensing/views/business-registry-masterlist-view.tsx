"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import {
  Archive,
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Columns3,
  Eye,
  Filter,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import styles from "../components/business-registry.module.css";
import {
  BUSINESS_ACTIVITY_CATEGORIES,
  MATNOG_BARANGAYS,
  MATNOG_BUSINESS_DIRECTORY,
} from "../data/matnog-business-directory";
import type {
  BusinessDirectoryFilters,
  BusinessDirectoryRecord,
  BusinessDirectorySortKey,
} from "../types/business-directory";
import {
  EMPTY_BUSINESS_FILTERS,
  filterBusinesses,
  formatPeso,
  sortBusinesses,
} from "../utils/business-directory-utils";
import { mergeBusinessRecords, REGISTERED_BUSINESSES_STORAGE_KEY } from "../utils/business-registration-utils";

const columns = [
  "id",
  "business",
  "organization",
  "owner",
  "activity",
  "barangay",
  "risk",
  "employees",
  "capitalization",
  "permit",
  "status",
  "validUntil",
  "contact",
  "updated",
  "actions",
] as const;
type Column = (typeof columns)[number];

const labels: Record<Column, string> = {
  id: "Business ID",
  business: "Business",
  organization: "Organization",
  owner: "Owner / Representative",
  activity: "Primary activity",
  barangay: "Barangay",
  risk: "Risk",
  employees: "Employees",
  capitalization: "Capitalization",
  permit: "Permit no.",
  status: "Permit status",
  validUntil: "Valid until",
  contact: "Contact",
  updated: "Last updated",
  actions: "Actions",
};

const fixedColumns = new Set<Column>(["id", "business", "actions"]);
const sortableColumns: Partial<Record<Column, BusinessDirectorySortKey>> = {
  id: "id",
  business: "business",
  organization: "organizationType",
  owner: "ownerName",
  activity: "activityCategory",
  barangay: "barangay",
  risk: "riskLevel",
  employees: "employeeCount",
  capitalization: "capitalization",
  permit: "permitNumber",
  status: "status",
  validUntil: "permitValidUntil",
  updated: "updatedAt",
};

const organizationTypes = [
  "Sole proprietorship",
  "Partnership",
  "Corporation",
  "One person corporation",
  "Cooperative",
];
const statuses = ["For application", "Active", "Expiring soon", "Expired", "Suspended", "Closed"];

function formatDate(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(`${value.slice(0, 10)}T00:00:00`),
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  children?: React.ReactNode;
}) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: the reusable control is supplied directly or through children.
    <label className={styles.field}>
      <span>{label}</span>
      {children ?? <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />}
    </label>
  );
}

export function BusinessRegistryMasterlistView() {
  const [records, setRecords] = useState<BusinessDirectoryRecord[]>(() => [...MATNOG_BUSINESS_DIRECTORY]);
  const [filters, setFilters] = useState<BusinessDirectoryFilters>(EMPTY_BUSINESS_FILTERS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<Column>>(new Set(columns));
  const [sortKey, setSortKey] = useState<BusinessDirectorySortKey>("business");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [openAction, setOpenAction] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(
        window.localStorage.getItem(REGISTERED_BUSINESSES_STORAGE_KEY) ?? "[]",
      ) as BusinessDirectoryRecord[];
      if (saved.length > 0) setRecords(mergeBusinessRecords(MATNOG_BUSINESS_DIRECTORY, saved));
    } catch {
      window.localStorage.removeItem(REGISTERED_BUSINESSES_STORAGE_KEY);
    }
  }, []);

  const filteredRecords = useMemo(
    () => sortBusinesses(filterBusinesses(records, filters), sortKey, direction),
    [records, filters, sortKey, direction],
  );
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleRecords = filteredRecords.slice((safePage - 1) * pageSize, safePage * pageSize);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const setFilter = (key: keyof BusinessDirectoryFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };
  const resetFilters = () => {
    setFilters(EMPTY_BUSINESS_FILTERS);
    setPage(1);
  };
  const toggleSort = (key: BusinessDirectorySortKey) => {
    if (sortKey === key) setDirection((current) => (current === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setDirection("asc");
    }
  };
  const tableHeading = (column: Column) => {
    const sortableKey = sortableColumns[column];
    return (
      <th
        key={column}
        aria-sort={sortableKey === sortKey ? (direction === "asc" ? "ascending" : "descending") : undefined}
      >
        {sortableKey ? (
          <button type="button" className={styles.sortButton} onClick={() => toggleSort(sortableKey)}>
            {labels[column]} <ChevronsUpDown size={12} />
          </button>
        ) : (
          labels[column]
        )}
      </th>
    );
  };
  const archiveBusiness = (id: string) => {
    setRecords((current) => current.map((record) => (record.id === id ? { ...record, status: "Closed" } : record)));
    setOpenAction(null);
  };

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Business Registration &amp; Renewal</p>
          <h1>Business Registry</h1>
          <p>Maintain the official masterlist of registered establishments in Matnog, Sorsogon.</p>
        </div>
        <Link className={styles.primaryButton} href="/businesses/register">
          <Plus size={16} /> Register business
        </Link>
      </header>

      <section className={styles.card} aria-label="Business registry masterlist">
        <div className={styles.toolbar}>
          <label className={styles.searchBox}>
            <Search size={16} />
            <input
              aria-label="Search businesses"
              placeholder="Search business ID, name, owner, permit, TIN, or contact"
              value={filters.search}
              onChange={(event) => setFilter("search", event.target.value)}
            />
          </label>
          <button type="button" className={styles.secondaryButton} onClick={() => setShowAdvanced((value) => !value)}>
            <Filter size={14} /> More filters
            {activeFilterCount > 0 && <span className={styles.filterCount}>{activeFilterCount}</span>}
          </button>
          <div className={styles.columnsMenu}>
            <button type="button" className={styles.secondaryButton} onClick={() => setColumnsOpen((value) => !value)}>
              <Columns3 size={14} /> Columns
            </button>
            {columnsOpen && (
              <div className={styles.columnsPopover}>
                <strong>Visible columns</strong>
                {columns.map((column) => (
                  <label key={column}>
                    <input
                      type="checkbox"
                      checked={visibleColumns.has(column)}
                      disabled={fixedColumns.has(column)}
                      onChange={() =>
                        setVisibleColumns((current) => {
                          const next = new Set(current);
                          next.has(column) ? next.delete(column) : next.add(column);
                          return next;
                        })
                      }
                    />
                    {labels[column]}
                  </label>
                ))}
              </div>
            )}
          </div>
          {activeFilterCount > 0 && (
            <button type="button" className={styles.secondaryButton} onClick={resetFilters}>
              <X size={14} /> Clear
            </button>
          )}
        </div>

        <div className={styles.quickFilters}>
          <select
            aria-label="Barangay filter"
            value={filters.barangay}
            onChange={(event) => setFilter("barangay", event.target.value)}
          >
            <option value="">All barangays</option>
            {MATNOG_BARANGAYS.map((barangay) => (
              <option key={barangay}>{barangay}</option>
            ))}
          </select>
          <select
            aria-label="Organization filter"
            value={filters.organizationType}
            onChange={(event) => setFilter("organizationType", event.target.value)}
          >
            <option value="">All organization types</option>
            {organizationTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
          <select
            aria-label="Permit status filter"
            value={filters.status}
            onChange={(event) => setFilter("status", event.target.value)}
          >
            <option value="">All permit statuses</option>
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
          <select
            aria-label="Activity filter"
            value={filters.activityCategory}
            onChange={(event) => setFilter("activityCategory", event.target.value)}
          >
            <option value="">All activity categories</option>
            {BUSINESS_ACTIVITY_CATEGORIES.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
          <select
            aria-label="Risk filter"
            value={filters.riskLevel}
            onChange={(event) => setFilter("riskLevel", event.target.value)}
          >
            <option value="">All risk levels</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        {showAdvanced && (
          <div className={styles.advancedPanel}>
            <div className={styles.panelHeading}>
              <div>
                <h2>Advanced filters</h2>
                <p>Refine the registry using business, permit, and financial details.</p>
              </div>
              <button type="button" aria-label="Close advanced filters" onClick={() => setShowAdvanced(false)}>
                <X size={16} />
              </button>
            </div>
            <div className={styles.filterGrid}>
              <Field label="Trade name" value={filters.tradeName} onChange={(value) => setFilter("tradeName", value)} />
              <Field
                label="Owner / representative"
                value={filters.ownerName}
                onChange={(value) => setFilter("ownerName", value)}
              />
              <Field
                label="Registration authority"
                value={filters.registrationAuthority}
                onChange={(value) => setFilter("registrationAuthority", value)}
              >
                <select
                  value={filters.registrationAuthority}
                  onChange={(event) => setFilter("registrationAuthority", event.target.value)}
                >
                  <option value="">All authorities</option>
                  <option>DTI</option>
                  <option>SEC</option>
                  <option>CDA</option>
                </select>
              </Field>
              <Field
                label="Registration number"
                value={filters.registrationNumber}
                onChange={(value) => setFilter("registrationNumber", value)}
              />
              <Field
                label="Permit number"
                value={filters.permitNumber}
                onChange={(value) => setFilter("permitNumber", value)}
              />
              <Field
                label="Establishment type"
                value={filters.establishmentType}
                onChange={(value) => setFilter("establishmentType", value)}
              >
                <select
                  value={filters.establishmentType}
                  onChange={(event) => setFilter("establishmentType", event.target.value)}
                >
                  <option value="">All establishment types</option>
                  <option>Main office</option>
                  <option>Branch</option>
                </select>
              </Field>
              <Field
                label="Address contains"
                value={filters.address}
                onChange={(value) => setFilter("address", value)}
              />
              <Field
                label="Contact number"
                value={filters.contactNumber}
                onChange={(value) => setFilter("contactNumber", value)}
              />
              <Field label="Email address" value={filters.email} onChange={(value) => setFilter("email", value)} />
              <Field label="Has email" value={filters.hasEmail} onChange={(value) => setFilter("hasEmail", value)}>
                <select value={filters.hasEmail} onChange={(event) => setFilter("hasEmail", event.target.value)}>
                  <option value="">Email: All</option>
                  <option value="yes">With email</option>
                  <option value="no">Without email</option>
                </select>
              </Field>
              <Field
                label="Employees from"
                type="number"
                value={filters.employeeFrom}
                onChange={(value) => setFilter("employeeFrom", value)}
              />
              <Field
                label="Employees to"
                type="number"
                value={filters.employeeTo}
                onChange={(value) => setFilter("employeeTo", value)}
              />
              <Field
                label="Capitalization from"
                type="number"
                value={filters.capitalizationFrom}
                onChange={(value) => setFilter("capitalizationFrom", value)}
              />
              <Field
                label="Capitalization to"
                type="number"
                value={filters.capitalizationTo}
                onChange={(value) => setFilter("capitalizationTo", value)}
              />
              <Field
                label="Registered from"
                type="date"
                value={filters.registrationDateFrom}
                onChange={(value) => setFilter("registrationDateFrom", value)}
              />
              <Field
                label="Registered to"
                type="date"
                value={filters.registrationDateTo}
                onChange={(value) => setFilter("registrationDateTo", value)}
              />
              <Field
                label="Permit expiry from"
                type="date"
                value={filters.permitExpiryFrom}
                onChange={(value) => setFilter("permitExpiryFrom", value)}
              />
              <Field
                label="Permit expiry to"
                type="date"
                value={filters.permitExpiryTo}
                onChange={(value) => setFilter("permitExpiryTo", value)}
              />
              <Field
                label="Updated from"
                type="date"
                value={filters.updatedFrom}
                onChange={(value) => setFilter("updatedFrom", value)}
              />
              <Field
                label="Updated to"
                type="date"
                value={filters.updatedTo}
                onChange={(value) => setFilter("updatedTo", value)}
              />
            </div>
          </div>
        )}

        <div className={styles.resultsMeta}>
          <div>
            <Building2 size={16} />
            <strong>{filteredRecords.length.toLocaleString()}</strong> of {records.length.toLocaleString()} businesses
          </div>
          <span>Sample registry data for interface validation</span>
        </div>

        <div className={styles.tableViewport}>
          <table>
            <thead>
              <tr>{columns.filter((column) => visibleColumns.has(column)).map(tableHeading)}</tr>
            </thead>
            <tbody>
              {visibleRecords.map((business) => (
                <tr key={business.id}>
                  {visibleColumns.has("id") && (
                    <td>
                      <Link className={styles.recordId} href={`/businesses/${business.id}`}>
                        {business.id}
                      </Link>
                    </td>
                  )}
                  {visibleColumns.has("business") && (
                    <td className={styles.businessCell}>
                      <strong>{business.tradeName}</strong>
                      <span>{business.registeredName}</span>
                    </td>
                  )}
                  {visibleColumns.has("organization") && <td>{business.organizationType}</td>}
                  {visibleColumns.has("owner") && <td>{business.ownerName}</td>}
                  {visibleColumns.has("activity") && (
                    <td className={styles.activityCell}>
                      <strong>{business.primaryActivity}</strong>
                      <span>
                        {business.activityCategory} · PSIC {business.psicCode}
                      </span>
                    </td>
                  )}
                  {visibleColumns.has("barangay") && (
                    <td>
                      <strong>{business.barangay}</strong>
                      <span className={styles.subtext}>{business.address}</span>
                    </td>
                  )}
                  {visibleColumns.has("risk") && (
                    <td>
                      <span className={`${styles.badge} ${styles[`risk${business.riskLevel}`]}`}>
                        {business.riskLevel}
                      </span>
                    </td>
                  )}
                  {visibleColumns.has("employees") && <td className={styles.numeric}>{business.employeeCount}</td>}
                  {visibleColumns.has("capitalization") && (
                    <td className={styles.numeric}>{formatPeso(business.capitalization)}</td>
                  )}
                  {visibleColumns.has("permit") && <td>{business.permitNumber}</td>}
                  {visibleColumns.has("status") && (
                    <td>
                      <span className={`${styles.badge} ${styles[`status${business.status.replaceAll(" ", "")}`]}`}>
                        {business.status}
                      </span>
                    </td>
                  )}
                  {visibleColumns.has("validUntil") && <td>{formatDate(business.permitValidUntil)}</td>}
                  {visibleColumns.has("contact") && (
                    <td>
                      <span className={styles.contact}>
                        {business.contactNumber}
                        <small>{business.email || "No email on file"}</small>
                      </span>
                    </td>
                  )}
                  {visibleColumns.has("updated") && <td>{formatDate(business.updatedAt)}</td>}
                  {visibleColumns.has("actions") && (
                    <td className={styles.actionCell}>
                      <button
                        type="button"
                        className={styles.iconButton}
                        aria-label={`Actions for ${business.tradeName}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenAction(openAction === business.id ? null : business.id);
                        }}
                      >
                        <MoreHorizontal size={17} />
                      </button>
                      {openAction === business.id && (
                        <div className={styles.actionMenu}>
                          <Link href={`/businesses/${business.id}`}>
                            <Eye size={14} /> View record
                          </Link>
                          <Link href={`/businesses/${business.id}/edit`}>
                            <Pencil size={14} /> Edit business
                          </Link>
                          <Link href={`/business/applications/new?type=renewal&businessId=${business.id}`}>
                            <RefreshCw size={14} /> Start renewal
                          </Link>
                          <button
                            type="button"
                            onClick={() => archiveBusiness(business.id)}
                            disabled={business.status === "Closed"}
                          >
                            <Archive size={14} /> Mark as closed
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {visibleRecords.length === 0 && (
            <div className={styles.emptyState}>
              <Building2 size={30} />
              <h2>No businesses found</h2>
              <p>Try adjusting or clearing the active filters.</p>
              <button type="button" className={styles.secondaryButton} onClick={resetFilters}>
                Clear filters
              </button>
            </div>
          )}
        </div>

        <footer className={styles.pagination}>
          <div>
            <span>Rows per page</span>
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
            >
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
          </div>
          <p>
            {filteredRecords.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–
            {Math.min(safePage * pageSize, filteredRecords.length)} of {filteredRecords.length}
          </p>
          <div className={styles.pageControls}>
            <button
              type="button"
              aria-label="Previous page"
              disabled={safePage === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              <ChevronLeft size={16} />
            </button>
            <span>
              Page {safePage} of {totalPages}
            </span>
            <button
              type="button"
              aria-label="Next page"
              disabled={safePage === totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}
