import type { RevenueTransaction } from "../types/revenue-report";
import {
  EMPTY_REVENUE_FILTERS,
  filterRevenueTransactions,
  revenueTransactionsToCsv,
  summarizeRevenue,
} from "./revenue-report-utils";
import assert from "node:assert/strict";
import test from "node:test";

const rows: RevenueTransaction[] = [
  {
    id: "1",
    paymentDate: "2026-09-01",
    officialReceiptNumber: "OR-1",
    applicationId: "APP-1",
    businessName: "Alpha Store",
    ownerName: "A",
    barangay: "Poblacion",
    applicationType: "New",
    feeCategory: "Business tax",
    assessmentAmount: 10000,
    collectedAmount: 10000,
    adjustmentAmount: 0,
    netAmount: 10000,
    outstandingAmount: 0,
    channel: "GCash",
    status: "Confirmed",
    reconciliationStatus: "Matched",
    receivingOfficer: "Ana",
    paymentReference: "G-1",
  },
  {
    id: "2",
    paymentDate: "2026-09-02",
    applicationId: "APP-2",
    businessName: "Beta Store",
    ownerName: "B",
    barangay: "Camcaman",
    applicationType: "Renewal",
    feeCategory: "Mayor's permit fee",
    assessmentAmount: 20000,
    collectedAmount: 10000,
    adjustmentAmount: -4000,
    netAmount: 6000,
    outstandingAmount: 10000,
    channel: "Cashier",
    status: "Refunded",
    reconciliationStatus: "Exception",
    receivingOfficer: "Rina",
    paymentReference: "MTO-2",
  },
];

test("summarizes gross, adjustments, net, balances, receipts, and exceptions", () => {
  assert.deepEqual(summarizeRevenue(rows), {
    grossCollections: 20000,
    adjustments: -4000,
    netCollections: 16000,
    outstandingBalance: 10000,
    officialReceipts: 1,
    onlineCollections: 10000,
    reconciliationExceptions: 1,
    onlineShare: 62.5,
  });
});

test("filters across search, date, and operational dimensions", () => {
  assert.deepEqual(
    filterRevenueTransactions(rows, {
      ...EMPTY_REVENUE_FILTERS,
      query: "beta",
      dateFrom: "2026-09-01",
      dateTo: "2026-09-30",
      barangay: "Camcaman",
    }).map((row) => row.id),
    ["2"],
  );
});

test("exports a CSV with money expressed in pesos", () => {
  const csv = revenueTransactionsToCsv(rows.slice(0, 1));
  assert.match(csv, /Alpha Store/);
  assert.match(csv, /,100,/);
});
