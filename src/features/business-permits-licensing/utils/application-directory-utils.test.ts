import { MATNOG_APPLICATION_DIRECTORY } from "../data/matnog-application-directory";
import {
  EMPTY_APPLICATION_FILTERS,
  filterApplications,
  isApplicationOverdue,
  sortApplications,
} from "./application-directory-utils";
import assert from "node:assert/strict";
import test from "node:test";

test("application directory contains deterministic production-scale data", () => {
  assert.equal(MATNOG_APPLICATION_DIRECTORY.length, 184);
  assert.equal(new Set(MATNOG_APPLICATION_DIRECTORY.map((record) => record.id)).size, 184);
});

test("application filters combine operational criteria", () => {
  const source = MATNOG_APPLICATION_DIRECTORY.find((record) => record.status === "Under review");
  assert.ok(source);
  const rows = filterApplications(MATNOG_APPLICATION_DIRECTORY, {
    ...EMPTY_APPLICATION_FILTERS,
    status: source.status,
    barangay: source.barangay,
    assignedOfficer: source.assignedOfficer,
  });
  assert.ok(rows.length > 0);
  assert.ok(
    rows.every(
      (record) =>
        record.status === source.status &&
        record.barangay === source.barangay &&
        record.assignedOfficer === source.assignedOfficer,
    ),
  );
});

test("overdue filtering excludes terminal applications", () => {
  const rows = filterApplications(MATNOG_APPLICATION_DIRECTORY, { ...EMPTY_APPLICATION_FILTERS, overdue: "yes" });
  assert.ok(rows.length > 0);
  assert.ok(rows.every((record) => isApplicationOverdue(record)));
});

test("application sorting is immutable", () => {
  const first = MATNOG_APPLICATION_DIRECTORY[0];
  const rows = sortApplications(MATNOG_APPLICATION_DIRECTORY, "targetRelease", "desc");
  const last = rows.at(-1);
  assert.ok(last);
  assert.ok(rows[0].targetRelease >= last.targetRelease);
  assert.equal(MATNOG_APPLICATION_DIRECTORY[0], first);
});
