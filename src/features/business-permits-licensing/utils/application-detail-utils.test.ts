import { MATNOG_APPLICATION_DIRECTORY } from "../data/matnog-application-directory";
import {
  applyBploDecision,
  createApplicationRequirements,
  createApplicationTimeline,
  createOfficeReviews,
  createProcessingGates,
  resolveApplicationRecord,
  validateBploDecision,
} from "./application-detail-utils";
import assert from "node:assert/strict";
import test from "node:test";

test("application resolution prefers locally saved records", () => {
  const seeded = MATNOG_APPLICATION_DIRECTORY[0];
  const saved = { ...seeded, businessName: "Locally Updated Business" };
  assert.equal(
    resolveApplicationRecord(MATNOG_APPLICATION_DIRECTORY, [saved], seeded.id)?.businessName,
    saved.businessName,
  );
});

test("every directory record produces a complete operational detail model", () => {
  for (const record of MATNOG_APPLICATION_DIRECTORY) {
    assert.equal(createApplicationRequirements(record).length, record.requirementsTotal);
    assert.equal(createOfficeReviews(record).length, 6);
  }
});

test("issued applications satisfy every processing gate", () => {
  const record = MATNOG_APPLICATION_DIRECTORY.find((item) => item.status === "Issued");
  assert.ok(record);
  const requirements = createApplicationRequirements(record);
  const reviews = createOfficeReviews(record);
  assert.ok(createProcessingGates(record, requirements, reviews).every((gate) => gate.status === "Complete"));
});

test("return decisions require a reason and affected requirement", () => {
  assert.ok(validateBploDecision("return", "Too short", []));
  assert.ok(validateBploDecision("return", "Updated clearance is required.", []));
  assert.equal(validateBploDecision("return", "Updated clearance is required.", ["REQ-1"]), "");
});

test("BPLO approval advances the application and records an audit event", () => {
  const record = MATNOG_APPLICATION_DIRECTORY.find((item) => item.status === "Submitted");
  assert.ok(record);
  const result = applyBploDecision(record, undefined, "approve", "Completeness confirmed.", []);
  assert.equal(result.record.status, "Under review");
  assert.equal(result.record.currentStage, "Zoning review");
  assert.equal(result.override.status, "Approved");
  assert.equal(result.override.events.length, 1);
});

test("BPLO correction return changes the application and selected evidence", () => {
  const record = MATNOG_APPLICATION_DIRECTORY[0];
  const requirement = createApplicationRequirements(record)[0];
  const result = applyBploDecision(record, undefined, "return", "Replace the expired registration document.", [
    requirement.id,
  ]);
  assert.equal(result.record.status, "For correction");
  assert.equal(result.override.status, "For correction");
  const requirements = createApplicationRequirements(result.record, result.override);
  assert.equal(requirements[0].status, "Returned");
  assert.equal(requirements.filter((item) => item.status === "Returned").length, 1);
  assert.equal(createOfficeReviews(result.record, result.override)[1].status, "Not started");
  assert.equal(
    createApplicationTimeline(result.record, result.override).at(-1)?.action,
    "BPLO review returned for correction",
  );
});
