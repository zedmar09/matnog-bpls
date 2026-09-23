import { MATNOG_APPLICATION_DIRECTORY } from "@/features/business-permits-licensing/data/matnog-application-directory";
import { MATNOG_PERMIT_REGISTRY } from "@/features/business-permits-licensing/data/matnog-permit-registry";

import {
  complianceRecordsToCsv,
  EMPTY_COMPLIANCE_FILTERS,
  filterComplianceRecords,
  projectComplianceRecord,
  projectComplianceRegister,
  summarizeCompliance,
} from "./compliance-report-utils";
import assert from "node:assert/strict";
import test from "node:test";

test("critical permit restrictions take precedence over lower findings", () => {
  const permit = MATNOG_PERMIT_REGISTRY.find((row) => row.status === "Suspended");
  assert.ok(permit);
  const application = MATNOG_APPLICATION_DIRECTORY.find((row) => row.id === permit.applicationId);
  assert.ok(application);
  const record = projectComplianceRecord(
    { ...application, paymentStatus: "Pending payment", requirementsComplete: 0 },
    permit,
  );
  assert.equal(record.complianceState, "Critical");
  assert.equal(record.issueCategory, "Permit restriction");
});

test("payment reversals outrank requirement findings", () => {
  const source = MATNOG_APPLICATION_DIRECTORY[0];
  const record = projectComplianceRecord({ ...source, paymentStatus: "Reversed", requirementsComplete: 0 });
  assert.equal(record.complianceState, "Critical");
  assert.equal(record.issueCategory, "Payment exception");
});

test("projects and filters all monitored application records", () => {
  const rows = projectComplianceRegister(MATNOG_APPLICATION_DIRECTORY, MATNOG_PERMIT_REGISTRY);
  assert.equal(rows.length, 184);
  const critical = filterComplianceRecords(rows, { ...EMPTY_COMPLIANCE_FILTERS, complianceState: "Critical" });
  assert.ok(critical.length > 0);
  assert.ok(critical.every((row) => row.complianceState === "Critical"));
});

test("summaries and exports retain compliance evidence", () => {
  const rows = projectComplianceRegister(MATNOG_APPLICATION_DIRECTORY, MATNOG_PERMIT_REGISTRY);
  const summary = summarizeCompliance(rows);
  assert.ok(summary.businessesMonitored > 0);
  assert.ok(summary.restrictions > 0);
  assert.equal(summary.critical, rows.filter((row) => row.complianceState === "Critical").length);
  const csv = complianceRecordsToCsv(rows.slice(0, 1));
  assert.match(csv, /Recommended action/);
  assert.match(csv, /APP-2026-/);
});
