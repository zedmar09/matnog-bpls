"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ClipboardCheck,
  Columns3,
  Eye,
  FileClock,
  FilePlus2,
  Filter,
  MoreHorizontal,
  Pencil,
  Search,
  UserRoundCheck,
  X,
} from "lucide-react";

import styles from "../components/application-masterlist.module.css";
import {
  APPLICATION_OFFICERS,
  APPLICATION_STAGES,
  MATNOG_APPLICATION_DIRECTORY,
} from "../data/matnog-application-directory";
import { MATNOG_BARANGAYS } from "../data/matnog-business-directory";
import type {
  ApplicationDirectoryFilters,
  ApplicationDirectoryRecord,
  ApplicationDirectorySortKey,
} from "../types/application-directory";
import {
  EMPTY_APPLICATION_FILTERS,
  filterApplications,
  isApplicationOverdue,
  sortApplications,
} from "../utils/application-directory-utils";
import { mergeApplicationRecords, SAVED_APPLICATIONS_STORAGE_KEY } from "../utils/application-wizard-utils";

const columns = [
  "id",
  "business",
  "type",
  "period",
  "status",
  "stage",
  "barangay",
  "officer",
  "filed",
  "target",
  "sla",
  "requirements",
  "assessment",
  "payment",
  "priority",
  "updated",
  "actions",
] as const;
type Column = (typeof columns)[number];
const labels: Record<Column, string> = {
  id: "Application no.",
  business: "Business",
  type: "Type",
  period: "Period",
  status: "Status",
  stage: "Current stage",
  barangay: "Barangay",
  officer: "Assigned officer",
  filed: "Filed",
  target: "Target release",
  sla: "SLA",
  requirements: "Requirements",
  assessment: "Assessment",
  payment: "Payment",
  priority: "Priority",
  updated: "Last updated",
  actions: "Actions",
};
const fixed = new Set<Column>(["id", "business", "actions"]);
const sortable: Partial<Record<Column, ApplicationDirectorySortKey>> = {
  id: "id",
  business: "businessName",
  type: "type",
  period: "fiscalPeriod",
  status: "status",
  stage: "currentStage",
  barangay: "barangay",
  officer: "assignedOfficer",
  filed: "filedAt",
  target: "targetRelease",
  requirements: "completeness",
  assessment: "assessmentAmount",
  payment: "paymentStatus",
  priority: "priority",
  updated: "updatedAt",
};
const statuses = ["Draft", "Submitted", "For correction", "Under review", "Ready to issue", "Issued", "Closed"];
const types = ["New", "Renewal", "Amendment", "Closure"];
const payments = ["Not assessed", "Pending payment", "Paid", "Reversed"];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(`${value.slice(0, 10)}T00:00:00`),
  );
}
function formatPeso(value: number) {
  return value
    ? new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(value)
    : "—";
}
function badgeClass(value: string) {
  return styles[`status${value.replaceAll(" ", "")}`] ?? "";
}
function Field({
  label,
  value,
  type = "text",
  children,
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  children?: React.ReactNode;
  onChange: (value: string) => void;
}) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: the reusable control is supplied directly or through children.
    <label className={styles.field}>
      <span>{label}</span>
      {children ?? <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />}
    </label>
  );
}

export function ApplicationMasterlistView() {
  const [records, setRecords] = useState<ApplicationDirectoryRecord[]>(() => [...MATNOG_APPLICATION_DIRECTORY]);
  const [filters, setFilters] = useState<ApplicationDirectoryFilters>(EMPTY_APPLICATION_FILTERS);
  const [advanced, setAdvanced] = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [visible, setVisible] = useState<Set<Column>>(new Set(columns));
  const [sortKey, setSortKey] = useState<ApplicationDirectorySortKey>("updatedAt");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [openAction, setOpenAction] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(SAVED_APPLICATIONS_STORAGE_KEY) ?? "[]");
      setRecords(mergeApplicationRecords(MATNOG_APPLICATION_DIRECTORY, saved));
    } catch {
      window.localStorage.removeItem(SAVED_APPLICATIONS_STORAGE_KEY);
    }
  }, []);

  const filtered = useMemo(
    () => sortApplications(filterApplications(records, filters), sortKey, direction),
    [records, filters, sortKey, direction],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const rows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const summary = useMemo(
    () => ({
      active: records.filter((record) => !["Issued", "Closed"].includes(record.status)).length,
      review: records.filter((record) => record.status === "Under review").length,
      correction: records.filter((record) => record.status === "For correction").length,
      ready: records.filter((record) => record.status === "Ready to issue").length,
      overdue: records.filter(isApplicationOverdue).length,
    }),
    [records],
  );

  const setFilter = (key: keyof ApplicationDirectoryFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };
  const reset = () => {
    setFilters(EMPTY_APPLICATION_FILTERS);
    setPage(1);
  };
  const doSort = (key: ApplicationDirectorySortKey) => {
    if (sortKey === key) setDirection((value) => (value === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setDirection("asc");
    }
  };
  const heading = (column: Column) => {
    const key = sortable[column];
    return (
      <th key={column} aria-sort={key === sortKey ? (direction === "asc" ? "ascending" : "descending") : undefined}>
        {key ? (
          <button type="button" className={styles.sortButton} onClick={() => doSort(key)}>
            {labels[column]} <ChevronsUpDown size={12} />
          </button>
        ) : (
          labels[column]
        )}
      </th>
    );
  };
  const assign = (id: string) => {
    setRecords((current) =>
      current.map((record) =>
        record.id === id
          ? {
              ...record,
              assignedOfficer:
                record.assignedOfficer === "Unassigned"
                  ? APPLICATION_OFFICERS[0]
                  : APPLICATION_OFFICERS[
                      (APPLICATION_OFFICERS.indexOf(record.assignedOfficer as (typeof APPLICATION_OFFICERS)[number]) +
                        1) %
                        (APPLICATION_OFFICERS.length - 1)
                    ],
              updatedAt: "2026-09-23 16:20",
            }
          : record,
      ),
    );
    setOpenAction(null);
  };

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Business Registration &amp; Renewal</p>
          <h1>Business Applications</h1>
          <p>Manage registrations, renewals, amendments, and closures from filing through permit issuance.</p>
        </div>
        <Link className={styles.primaryButton} href="/applications/new">
          <FilePlus2 size={15} /> New application
        </Link>
      </header>

      <section className={styles.summaryGrid} aria-label="Application queue summary">
        <article>
          <FileClock size={18} />
          <span>
            Active applications<strong>{summary.active}</strong>
            <small>Excludes issued and closed</small>
          </span>
        </article>
        <article>
          <ClipboardCheck size={18} />
          <span>
            Under review<strong>{summary.review}</strong>
            <small>Across reviewing offices</small>
          </span>
        </article>
        <article className={styles.warningSummary}>
          <AlertTriangle size={18} />
          <span>
            Corrections required<strong>{summary.correction}</strong>
            <small>Awaiting applicant action</small>
          </span>
        </article>
        <article className={styles.successSummary}>
          <CheckCircle2 size={18} />
          <span>
            Ready to issue<strong>{summary.ready}</strong>
            <small>All requirements cleared</small>
          </span>
        </article>
        <article className={styles.dangerSummary}>
          <FileClock size={18} />
          <span>
            Overdue target<strong>{summary.overdue}</strong>
            <small>Past committed release date</small>
          </span>
        </article>
      </section>

      <section className={styles.card}>
        <div className={styles.toolbar}>
          <label className={styles.searchBox}>
            <Search size={15} />
            <input
              aria-label="Search applications"
              placeholder="Search application, business, owner, permit, officer, or location"
              value={filters.search}
              onChange={(event) => setFilter("search", event.target.value)}
            />
          </label>
          <button type="button" className={styles.secondaryButton} onClick={() => setAdvanced((value) => !value)}>
            <Filter size={14} /> More filters{" "}
            {activeFilterCount ? <span className={styles.filterCount}>{activeFilterCount}</span> : null}
          </button>
          <div className={styles.columnsMenu}>
            <button type="button" className={styles.secondaryButton} onClick={() => setColumnsOpen((value) => !value)}>
              <Columns3 size={14} /> Columns
            </button>
            {columnsOpen ? (
              <div className={styles.columnsPopover}>
                <strong>Visible columns</strong>
                {columns.map((column) => (
                  <label key={column}>
                    <input
                      type="checkbox"
                      checked={visible.has(column)}
                      disabled={fixed.has(column)}
                      onChange={() =>
                        setVisible((current) => {
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
            ) : null}
          </div>
          {activeFilterCount ? (
            <button type="button" className={styles.secondaryButton} onClick={reset}>
              <X size={14} /> Clear
            </button>
          ) : null}
        </div>
        <div className={styles.quickFilters}>
          <select
            aria-label="Application type filter"
            value={filters.type}
            onChange={(event) => setFilter("type", event.target.value)}
          >
            <option value="">All application types</option>
            {types.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <select
            aria-label="Workflow status filter"
            value={filters.status}
            onChange={(event) => setFilter("status", event.target.value)}
          >
            <option value="">All workflow statuses</option>
            {statuses.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <select
            aria-label="Fiscal period filter"
            value={filters.fiscalPeriod}
            onChange={(event) => setFilter("fiscalPeriod", event.target.value)}
          >
            <option value="">All fiscal periods</option>
            <option>2026</option>
            <option>2027</option>
          </select>
          <select
            aria-label="Barangay filter"
            value={filters.barangay}
            onChange={(event) => setFilter("barangay", event.target.value)}
          >
            <option value="">All barangays</option>
            {MATNOG_BARANGAYS.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <select
            aria-label="Assigned officer filter"
            value={filters.assignedOfficer}
            onChange={(event) => setFilter("assignedOfficer", event.target.value)}
          >
            <option value="">All assigned officers</option>
            {APPLICATION_OFFICERS.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>
        {advanced ? (
          <div className={styles.advancedPanel}>
            <div className={styles.panelHeading}>
              <div>
                <h2>Advanced filters</h2>
                <p>Refine the queue by schedule, workflow, compliance, and assessment.</p>
              </div>
              <button type="button" aria-label="Close advanced filters" onClick={() => setAdvanced(false)}>
                <X size={16} />
              </button>
            </div>
            <div className={styles.filterGrid}>
              <Field
                label="Filed from"
                type="date"
                value={filters.filedFrom}
                onChange={(value) => setFilter("filedFrom", value)}
              />
              <Field
                label="Filed to"
                type="date"
                value={filters.filedTo}
                onChange={(value) => setFilter("filedTo", value)}
              />
              <Field
                label="Target release from"
                type="date"
                value={filters.targetFrom}
                onChange={(value) => setFilter("targetFrom", value)}
              />
              <Field
                label="Target release to"
                type="date"
                value={filters.targetTo}
                onChange={(value) => setFilter("targetTo", value)}
              />
              <Field
                label="Current workflow stage"
                value={filters.stage}
                onChange={(value) => setFilter("stage", value)}
              >
                <select value={filters.stage} onChange={(event) => setFilter("stage", event.target.value)}>
                  <option value="">All stages</option>
                  {[...APPLICATION_STAGES, "Completed"].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </Field>
              <Field
                label="Requirements"
                value={filters.completeness}
                onChange={(value) => setFilter("completeness", value)}
              >
                <select
                  value={filters.completeness}
                  onChange={(event) => setFilter("completeness", event.target.value)}
                >
                  <option value="">All completeness states</option>
                  <option value="complete">Complete</option>
                  <option value="incomplete">Incomplete</option>
                </select>
              </Field>
              <Field
                label="Payment status"
                value={filters.paymentStatus}
                onChange={(value) => setFilter("paymentStatus", value)}
              >
                <select
                  value={filters.paymentStatus}
                  onChange={(event) => setFilter("paymentStatus", event.target.value)}
                >
                  <option value="">All payment statuses</option>
                  {payments.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </Field>
              <Field
                label="Risk classification"
                value={filters.riskLevel}
                onChange={(value) => setFilter("riskLevel", value)}
              >
                <select value={filters.riskLevel} onChange={(event) => setFilter("riskLevel", event.target.value)}>
                  <option value="">All risk levels</option>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </Field>
              <Field label="Overdue state" value={filters.overdue} onChange={(value) => setFilter("overdue", value)}>
                <select value={filters.overdue} onChange={(event) => setFilter("overdue", event.target.value)}>
                  <option value="">Overdue: All</option>
                  <option value="yes">Overdue only</option>
                  <option value="no">On-time only</option>
                </select>
              </Field>
              <Field label="Priority" value={filters.priority} onChange={(value) => setFilter("priority", value)}>
                <select value={filters.priority} onChange={(event) => setFilter("priority", event.target.value)}>
                  <option value="">All priorities</option>
                  <option>Normal</option>
                  <option>Urgent</option>
                </select>
              </Field>
            </div>
          </div>
        ) : null}
        <div className={styles.resultsMeta}>
          <div>
            <FileClock size={15} />
            <strong>{filtered.length}</strong> of {records.length} applications
          </div>
          <span>Sample operational data for interface validation</span>
        </div>
        <div className={styles.tableViewport}>
          <table>
            <thead>
              <tr>{columns.filter((column) => visible.has(column)).map(heading)}</tr>
            </thead>
            <tbody>
              {rows.map((record) => {
                const complete = record.requirementsComplete === record.requirementsTotal;
                const overdue = isApplicationOverdue(record);
                return (
                  <tr key={record.id}>
                    {visible.has("id") && (
                      <td>
                        <Link className={styles.recordId} href={`/applications/${record.id}`}>
                          {record.id}
                        </Link>
                      </td>
                    )}
                    {visible.has("business") && (
                      <td className={styles.businessCell}>
                        <strong>{record.businessName}</strong>
                        <span>
                          {record.businessId} · {record.ownerName}
                        </span>
                      </td>
                    )}
                    {visible.has("type") && <td>{record.type}</td>}
                    {visible.has("period") && <td>{record.fiscalPeriod}</td>}
                    {visible.has("status") && (
                      <td>
                        <span className={`${styles.badge} ${badgeClass(record.status)}`}>{record.status}</span>
                      </td>
                    )}
                    {visible.has("stage") && <td>{record.currentStage}</td>}
                    {visible.has("barangay") && <td>{record.barangay}</td>}
                    {visible.has("officer") && (
                      <td>
                        {record.assignedOfficer === "Unassigned" ? (
                          <span className={styles.unassigned}>Unassigned</span>
                        ) : (
                          record.assignedOfficer
                        )}
                      </td>
                    )}
                    {visible.has("filed") && <td>{formatDate(record.filedAt)}</td>}
                    {visible.has("target") && <td>{formatDate(record.targetRelease)}</td>}
                    {visible.has("sla") && (
                      <td>
                        <span className={`${styles.sla} ${overdue ? styles.overdue : styles.onTime}`}>
                          {overdue ? "Overdue" : "On time"}
                        </span>
                      </td>
                    )}
                    {visible.has("requirements") && (
                      <td>
                        <span className={styles.completeness}>
                          <span>
                            <i
                              style={{ width: `${(record.requirementsComplete / record.requirementsTotal) * 100}%` }}
                            />
                          </span>
                          <small className={complete ? styles.completeText : ""}>
                            {record.requirementsComplete}/{record.requirementsTotal}
                          </small>
                        </span>
                      </td>
                    )}
                    {visible.has("assessment") && (
                      <td className={styles.numeric}>{formatPeso(record.assessmentAmount)}</td>
                    )}
                    {visible.has("payment") && (
                      <td>
                        <span className={`${styles.badge} ${badgeClass(record.paymentStatus)}`}>
                          {record.paymentStatus}
                        </span>
                      </td>
                    )}
                    {visible.has("priority") && (
                      <td>
                        <span className={`${styles.priority} ${record.priority === "Urgent" ? styles.urgent : ""}`}>
                          {record.priority}
                        </span>
                      </td>
                    )}
                    {visible.has("updated") && <td>{formatDate(record.updatedAt)}</td>}
                    {visible.has("actions") && (
                      <td className={styles.actionCell}>
                        <button
                          type="button"
                          className={styles.iconButton}
                          aria-label={`Actions for ${record.id}`}
                          onClick={() => setOpenAction(openAction === record.id ? null : record.id)}
                        >
                          <MoreHorizontal size={17} />
                        </button>
                        {openAction === record.id ? (
                          <div className={styles.actionMenu}>
                            <Link href={`/applications/${record.id}`}>
                              <Eye size={14} /> Open application
                            </Link>
                            {["Draft", "For correction"].includes(record.status) ? (
                              <Link href={`/applications/${record.id}/edit`}>
                                <Pencil size={14} /> Edit application
                              </Link>
                            ) : null}
                            <button type="button" onClick={() => assign(record.id)}>
                              <UserRoundCheck size={14} />{" "}
                              {record.assignedOfficer === "Unassigned" ? "Assign officer" : "Reassign officer"}
                            </button>
                            <Link href={`/businesses/${record.businessId}`}>
                              <Building2 size={14} /> View business
                            </Link>
                          </div>
                        ) : null}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 ? (
            <div className={styles.emptyState}>
              <FileClock size={30} />
              <h2>No applications found</h2>
              <p>Adjust or clear the active filters.</p>
              <button type="button" className={styles.secondaryButton} onClick={reset}>
                Clear filters
              </button>
            </div>
          ) : null}
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
            {filtered.length ? (safePage - 1) * pageSize + 1 : 0}–{Math.min(safePage * pageSize, filtered.length)} of{" "}
            {filtered.length}
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
