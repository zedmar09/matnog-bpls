"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import {
  Activity,
  CalendarClock,
  CalendarDays,
  CheckCheck,
  CircleAlert,
  ClipboardList,
  Download,
  FilterX,
  Hourglass,
  Printer,
  RotateCcw,
  Search,
  TimerOff,
} from "lucide-react";

import { MATNOG_APPLICATION_DIRECTORY } from "@/features/business-permits-licensing/data/matnog-application-directory";
import { DataTable, type DataTableColumn } from "@/shared/components/data-table";

import performanceStyles from "../components/processing-performance-report.module.css";
import styles from "../components/revenue-collection-report.module.css";
import type {
  ProcessingPerformanceFilters,
  ProcessingPerformanceGroup,
  ProcessingPerformanceRecord,
} from "../types/processing-performance-report";
import {
  averageTurnaroundByType,
  EMPTY_PROCESSING_FILTERS,
  filterProcessingPerformance,
  groupProcessingPerformance,
  processingPerformanceToCsv,
  projectProcessingPerformance,
  summarizeProcessingPerformance,
} from "../utils/processing-performance-utils";

const PROCESSING_RECORDS = projectProcessingPerformance(MATNOG_APPLICATION_DIRECTORY);
const dateFormatter = new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" });
const monthFormatter = new Intl.DateTimeFormat("en-PH", { month: "short", year: "2-digit" });
const formatDate = (value: string) => dateFormatter.format(new Date(`${value.slice(0, 10)}T00:00:00`));
const formatMonth = (value: string) => monthFormatter.format(new Date(`${value}-01T00:00:00`));

const unique = (read: (row: ProcessingPerformanceRecord) => string) =>
  [...new Set(PROCESSING_RECORDS.map(read))].sort((left, right) => left.localeCompare(right));

function statusClass(value: string) {
  if (["On track", "Completed on time", "Issued", "Closed"].includes(value)) return styles.success;
  if (["Overdue", "Completed late", "Urgent", "High"].includes(value)) return styles.danger;
  if (["Due soon", "For correction", "Medium"].includes(value)) return styles.warning;
  if (value === "Low") return styles.refund;
  return styles.neutral;
}

function PerformanceBreakdown({
  eyebrow,
  title,
  items,
  tone,
  valueLabel,
}: {
  eyebrow: string;
  title: string;
  items: readonly ProcessingPerformanceGroup[];
  tone?: "teal";
  valueLabel: (item: ProcessingPerformanceGroup) => string;
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
            <strong>{valueLabel(item)}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}

export function ProcessingPerformanceReportView() {
  const [filters, setFilters] = useState<ProcessingPerformanceFilters>(EMPTY_PROCESSING_FILTERS);
  const rows = useMemo(() => filterProcessingPerformance(PROCESSING_RECORDS, filters), [filters]);
  const summary = useMemo(() => summarizeProcessingPerformance(rows), [rows]);
  const openRows = useMemo(() => rows.filter((row) => !row.terminal), [rows]);
  const completedRows = useMemo(() => rows.filter((row) => row.terminal), [rows]);
  const byStage = useMemo(
    () =>
      groupProcessingPerformance(
        openRows,
        (row) => row.currentStage,
        (row) => row.slaState === "Overdue",
      ).slice(0, 7),
    [openRows],
  );
  const byOfficer = useMemo(
    () =>
      groupProcessingPerformance(
        openRows,
        (row) => row.assignedOfficer,
        (row) => row.slaState === "Overdue",
      ).slice(0, 7),
    [openRows],
  );
  const byMonth = useMemo(
    () =>
      groupProcessingPerformance(
        completedRows,
        (row) => row.endpointDate.slice(0, 7),
        (row) => row.slaState === "Completed on time",
      )
        .sort((a, b) => a.label.localeCompare(b.label))
        .map((item) => ({ ...item, label: formatMonth(item.label) })),
    [completedRows],
  );
  const byType = useMemo(() => averageTurnaroundByType(completedRows), [completedRows]);
  const activeFilters = Object.entries(filters).filter(
    ([key, value]) => value && !["filedFrom", "filedTo"].includes(key),
  ).length;
  const setFilter = (key: keyof ProcessingPerformanceFilters, value: string) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const downloadCsv = () => {
    const blob = new Blob([processingPerformanceToCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `matnog-processing-performance-${filters.filedFrom || "all"}-${filters.filedTo || "all"}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const columns: DataTableColumn<ProcessingPerformanceRecord>[] = [
    {
      key: "application",
      header: "Application",
      sortValue: (row) => row.id,
      cell: (row) => (
        <div className={styles.primaryCell}>
          <Link href={`/applications/${row.id}`}>{row.id}</Link>
          <small>
            {row.type} · FY {row.fiscalPeriod}
          </small>
        </div>
      ),
    },
    {
      key: "business",
      header: "Business",
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
      key: "filed",
      header: "Filed / target",
      sortValue: (row) => row.filedAt,
      cell: (row) => (
        <div className={styles.primaryCell}>
          <strong>{formatDate(row.filedAt)}</strong>
          <small>Target {formatDate(row.targetRelease)}</small>
        </div>
      ),
    },
    {
      key: "elapsed",
      header: "Elapsed / target",
      sortValue: (row) => row.elapsedDays,
      cell: (row) => (
        <div className={styles.primaryCell}>
          <strong>{row.elapsedDays} calendar days</strong>
          <small>
            {row.targetDays}-day target · through {formatDate(row.endpointDate)}
          </small>
        </div>
      ),
    },
    {
      key: "variance",
      header: "Variance",
      sortValue: (row) => row.varianceDays,
      cell: (row) => (
        <strong
          className={row.varianceDays > 0 ? performanceStyles.positiveVariance : performanceStyles.negativeVariance}
        >
          {row.varianceDays > 0 ? "+" : ""}
          {row.varianceDays} days
        </strong>
      ),
    },
    {
      key: "sla",
      header: "SLA state",
      sortValue: (row) => row.slaState,
      cell: (row) => <span className={`${styles.badge} ${statusClass(row.slaState)}`}>{row.slaState}</span>,
    },
    {
      key: "quality",
      header: "Risk / completeness",
      sortValue: (row) => row.riskLevel,
      cell: (row) => (
        <div className={styles.primaryCell}>
          <span className={`${styles.badge} ${statusClass(row.riskLevel)}`}>{row.riskLevel} risk</span>
          <small>
            {row.requirementsComplete}/{row.requirementsTotal} requirements · {row.priority}
          </small>
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
            <span>Processing performance</span>
          </nav>
          <p className={styles.eyebrow}>Business Permits and Licensing Office</p>
          <h1>Processing Performance Report</h1>
          <p>Application turnaround, SLA exposure, correction workload, and processing-stage capacity.</p>
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
          <strong>Calendar-day SLA basis</strong>
        </span>
        <span>
          Filed: {formatDate(filters.filedFrom)} – {formatDate(filters.filedTo)}
        </span>
        <span>Snapshot date Sep 23, 2026</span>
        <span>Terminal dates use the latest recorded update</span>
      </section>

      <section
        className={`${styles.summaryGrid} ${performanceStyles.summarySeven}`}
        aria-label="Processing performance summary"
      >
        <article>
          <ClipboardList size={20} />
          <div>
            <span>Applications in scope</span>
            <strong>{summary.total}</strong>
            <small>Filtered workflow records</small>
          </div>
        </article>
        <article>
          <CheckCheck size={20} />
          <div>
            <span>Completed</span>
            <strong>{summary.completed}</strong>
            <small>Issued or closed</small>
          </div>
        </article>
        <article>
          <CalendarClock size={20} />
          <div>
            <span>Average turnaround</span>
            <strong>{summary.averageTurnaround.toFixed(1)} days</strong>
            <small>Completed applications</small>
          </div>
        </article>
        <article>
          <Hourglass size={20} />
          <div>
            <span>Median turnaround</span>
            <strong>{summary.medianTurnaround.toFixed(1)} days</strong>
            <small>Completed applications</small>
          </div>
        </article>
        <article>
          <Activity size={20} />
          <div>
            <span>On-time completion</span>
            <strong>{summary.onTimeRate.toFixed(1)}%</strong>
            <small>Completed by target</small>
          </div>
        </article>
        <article className={summary.overdueOpen ? performanceStyles.overdueCard : undefined}>
          <TimerOff size={20} />
          <div>
            <span>Open past target</span>
            <strong>{summary.overdueOpen}</strong>
            <small>Requires SLA action</small>
          </div>
        </article>
        <article>
          <RotateCcw size={20} />
          <div>
            <span>Correction workload</span>
            <strong>{summary.correctionWorkload}</strong>
            <small>Currently for correction</small>
          </div>
        </article>
      </section>

      <section className={styles.analyticsGrid}>
        <PerformanceBreakdown
          eyebrow="Current workload"
          title="Open applications by stage"
          items={byStage}
          valueLabel={(item) => `${item.count} · ${item.secondary} late`}
        />
        <PerformanceBreakdown
          eyebrow="Assignment capacity"
          title="Open workload by officer"
          items={byOfficer}
          tone="teal"
          valueLabel={(item) => `${item.count} · ${item.secondary} late`}
        />
        <PerformanceBreakdown
          eyebrow="Completion trend"
          title="Completed applications by month"
          items={byMonth}
          valueLabel={(item) => `${item.count} · ${item.secondary} on time`}
        />
        <PerformanceBreakdown
          eyebrow="Turnaround profile"
          title="Average turnaround by type"
          items={byType}
          tone="teal"
          valueLabel={(item) => `${item.count} days`}
        />
      </section>

      <section className={styles.reportCard}>
        <div className={styles.toolbar}>
          <label className={styles.searchBox}>
            <Search size={15} />
            <input
              value={filters.query}
              onChange={(event) => setFilter("query", event.target.value)}
              placeholder="Search application, business, owner, permit, or officer"
            />
          </label>
          <button className={styles.clearButton} type="button" onClick={() => setFilters(EMPTY_PROCESSING_FILTERS)}>
            <FilterX size={14} /> Clear filters {activeFilters > 0 ? <b>{activeFilters}</b> : null}
          </button>
        </div>
        <div className={styles.filters}>
          <label>
            Filed from
            <input
              type="date"
              value={filters.filedFrom}
              onChange={(event) => setFilter("filedFrom", event.target.value)}
            />
          </label>
          <label>
            Filed to
            <input type="date" value={filters.filedTo} onChange={(event) => setFilter("filedTo", event.target.value)} />
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
            Application type
            <select value={filters.type} onChange={(event) => setFilter("type", event.target.value)}>
              <option value="">All types</option>
              {unique((row) => row.type).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select value={filters.status} onChange={(event) => setFilter("status", event.target.value)}>
              <option value="">All statuses</option>
              {unique((row) => row.status).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Current stage
            <select value={filters.stage} onChange={(event) => setFilter("stage", event.target.value)}>
              <option value="">All stages</option>
              {unique((row) => row.currentStage).map((value) => (
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
            Barangay
            <select value={filters.barangay} onChange={(event) => setFilter("barangay", event.target.value)}>
              <option value="">All barangays</option>
              {unique((row) => row.barangay).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Risk level
            <select value={filters.riskLevel} onChange={(event) => setFilter("riskLevel", event.target.value)}>
              <option value="">All risk levels</option>
              {unique((row) => row.riskLevel).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Priority
            <select value={filters.priority} onChange={(event) => setFilter("priority", event.target.value)}>
              <option value="">All priorities</option>
              {unique((row) => row.priority).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            SLA state
            <select value={filters.slaState} onChange={(event) => setFilter("slaState", event.target.value)}>
              <option value="">All SLA states</option>
              {unique((row) => row.slaState).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>
        <div className={styles.resultBar}>
          <div>
            <strong>Application SLA register</strong>
            <span>
              {rows.length} of {PROCESSING_RECORDS.length} applications
            </span>
          </div>
          <p>Current stages are snapshot metrics · Completed durations use recorded update dates</p>
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          getRowKey={(row) => row.id}
          initialSort={{ key: "elapsed", direction: "desc" }}
          pageSize={10}
          summary={`${summary.overdueOpen} open applications past target`}
        />
      </section>
      <p className={styles.disclaimer}>
        <CircleAlert size={13} /> Demo performance report. SLA figures are derived from generated workflow records and
        are not official service statistics.
      </p>
    </main>
  );
}
