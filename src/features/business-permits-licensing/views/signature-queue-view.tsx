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
  FilePenLine,
  MailCheck,
  PenTool,
  Search,
  Send,
  X,
} from "lucide-react";

import styles from "../components/signature-queue.module.css";
import { MATNOG_APPLICATION_DIRECTORY } from "../data/matnog-application-directory";
import { MATNOG_SIGNATURE_DOCUMENTS, MATNOG_SIGNATURE_RELEASES } from "../data/matnog-signature-workflow";
import type { PermitDocumentOverride, PermitReleaseOverride } from "../types/application-detail";
import type { ApplicationDirectoryRecord } from "../types/application-directory";
import type { SignatureQueueFilters, SignatureQueueRecord, SignatureQueueSortKey } from "../types/signature-queue";
import { PERMIT_DOCUMENT_STORAGE_KEY, PERMIT_RELEASE_STORAGE_KEY } from "../utils/application-detail-utils";
import { mergeApplicationRecords, SAVED_APPLICATIONS_STORAGE_KEY } from "../utils/application-wizard-utils";
import {
  createSignatureQueue,
  EMPTY_SIGNATURE_QUEUE_FILTERS,
  filterSignatureQueue,
  mergeSignatureDocuments,
  mergeSignatureReleases,
  sortSignatureQueue,
  summarizeSignatureQueue,
} from "../utils/signature-queue-utils";

const documentTypes = ["Business Permit", "Closure Certificate"];
const signatureStatuses = ["Pending", "Sent", "Signed", "Declined", "Failed"];
const riskLevels = ["Low", "Medium", "High"];

function formatDate(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(`${value.slice(0, 10)}T00:00:00`),
  );
}

function unique(values: readonly string[]) {
  return [...new Set(values)].toSorted((a, b) => a.localeCompare(b));
}

function statusClass(status: SignatureQueueRecord["signatureStatus"]) {
  if (status === "Signed") return styles.signed;
  if (status === "Sent") return styles.sent;
  if (status === "Pending") return styles.pending;
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
  column: SignatureQueueSortKey;
  current: SignatureQueueSortKey;
  direction: "asc" | "desc";
  onSort: (key: SignatureQueueSortKey) => void;
}) {
  return (
    <th aria-sort={column === current ? (direction === "asc" ? "ascending" : "descending") : undefined}>
      <button className={styles.sortButton} type="button" onClick={() => onSort(column)}>
        {label} <ChevronsUpDown size={12} />
      </button>
    </th>
  );
}

function QueueActions({ record }: { record: SignatureQueueRecord }) {
  return (
    <div className={styles.actions}>
      <Link className={styles.primaryLink} href={`/applications/${record.id}`}>
        Open workspace
      </Link>
      <Link className={styles.textLink} href={`/businesses/${record.businessId}`}>
        Business
      </Link>
    </div>
  );
}

export function SignatureQueueView() {
  const [records, setRecords] = useState<SignatureQueueRecord[]>(() =>
    createSignatureQueue(MATNOG_APPLICATION_DIRECTORY, MATNOG_SIGNATURE_DOCUMENTS, MATNOG_SIGNATURE_RELEASES),
  );
  const [filters, setFilters] = useState<SignatureQueueFilters>(EMPTY_SIGNATURE_QUEUE_FILTERS);
  const [sortKey, setSortKey] = useState<SignatureQueueSortKey>("daysInStage");
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
        createSignatureQueue(
          mergeApplicationRecords(MATNOG_APPLICATION_DIRECTORY, savedApplications),
          mergeSignatureDocuments(MATNOG_SIGNATURE_DOCUMENTS, savedDocuments),
          mergeSignatureReleases(MATNOG_SIGNATURE_RELEASES, savedReleases),
        ),
      );
    } catch {
      setRecords(
        createSignatureQueue(MATNOG_APPLICATION_DIRECTORY, MATNOG_SIGNATURE_DOCUMENTS, MATNOG_SIGNATURE_RELEASES),
      );
    }
  }, []);

  const summary = useMemo(() => summarizeSignatureQueue(records), [records]);
  const barangays = useMemo(() => unique(records.map((record) => record.barangay)), [records]);
  const providers = useMemo(() => unique(records.map((record) => record.provider)), [records]);
  const filtered = useMemo(
    () => sortSignatureQueue(filterSignatureQueue(records, filters), sortKey, direction),
    [records, filters, sortKey, direction],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleRecords = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const setFilter = (key: keyof SignatureQueueFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };
  const resetFilters = () => {
    setFilters(EMPTY_SIGNATURE_QUEUE_FILTERS);
    setPage(1);
  };
  const sort = (key: SignatureQueueSortKey) => {
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
            <span>For signature</span>
          </nav>
          <p className={styles.eyebrow}>Controlled document workflow</p>
          <h1>For Signature</h1>
          <p>
            Monitor generated permits and closure certificates from envelope preparation through completed signature.
          </p>
        </div>
        <Link className={styles.headerAction} href="/permits">
          <FilePenLine size={15} /> Open permit registry
        </Link>
      </header>

      <section className={styles.summaryGrid} aria-label="Signature queue summary">
        <article>
          <PenTool size={18} />
          <span>
            In signature workflow<strong>{summary.total}</strong>
            <small>Controlled documents not released</small>
          </span>
        </article>
        <article className={styles.warningMetric}>
          <MailCheck size={18} />
          <span>
            Pending send<strong>{summary.pending}</strong>
            <small>Envelope preparation required</small>
          </span>
        </article>
        <article className={styles.infoMetric}>
          <Send size={18} />
          <span>
            Awaiting signature<strong>{summary.sent}</strong>
            <small>Envelope sent to signatory</small>
          </span>
        </article>
        <article className={styles.successMetric}>
          <BadgeCheck size={18} />
          <span>
            Ready for release<strong>{summary.signed}</strong>
            <small>Signature completion recorded</small>
          </span>
        </article>
        <article className={styles.dangerMetric}>
          <CircleAlert size={18} />
          <span>
            Exceptions<strong>{summary.exceptions}</strong>
            <small>Declined or failed envelopes</small>
          </span>
        </article>
        <article className={styles.overdueMetric}>
          <CalendarClock size={18} />
          <span>
            Past target release<strong>{summary.overdue}</strong>
            <small>Service target requires action</small>
          </span>
        </article>
      </section>

      <section className={styles.queueCard} aria-label="Signature queue">
        <div className={styles.toolbar}>
          <label className={styles.searchBox}>
            <Search size={15} />
            <input
              aria-label="Search signature queue"
              placeholder="Search application, document, business, signer, or envelope"
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
            Provider
            <select value={filters.provider} onChange={(e) => setFilter("provider", e.target.value)}>
              <option value="">All providers</option>
              {providers.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Signature status
            <select value={filters.signatureStatus} onChange={(e) => setFilter("signatureStatus", e.target.value)}>
              <option value="">All statuses</option>
              {signatureStatuses.map((value) => (
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
            <strong>{filtered.length}</strong> matching documents · {records.length} in signature workflow
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
                    <SortHeading
                      label="Provider"
                      column="provider"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <th>Envelope / signer</th>
                    <SortHeading
                      label="Signature"
                      column="signatureStatus"
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
                      label="Age"
                      column="daysInStage"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <SortHeading
                      label="Risk"
                      column="riskLevel"
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
                        <small>Version {record.documentVersion}</small>
                      </td>
                      <td>{record.documentType}</td>
                      <td>{record.provider}</td>
                      <td className={styles.envelopeCell}>
                        <strong>{record.envelopeReference}</strong>
                        <small>{record.signerEmail}</small>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${statusClass(record.signatureStatus)}`}>
                          {record.signatureStatus}
                        </span>
                        {record.exceptionReason ? (
                          <small className={styles.reason}>{record.exceptionReason}</small>
                        ) : null}
                      </td>
                      <td>
                        <span className={record.overdue ? styles.overdue : undefined}>
                          {formatDate(record.targetRelease)}
                        </span>
                      </td>
                      <td>{record.daysInStage} days</td>
                      <td>
                        <span className={`${styles.badge} ${styles[record.riskLevel.toLocaleLowerCase()]}`}>
                          {record.riskLevel}
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
                    <span className={`${styles.badge} ${statusClass(record.signatureStatus)}`}>
                      {record.signatureStatus}
                    </span>
                  </div>
                  <div className={styles.documentSummary}>
                    <strong>{record.documentNumber}</strong>
                    <span>
                      <FilePenLine size={12} /> Version {record.documentVersion} · {record.provider}
                    </span>
                    <span>
                      <MailCheck size={12} /> {record.envelopeReference}
                    </span>
                  </div>
                  <div className={styles.mobileFacts}>
                    <div>
                      <span>Signer</span>
                      <strong>{record.signerEmail}</strong>
                    </div>
                    <div>
                      <span>Risk</span>
                      <strong>{record.riskLevel}</strong>
                    </div>
                    <div>
                      <span>Target release</span>
                      <strong className={record.overdue ? styles.overdue : undefined}>
                        {formatDate(record.targetRelease)}
                      </strong>
                    </div>
                    <div>
                      <span>Workflow age</span>
                      <strong>{record.daysInStage} days</strong>
                    </div>
                  </div>
                  {record.exceptionReason ? <p className={styles.exceptionNote}>{record.exceptionReason}</p> : null}
                  <QueueActions record={record} />
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <PenTool size={28} />
            <h2>No signature records match</h2>
            <p>Change the search, status, dates, or operational filters to broaden the queue.</p>
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
