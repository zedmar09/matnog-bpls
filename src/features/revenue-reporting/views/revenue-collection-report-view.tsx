"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import {
  Banknote,
  CalendarDays,
  CircleAlert,
  Download,
  FileText,
  FilterX,
  Landmark,
  Printer,
  ReceiptText,
  Search,
  WalletCards,
} from "lucide-react";

import { DataTable, type DataTableColumn } from "@/shared/components/data-table";

import styles from "../components/revenue-collection-report.module.css";
import { MATNOG_REVENUE_TRANSACTIONS } from "../data/matnog-revenue-transactions";
import type { RevenueReportFilters, RevenueTransaction } from "../types/revenue-report";
import {
  EMPTY_REVENUE_FILTERS,
  filterRevenueTransactions,
  groupRevenue,
  revenueTransactionsToCsv,
  summarizeRevenue,
} from "../utils/revenue-report-utils";

const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 });
const date = new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" });
const formatMoney = (minorUnits: number) => peso.format(minorUnits / 100);
const formatDate = (value: string) => date.format(new Date(`${value}T00:00:00`));

const unique = (read: (row: RevenueTransaction) => string) =>
  [...new Set(MATNOG_REVENUE_TRANSACTIONS.map(read))].sort((left, right) => left.localeCompare(right));

function statusClass(value: string) {
  if (value === "Confirmed" || value === "Matched") return styles.success;
  if (value === "Rejected" || value === "Reversed" || value === "Exception") return styles.danger;
  if (value === "Refunded") return styles.refund;
  if (value === "Not applicable") return styles.neutral;
  return styles.warning;
}

export function RevenueCollectionReportView() {
  const [filters, setFilters] = useState<RevenueReportFilters>(EMPTY_REVENUE_FILTERS);
  const rows = useMemo(() => filterRevenueTransactions(MATNOG_REVENUE_TRANSACTIONS, filters), [filters]);
  const summary = useMemo(() => summarizeRevenue(rows), [rows]);
  const byChannel = useMemo(() => groupRevenue(rows, (row) => row.channel), [rows]);
  const byBarangay = useMemo(() => groupRevenue(rows, (row) => row.barangay).slice(0, 5), [rows]);
  const maxChannel = Math.max(1, ...byChannel.map((item) => item.amount));
  const maxBarangay = Math.max(1, ...byBarangay.map((item) => item.amount));
  const activeFilters = Object.entries(filters).filter(
    ([key, value]) => value && key !== "dateFrom" && key !== "dateTo",
  ).length;

  const setFilter = (key: keyof RevenueReportFilters, value: string) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const downloadCsv = () => {
    const blob = new Blob([revenueTransactionsToCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `matnog-revenue-collection-${filters.dateFrom || "all"}-${filters.dateTo || "all"}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const columns: DataTableColumn<RevenueTransaction>[] = [
    {
      key: "date",
      header: "Payment date",
      sortValue: (row) => row.paymentDate,
      cell: (row) => <strong>{formatDate(row.paymentDate)}</strong>,
    },
    {
      key: "reference",
      header: "Receipt / reference",
      sortValue: (row) => row.officialReceiptNumber ?? row.paymentReference,
      cell: (row) => (
        <div className={styles.primaryCell}>
          <strong>{row.officialReceiptNumber ?? "No OR issued"}</strong>
          <small>{row.paymentReference}</small>
        </div>
      ),
    },
    {
      key: "business",
      header: "Business and application",
      className: styles.businessColumn,
      sortValue: (row) => row.businessName,
      cell: (row) => (
        <div className={styles.primaryCell}>
          <Link href={`/applications/${row.applicationId}`}>{row.businessName}</Link>
          <small>
            {row.applicationId} · {row.barangay}
          </small>
        </div>
      ),
    },
    {
      key: "assessment",
      header: "Assessed",
      sortValue: (row) => row.assessmentAmount,
      cell: (row) => <span className={styles.money}>{formatMoney(row.assessmentAmount)}</span>,
    },
    {
      key: "net",
      header: "Net collection",
      sortValue: (row) => row.netAmount,
      cell: (row) => (
        <div className={styles.primaryCell}>
          <strong className={row.netAmount < row.collectedAmount ? styles.negative : undefined}>
            {formatMoney(row.netAmount)}
          </strong>
          {row.adjustmentAmount !== 0 && <small>{formatMoney(row.adjustmentAmount)} adjustment</small>}
        </div>
      ),
    },
    {
      key: "channel",
      header: "Channel",
      sortValue: (row) => row.channel,
      cell: (row) => <span>{row.channel}</span>,
    },
    {
      key: "status",
      header: "Collection status",
      sortValue: (row) => row.status,
      cell: (row) => <span className={`${styles.badge} ${statusClass(row.status)}`}>{row.status}</span>,
    },
    {
      key: "reconciliation",
      header: "Reconciliation",
      sortValue: (row) => row.reconciliationStatus,
      cell: (row) => (
        <span className={`${styles.badge} ${statusClass(row.reconciliationStatus)}`}>{row.reconciliationStatus}</span>
      ),
    },
    {
      key: "officer",
      header: "Receiving officer",
      sortValue: (row) => row.receivingOfficer,
      cell: (row) => <span>{row.receivingOfficer}</span>,
    },
  ];

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/reports">Reports</Link>
            <span>/</span>
            <span>Revenue collection</span>
          </nav>
          <p className={styles.eyebrow}>Municipal Treasurer&apos;s Office</p>
          <h1>Revenue Collection Report</h1>
          <p>Confirmed collections, adjustments, outstanding balances, and settlement exceptions.</p>
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
          <strong>Payment date basis</strong>
        </span>
        <span>
          Coverage: {formatDate(filters.dateFrom)} – {formatDate(filters.dateTo)}
        </span>
        <span>Fiscal year 2026</span>
        <span>Generated from demo ledger</span>
      </section>

      <section className={styles.summaryGrid} aria-label="Collection summary">
        <article>
          <Banknote size={20} />
          <div>
            <span>Gross collections</span>
            <strong>{formatMoney(summary.grossCollections)}</strong>
            <small>Before refunds and reversals</small>
          </div>
        </article>
        <article>
          <Landmark size={20} />
          <div>
            <span>Net collections</span>
            <strong>{formatMoney(summary.netCollections)}</strong>
            <small>{formatMoney(summary.adjustments)} adjustments</small>
          </div>
        </article>
        <article>
          <ReceiptText size={20} />
          <div>
            <span>Official receipts</span>
            <strong>{summary.officialReceipts}</strong>
            <small>Issued within result set</small>
          </div>
        </article>
        <article>
          <WalletCards size={20} />
          <div>
            <span>Online payment share</span>
            <strong>{summary.onlineShare.toFixed(1)}%</strong>
            <small>GCash, Maya, and bank</small>
          </div>
        </article>
        <article>
          <FileText size={20} />
          <div>
            <span>Outstanding assessed</span>
            <strong>{formatMoney(summary.outstandingBalance)}</strong>
            <small>Unpaid assessed balance</small>
          </div>
        </article>
        <article className={summary.reconciliationExceptions ? styles.alertCard : undefined}>
          <CircleAlert size={20} />
          <div>
            <span>Reconciliation exceptions</span>
            <strong>{summary.reconciliationExceptions}</strong>
            <small>Requires treasury review</small>
          </div>
        </article>
      </section>

      <section className={styles.analyticsGrid}>
        <article className={styles.breakdownCard}>
          <div className={styles.cardHeading}>
            <div>
              <span>Collection mix</span>
              <h2>Net collections by channel</h2>
            </div>
            <small>{formatMoney(summary.netCollections)} total</small>
          </div>
          <div className={styles.bars}>
            {byChannel.map((item) => (
              <div className={styles.barRow} key={item.label}>
                <span>{item.label}</span>
                <i>
                  <b style={{ width: `${Math.max(2, (item.amount / maxChannel) * 100)}%` }} />
                </i>
                <strong>{formatMoney(item.amount)}</strong>
              </div>
            ))}
          </div>
        </article>
        <article className={styles.breakdownCard}>
          <div className={styles.cardHeading}>
            <div>
              <span>Geographic view</span>
              <h2>Top barangays by net collection</h2>
            </div>
            <small>Top five</small>
          </div>
          <div className={styles.bars}>
            {byBarangay.map((item) => (
              <div className={styles.barRow} key={item.label}>
                <span>{item.label}</span>
                <i>
                  <b
                    className={styles.tealBar}
                    style={{ width: `${Math.max(2, (item.amount / maxBarangay) * 100)}%` }}
                  />
                </i>
                <strong>{formatMoney(item.amount)}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className={styles.reportCard}>
        <div className={styles.toolbar}>
          <label className={styles.searchBox}>
            <Search size={15} />
            <input
              value={filters.query}
              onChange={(event) => setFilter("query", event.target.value)}
              placeholder="Search OR, reference, application, business, or owner"
            />
          </label>
          <button className={styles.clearButton} type="button" onClick={() => setFilters(EMPTY_REVENUE_FILTERS)}>
            <FilterX size={14} /> Clear filters {activeFilters > 0 && <b>{activeFilters}</b>}
          </button>
        </div>
        <div className={styles.filters}>
          <label>
            From
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(event) => setFilter("dateFrom", event.target.value)}
            />
          </label>
          <label>
            To
            <input type="date" value={filters.dateTo} onChange={(event) => setFilter("dateTo", event.target.value)} />
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
            Application
            <select
              value={filters.applicationType}
              onChange={(event) => setFilter("applicationType", event.target.value)}
            >
              <option value="">All application types</option>
              {unique((row) => row.applicationType).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Channel
            <select value={filters.channel} onChange={(event) => setFilter("channel", event.target.value)}>
              <option value="">All channels</option>
              {unique((row) => row.channel).map((value) => (
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
            Reconciliation
            <select
              value={filters.reconciliationStatus}
              onChange={(event) => setFilter("reconciliationStatus", event.target.value)}
            >
              <option value="">All reconciliation</option>
              {unique((row) => row.reconciliationStatus).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Receiving officer
            <select
              value={filters.receivingOfficer}
              onChange={(event) => setFilter("receivingOfficer", event.target.value)}
            >
              <option value="">All officers</option>
              {unique((row) => row.receivingOfficer).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>
        <div className={styles.resultBar}>
          <div>
            <strong>Collection ledger</strong>
            <span>
              {rows.length} of {MATNOG_REVENUE_TRANSACTIONS.length} transactions
            </span>
          </div>
          <p>Amounts are reported in Philippine pesos · Adjustments are shown separately</p>
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          getRowKey={(row) => row.id}
          initialSort={{ key: "date", direction: "desc" }}
          pageSize={10}
          summary={`${formatMoney(summary.netCollections)} net collections`}
        />
      </section>
      <p className={styles.disclaimer}>
        <CircleAlert size={13} /> Demo reporting workspace. Figures are generated sample data and are not official
        accounting records.
      </p>
    </main>
  );
}
