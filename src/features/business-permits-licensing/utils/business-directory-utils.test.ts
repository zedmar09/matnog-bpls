import { BUSINESS_ACTIVITY_CATEGORIES, MATNOG_BUSINESS_DIRECTORY } from "../data/matnog-business-directory";
import { EMPTY_BUSINESS_FILTERS, filterBusinesses, sortBusinesses } from "./business-directory-utils";
import assert from "node:assert/strict";
import test from "node:test";

test("business directory provides a large deterministic Matnog dataset", () => {
  assert.equal(MATNOG_BUSINESS_DIRECTORY.length, 128);
  assert.equal(new Set(MATNOG_BUSINESS_DIRECTORY.map((record) => record.id)).size, 128);
  assert.ok(BUSINESS_ACTIVITY_CATEGORIES.length >= 8);
  assert.ok(MATNOG_BUSINESS_DIRECTORY.every((record) => record.address.includes("Matnog, Sorsogon")));
});

test("business filters combine quick and advanced criteria", () => {
  const target = MATNOG_BUSINESS_DIRECTORY.find(
    (record) => record.status === "Active" && record.riskLevel === "Low" && Boolean(record.email),
  );
  assert.ok(target);

  const rows = filterBusinesses(MATNOG_BUSINESS_DIRECTORY, {
    ...EMPTY_BUSINESS_FILTERS,
    barangay: target.barangay,
    status: "Active",
    riskLevel: "Low",
    hasEmail: "yes",
  });

  assert.ok(rows.length > 0);
  assert.ok(rows.every((record) => record.barangay === target.barangay));
  assert.ok(rows.every((record) => record.status === "Active" && record.riskLevel === "Low" && record.email));
});

test("business search checks identity, owner, permit, activity, and address", () => {
  const target = MATNOG_BUSINESS_DIRECTORY[37];
  for (const search of [target.id, target.ownerName, target.permitNumber, target.primaryActivity, target.barangay]) {
    const rows = filterBusinesses(MATNOG_BUSINESS_DIRECTORY, { ...EMPTY_BUSINESS_FILTERS, search });
    assert.ok(rows.some((record) => record.id === target.id));
  }
});

test("business sorting supports numeric and textual columns without mutating the source", () => {
  const originalFirst = MATNOG_BUSINESS_DIRECTORY[0];
  const byEmployees = sortBusinesses(MATNOG_BUSINESS_DIRECTORY, "employeeCount", "desc");
  const byName = sortBusinesses(MATNOG_BUSINESS_DIRECTORY, "business", "asc");
  const lastByEmployees = byEmployees.at(-1);
  const lastByName = byName.at(-1);

  assert.ok(lastByEmployees);
  assert.ok(lastByName);
  assert.ok(byEmployees[0].employeeCount >= lastByEmployees.employeeCount);
  assert.ok(byName[0].tradeName.localeCompare(lastByName.tradeName, "en-PH") <= 0);
  assert.equal(MATNOG_BUSINESS_DIRECTORY[0], originalFirst);
});
