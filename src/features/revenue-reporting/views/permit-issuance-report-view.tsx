"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import {
  BadgeCheck,
  CalendarDays,
  CircleAlert,
  Download,
  FileBadge2,
  FileCheck2,
  FilterX,
  Hourglass,
  Printer,
  QrCode,
  Search,
  ShieldAlert,
} from "lucide-react";

import { DataTable, type DataTableColumn } from "@/shared/components/data-table";

import styles from "../components/revenue-collection-report.module.css";
import { MATNOG_PERMIT_ISSUANCE_RECORDS } from "../data/matnog-permit-issuance";
import type { PermitIssuanceFilters, PermitIssuanceRecord } from "../types/permit-issuance-report";
import {
  EMPTY_PERMIT_ISSUANCE_FILTERS,
  filterPermitIssuance,
  groupPermitIssuance,
  permitIssuanceToCsv,
  summarizePermitIssuance,
} from "../utils/permit-issuance-report-utils";

const dateFormatter = new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" });
const monthFormatter = new Intl.DateTimeFormat("en-PH", { month: "short", year: "2-digit" });
const formatDate = (value: string) => (value ? dateFormatter.format(new Date(`${value}T00:00:00`)) : "No expiry");
const formatMonth = (value: string) => monthFormatter.format(new Date(`${value}-01T00:00:00`));

const unique = (read: (row: PermitIssuanceRecord) => string) =>
  [...new Set(MATNOG_PERMIT_ISSUANCE_RECORDS.map(read))].sort((left, right) => left.localeCompare(right));

function statusClass(value: string) {
  if (["Active", "Signed", "Released"].includes(value)) return styles.success;
  if (["Suspended", "Revoked", "Inactive", "Failed", "Declined"].includes(value)) return styles.danger;
  if (["Expiring soon", "Pending", "Ready for release"].includes(value)) return styles.warning;
  if (value === "Closed") return styles.refund;
  return styles.neutral;
}

function Breakdown({
  eyebrow,
  title,
  items,
  tone,
}: {
  eyebrow: string;
  title: string;
  items: readonly { label: string; count: number }[];
  tone?: "teal";
}) {
  const maximum = Math.max(1, ...items.map((item) => item.count));
  return (
    <article className={styles.breakdownCard}>
      <div className={styles.cardHeading}>
        <div>
          <span>{eyebrow}</span>
          <h2>{title}</h2>
        </div>
        <small>{items.reduce((total, item) => total + item.count, 0)} records</small>
      </div>
      <div className={styles.bars}>
        {items.map((item) => (
          <div className={styles.barRow} key={item.label}>
            <span>{item.label}</span>
            <i>
              <b
                className={tone === "teal" ? styles.tealBar : undefined}
                style={{ width: `${Math.max(2, (item.count / maximum) * 100)}%` }}
              />
            </i>
            <strong>{item.count}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}

export function PermitIssuanceReportView() {
  const [filters, setFilters] = useState<PermitIssuanceFilters>(EMPTY_PERMIT_ISSUANCE_FILTERS);
  const rows = useMemo(() => filterPermitIssuance(MATNOG_PERMIT_ISSUANCE_RECORDS, filters), [filters]);
  const summary = useMemo(() => summarizePermitIssuance(rows), [rows]);
  const byMonth = useMemo(
    () =>
      groupPermitIssuance(rows, (row) => row.issueDate.slice(0, 7))
        .sort((a, b) => a.label.localeCompare(b.label))
        .slice(-8)
        .map((item) => ({ ...item, label: formatMonth(item.label) })),
    [rows],
  );
  const byBarangay = useMemo(() => groupPermitIssuance(rows, (row) => row.barangay).slice(0, 6), [rows]);
  const byApplication = useMemo(() => groupPermitIssuance(rows, (row) => row.applicationType), [rows]);
  const byRelease = useMemo(() => groupPermitIssuance(rows, (row) => row.releaseChannel), [rows]);
  const activeFilters = Object.entries(filters).filter(
    ([key, value]) => value && !["dateFrom", "dateTo"].includes(key),
  ).length;
  const setFilter = (key: keyof PermitIssuanceFilters, value: string) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const downloadCsv = () => {
    const blob = new Blob([permitIssuanceToCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `matnog-permit-issuance-${filters.dateFrom || "all"}-${filters.dateTo || "all"}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const columns: DataTableColumn<PermitIssuanceRecord>[] = [
    {
      key: "document",
      header: "Permit / certificate",
      sortValue: (row) => row.documentNumber,
      cell: (row) => (
        <div className={styles.primaryCell}>
          <Link href={`/permits/${encodeURIComponent(row.documentNumber)}`}>{row.documentNumber}</Link>
          <small>
            {row.documentType} · v{row.version}
          </small>
        </div>
      ),
    },
    {
      key: "business",
      header: "Business and owner",
      className: styles.businessColumn,
      sortValue: (row) => row.businessName,
      cell: (row) => (
        <div className={styles.primaryCell}>
          <strong>{row.businessName}</strong>
          <small>
            {row.ownerName} · {row.barangay}
          </small>
        </div>
      ),
    },
    {
      key: "application",
      header: "Application",
      sortValue: (row) => row.applicationId,
      cell: (row) => (
        <div className={styles.primaryCell}>
          <Link href={`/applications/${row.applicationId}`}>{row.applicationId}</Link>
          <small>
            {row.applicationType} · FY {row.fiscalPeriod}
          </small>
        </div>
      ),
    },
    {
      key: "issueDate",
      header: "Issue / validity",
      sortValue: (row) => row.issueDate,
      cell: (row) => (
        <div className={styles.primaryCell}>
          <strong>{formatDate(row.issueDate)}</strong>
          <small>
            {formatDate(row.effectiveFrom)} – {formatDate(row.effectiveUntil)}
          </small>
        </div>
      ),
    },
    {
      key: "status",
      header: "Permit status",
      sortValue: (row) => row.status,
      cell: (row) => <span className={`${styles.badge} ${statusClass(row.status)}`}>{row.status}</span>,
    },
    {
      key: "release",
      header: "Release",
      sortValue: (row) => row.releaseDate,
      cell: (row) => (
        <div className={styles.primaryCell}>
          <strong>{row.releaseChannel}</strong>
          <small>
            {formatDate(row.releaseDate)} · {row.releasingOfficer}
          </small>
        </div>
      ),
    },
    {
      key: "controls",
      header: "Signature / QR",
      sortValue: (row) => row.verificationStatus,
      cell: (row) => (
        <div className={styles.primaryCell}>
          <span className={`${styles.badge} ${statusClass(row.signatureStatus)}`}>{row.signatureStatus}</span>
          <small>QR verification: {row.verificationStatus}</small>
        </div>
      ),
    },
  ];

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/reports">Reports</Link>
            <span>/</span>
            <span>Permit issuance</span>
          </nav>
          <p className={styles.eyebrow}>Business Permits and Licensing Office</p>
          <h1>Permit Issuance Report</h1>
          <p>Statutory register of issued business permits and closure certificates.</p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.secondaryAction} onClick={() => window.print()}>
            <Printer size={15} /> Print register
          </button>
          <button type="button" className={styles.primaryAction} onClick={downloadCsv}>
            <Download size={15} /> Export CSV
          </button>
        </div>
      </header>

      <section className={styles.contextBar} aria-label="Report context">
        <span>
          <CalendarDays size={14} />
          <strong>Issue date basis</strong>
        </span>
        <span>
          Coverage: {formatDate(filters.dateFrom)} – {formatDate(filters.dateTo)}
        </span>
        <span>Fiscal periods 2024–2026</span>
        <span>Issued and released documents only</span>
      </section>

      <section className={styles.summaryGrid} aria-label="Permit issuance summary">
        <article>
          <FileBadge2 size={20} />
          <div>
            <span>Total issued documents</span>
            <strong>{summary.total}</strong>
            <small>Permits and certificates</small>
          </div>
        </article>
        <article>
          <BadgeCheck size={20} />
          <div>
            <span>Active permits</span>
            <strong>{summary.active}</strong>
            <small>Currently effective</small>
          </div>
        </article>
        <article>
          <FileCheck2 size={20} />
          <div>
            <span>Closure certificates</span>
            <strong>{summary.closureCertificates}</strong>
            <small>Formal closure records</small>
          </div>
        </article>
        <article>
          <Hourglass size={20} />
          <div>
            <span>Expiring soon</span>
            <strong>{summary.expiring}</strong>
            <small>Renewal attention</small>
          </div>
        </article>
        <article className={summary.restricted ? styles.alertCard : undefined}>
          <ShieldAlert size={20} />
          <div>
            <span>Restricted permits</span>
            <strong>{summary.restricted}</strong>
            <small>Suspended or revoked</small>
          </div>
        </article>
        <article>
          <QrCode size={20} />
          <div>
            <span>QR-verifiable records</span>
            <strong>{summary.qrVerifiable}</strong>
            <small>Public verification active</small>
          </div>
        </article>
      </section>

      <section className={styles.analyticsGrid}>
        <Breakdown eyebrow="Issuance trend" title="Documents issued by month" items={byMonth} />
        <Breakdown eyebrow="Geographic distribution" title="Top barangays by issuance" items={byBarangay} tone="teal" />
        <Breakdown eyebrow="Transaction profile" title="Issuance by application type" items={byApplication} />
        <Breakdown eyebrow="Release operations" title="Documents by release channel" items={byRelease} tone="teal" />
      </section>

      <section className={styles.reportCard}>
        <div className={styles.toolbar}>
          <label className={styles.searchBox}>
            <Search size={15} />
            <input
              value={filters.query}
              onChange={(event) => setFilter("query", event.target.value)}
              placeholder="Search permit, application, business, owner, or QR token"
            />
          </label>
          <button
            className={styles.clearButton}
            type="button"
            onClick={() => setFilters(EMPTY_PERMIT_ISSUANCE_FILTERS)}
          >
            <FilterX size={14} /> Clear filters {activeFilters > 0 ? <b>{activeFilters}</b> : null}
          </button>
        </div>
        <div className={styles.filters}>
          <label>
            Issued from
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(event) => setFilter("dateFrom", event.target.value)}
            />
          </label>
          <label>
            Issued to
            <input type="date" value={filters.dateTo} onChange={(event) => setFilter("dateTo", event.target.value)} />
          </label>
          <label>
            Fiscal period
            <select value={filters.fiscalPeriod} onChange={(event) => setFilter("fiscalPeriod", event.target.value)}>
              <option value="">All periods</option>
              {unique((row) => row.fiscalPeriod).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Document type
            <select value={filters.documentType} onChange={(event) => setFilter("documentType", event.target.value)}>
              <option value="">All documents</option>
              {unique((row) => row.documentType).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Application type
            <select
              value={filters.applicationType}
              onChange={(event) => setFilter("applicationType", event.target.value)}
            >
              <option value="">All applications</option>
              {unique((row) => row.applicationType).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Barangay
            <select value={filters.barangay} onChange={(event) => setFilter("barangay", event.target.value)}>
              <option value="">All barangays</option>
              {unique((row) => row.barangay).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Permit status
            <select value={filters.status} onChange={(event) => setFilter("status", event.target.value)}>
              <option value="">All statuses</option>
              {unique((row) => row.status).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Release channel
            <select
              value={filters.releaseChannel}
              onChange={(event) => setFilter("releaseChannel", event.target.value)}
            >
              <option value="">All channels</option>
              {unique((row) => row.releaseChannel).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            QR verification
            <select
              value={filters.verificationStatus}
              onChange={(event) => setFilter("verificationStatus", event.target.value)}
            >
              <option value="">All verification</option>
              {unique((row) => row.verificationStatus).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Releasing officer
            <select
              value={filters.releasingOfficer}
              onChange={(event) => setFilter("releasingOfficer", event.target.value)}
            >
              <option value="">All officers</option>
              {unique((row) => row.releasingOfficer).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>
        <div className={styles.resultBar}>
          <div>
            <strong>Statutory issuance register</strong>
            <span>
              {rows.length} of {MATNOG_PERMIT_ISSUANCE_RECORDS.length} documents
            </span>
          </div>
          <p>Historical rows are deterministic demo projections · Operational lifecycle remains read-only</p>
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          getRowKey={(row) => row.documentNumber}
          initialSort={{ key: "issueDate", direction: "desc" }}
          pageSize={10}
          summary={`${summary.qrVerifiable} QR-verifiable records`}
        />
      </section>
      <p className={styles.disclaimer}>
        <CircleAlert size={13} /> Demo statutory register. Figures are generated sample data and are not official permit
        records.
      </p>
    </main>
  );
}
