"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

import Link from "next/link";

import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  CircleAlert,
  ExternalLink,
  FileQuestion,
  FileSearch,
  ScanLine,
  Search,
  ShieldOff,
  X,
} from "lucide-react";

import styles from "../components/permit-verification.module.css";
import { MATNOG_APPLICATION_DIRECTORY } from "../data/matnog-application-directory";
import { MATNOG_PERMIT_REGISTRY } from "../data/matnog-permit-registry";
import type { PermitDocumentOverride, PermitReleaseOverride } from "../types/application-detail";
import type { ApplicationDirectoryRecord } from "../types/application-directory";
import type { PermitLifecycleOverride, PermitRegistryRecord } from "../types/permit-registry";
import type {
  PermitVerificationActivity,
  PermitVerificationFilters,
  PermitVerificationLookupResult,
  PermitVerificationOutcome,
  PermitVerificationSortKey,
  PermitVerificationSource,
} from "../types/permit-verification";
import { PERMIT_DOCUMENT_STORAGE_KEY, PERMIT_RELEASE_STORAGE_KEY } from "../utils/application-detail-utils";
import { mergeApplicationRecords, SAVED_APPLICATIONS_STORAGE_KEY } from "../utils/application-wizard-utils";
import { mergePermitRegistryRecords, PERMIT_LIFECYCLE_STORAGE_KEY } from "../utils/permit-registry-utils";
import {
  createPermitVerificationActivity,
  createSeededPermitVerificationActivity,
  EMPTY_PERMIT_VERIFICATION_FILTERS,
  filterPermitVerificationActivity,
  PERMIT_VERIFICATION_ACTIVITY_STORAGE_KEY,
  PERMIT_VERIFICATION_OFFICERS,
  PERMIT_VERIFICATION_SOURCES,
  resolveStaffPermitVerification,
  sortPermitVerificationActivity,
  summarizePermitVerificationActivity,
} from "../utils/permit-verification-utils";

const outcomes: readonly PermitVerificationOutcome[] = [
  "Verified",
  "Expiring soon",
  "Expired",
  "Suspended",
  "Revoked",
  "Inactive",
  "Not found",
];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value.replace(" ", "T")));
}

function currentLocalDateTime() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function toneClass(outcome: PermitVerificationOutcome) {
  if (outcome === "Verified") return styles.success;
  if (["Expiring soon", "Expired", "Inactive"].includes(outcome)) return styles.warning;
  return styles.danger;
}

function SortHeading({
  label,
  column,
  current,
  direction,
  onSort,
}: {
  label: string;
  column: PermitVerificationSortKey;
  current: PermitVerificationSortKey;
  direction: "asc" | "desc";
  onSort: (key: PermitVerificationSortKey) => void;
}) {
  return (
    <th aria-sort={column === current ? (direction === "asc" ? "ascending" : "descending") : undefined}>
      <button className={styles.sortButton} type="button" onClick={() => onSort(column)}>
        {label} <ChevronsUpDown size={12} />
      </button>
    </th>
  );
}

function VerificationResult({ reference, result }: { reference: string; result: PermitVerificationLookupResult }) {
  const record = result.record;
  const verified = result.outcome === "Verified";
  const Icon = verified ? BadgeCheck : record ? CircleAlert : FileQuestion;
  return (
    <section className={`${styles.resultPanel} ${toneClass(result.outcome)}`} aria-live="polite">
      <div className={styles.resultLead}>
        <span className={styles.resultIcon}>
          <Icon size={22} />
        </span>
        <div>
          <p className={styles.resultEyebrow}>Verification result</p>
          <h2>{record ? record.businessName : "No matching registry record"}</h2>
          <p>
            {record
              ? `${record.documentNumber} · ${record.documentType} · ${record.barangay}`
              : `The submitted reference “${reference}” does not match an issued Matnog BPLS document.`}
          </p>
        </div>
      </div>
      <span className={styles.resultBadge}>{result.outcome}</span>
      {record ? (
        <div className={styles.resultFacts}>
          <div>
            <span>Permit status</span>
            <strong>{record.status}</strong>
          </div>
          <div>
            <span>QR status</span>
            <strong>{record.verificationStatus}</strong>
          </div>
          <div>
            <span>Fiscal period</span>
            <strong>{record.fiscalPeriod}</strong>
          </div>
          <div>
            <span>Version</span>
            <strong>{record.version}</strong>
          </div>
        </div>
      ) : null}
      {record ? (
        <div className={styles.resultActions}>
          <Link href={`/permits/${record.documentNumber}`}>Open controlled record</Link>
          <Link href={`/applications/${record.applicationId}`}>Application</Link>
          <Link href={`/businesses/${record.businessId}`}>Business</Link>
          <Link href={`/verify/documents/${record.qrToken}`}>
            Public result <ExternalLink size={12} />
          </Link>
        </div>
      ) : null}
    </section>
  );
}

export function PermitVerificationView() {
  const seededActivity = useMemo(() => createSeededPermitVerificationActivity(MATNOG_PERMIT_REGISTRY), []);
  const [registry, setRegistry] = useState<PermitRegistryRecord[]>(() => [...MATNOG_PERMIT_REGISTRY]);
  const [activities, setActivities] = useState<PermitVerificationActivity[]>(seededActivity);
  const [reference, setReference] = useState("");
  const [lookupSource, setLookupSource] = useState<PermitVerificationSource>("QR scanner");
  const [officer, setOfficer] = useState<(typeof PERMIT_VERIFICATION_OFFICERS)[number]>(
    PERMIT_VERIFICATION_OFFICERS[0],
  );
  const [lastReference, setLastReference] = useState("");
  const [lookupResult, setLookupResult] = useState<PermitVerificationLookupResult>();
  const [filters, setFilters] = useState<PermitVerificationFilters>(EMPTY_PERMIT_VERIFICATION_FILTERS);
  const [sortKey, setSortKey] = useState<PermitVerificationSortKey>("checkedAt");
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
      setRegistry(
        mergePermitRegistryRecords(MATNOG_PERMIT_REGISTRY, applications, documents, releases, lifecycleOverrides),
      );
      const savedActivity = JSON.parse(
        window.localStorage.getItem(PERMIT_VERIFICATION_ACTIVITY_STORAGE_KEY) ?? "[]",
      ) as PermitVerificationActivity[];
      if (savedActivity.length) setActivities(savedActivity);
    } catch {
      setRegistry([...MATNOG_PERMIT_REGISTRY]);
      setActivities(seededActivity);
    }
  }, [seededActivity]);

  const summary = useMemo(() => summarizePermitVerificationActivity(activities), [activities]);
  const filtered = useMemo(
    () => sortPermitVerificationActivity(filterPermitVerificationActivity(activities, filters), sortKey, direction),
    [activities, direction, filters, sortKey],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleActivities = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const setFilter = (key: keyof PermitVerificationFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };
  const resetFilters = () => {
    setFilters(EMPTY_PERMIT_VERIFICATION_FILTERS);
    setPage(1);
  };
  const sort = (key: PermitVerificationSortKey) => {
    if (key === sortKey) setDirection((current) => (current === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setDirection("asc");
    }
  };

  const verify = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submittedReference = reference.trim();
    if (!submittedReference) return;
    const result = resolveStaffPermitVerification(registry, submittedReference);
    const activity = createPermitVerificationActivity({
      id: `VERIFY-${Date.now()}`,
      checkedAt: currentLocalDateTime(),
      officer,
      source: lookupSource,
      submittedReference,
      result,
    });
    const nextActivities = [activity, ...activities];
    setActivities(nextActivities);
    setLookupResult(result);
    setLastReference(submittedReference);
    setPage(1);
    try {
      window.localStorage.setItem(PERMIT_VERIFICATION_ACTIVITY_STORAGE_KEY, JSON.stringify(nextActivities));
    } catch {
      // The current result remains usable when browser storage is unavailable.
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/permits">Permits</Link>
            <span>/</span>
            <span>Permit verification</span>
          </nav>
          <p className={styles.eyebrow}>Registry Validation &amp; Audit</p>
          <h1>Permit Verification</h1>
          <p>Validate controlled documents and review every staff, counter, scanner, and public lookup.</p>
        </div>
        <Link className={styles.headerAction} href="/permits/issued">
          <FileSearch size={15} /> Open issued permits
        </Link>
      </header>

      <section className={styles.lookupCard} aria-label="Verify permit reference">
        <div className={styles.lookupIntro}>
          <span className={styles.lookupIcon}>
            <ScanLine size={21} />
          </span>
          <div>
            <h2>Scan or enter a permit reference</h2>
            <p>Accepts QR token, document number, application ID, or business ID.</p>
          </div>
        </div>
        <form className={styles.lookupForm} onSubmit={verify}>
          <label className={styles.referenceField}>
            Reference
            <input
              aria-label="Permit reference"
              autoComplete="off"
              placeholder="Example: MTG-2026-00394-0128"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
            />
          </label>
          <label>
            Lookup source
            <select
              value={lookupSource}
              onChange={(event) => setLookupSource(event.target.value as PermitVerificationSource)}
            >
              {PERMIT_VERIFICATION_SOURCES.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Verifying officer
            <select value={officer} onChange={(event) => setOfficer(event.target.value as typeof officer)}>
              {PERMIT_VERIFICATION_OFFICERS.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={!reference.trim()}>
            <Search size={14} /> Verify record
          </button>
        </form>
      </section>

      {lookupResult ? <VerificationResult reference={lastReference} result={lookupResult} /> : null}

      <section className={styles.summaryGrid} aria-label="Verification activity summary">
        <article>
          <ScanLine size={18} />
          <span>
            Checks today<strong>{summary.today}</strong>
            <small>All verification sources</small>
          </span>
        </article>
        <article className={styles.successMetric}>
          <BadgeCheck size={18} />
          <span>
            Verified<strong>{summary.verified}</strong>
            <small>Active authentic documents</small>
          </span>
        </article>
        <article className={styles.warningMetric}>
          <CircleAlert size={18} />
          <span>
            Warnings<strong>{summary.warnings}</strong>
            <small>Expiry or inactive QR status</small>
          </span>
        </article>
        <article className={styles.dangerMetric}>
          <ShieldOff size={18} />
          <span>
            Restricted<strong>{summary.restricted}</strong>
            <small>Suspended or revoked</small>
          </span>
        </article>
        <article className={styles.dangerMetric}>
          <FileQuestion size={18} />
          <span>
            Failed lookups<strong>{summary.failed}</strong>
            <small>No registry match</small>
          </span>
        </article>
      </section>

      <section className={styles.activityCard} aria-label="Verification activity">
        <div className={styles.toolbar}>
          <label className={styles.searchBox}>
            <Search size={15} />
            <input
              aria-label="Search verification activity"
              placeholder="Search reference, document, business, barangay, or officer"
              value={filters.search}
              onChange={(event) => setFilter("search", event.target.value)}
            />
          </label>
          {activeFilterCount ? (
            <button className={styles.clearButton} type="button" onClick={resetFilters}>
              <X size={14} /> Clear filters <span className={styles.filterCount}>{activeFilterCount}</span>
            </button>
          ) : null}
        </div>
        <div className={styles.filters}>
          <label>
            Result
            <select value={filters.outcome} onChange={(event) => setFilter("outcome", event.target.value)}>
              <option value="">All results</option>
              {outcomes.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Source
            <select value={filters.source} onChange={(event) => setFilter("source", event.target.value)}>
              <option value="">All sources</option>
              {PERMIT_VERIFICATION_SOURCES.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Officer
            <select value={filters.officer} onChange={(event) => setFilter("officer", event.target.value)}>
              <option value="">All officers</option>
              {PERMIT_VERIFICATION_OFFICERS.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Checked from
            <input
              type="date"
              value={filters.checkedFrom}
              onChange={(event) => setFilter("checkedFrom", event.target.value)}
            />
          </label>
          <label>
            Checked to
            <input
              type="date"
              value={filters.checkedTo}
              onChange={(event) => setFilter("checkedTo", event.target.value)}
            />
          </label>
        </div>
        <div className={styles.resultBar}>
          <div>
            <strong>{filtered.length}</strong> matching checks · {activities.length} total
          </div>
          <span>
            Showing {filtered.length ? (safePage - 1) * pageSize + 1 : 0}–
            {Math.min(safePage * pageSize, filtered.length)}
          </span>
        </div>

        {visibleActivities.length ? (
          <>
            <div className={styles.tableViewport}>
              <table>
                <thead>
                  <tr>
                    <SortHeading
                      label="Checked"
                      column="checkedAt"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <SortHeading
                      label="Submitted reference"
                      column="submittedReference"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <SortHeading
                      label="Result"
                      column="outcome"
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
                      label="Business"
                      column="businessName"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <th>Barangay</th>
                    <SortHeading label="Source" column="source" current={sortKey} direction={direction} onSort={sort} />
                    <SortHeading
                      label="Officer"
                      column="officer"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleActivities.map((activity) => (
                    <tr key={activity.id}>
                      <td>{formatDateTime(activity.checkedAt)}</td>
                      <td className={styles.referenceCell}>{activity.submittedReference}</td>
                      <td>
                        <span className={`${styles.badge} ${toneClass(activity.outcome)}`}>{activity.outcome}</span>
                      </td>
                      <td>
                        {activity.documentNumber === "—" ? (
                          "—"
                        ) : (
                          <Link className={styles.documentLink} href={`/permits/${activity.documentNumber}`}>
                            {activity.documentNumber}
                          </Link>
                        )}
                        <small>{activity.documentType}</small>
                      </td>
                      <td>
                        <strong>{activity.businessName}</strong>
                        <small>{activity.permitStatus}</small>
                      </td>
                      <td>{activity.barangay}</td>
                      <td>{activity.source}</td>
                      <td>{activity.officer}</td>
                      <td>
                        {activity.documentNumber === "—" ? (
                          "—"
                        ) : (
                          <Link className={styles.textLink} href={`/permits/${activity.documentNumber}`}>
                            Open
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={styles.mobileList}>
              {visibleActivities.map((activity) => (
                <article className={styles.mobileCard} key={activity.id}>
                  <div className={styles.mobileCardHeader}>
                    <div>
                      <strong>{activity.submittedReference}</strong>
                      <p>{formatDateTime(activity.checkedAt)}</p>
                    </div>
                    <span className={`${styles.badge} ${toneClass(activity.outcome)}`}>{activity.outcome}</span>
                  </div>
                  <h2>{activity.businessName}</h2>
                  <div className={styles.mobileFacts}>
                    <div>
                      <span>Document</span>
                      <strong>{activity.documentNumber}</strong>
                    </div>
                    <div>
                      <span>Source</span>
                      <strong>{activity.source}</strong>
                    </div>
                    <div>
                      <span>Officer</span>
                      <strong>{activity.officer}</strong>
                    </div>
                    <div>
                      <span>Barangay</span>
                      <strong>{activity.barangay}</strong>
                    </div>
                  </div>
                  {activity.documentNumber === "—" ? null : (
                    <Link className={styles.textLink} href={`/permits/${activity.documentNumber}`}>
                      Open controlled record
                    </Link>
                  )}
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <FileSearch size={28} />
            <h2>No verification activity found</h2>
            <p>Change the search or filters to broaden the audit results.</p>
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
