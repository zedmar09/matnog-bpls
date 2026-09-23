import { MATNOG_PERMIT_ISSUANCE_RECORDS } from "../data/matnog-permit-issuance";
import {
  EMPTY_PERMIT_ISSUANCE_FILTERS,
  filterPermitIssuance,
  groupPermitIssuance,
  permitIssuanceToCsv,
  summarizePermitIssuance,
} from "./permit-issuance-report-utils";
import assert from "node:assert/strict";
import test from "node:test";

test("provides a production-scale multi-year statutory register", () => {
  assert.equal(MATNOG_PERMIT_ISSUANCE_RECORDS.length, 98);
  assert.deepEqual([...new Set(MATNOG_PERMIT_ISSUANCE_RECORDS.map((row) => row.fiscalPeriod))].sort(), [
    "2024",
    "2025",
    "2026",
  ]);
});

test("filters issuance records across dates and permit dimensions", () => {
  const rows = filterPermitIssuance(MATNOG_PERMIT_ISSUANCE_RECORDS, {
    ...EMPTY_PERMIT_ISSUANCE_FILTERS,
    dateFrom: "2026-01-01",
    dateTo: "2026-12-31",
    documentType: "Business Permit",
    status: "Suspended",
  });
  assert.ok(rows.length > 0);
  assert.ok(
    rows.every(
      (row) => row.fiscalPeriod === "2026" && row.documentType === "Business Permit" && row.status === "Suspended",
    ),
  );
});

test("summary distinguishes current, closure, restricted, and verifiable records", () => {
  const summary = summarizePermitIssuance(MATNOG_PERMIT_ISSUANCE_RECORDS);
  assert.equal(summary.total, 98);
  assert.ok(summary.closureCertificates > 0);
  assert.ok(summary.restricted > 0);
  assert.ok(summary.qrVerifiable > summary.active);
});

test("groups and exports the current result set", () => {
  const grouped = groupPermitIssuance(MATNOG_PERMIT_ISSUANCE_RECORDS, (row) => row.fiscalPeriod);
  assert.equal(
    grouped.reduce((total, item) => total + item.count, 0),
    98,
  );
  assert.match(permitIssuanceToCsv(MATNOG_PERMIT_ISSUANCE_RECORDS.slice(0, 1)), /Permit number/);
  assert.match(permitIssuanceToCsv(MATNOG_PERMIT_ISSUANCE_RECORDS.slice(0, 1)), /MATNOG-/);
});
