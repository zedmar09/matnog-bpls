"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import {
  BadgeCheck,
  Ban,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  CircleAlert,
  FileBadge2,
  FileSearch,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

import styles from "../components/permit-registry.module.css";
import { MATNOG_APPLICATION_DIRECTORY } from "../data/matnog-application-directory";
import { MATNOG_BARANGAYS } from "../data/matnog-business-directory";
import { MATNOG_PERMIT_REGISTRY } from "../data/matnog-permit-registry";
import type { PermitDocumentOverride, PermitReleaseOverride } from "../types/application-detail";
import type { ApplicationDirectoryRecord } from "../types/application-directory";
import type { PermitRegistryFilters, PermitRegistryRecord, PermitRegistrySortKey } from "../types/permit-registry";
import { PERMIT_DOCUMENT_STORAGE_KEY, PERMIT_RELEASE_STORAGE_KEY } from "../utils/application-detail-utils";
import { mergeApplicationRecords, SAVED_APPLICATIONS_STORAGE_KEY } from "../utils/application-wizard-utils";
import {
  EMPTY_PERMIT_REGISTRY_FILTERS,
  filterPermitRegistry,
  mergePermitRegistryRecords,
  sortPermitRegistry,
  summarizePermitRegistry,
} from "../utils/permit-registry-utils";

const documentTypes = ["Business Permit", "Closure Certificate"];
const statuses = ["Active", "Expiring soon", "Expired", "Closed", "Suspended", "Revoked"];
const fiscalPeriods = ["2027", "2026", "2025"];
const verificationStatuses = ["Active", "Pending", "Inactive"];
const releaseChannels = ["Digital email", "Onsite pickup", "Printed counter release", "Pending release"];

function formatDate(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(`${value.slice(0, 10)}T00:00:00`),
  );
}

function statusClass(value: string) {
  if (value === "Expiring soon") return styles.expiring;
  return styles[value.toLocaleLowerCase().replaceAll(" ", "")] ?? "";
}

function SortHeading({
  label,
  column,
  current,
  direction,
  onSort,
}: {
  label: string;
  column: PermitRegistrySortKey;
  current: PermitRegistrySortKey;
  direction: "asc" | "desc";
  onSort: (key: PermitRegistrySortKey) => void;
}) {
  return (
    <th aria-sort={column === current ? (direction === "asc" ? "ascending" : "descending") : undefined}>
      <button className={styles.sortButton} type="button" onClick={() => onSort(column)}>
        {label} <ChevronsUpDown size={12} />
      </button>
    </th>
  );
}

function RecordActions({ record }: { record: PermitRegistryRecord }) {
  return (
    <div className={styles.actions}>
      <Link className={styles.textLink} href={`/verify/documents/${record.qrToken}`}>
        Verify
      </Link>
      <Link className={styles.textLink} href={`/applications/${record.applicationId}`}>
        Application
      </Link>
      <Link className={styles.textLink} href={`/businesses/${record.businessId}`}>
        Business
      </Link>
    </div>
  );
}

export function PermitRegistryView() {
  const [records, setRecords] = useState<PermitRegistryRecord[]>(() => [...MATNOG_PERMIT_REGISTRY]);
  const [filters, setFilters] = useState<PermitRegistryFilters>(EMPTY_PERMIT_REGISTRY_FILTERS);
  const [sortKey, setSortKey] = useState<PermitRegistrySortKey>("lastUpdated");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

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
      setRecords(mergePermitRegistryRecords(MATNOG_PERMIT_REGISTRY, applications, documents, releases));
    } catch {
      setRecords([...MATNOG_PERMIT_REGISTRY]);
    }
  }, []);

  const summary = useMemo(() => summarizePermitRegistry(records), [records]);
  const filtered = useMemo(
    () => sortPermitRegistry(filterPermitRegistry(records, filters), sortKey, direction),
    [records, filters, sortKey, direction],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleRecords = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const setFilter = (key: keyof PermitRegistryFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };
  const resetFilters = () => {
    setFilters(EMPTY_PERMIT_REGISTRY_FILTERS);
    setPage(1);
  };
  const sort = (key: PermitRegistrySortKey) => {
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
          <p className={styles.eyebrow}>Permit Issuance &amp; Verification</p>
          <h1>Permit Registry</h1>
          <p>Search issued business permits and closure certificates with release and QR verification status.</p>
        </div>
        <Link className={styles.headerAction} href="/applications">
          <FileSearch size={15} /> View applications
        </Link>
      </header>

      <section className={styles.summaryGrid} aria-label="Permit registry summary">
        <article>
          <FileBadge2 size={18} />
          <span>
            Total controlled records<strong>{summary.total}</strong>
            <small>Permits and closure certificates</small>
          </span>
        </article>
        <article className={styles.successIcon}>
          <BadgeCheck size={18} />
          <span>
            Active permits<strong>{summary.active}</strong>
            <small>Includes permits nearing expiry</small>
          </span>
        </article>
        <article className={styles.warningIcon}>
          <CircleAlert size={18} />
          <span>
            Expiring soon<strong>{summary.expiring}</strong>
            <small>Requires renewal follow-up</small>
          </span>
        </article>
        <article className={styles.dangerIcon}>
          <Ban size={18} />
          <span>
            Restricted records<strong>{summary.restricted}</strong>
            <small>Suspended or revoked</small>
          </span>
        </article>
        <article className={styles.successIcon}>
          <ShieldCheck size={18} />
          <span>
            QR verification active<strong>{summary.verified}</strong>
            <small>Public-check token enabled</small>
          </span>
        </article>
      </section>

      <section className={styles.registryCard} aria-label="Permit registry records">
        <div className={styles.toolbar}>
          <label className={styles.searchBox}>
            <Search size={15} />
            <input
              aria-label="Search permit registry"
              placeholder="Search document no., business, owner, application, or QR token"
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
              <option value="">All document types</option>
              {documentTypes.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select value={filters.status} onChange={(e) => setFilter("status", e.target.value)}>
              <option value="">All statuses</option>
              {statuses.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Fiscal period
            <select value={filters.fiscalPeriod} onChange={(e) => setFilter("fiscalPeriod", e.target.value)}>
              <option value="">All periods</option>
              {fiscalPeriods.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Barangay
            <select value={filters.barangay} onChange={(e) => setFilter("barangay", e.target.value)}>
              <option value="">All barangays</option>
              {MATNOG_BARANGAYS.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            QR verification
            <select
              value={filters.verificationStatus}
              onChange={(e) => setFilter("verificationStatus", e.target.value)}
            >
              <option value="">All QR states</option>
              {verificationStatuses.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Release channel
            <select value={filters.releaseChannel} onChange={(e) => setFilter("releaseChannel", e.target.value)}>
              <option value="">All release channels</option>
              {releaseChannels.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>

        <div className={styles.resultBar}>
          <div>
            <strong>{filtered.length}</strong> matching records · {records.length} total
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
                      label="Document no."
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
                    <SortHeading
                      label="Document type"
                      column="documentType"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <SortHeading
                      label="Period"
                      column="fiscalPeriod"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <SortHeading label="Status" column="status" current={sortKey} direction={direction} onSort={sort} />
                    <SortHeading
                      label="Barangay"
                      column="barangay"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <SortHeading
                      label="Issued"
                      column="issueDate"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <SortHeading
                      label="Valid until"
                      column="effectiveUntil"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <th>Release</th>
                    <th>Signature</th>
                    <SortHeading
                      label="QR verification"
                      column="verificationStatus"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <th>QR token</th>
                    <th>Officer</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRecords.map((record) => (
                    <tr key={record.documentNumber}>
                      <td className={styles.documentCell}>
                        <Link className={styles.documentLink} href={`/applications/${record.applicationId}`}>
                          {record.documentNumber}
                        </Link>
                        <small>
                          Version {record.version} · {record.applicationId}
                        </small>
                      </td>
                      <td className={styles.businessCell}>
                        <strong>{record.businessName}</strong>
                        <small>
                          {record.businessId} · {record.ownerName}
                        </small>
                      </td>
                      <td>{record.documentType}</td>
                      <td>{record.fiscalPeriod}</td>
                      <td>
                        <span className={`${styles.badge} ${statusClass(record.status)}`}>{record.status}</span>
                      </td>
                      <td>{record.barangay}</td>
                      <td>{formatDate(record.issueDate)}</td>
                      <td>{formatDate(record.effectiveUntil)}</td>
                      <td>
                        <span className={`${styles.badge} ${statusClass(record.releaseStatus)}`}>
                          {record.releaseStatus}
                        </span>
                        <br />
                        {record.releaseDate ? formatDate(record.releaseDate) : "—"}
                      </td>
                      <td>
                        <span className={`${styles.badge} ${statusClass(record.signatureStatus)}`}>
                          {record.signatureStatus}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${statusClass(record.verificationStatus)}`}>
                          <ShieldCheck size={11} />
                          {record.verificationStatus}
                        </span>
                      </td>
                      <td className={styles.qrCell}>
                        {record.qrToken}
                        <small>{record.releaseChannel}</small>
                      </td>
                      <td>{record.releasingOfficer}</td>
                      <td>
                        <RecordActions record={record} />
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
                      <Link className={styles.documentLink} href={`/applications/${record.applicationId}`}>
                        {record.documentNumber}
                      </Link>
                      <h2>{record.businessName}</h2>
                      <p>
                        {record.documentType} · {record.applicationId}
                      </p>
                    </div>
                    <span className={`${styles.badge} ${statusClass(record.status)}`}>{record.status}</span>
                  </div>
                  <div className={styles.mobileFacts}>
                    <div>
                      <span>Owner</span>
                      <strong>{record.ownerName}</strong>
                    </div>
                    <div>
                      <span>Barangay</span>
                      <strong>{record.barangay}</strong>
                    </div>
                    <div>
                      <span>Issued</span>
                      <strong>{formatDate(record.issueDate)}</strong>
                    </div>
                    <div>
                      <span>Valid until</span>
                      <strong>{formatDate(record.effectiveUntil)}</strong>
                    </div>
                    <div>
                      <span>Release</span>
                      <strong>{record.releaseStatus}</strong>
                    </div>
                    <div>
                      <span>QR verification</span>
                      <strong>{record.verificationStatus}</strong>
                    </div>
                  </div>
                  <RecordActions record={record} />
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <FileSearch size={28} />
            <h2>No permit records found</h2>
            <p>Change the search or filters to broaden the registry results.</p>
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
