"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import {
  BadgeCheck,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  CircleAlert,
  ClipboardCheck,
  FileCheck2,
  PackageCheck,
  Search,
  Store,
  UserRoundCheck,
  X,
} from "lucide-react";

import styles from "../components/signature-queue.module.css";
import { MATNOG_APPLICATION_DIRECTORY } from "../data/matnog-application-directory";
import { MATNOG_SIGNATURE_DOCUMENTS, MATNOG_SIGNATURE_RELEASES } from "../data/matnog-signature-workflow";
import type { PermitDocumentOverride, PermitReleaseOverride } from "../types/application-detail";
import type { ApplicationDirectoryRecord } from "../types/application-directory";
import type { ReleaseQueueFilters, ReleaseQueueRecord, ReleaseQueueSortKey } from "../types/release-queue";
import { PERMIT_DOCUMENT_STORAGE_KEY, PERMIT_RELEASE_STORAGE_KEY } from "../utils/application-detail-utils";
import { mergeApplicationRecords, SAVED_APPLICATIONS_STORAGE_KEY } from "../utils/application-wizard-utils";
import {
  createReleaseQueue,
  EMPTY_RELEASE_QUEUE_FILTERS,
  filterReleaseQueue,
  sortReleaseQueue,
  summarizeReleaseQueue,
} from "../utils/release-queue-utils";
import { mergeSignatureDocuments, mergeSignatureReleases } from "../utils/signature-queue-utils";

const documentTypes = ["Business Permit", "Closure Certificate"];
const releaseChannels = ["Digital email", "Onsite pickup", "Printed counter release"];
const riskLevels = ["Low", "Medium", "High"];
const readinessOptions = ["Ready to finalize", "Needs recipient details", "Needs acknowledgment"];

function formatDate(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(`${value.slice(0, 10)}T00:00:00`),
  );
}

function unique(values: readonly string[]) {
  return [...new Set(values)].toSorted((a, b) => a.localeCompare(b));
}

function readinessClass(readiness: ReleaseQueueRecord["readiness"]) {
  if (readiness === "Ready to finalize") return styles.signed;
  if (readiness === "Needs acknowledgment") return styles.pending;
  return styles.exception;
}

function SortHeading({
  label,
  column,
  current,
  direction,
  onSort,
}: {
  label: string;
  column: ReleaseQueueSortKey;
  current: ReleaseQueueSortKey;
  direction: "asc" | "desc";
  onSort: (key: ReleaseQueueSortKey) => void;
}) {
  return (
    <th aria-sort={column === current ? (direction === "asc" ? "ascending" : "descending") : undefined}>
      <button className={styles.sortButton} type="button" onClick={() => onSort(column)}>
        {label} <ChevronsUpDown size={12} />
      </button>
    </th>
  );
}

function ReleaseActions({ record }: { record: ReleaseQueueRecord }) {
  return (
    <div className={styles.actions}>
      <Link className={styles.primaryLink} href={`/applications/${record.id}`}>
        Open release workspace
      </Link>
      <Link className={styles.textLink} href={`/businesses/${record.businessId}`}>
        Business
      </Link>
    </div>
  );
}

export function ReleaseQueueView() {
  const [records, setRecords] = useState<ReleaseQueueRecord[]>(() =>
    createReleaseQueue(MATNOG_APPLICATION_DIRECTORY, MATNOG_SIGNATURE_DOCUMENTS, MATNOG_SIGNATURE_RELEASES),
  );
  const [filters, setFilters] = useState<ReleaseQueueFilters>(EMPTY_RELEASE_QUEUE_FILTERS);
  const [sortKey, setSortKey] = useState<ReleaseQueueSortKey>("daysWaiting");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    try {
      const savedApplications = JSON.parse(
        window.localStorage.getItem(SAVED_APPLICATIONS_STORAGE_KEY) ?? "[]",
      ) as ApplicationDirectoryRecord[];
      const savedDocuments = JSON.parse(
        window.localStorage.getItem(PERMIT_DOCUMENT_STORAGE_KEY) ?? "[]",
      ) as PermitDocumentOverride[];
      const savedReleases = JSON.parse(
        window.localStorage.getItem(PERMIT_RELEASE_STORAGE_KEY) ?? "[]",
      ) as PermitReleaseOverride[];
      setRecords(
        createReleaseQueue(
          mergeApplicationRecords(MATNOG_APPLICATION_DIRECTORY, savedApplications),
          mergeSignatureDocuments(MATNOG_SIGNATURE_DOCUMENTS, savedDocuments),
          mergeSignatureReleases(MATNOG_SIGNATURE_RELEASES, savedReleases),
        ),
      );
    } catch {
      setRecords(
        createReleaseQueue(MATNOG_APPLICATION_DIRECTORY, MATNOG_SIGNATURE_DOCUMENTS, MATNOG_SIGNATURE_RELEASES),
      );
    }
  }, []);

  const summary = useMemo(() => summarizeReleaseQueue(records), [records]);
  const barangays = useMemo(() => unique(records.map((record) => record.barangay)), [records]);
  const filtered = useMemo(
    () => sortReleaseQueue(filterReleaseQueue(records, filters), sortKey, direction),
    [records, filters, sortKey, direction],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleRecords = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const setFilter = (key: keyof ReleaseQueueFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };
  const resetFilters = () => {
    setFilters(EMPTY_RELEASE_QUEUE_FILTERS);
    setPage(1);
  };
  const sort = (key: ReleaseQueueSortKey) => {
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
            <span>For release</span>
          </nav>
          <p className={styles.eyebrow}>BPLO controlled release</p>
          <h1>For Release</h1>
          <p>Finalize signed permits and closure certificates after recipient and acknowledgment validation.</p>
        </div>
        <Link className={styles.headerAction} href="/permits/signature">
          <FileCheck2 size={15} /> Open signature queue
        </Link>
      </header>

      <section className={styles.summaryGrid} aria-label="Release queue summary">
        <article>
          <PackageCheck size={18} />
          <span>
            Awaiting release<strong>{summary.total}</strong>
            <small>Signed controlled documents</small>
          </span>
        </article>
        <article className={styles.successMetric}>
          <BadgeCheck size={18} />
          <span>
            Ready to finalize<strong>{summary.ready}</strong>
            <small>All release evidence complete</small>
          </span>
        </article>
        <article className={styles.warningMetric}>
          <ClipboardCheck size={18} />
          <span>
            Incomplete evidence<strong>{summary.needsInformation + summary.needsAcknowledgment}</strong>
            <small>Recipient or acknowledgment action</small>
          </span>
        </article>
        <article className={styles.dangerMetric}>
          <CircleAlert size={18} />
          <span>
            Urgent<strong>{summary.urgent}</strong>
            <small>Priority controlled release</small>
          </span>
        </article>
        <article className={styles.overdueMetric}>
          <CalendarClock size={18} />
          <span>
            Past target release<strong>{summary.overdue}</strong>
            <small>Service target requires action</small>
          </span>
        </article>
        <article className={styles.infoMetric}>
          <Store size={18} />
          <span>
            Closure certificates<strong>{summary.closures}</strong>
            <small>Business closure completion</small>
          </span>
        </article>
      </section>

      <section className={styles.queueCard} aria-label="Release queue">
        <div className={styles.toolbar}>
          <label className={styles.searchBox}>
            <Search size={15} />
            <input
              aria-label="Search release queue"
              placeholder="Search application, document, business, recipient, or acknowledgment"
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
            Document type
            <select value={filters.documentType} onChange={(e) => setFilter("documentType", e.target.value)}>
              <option value="">All documents</option>
              {documentTypes.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Release channel
            <select value={filters.releaseChannel} onChange={(e) => setFilter("releaseChannel", e.target.value)}>
              <option value="">All channels</option>
              {releaseChannels.map((value) => (
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
            Readiness
            <select value={filters.readiness} onChange={(e) => setFilter("readiness", e.target.value)}>
              <option value="">All readiness states</option>
              {readinessOptions.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Signed from
            <input
              aria-label="Signed from"
              type="date"
              value={filters.signedFrom}
              onChange={(e) => setFilter("signedFrom", e.target.value)}
            />
          </label>
          <label>
            Signed to
            <input
              aria-label="Signed to"
              type="date"
              value={filters.signedTo}
              onChange={(e) => setFilter("signedTo", e.target.value)}
            />
          </label>
        </div>

        <div className={styles.resultBar}>
          <div>
            <strong>{filtered.length}</strong> matching documents · {records.length} awaiting controlled release
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
                      column="applicationId"
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
                    <SortHeading
                      label="Document"
                      column="documentNumber"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <SortHeading
                      label="Type"
                      column="documentType"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <th>Recipient</th>
                    <SortHeading
                      label="Channel"
                      column="releaseChannel"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <SortHeading
                      label="Signed"
                      column="signedDate"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <SortHeading
                      label="Readiness"
                      column="readiness"
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
                      <td className={styles.documentCell}>
                        <strong>{record.documentNumber}</strong>
                        <small>
                          Version {record.documentVersion} · {record.provider}
                        </small>
                      </td>
                      <td>{record.documentType}</td>
                      <td className={styles.envelopeCell}>
                        <strong>{record.recipientName}</strong>
                        <small>{record.recipientIdentification || "Recipient authority missing"}</small>
                      </td>
                      <td>{record.releaseChannel}</td>
                      <td>
                        <strong>{formatDate(record.signedDate)}</strong>
                        <small>{record.envelopeReference}</small>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${readinessClass(record.readiness)}`}>
                          {record.readiness}
                        </span>
                        <small className={styles.reason}>
                          {record.readinessComplete}/{record.readinessTotal} release gates complete
                        </small>
                      </td>
                      <td>
                        <span className={record.overdue ? styles.overdue : undefined}>
                          {formatDate(record.targetRelease)}
                        </span>
                      </td>
                      <td>{record.daysWaiting} days</td>
                      <td>
                        <span
                          className={`${styles.badge} ${record.priority === "Urgent" ? styles.exception : styles.signed}`}
                        >
                          {record.priority}
                        </span>
                      </td>
                      <td>
                        <ReleaseActions record={record} />
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
                        {record.documentType} · {record.barangay}
                      </p>
                    </div>
                    <span className={`${styles.badge} ${readinessClass(record.readiness)}`}>{record.readiness}</span>
                  </div>
                  <div className={styles.documentSummary}>
                    <strong>{record.documentNumber}</strong>
                    <span>
                      <BadgeCheck size={12} /> Signed {formatDate(record.signedDate)} · Version {record.documentVersion}
                    </span>
                    <span>
                      <UserRoundCheck size={12} /> {record.recipientName}
                    </span>
                  </div>
                  <div className={styles.mobileFacts}>
                    <div>
                      <span>Release channel</span>
                      <strong>{record.releaseChannel}</strong>
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
                  <p
                    className={record.readiness === "Ready to finalize" ? styles.documentSummary : styles.exceptionNote}
                  >
                    {record.readinessComplete}/{record.readinessTotal} release gates complete ·{" "}
                    {record.acknowledgmentReference}
                  </p>
                  <ReleaseActions record={record} />
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <PackageCheck size={28} />
            <h2>No release records match</h2>
            <p>Change the search, readiness, dates, or operational filters to broaden the queue.</p>
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
