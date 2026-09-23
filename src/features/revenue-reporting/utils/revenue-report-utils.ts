import type { RevenueReportFilters, RevenueReportSummary, RevenueTransaction } from "../types/revenue-report";

export const EMPTY_REVENUE_FILTERS: RevenueReportFilters = {
  query: "",
  dateFrom: "2026-07-01",
  dateTo: "2026-09-30",
  barangay: "",
  applicationType: "",
  channel: "",
  status: "",
  reconciliationStatus: "",
  receivingOfficer: "",
};

export function filterRevenueTransactions(rows: readonly RevenueTransaction[], filters: RevenueReportFilters) {
  const query = filters.query.trim().toLocaleLowerCase();
  return rows.filter((row) => {
    const haystack =
      `${row.id} ${row.officialReceiptNumber ?? ""} ${row.applicationId} ${row.businessName} ${row.ownerName} ${row.paymentReference}`.toLocaleLowerCase();
    return (
      (!query || haystack.includes(query)) &&
      (!filters.dateFrom || row.paymentDate >= filters.dateFrom) &&
      (!filters.dateTo || row.paymentDate <= filters.dateTo) &&
      (!filters.barangay || row.barangay === filters.barangay) &&
      (!filters.applicationType || row.applicationType === filters.applicationType) &&
      (!filters.channel || row.channel === filters.channel) &&
      (!filters.status || row.status === filters.status) &&
      (!filters.reconciliationStatus || row.reconciliationStatus === filters.reconciliationStatus) &&
      (!filters.receivingOfficer || row.receivingOfficer === filters.receivingOfficer)
    );
  });
}

export function summarizeRevenue(rows: readonly RevenueTransaction[]): RevenueReportSummary {
  const totals = rows.reduce(
    (sum, row) => ({
      grossCollections: sum.grossCollections + row.collectedAmount,
      adjustments: sum.adjustments + row.adjustmentAmount,
      netCollections: sum.netCollections + row.netAmount,
      outstandingBalance: sum.outstandingBalance + row.outstandingAmount,
      officialReceipts: sum.officialReceipts + (row.officialReceiptNumber ? 1 : 0),
      onlineCollections: sum.onlineCollections + (row.channel === "Cashier" ? 0 : row.netAmount),
      reconciliationExceptions: sum.reconciliationExceptions + (row.reconciliationStatus === "Exception" ? 1 : 0),
    }),
    {
      grossCollections: 0,
      adjustments: 0,
      netCollections: 0,
      outstandingBalance: 0,
      officialReceipts: 0,
      onlineCollections: 0,
      reconciliationExceptions: 0,
    },
  );
  return {
    ...totals,
    onlineShare: totals.netCollections > 0 ? (totals.onlineCollections / totals.netCollections) * 100 : 0,
  };
}

export function groupRevenue(rows: readonly RevenueTransaction[], readKey: (row: RevenueTransaction) => string) {
  const totals = new Map<string, number>();
  for (const row of rows) totals.set(readKey(row), (totals.get(readKey(row)) ?? 0) + row.netAmount);
  return [...totals.entries()]
    .map(([label, amount]) => ({ label, amount }))
    .sort((left, right) => right.amount - left.amount);
}

function escapeCsv(value: string | number) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function revenueTransactionsToCsv(rows: readonly RevenueTransaction[]) {
  const headings = [
    "Payment date",
    "OR number",
    "Application",
    "Business",
    "Barangay",
    "Application type",
    "Fee category",
    "Assessment",
    "Collected",
    "Adjustment",
    "Net",
    "Outstanding",
    "Channel",
    "Status",
    "Reconciliation",
    "Officer",
    "Reference",
  ];
  const values = rows.map((row) => [
    row.paymentDate,
    row.officialReceiptNumber ?? "",
    row.applicationId,
    row.businessName,
    row.barangay,
    row.applicationType,
    row.feeCategory,
    row.assessmentAmount / 100,
    row.collectedAmount / 100,
    row.adjustmentAmount / 100,
    row.netAmount / 100,
    row.outstandingAmount / 100,
    row.channel,
    row.status,
    row.reconciliationStatus,
    row.receivingOfficer,
    row.paymentReference,
  ]);
  return [headings, ...values].map((line) => line.map(escapeCsv).join(",")).join("\n");
}
