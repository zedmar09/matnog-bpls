"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import {
  BadgeCheck,
  Building2,
  CalendarDays,
  CircleAlert,
  CreditCard,
  Download,
  FileWarning,
  FilterX,
  Printer,
  Search,
  ShieldAlert,
  ShieldX,
  TimerOff,
} from "lucide-react";

import { MATNOG_APPLICATION_DIRECTORY } from "@/features/business-permits-licensing/data/matnog-application-directory";
import { MATNOG_PERMIT_REGISTRY } from "@/features/business-permits-licensing/data/matnog-permit-registry";
import { DataTable, type DataTableColumn } from "@/shared/components/data-table";

import complianceStyles from "../components/compliance-report.module.css";
import performanceStyles from "../components/processing-performance-report.module.css";
import styles from "../components/revenue-collection-report.module.css";
import type { ComplianceFilters, ComplianceGroup, ComplianceRecord } from "../types/compliance-report";
import {
  complianceRecordsToCsv,
  EMPTY_COMPLIANCE_FILTERS,
  filterComplianceRecords,
  groupCompliance,
  projectComplianceRegister,
  summarizeCompliance,
} from "../utils/compliance-report-utils";

const COMPLIANCE_RECORDS = projectComplianceRegister(MATNOG_APPLICATION_DIRECTORY, MATNOG_PERMIT_REGISTRY);
const dateFormatter = new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" });
const formatDate = (value: string) => (value ? dateFormatter.format(new Date(`${value}T00:00:00`)) : "Not applicable");
const unique = (read: (row: ComplianceRecord) => string) =>
  [...new Set(COMPLIANCE_RECORDS.map(read))].sort((left, right) => left.localeCompare(right));
const needsComplianceAction = (row: ComplianceRecord) =>
  row.complianceState === "Critical" || row.complianceState === "Action required";

function statusClass(value: string) {
  if (["Compliant", "Active", "Complete", "Informational"].includes(value)) return styles.success;
  if (["Critical", "Revoked", "Suspended", "Inactive", "Overdue"].includes(value)) return styles.danger;
  if (["Action required", "High", "Expired", "Issue", "Due now"].includes(value)) return styles.warning;
  if (["Monitoring required", "Medium", "Expiring soon", "Due within 30 days"].includes(value)) return styles.refund;
  return styles.neutral;
}

function ComplianceBreakdown({
  eyebrow,
  title,
  items,
  tone,
}: {
  eyebrow: string;
  title: string;
  items: readonly ComplianceGroup[];
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
        <small>Current filtered scope</small>
      </div>
      <div className={styles.bars}>
        {items.map((item) => (
          <div className={`${styles.barRow} ${performanceStyles.performanceBar}`} key={item.label}>
            <span>{item.label}</span>
            <i>
              <b
                className={tone === "teal" ? styles.tealBar : undefined}
                style={{ width: `${Math.max(2, (item.count / maximum) * 100)}%` }}
              />
            </i>
            <strong>
              {item.count}
              {item.secondary ? ` · ${item.secondary} action` : ""}
            </strong>
          </div>
        ))}
      </div>
    </article>
  );
}

export function ComplianceMonitoringReportView() {
  const [filters, setFilters] = useState<ComplianceFilters>(EMPTY_COMPLIANCE_FILTERS);
  const rows = useMemo(() => filterComplianceRecords(COMPLIANCE_RECORDS, filters), [filters]);
  const summary = useMemo(() => summarizeCompliance(rows), [rows]);
  const byIssue = useMemo(
    () =>
      groupCompliance(
        rows,
        (row) => row.issueCategory,
        (row) => row.complianceState === "Critical",
      ),
    [rows],
  );
  const byBarangay = useMemo(
    () => groupCompliance(rows, (row) => row.barangay, needsComplianceAction).slice(0, 7),
    [rows],
  );
  const byRisk = useMemo(() => groupCompliance(rows, (row) => row.riskLevel, needsComplianceAction), [rows]);
  const byOfficer = useMemo(
    () => groupCompliance(rows, (row) => row.assignedOfficer, needsComplianceAction).slice(0, 7),
    [rows],
  );
  const activeFilters = Object.values(filters).filter(Boolean).length;
  const setFilter = (key: keyof ComplianceFilters, value: string) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const downloadCsv = () => {
    const blob = new Blob([complianceRecordsToCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "matnog-compliance-monitoring-2026-09-23.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const columns: DataTableColumn<ComplianceRecord>[] = [
    {
      key: "business",
      header: "Business and application",
      className: styles.businessColumn,
      sortValue: (row) => row.businessName,
      cell: (row) => (
        <div className={styles.primaryCell}>
          <strong>{row.businessName}</strong>
          <Link href={`/applications/${row.id}`}>
            {row.id} · {row.barangay}
          </Link>
          <small>{row.ownerName}</small>
        </div>
      ),
    },
    {
      key: "permit",
      header: "Permit",
      sortValue: (row) => row.permitStatus,
      cell: (row) => (
        <div className={styles.primaryCell}>
          {row.permitNumber !== "Pending" ? <strong>{row.permitNumber}</strong> : <strong>Not issued</strong>}
          <span className={`${styles.badge} ${statusClass(row.permitStatus)}`}>{row.permitStatus}</span>
          <small>QR: {row.verificationStatus}</small>
        </div>
      ),
    },
    {
      key: "requirements",
      header: "Requirements / payment",
      sortValue: (row) => row.missingRequirements,
      cell: (row) => (
        <div className={styles.primaryCell}>
          <strong>
            {row.requirementsComplete}/{row.requirementsTotal} complete
          </strong>
          <small>{row.paymentStatus}</small>
        </div>
      ),
    },
    {
      key: "workflow",
      header: "Stage / officer",
      sortValue: (row) => row.currentStage,
      cell: (row) => (
        <div className={styles.primaryCell}>
          <strong>{row.currentStage}</strong>
          <small>{row.assignedOfficer}</small>
        </div>
      ),
    },
    {
      key: "finding",
      header: "Primary compliance finding",
      className: complianceStyles.findingColumn,
      sortValue: (row) => row.issueCategory,
      cell: (row) => (
        <div className={complianceStyles.findingCell}>
          <strong>{row.finding}</strong>
          <small>{row.recommendedAction}</small>
        </div>
      ),
    },
    {
      key: "state",
      header: "Compliance state",
      sortValue: (row) => row.complianceState,
      cell: (row) => (
        <div className={styles.primaryCell}>
          <span className={`${styles.badge} ${statusClass(row.complianceState)}`}>{row.complianceState}</span>
          <small>
            {row.issueCategory} · {row.severity}
          </small>
        </div>
      ),
    },
    {
      key: "review",
      header: "Review due",
      className: complianceStyles.reviewCell,
      sortValue: (row) => row.reviewDueDate || "9999-12-31",
      cell: (row) => (
        <div className={styles.primaryCell}>
          <strong>{formatDate(row.reviewDueDate)}</strong>
          <span className={`${styles.badge} ${statusClass(row.reviewUrgency)}`}>{row.reviewUrgency}</span>
        </div>
      ),
    },
    {
      key: "risk",
      header: "Business risk",
      sortValue: (row) => row.riskLevel,
      cell: (row) => <span className={`${styles.badge} ${statusClass(row.riskLevel)}`}>{row.riskLevel}</span>,
    },
  ];

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/reports">Reports</Link>
            <span>/</span>
            <span>Compliance monitoring</span>
          </nav>
          <p className={styles.eyebrow}>Business Permits and Licensing Office</p>
          <h1>Compliance Monitoring Report</h1>
          <p>Requirements, payment exceptions, permit validity, restrictions, and follow-up accountability.</p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.secondaryAction} onClick={() => window.print()}>
            <Printer size={15} /> Print report
          </button>
          <button type="button" className={styles.primaryAction} onClick={downloadCsv}>
            <Download size={15} /> Export CSV
          </button>
        </div>
      </header>

      <section className={styles.contextBar} aria-label="Report context">
        <span>
          <CalendarDays size={14} />
          <strong>Compliance snapshot</strong>
        </span>
        <span>As of Sep 23, 2026</span>
        <span>Applications, permits, payments, requirements, and verification</span>
        <span>Primary finding uses severity precedence</span>
      </section>

      <section className={`${styles.summaryGrid} ${performanceStyles.summarySeven}`} aria-label="Compliance summary">
        <article>
          <Building2 size={20} />
          <div>
            <span>Businesses monitored</span>
            <strong>{summary.businessesMonitored}</strong>
            <small>{rows.length} application records</small>
          </div>
        </article>
        <article>
          <BadgeCheck size={20} />
          <div>
            <span>Fully compliant</span>
            <strong>{summary.compliant}</strong>
            <small>No open system finding</small>
          </div>
        </article>
        <article>
          <FileWarning size={20} />
          <div>
            <span>Requirement issues</span>
            <strong>{summary.requirementIssues}</strong>
            <small>Incomplete or returned</small>
          </div>
        </article>
        <article>
          <CreditCard size={20} />
          <div>
            <span>Payment exceptions</span>
            <strong>{summary.paymentExceptions}</strong>
            <small>Pending or reversed</small>
          </div>
        </article>
        <article>
          <TimerOff size={20} />
          <div>
            <span>Permit validity</span>
            <strong>{summary.permitExpiry}</strong>
            <small>Expired or expiring</small>
          </div>
        </article>
        <article>
          <ShieldX size={20} />
          <div>
            <span>Permit restrictions</span>
            <strong>{summary.restrictions}</strong>
            <small>Suspended or revoked</small>
          </div>
        </article>
        <article className={summary.critical ? performanceStyles.overdueCard : undefined}>
          <ShieldAlert size={20} />
          <div>
            <span>Critical cases</span>
            <strong>{summary.critical}</strong>
            <small>Immediate review</small>
          </div>
        </article>
      </section>

      <section className={styles.analyticsGrid}>
        <ComplianceBreakdown eyebrow="Finding profile" title="Records by issue category" items={byIssue} />
        <ComplianceBreakdown
          eyebrow="Geographic monitoring"
          title="Top barangays by monitored records"
          items={byBarangay}
          tone="teal"
        />
        <ComplianceBreakdown eyebrow="Risk exposure" title="Compliance findings by business risk" items={byRisk} />
        <ComplianceBreakdown
          eyebrow="Action ownership"
          title="Monitoring workload by officer"
          items={byOfficer}
          tone="teal"
        />
      </section>

      <section className={styles.reportCard}>
        <div className={styles.toolbar}>
          <label className={styles.searchBox}>
            <Search size={15} />
            <input
              value={filters.query}
              onChange={(event) => setFilter("query", event.target.value)}
              placeholder="Search business, application, owner, permit, finding, or officer"
            />
          </label>
          <button className={styles.clearButton} type="button" onClick={() => setFilters(EMPTY_COMPLIANCE_FILTERS)}>
            <FilterX size={14} /> Clear filters {activeFilters > 0 ? <b>{activeFilters}</b> : null}
          </button>
        </div>
        <div className={styles.filters}>
          <label>
            Compliance state
            <select
              value={filters.complianceState}
              onChange={(event) => setFilter("complianceState", event.target.value)}
            >
              <option value="">All states</option>
              {unique((row) => row.complianceState).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Issue category
            <select value={filters.issueCategory} onChange={(event) => setFilter("issueCategory", event.target.value)}>
              <option value="">All categories</option>
              {unique((row) => row.issueCategory).map((value) => (
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
            Business risk
            <select value={filters.riskLevel} onChange={(event) => setFilter("riskLevel", event.target.value)}>
              <option value="">All risks</option>
              {unique((row) => row.riskLevel).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Application type
            <select value={filters.type} onChange={(event) => setFilter("type", event.target.value)}>
              <option value="">All types</option>
              {unique((row) => row.type).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Permit status
            <select value={filters.permitStatus} onChange={(event) => setFilter("permitStatus", event.target.value)}>
              <option value="">All permit statuses</option>
              {unique((row) => row.permitStatus).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Requirements
            <select
              value={filters.requirementState}
              onChange={(event) => setFilter("requirementState", event.target.value)}
            >
              <option value="">All requirement states</option>
              <option>Complete</option>
              <option>Issue</option>
            </select>
          </label>
          <label>
            Payment status
            <select value={filters.paymentStatus} onChange={(event) => setFilter("paymentStatus", event.target.value)}>
              <option value="">All payments</option>
              {unique((row) => row.paymentStatus).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Assigned officer
            <select
              value={filters.assignedOfficer}
              onChange={(event) => setFilter("assignedOfficer", event.target.value)}
            >
              <option value="">All officers</option>
              {unique((row) => row.assignedOfficer).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Review urgency
            <select value={filters.reviewUrgency} onChange={(event) => setFilter("reviewUrgency", event.target.value)}>
              <option value="">All review urgency</option>
              {unique((row) => row.reviewUrgency).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>
        <div className={styles.resultBar}>
          <div>
            <strong>Compliance action register</strong>
            <span>
              {rows.length} of {COMPLIANCE_RECORDS.length} records
            </span>
          </div>
          <p>Primary findings are derived from current system states · Detailed inspections remain separate</p>
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          getRowKey={(row) => row.id}
          initialSort={{ key: "review", direction: "asc" }}
          pageSize={10}
          summary={`${summary.critical} critical cases`}
        />
      </section>
      <p className={styles.disclaimer}>
        <CircleAlert size={13} /> Demo compliance report. Findings are deterministic projections and are not official
        enforcement determinations.
      </p>
    </main>
  );
}
