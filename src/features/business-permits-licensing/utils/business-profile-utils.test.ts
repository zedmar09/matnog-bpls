import { MATNOG_BUSINESS_DIRECTORY } from "../data/matnog-business-directory";
import { createApplicationHistory, createAuditTrail, createDocumentChecklist } from "./business-profile-utils";
import assert from "node:assert/strict";
import test from "node:test";

test("profile fixtures are deterministic for an established business", () => {
  const record = MATNOG_BUSINESS_DIRECTORY[0];
  assert.deepEqual(createApplicationHistory(record), createApplicationHistory(record));
  assert.equal(createApplicationHistory(record).length, 3);
  assert.equal(createDocumentChecklist(record).length, 8);
  assert.equal(createAuditTrail(record).length, 8);
});

test("newly registered businesses start without permit history", () => {
  const record = { ...MATNOG_BUSINESS_DIRECTORY[0], status: "For application" as const };
  assert.deepEqual(createApplicationHistory(record), []);
  assert.ok(createDocumentChecklist(record).some((document) => document.status === "Not submitted"));
  assert.equal(createAuditTrail(record).length, 2);
});
