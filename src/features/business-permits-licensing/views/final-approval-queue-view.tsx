"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  CircleAlert,
  Clock3,
  FileCheck2,
  FileSearch,
  Search,
  ShieldCheck,
  Store,
  X,
} from "lucide-react";

import styles from "../components/final-approval-queue.module.css";
import { MATNOG_APPLICATION_DIRECTORY } from "../data/matnog-application-directory";
import type { MayorReviewOverride } from "../types/application-detail";
import type {
  ApplicationDirectoryRecord,
  FinalApprovalFilters,
  FinalApprovalQueueRecord,
  FinalApprovalSortKey,
} from "../types/application-directory";
import { MAYOR_REVIEW_STORAGE_KEY } from "../utils/application-detail-utils";
import { mergeApplicationRecords, SAVED_APPLICATIONS_STORAGE_KEY } from "../utils/application-wizard-utils";
import {
  createFinalApprovalQueue,
  EMPTY_FINAL_APPROVAL_FILTERS,
  filterFinalApprovalQueue,
  sortFinalApprovalQueue,
  summarizeFinalApprovalQueue,
} from "../utils/final-approval-utils";

const applicationTypes = ["New", "Renewal", "Amendment", "Closure"];
const riskLevels = ["Low", "Medium", "High"];

function formatDate(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(`${value.slice(0, 10)}T00:00:00`),
  );
}

function formatPeso(value: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(value);
}

function unique(values: readonly string[]) {
  return [...new Set(values)].toSorted((a, b) => a.localeCompare(b));
}

function SortHeading({
  label,
  column,
  current,
  direction,
  onSort,
}: {
  label: string;
  column: FinalApprovalSortKey;
  current: FinalApprovalSortKey;
  direction: "asc" | "desc";
  onSort: (key: FinalApprovalSortKey) => void;
}) {
  return (
    <th aria-sort={column === current ? (direction === "asc" ? "ascending" : "descending") : undefined}>
      <button className={styles.sortButton} type="button" onClick={() => onSort(column)}>
        {label} <ChevronsUpDown size={12} />
      </button>
    </th>
  );
}

function DecisionActions({ record }: { record: FinalApprovalQueueRecord }) {
  return (
    <div className={styles.actions}>
      <Link className={styles.primaryLink} href={`/applications/${record.id}`}>
        Review decision
      </Link>
      <Link className={styles.textLink} href={`/businesses/${record.businessId}`}>
        Business
      </Link>
    </div>
  );
}

export function FinalApprovalQueueView() {
  const [records, setRecords] = useState<FinalApprovalQueueRecord[]>(() =>
    createFinalApprovalQueue(MATNOG_APPLICATION_DIRECTORY, []),
  );
  const [filters, setFilters] = useState<FinalApprovalFilters>(EMPTY_FINAL_APPROVAL_FILTERS);
  const [sortKey, setSortKey] = useState<FinalApprovalSortKey>("daysWaiting");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    try {
      const savedApplications = JSON.parse(
        window.localStorage.getItem(SAVED_APPLICATIONS_STORAGE_KEY) ?? "[]",
      ) as ApplicationDirectoryRecord[];
      const applications = mergeApplicationRecords(MATNOG_APPLICATION_DIRECTORY, savedApplications);
      const mayorOverrides = JSON.parse(
        window.localStorage.getItem(MAYOR_REVIEW_STORAGE_KEY) ?? "[]",
      ) as MayorReviewOverride[];
      setRecords(createFinalApprovalQueue(applications, mayorOverrides));
    } catch {
      setRecords(createFinalApprovalQueue(MATNOG_APPLICATION_DIRECTORY, []));
    }
  }, []);

  const summary = useMemo(() => summarizeFinalApprovalQueue(records), [records]);
  const barangays = useMemo(() => unique(records.map((record) => record.barangay)), [records]);
  const filtered = useMemo(
    () => sortFinalApprovalQueue(filterFinalApprovalQueue(records, filters), sortKey, direction),
    [records, filters, sortKey, direction],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleRecords = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const setFilter = (key: keyof FinalApprovalFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };
  const resetFilters = () => {
    setFilters(EMPTY_FINAL_APPROVAL_FILTERS);
    setPage(1);
  };
  const sort = (key: FinalApprovalSortKey) => {
    if (key === sortKey) setDirection((current) => (current === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setDirection("asc");
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/permits">Permits</Link>
            <span>/</span>
            <span>For final approval</span>
          </nav>
          <p className={styles.eyebrow}>Office of the Municipal Mayor</p>
          <h1>For Final Approval</h1>
          <p>Review fully paid, requirements-complete applications awaiting an individual municipal decision.</p>
        </div>
        <Link className={styles.headerAction} href="/applications">
          <FileSearch size={15} /> Open all applications
        </Link>
      </header>

      <section className={styles.summaryGrid} aria-label="Final approval summary">
        <article>
          <ShieldCheck size={18} />
          <span>
            Awaiting decision<strong>{summary.total}</strong>
            <small>Payment and review gates complete</small>
          </span>
        </article>
        <article className={styles.dangerMetric}>
          <CircleAlert size={18} />
          <span>
            Urgent<strong>{summary.urgent}</strong>
            <small>Priority executive review</small>
          </span>
        </article>
        <article className={styles.warningMetric}>
          <CalendarClock size={18} />
          <span>
            Past target release<strong>{summary.overdue}</strong>
            <small>Service target requires attention</small>
          </span>
        </article>
        <article className={styles.infoMetric}>
          <Store size={18} />
          <span>
            Closure cases<strong>{summary.closures}</strong>
            <small>Certificate decision required</small>
          </span>
        </article>
        <article className={styles.warningMetric}>
          <Clock3 size={18} />
          <span>
            Deferred<strong>{summary.deferred}</strong>
            <small>Decision reason remains active</small>
          </span>
        </article>
      </section>

      <section className={styles.queueCard} aria-label="Final approval queue">
        <div className={styles.toolbar}>
          <label className={styles.searchBox}>
            <Search size={15} />
            <input
              aria-label="Search final approval queue"
              placeholder="Search application, business, owner, business ID, or barangay"
              value={filters.search}
              onChange={(event) => setFilter("search", event.target.value)}
            />
          </label>
          {activeFilterCount > 0 ? (
            <button className={styles.clearButton} type="button" onClick={resetFilters}>
              <X size={14} /> Clear filters <span className={styles.filterCount}>{activeFilterCount}</span>
            </button>
          ) : null}
        </div>

        <div className={styles.filters}>
          <label>
            Application type
            <select value={filters.type} onChange={(e) => setFilter("type", e.target.value)}>
              <option value="">All types</option>
              {applicationTypes.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Barangay
            <select value={filters.barangay} onChange={(e) => setFilter("barangay", e.target.value)}>
              <option value="">All barangays</option>
              {barangays.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Risk level
            <select value={filters.riskLevel} onChange={(e) => setFilter("riskLevel", e.target.value)}>
              <option value="">All risk levels</option>
              {riskLevels.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Priority
            <select value={filters.priority} onChange={(e) => setFilter("priority", e.target.value)}>
              <option value="">All priorities</option>
              <option>Normal</option>
              <option>Urgent</option>
            </select>
          </label>
          <label>
            Decision state
            <select value={filters.decisionState} onChange={(e) => setFilter("decisionState", e.target.value)}>
              <option value="">All decision states</option>
              <option>Ready for decision</option>
              <option>Deferred</option>
            </select>
          </label>
          <label>
            Target from
            <input
              aria-label="Target from"
              type="date"
              value={filters.targetFrom}
              onChange={(e) => setFilter("targetFrom", e.target.value)}
            />
          </label>
          <label>
            Target to
            <input
              aria-label="Target to"
              type="date"
              value={filters.targetTo}
              onChange={(e) => setFilter("targetTo", e.target.value)}
            />
          </label>
        </div>

        <div className={styles.resultBar}>
          <div>
            <strong>{filtered.length}</strong> matching applications · {records.length} awaiting decision
          </div>
          <span>
            Showing {filtered.length ? (safePage - 1) * pageSize + 1 : 0}–
            {Math.min(safePage * pageSize, filtered.length)}
          </span>
        </div>

        {visibleRecords.length ? (
          <>
            <div className={styles.tableViewport}>
              <table>
                <thead>
                  <tr>
                    <SortHeading
                      label="Application"
                      column="id"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <SortHeading
                      label="Business"
                      column="businessName"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <SortHeading label="Type" column="type" current={sortKey} direction={direction} onSort={sort} />
                    <SortHeading
                      label="Risk"
                      column="riskLevel"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <th>Readiness gates</th>
                    <SortHeading
                      label="Assessment"
                      column="assessmentAmount"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <SortHeading
                      label="Target release"
                      column="targetRelease"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <SortHeading
                      label="Waiting"
                      column="daysWaiting"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <SortHeading
                      label="Priority"
                      column="priority"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <SortHeading
                      label="Decision state"
                      column="decisionState"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRecords.map((record) => (
                    <tr key={record.id}>
                      <td className={styles.applicationCell}>
                        <Link className={styles.documentLink} href={`/applications/${record.id}`}>
                          {record.id}
                        </Link>
                        <small>
                          {record.fiscalPeriod} · {record.barangay}
                        </small>
                      </td>
                      <td className={styles.businessCell}>
                        <strong>{record.businessName}</strong>
                        <small>
                          {record.ownerName} · {record.businessId}
                        </small>
                      </td>
                      <td>{record.type}</td>
                      <td>
                        <span className={`${styles.badge} ${styles[record.riskLevel.toLocaleLowerCase()]}`}>
                          {record.riskLevel}
                        </span>
                      </td>
                      <td className={styles.gatesCell}>
                        <span>
                          <FileCheck2 size={11} /> {record.requirementsComplete}/{record.requirementsTotal} verified
                        </span>
                        <span>
                          <ShieldCheck size={11} /> Paid
                        </span>
                      </td>
                      <td>{formatPeso(record.assessmentAmount)}</td>
                      <td>
                        <span className={record.overdue ? styles.overdue : undefined}>
                          {formatDate(record.targetRelease)}
                        </span>
                      </td>
                      <td>{record.daysWaiting} days</td>
                      <td>
                        <span
                          className={`${styles.badge} ${record.priority === "Urgent" ? styles.urgent : styles.normal}`}
                        >
                          {record.priority}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${styles.badge} ${record.decisionState === "Deferred" ? styles.deferred : styles.ready}`}
                        >
                          {record.decisionState}
                        </span>
                        {record.deferralReason ? (
                          <small className={styles.reason}>{record.deferralReason}</small>
                        ) : null}
                      </td>
                      <td>
                        <DecisionActions record={record} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.mobileList}>
              {visibleRecords.map((record) => (
                <article className={styles.mobileCard} key={record.id}>
                  <div className={styles.mobileCardHeader}>
                    <div>
                      <Link className={styles.documentLink} href={`/applications/${record.id}`}>
                        {record.id}
                      </Link>
                      <h2>{record.businessName}</h2>
                      <p>
                        {record.type} · {record.barangay}
                      </p>
                    </div>
                    <span
                      className={`${styles.badge} ${record.decisionState === "Deferred" ? styles.deferred : styles.ready}`}
                    >
                      {record.decisionState}
                    </span>
                  </div>
                  <div className={styles.readiness}>
                    <strong>Decision gates complete</strong>
                    <span>
                      <FileCheck2 size={12} /> {record.requirementsComplete}/{record.requirementsTotal} requirements
                    </span>
                    <span>
                      <ShieldCheck size={12} /> Paid · {formatPeso(record.assessmentAmount)}
                    </span>
                  </div>
                  <div className={styles.mobileFacts}>
                    <div>
                      <span>Risk</span>
                      <strong>{record.riskLevel}</strong>
                    </div>
                    <div>
                      <span>Priority</span>
                      <strong>{record.priority}</strong>
                    </div>
                    <div>
                      <span>Target release</span>
                      <strong className={record.overdue ? styles.overdue : undefined}>
                        {formatDate(record.targetRelease)}
                      </strong>
                    </div>
                    <div>
                      <span>Waiting</span>
                      <strong>{record.daysWaiting} days</strong>
                    </div>
                  </div>
                  {record.deferralReason ? <p className={styles.deferralNote}>{record.deferralReason}</p> : null}
                  <DecisionActions record={record} />
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <FileSearch size={28} />
            <h2>No final approval cases match</h2>
            <p>Change the search, decision state, dates, or operational filters to broaden the queue.</p>
            <button className={styles.clearButton} type="button" onClick={resetFilters}>
              Clear all filters
            </button>
          </div>
        )}

        <footer className={styles.pagination}>
          <div>
            Rows per page
            <select
              className={styles.pageSize}
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
          <div>
            <button
              type="button"
              aria-label="Previous page"
              disabled={safePage === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              <ChevronLeft size={14} />
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
              <ChevronRight size={14} />
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}
