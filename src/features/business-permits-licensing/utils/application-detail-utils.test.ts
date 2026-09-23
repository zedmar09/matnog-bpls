import { MATNOG_APPLICATION_DIRECTORY } from "../data/matnog-application-directory";
import {
  applyBploDecision,
  applyFireDecision,
  applyHealthDecision,
  applyZoningDecision,
  createApplicationRequirements,
  createApplicationTimeline,
  createOfficeReviews,
  createProcessingGates,
  resolveApplicationRecord,
  validateBploDecision,
  validateFireDecision,
  validateHealthDecision,
  validateZoningDecision,
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

test("zoning approval records findings and advances the application", () => {
  const record = MATNOG_APPLICATION_DIRECTORY.find((item) => item.status === "Submitted");
  assert.ok(record);
  const bplo = applyBploDecision(record, undefined, "approve", "Completeness confirmed.", []);
  const result = applyZoningDecision(
    bplo.record,
    undefined,
    "approve",
    {
      classification: "Commercial zone",
      compatibility: "Conforming use",
      occupancyType: "Mercantile",
      referenceNumber: "ZLC-2026-00318",
      remarks: "Location is compatible with the approved land-use classification.",
    },
    [],
  );
  assert.equal(result.record.status, "Under review");
  assert.equal(result.record.currentStage, "Health and sanitary review");
  assert.equal(result.override.status, "Approved");
  assert.equal(createOfficeReviews(result.record, bplo.override, result.override)[2].status, "In review");
  assert.equal(createApplicationTimeline(result.record, bplo.override, result.override)[2].actor, "Maricel A. Gacosta");
});

test("zoning return requires a reason and selected requirement", () => {
  const fields = {
    classification: "Commercial zone",
    compatibility: "Needs verification",
    occupancyType: "Mercantile",
    referenceNumber: "ZLC-2026-00318",
    remarks: "Short",
  };
  assert.ok(validateZoningDecision("return", fields, []));
  assert.ok(validateZoningDecision("return", { ...fields, remarks: "Upload an updated site plan." }, []));
  assert.equal(validateZoningDecision("return", { ...fields, remarks: "Upload an updated site plan." }, ["REQ-1"]), "");
});

test("zoning not-applicable decisions advance with an audit event", () => {
  const record = MATNOG_APPLICATION_DIRECTORY[0];
  const result = applyZoningDecision(
    record,
    undefined,
    "not-applicable",
    {
      classification: "Exempt transaction",
      compatibility: "Not applicable",
      occupancyType: "No change in occupancy",
      referenceNumber: "ZNA-2026-00001",
      remarks: "Closure transaction does not require a new locational clearance.",
    },
    [],
  );
  assert.equal(result.override.status, "Not applicable");
  assert.equal(result.record.currentStage, "Health and sanitary review");
  assert.match(result.event.action, /not applicable/i);
});

const completeHealthFields = {
  inspectionRequirement: "On-site inspection required",
  inspectionDate: "2026-09-23",
  sanitaryCategory: "Food establishment",
  inspectionResult: "Passed",
  permitReference: "SP-2026-00318",
  complianceAreas: ["Sanitation", "Water supply", "Waste disposal", "Food handling", "Employee health"],
  remarks: "All required sanitary controls were verified during inspection.",
};

test("health approval advances the application to fire safety review", () => {
  const record = { ...MATNOG_APPLICATION_DIRECTORY[0], status: "Under review" as const };
  const result = applyHealthDecision(record, undefined, "approve", completeHealthFields, []);
  assert.equal(result.record.status, "Under review");
  assert.equal(result.record.currentStage, "Fire safety review");
  assert.equal(result.record.assignedOfficer, "FO2 Catherine O. Fortes");
  assert.equal(result.override.status, "Approved");
});

test("health approval requires complete inspection findings", () => {
  assert.ok(validateHealthDecision("approve", { ...completeHealthFields, inspectionDate: "" }, []));
  assert.ok(validateHealthDecision("approve", { ...completeHealthFields, complianceAreas: ["Sanitation"] }, []));
  assert.equal(validateHealthDecision("approve", completeHealthFields, []), "");
});

test("health correction return requires a reason and selected requirement", () => {
  assert.ok(validateHealthDecision("return", { ...completeHealthFields, remarks: "Short" }, []));
  assert.ok(validateHealthDecision("return", completeHealthFields, []));
  assert.equal(validateHealthDecision("return", completeHealthFields, ["REQ-1"]), "");
});

const completeFireFields = {
  inspectionRequirement: "On-site inspection required",
  scheduledDate: "2026-09-22",
  inspectionDate: "2026-09-23",
  inspectionResult: "Passed",
  fsicNumber: "FSIC-2026-00318",
  validUntil: "2027-09-23",
  safetyControls: [
    "Fire extinguishers",
    "Emergency exits",
    "Alarm and detection",
    "Electrical safety",
    "Emergency plan",
  ],
  remarks: "BFP inspection completed with all required fire-safety controls verified.",
};

test("fire approval advances the application to treasurer assessment", () => {
  const record = { ...MATNOG_APPLICATION_DIRECTORY[0], status: "Under review" as const };
  const result = applyFireDecision(record, undefined, "approve", completeFireFields, []);
  assert.equal(result.record.status, "Under review");
  assert.equal(result.record.currentStage, "Treasurer assessment");
  assert.equal(result.record.assignedOfficer, "Rogelio M. Funes");
  assert.equal(result.override.status, "Approved");
});

test("fire approval validates inspection chronology and controls", () => {
  assert.ok(validateFireDecision("approve", { ...completeFireFields, inspectionDate: "2026-09-20" }, []));
  assert.ok(validateFireDecision("approve", { ...completeFireFields, safetyControls: ["Fire extinguishers"] }, []));
  assert.equal(validateFireDecision("approve", completeFireFields, []), "");
});

test("fire correction return requires a reason and selected requirement", () => {
  assert.ok(validateFireDecision("return", { ...completeFireFields, remarks: "Short" }, []));
  assert.ok(validateFireDecision("return", completeFireFields, []));
  assert.equal(validateFireDecision("return", completeFireFields, ["REQ-1"]), "");
});
