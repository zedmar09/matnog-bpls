"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import {
  Ban,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  CircleAlert,
  FileSearch,
  Search,
  ShieldOff,
  X,
} from "lucide-react";

import styles from "../components/restricted-permits.module.css";
import { MATNOG_APPLICATION_DIRECTORY } from "../data/matnog-application-directory";
import { MATNOG_PERMIT_REGISTRY } from "../data/matnog-permit-registry";
import type { PermitDocumentOverride, PermitReleaseOverride } from "../types/application-detail";
import type { ApplicationDirectoryRecord } from "../types/application-directory";
import type {
  PermitLifecycleOverride,
  RestrictedPermitFilters,
  RestrictedPermitQueueRecord,
  RestrictedPermitSortKey,
} from "../types/permit-registry";
import { PERMIT_DOCUMENT_STORAGE_KEY, PERMIT_RELEASE_STORAGE_KEY } from "../utils/application-detail-utils";
import { mergeApplicationRecords, SAVED_APPLICATIONS_STORAGE_KEY } from "../utils/application-wizard-utils";
import {
  createRestrictedPermitQueue,
  EMPTY_RESTRICTED_PERMIT_FILTERS,
  filterRestrictedPermitQueue,
  mergePermitRegistryRecords,
  PERMIT_LIFECYCLE_STORAGE_KEY,
  sortRestrictedPermitQueue,
  summarizeRestrictedPermitQueue,
} from "../utils/permit-registry-utils";

function formatDate(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(`${value.slice(0, 10)}T00:00:00`),
  );
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
  column: RestrictedPermitSortKey;
  current: RestrictedPermitSortKey;
  direction: "asc" | "desc";
  onSort: (key: RestrictedPermitSortKey) => void;
}) {
  return (
    <th aria-sort={column === current ? (direction === "asc" ? "ascending" : "descending") : undefined}>
      <button className={styles.sortButton} type="button" onClick={() => onSort(column)}>
        {label} <ChevronsUpDown size={12} />
      </button>
    </th>
  );
}

function QueueActions({ record }: { record: RestrictedPermitQueueRecord }) {
  return (
    <div className={styles.actions}>
      <Link className={styles.primaryLink} href={`/permits/${record.documentNumber}`}>
        {record.status === "Suspended" ? "Manage case" : "View record"}
      </Link>
      <Link className={styles.textLink} href={`/verify/documents/${record.qrToken}`}>
        Public result
      </Link>
    </div>
  );
}

export function RestrictedPermitsView() {
  const [records, setRecords] = useState<RestrictedPermitQueueRecord[]>(() =>
    createRestrictedPermitQueue(MATNOG_PERMIT_REGISTRY, []),
  );
  const [filters, setFilters] = useState<RestrictedPermitFilters>(EMPTY_RESTRICTED_PERMIT_FILTERS);
  const [sortKey, setSortKey] = useState<RestrictedPermitSortKey>("effectiveDate");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    try {
      const savedApplications = JSON.parse(
        window.localStorage.getItem(SAVED_APPLICATIONS_STORAGE_KEY) ?? "[]",
      ) as ApplicationDirectoryRecord[];
      const applications = mergeApplicationRecords(MATNOG_APPLICATION_DIRECTORY, savedApplications);
      const documents = JSON.parse(
        window.localStorage.getItem(PERMIT_DOCUMENT_STORAGE_KEY) ?? "[]",
      ) as PermitDocumentOverride[];
      const releases = JSON.parse(
        window.localStorage.getItem(PERMIT_RELEASE_STORAGE_KEY) ?? "[]",
      ) as PermitReleaseOverride[];
      const lifecycleOverrides = JSON.parse(
        window.localStorage.getItem(PERMIT_LIFECYCLE_STORAGE_KEY) ?? "[]",
      ) as PermitLifecycleOverride[];
      const registry = mergePermitRegistryRecords(
        MATNOG_PERMIT_REGISTRY,
        applications,
        documents,
        releases,
        lifecycleOverrides,
      );
      setRecords(createRestrictedPermitQueue(registry, lifecycleOverrides));
    } catch {
      setRecords(createRestrictedPermitQueue(MATNOG_PERMIT_REGISTRY, []));
    }
  }, []);

  const summary = useMemo(() => summarizeRestrictedPermitQueue(records), [records]);
  const grounds = useMemo(() => unique(records.map((record) => record.restriction.grounds)), [records]);
  const barangays = useMemo(() => unique(records.map((record) => record.barangay)), [records]);
  const officers = useMemo(() => unique(records.map((record) => record.restriction.actor)), [records]);
  const filtered = useMemo(
    () => sortRestrictedPermitQueue(filterRestrictedPermitQueue(records, filters), sortKey, direction),
    [records, filters, sortKey, direction],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleRecords = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const setFilter = (key: keyof RestrictedPermitFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };
  const resetFilters = () => {
    setFilters(EMPTY_RESTRICTED_PERMIT_FILTERS);
    setPage(1);
  };
  const sort = (key: RestrictedPermitSortKey) => {
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
            <span>Restricted records</span>
          </nav>
          <p className={styles.eyebrow}>Compliance &amp; Enforcement</p>
          <h1>Suspended or Revoked Permits</h1>
          <p>Monitor active restrictions, controlling orders, responsible officers, and public QR status.</p>
        </div>
        <Link className={styles.headerAction} href="/permits">
          <FileSearch size={15} /> Open permit registry
        </Link>
      </header>

      <section className={styles.summaryGrid} aria-label="Restricted permit summary">
        <article>
          <Ban size={18} />
          <span>
            Restricted permits<strong>{summary.total}</strong>
            <small>Current operational caseload</small>
          </span>
        </article>
        <article className={styles.warningMetric}>
          <CircleAlert size={18} />
          <span>
            Suspended<strong>{summary.suspended}</strong>
            <small>Eligible for review or reinstatement</small>
          </span>
        </article>
        <article className={styles.dangerMetric}>
          <ShieldOff size={18} />
          <span>
            Revoked<strong>{summary.revoked}</strong>
            <small>Terminal permit decisions</small>
          </span>
        </article>
        <article className={styles.dangerMetric}>
          <ShieldOff size={18} />
          <span>
            QR inactive<strong>{summary.inactiveQr}</strong>
            <small>Public verification restricted</small>
          </span>
        </article>
        <article className={styles.warningMetric}>
          <CalendarClock size={18} />
          <span>
            Aged 30+ days<strong>{summary.aged}</strong>
            <small>Requires case follow-up</small>
          </span>
        </article>
      </section>

      <section className={styles.queueCard} aria-label="Restricted permit queue">
        <div className={styles.toolbar}>
          <label className={styles.searchBox}>
            <Search size={15} />
            <input
              aria-label="Search restricted permits"
              placeholder="Search permit, business, owner, order, application, or QR token"
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
            Restriction type
            <select value={filters.status} onChange={(event) => setFilter("status", event.target.value)}>
              <option value="">All restriction types</option>
              <option>Suspended</option>
              <option>Revoked</option>
            </select>
          </label>
          <label>
            Grounds
            <select value={filters.grounds} onChange={(event) => setFilter("grounds", event.target.value)}>
              <option value="">All grounds</option>
              {grounds.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Barangay
            <select value={filters.barangay} onChange={(event) => setFilter("barangay", event.target.value)}>
              <option value="">All barangays</option>
              {barangays.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Effective from
            <input
              aria-label="Effective from"
              type="date"
              value={filters.effectiveFrom}
              onChange={(event) => setFilter("effectiveFrom", event.target.value)}
            />
          </label>
          <label>
            Effective to
            <input
              aria-label="Effective to"
              type="date"
              value={filters.effectiveTo}
              onChange={(event) => setFilter("effectiveTo", event.target.value)}
            />
          </label>
          <label>
            Assigned officer
            <select value={filters.officer} onChange={(event) => setFilter("officer", event.target.value)}>
              <option value="">All officers</option>
              {officers.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>

        <div className={styles.resultBar}>
          <div>
            <strong>{filtered.length}</strong> matching cases · {records.length} restricted permits
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
                      label="Permit"
                      column="documentNumber"
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
                    <SortHeading label="Status" column="status" current={sortKey} direction={direction} onSort={sort} />
                    <th>Grounds &amp; authority</th>
                    <SortHeading
                      label="Barangay"
                      column="barangay"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <SortHeading
                      label="Effective"
                      column="effectiveDate"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <SortHeading
                      label="Age"
                      column="daysRestricted"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <SortHeading
                      label="Officer"
                      column="officer"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <th>QR status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRecords.map((record) => (
                    <tr key={record.documentNumber}>
                      <td className={styles.documentCell}>
                        <Link className={styles.documentLink} href={`/permits/${record.documentNumber}`}>
                          {record.documentNumber}
                        </Link>
                        <small>
                          {record.applicationId} · Version {record.version}
                        </small>
                      </td>
                      <td className={styles.businessCell}>
                        <strong>{record.businessName}</strong>
                        <small>
                          {record.ownerName} · {record.businessId}
                        </small>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${styles[record.status.toLocaleLowerCase()]}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className={styles.evidenceCell}>
                        <strong>{record.restriction.grounds}</strong>
                        <small>{record.restriction.orderReference}</small>
                      </td>
                      <td>{record.barangay}</td>
                      <td>{formatDate(record.restriction.effectiveDate)}</td>
                      <td>
                        <span className={record.daysRestricted >= 30 ? styles.ageWarning : styles.age}>
                          {record.daysRestricted} days
                        </span>
                      </td>
                      <td>{record.restriction.actor}</td>
                      <td>
                        <span className={`${styles.badge} ${styles.inactive}`}>
                          <ShieldOff size={11} />
                          {record.verificationStatus}
                        </span>
                      </td>
                      <td>
                        <QueueActions record={record} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.mobileList}>
              {visibleRecords.map((record) => (
                <article className={styles.mobileCard} key={record.documentNumber}>
                  <div className={styles.mobileCardHeader}>
                    <div>
                      <Link className={styles.documentLink} href={`/permits/${record.documentNumber}`}>
                        {record.documentNumber}
                      </Link>
                      <h2>{record.businessName}</h2>
                      <p>
                        {record.applicationId} · {record.barangay}
                      </p>
                    </div>
                    <span className={`${styles.badge} ${styles[record.status.toLocaleLowerCase()]}`}>
                      {record.status}
                    </span>
                  </div>
                  <div className={styles.caseEvidence}>
                    <span>Controlling grounds</span>
                    <strong>{record.restriction.grounds}</strong>
                    <small>{record.restriction.orderReference}</small>
                  </div>
                  <div className={styles.mobileFacts}>
                    <div>
                      <span>Effective</span>
                      <strong>{formatDate(record.restriction.effectiveDate)}</strong>
                    </div>
                    <div>
                      <span>Case age</span>
                      <strong>{record.daysRestricted} days</strong>
                    </div>
                    <div>
                      <span>Officer</span>
                      <strong>{record.restriction.actor}</strong>
                    </div>
                    <div>
                      <span>QR verification</span>
                      <strong>{record.verificationStatus}</strong>
                    </div>
                  </div>
                  <QueueActions record={record} />
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <FileSearch size={28} />
            <h2>No restricted permits match</h2>
            <p>Change the search, restriction, dates, or assigned officer to broaden the queue.</p>
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
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
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
