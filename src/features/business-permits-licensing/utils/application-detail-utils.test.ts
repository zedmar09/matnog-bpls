import { MATNOG_APPLICATION_DIRECTORY } from "../data/matnog-application-directory";
import { MATNOG_BUSINESS_DIRECTORY } from "../data/matnog-business-directory";
import {
  applyBploDecision,
  applyFireDecision,
  applyHealthDecision,
  applyMayorDecision,
  applyPaymentConfirmation,
  applyPaymentReversal,
  applyPermitDocumentAction,
  applyPermitReleaseAction,
  applyTreasurerAssessment,
  applyZoningDecision,
  calculateAssessmentTotals,
  calculatePaymentSummary,
  createApplicationRequirements,
  createApplicationTimeline,
  createDefaultAssessmentFields,
  createDefaultMayorFields,
  createDefaultPaymentFields,
  createDefaultPermitDocumentFields,
  createDefaultPermitReleaseFields,
  createOfficeReviews,
  createProcessingGates,
  invalidateMayorApprovalForPaymentReversal,
  invalidatePermitDocumentForPaymentReversal,
  resolveApplicationRecord,
  synchronizeReleasedBusiness,
  validateBploDecision,
  validateFireDecision,
  validateHealthDecision,
  validateMayorDecision,
  validatePaymentConfirmation,
  validatePaymentReversal,
  validatePermitDocument,
  validatePermitReleaseAction,
  validateTreasurerAssessment,
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

test("Treasurer posting calculates the total and routes to payment confirmation", () => {
  const record = { ...MATNOG_APPLICATION_DIRECTORY[0], assessmentAmount: 0, paymentStatus: "Not assessed" as const };
  const fields = createDefaultAssessmentFields(record);
  const expected = calculateAssessmentTotals(fields).total;
  const result = applyTreasurerAssessment(record, undefined, "post", fields, []);
  assert.equal(result.record.assessmentAmount, expected);
  assert.equal(result.record.paymentStatus, "Pending payment");
  assert.equal(result.record.currentStage, "Payment confirmation");
  assert.equal(result.override.status, "Approved");
});

test("Treasurer posting validates chronology and manual adjustments", () => {
  const fields = createDefaultAssessmentFields(MATNOG_APPLICATION_DIRECTORY[0]);
  assert.ok(validateTreasurerAssessment("post", { ...fields, dueDate: "2026-09-20" }, []));
  assert.ok(validateTreasurerAssessment("post", { ...fields, adjustment: -500 }, []));
  assert.equal(
    validateTreasurerAssessment(
      "post",
      { ...fields, adjustment: -500, adjustmentReason: "Approved correction to an overcomputed regulatory charge." },
      [],
    ),
    "",
  );
});

test("Zero assessment requires an exemption and advances past payment", () => {
  const record = { ...MATNOG_APPLICATION_DIRECTORY[0], assessmentAmount: 0, paymentStatus: "Not assessed" as const };
  const fields = {
    ...createDefaultAssessmentFields(record),
    assessmentType: "Zero / exempt" as const,
    exemptionBasis: "Approved closure exemption under the configured municipal revenue-code rule.",
    remarks: "No collectible balance remains after Treasurer reconciliation.",
  };
  const result = applyTreasurerAssessment(record, undefined, "post", fields, []);
  assert.equal(result.record.assessmentAmount, 0);
  assert.equal(result.record.paymentStatus, "Paid");
  assert.equal(result.record.currentStage, "Mayor's final approval");
});

test("Treasurer correction return requires a reason and selected requirement", () => {
  const fields = { ...createDefaultAssessmentFields(MATNOG_APPLICATION_DIRECTORY[0]), remarks: "Short" };
  assert.ok(validateTreasurerAssessment("return", fields, []));
  assert.ok(
    validateTreasurerAssessment("return", { ...fields, remarks: "Submit a corrected gross-receipts declaration." }, []),
  );
  assert.equal(
    validateTreasurerAssessment("return", { ...fields, remarks: "Submit a corrected gross-receipts declaration." }, [
      "REQ-1",
    ]),
    "",
  );
});

const payableRecord = {
  ...MATNOG_APPLICATION_DIRECTORY[0],
  assessmentAmount: 13_600,
  paymentStatus: "Pending payment" as const,
  currentStage: "Payment confirmation",
};

const completePaymentFields = {
  ...createDefaultPaymentFields(payableRecord),
  channel: "GCash",
  amount: 5_000,
  referenceNumber: "GCASH-2026-00318-01",
  gatewayStatus: "Successful",
  notes: "Gateway reference matched the posted settlement report.",
};

test("Partial payment reduces the balance without opening Mayor approval", () => {
  const result = applyPaymentConfirmation(payableRecord, "ASM-2026-00318", undefined, "confirm", completePaymentFields);
  assert.equal(result.record.paymentStatus, "Pending payment");
  assert.equal(result.record.currentStage, "Payment confirmation");
  assert.equal(
    calculatePaymentSummary(payableRecord.assessmentAmount, result.override.transactions).outstandingBalance,
    8_600,
  );
  assert.match(result.override.transactions[0].officialReceiptNumber, /^OR-2026-/);
});

test("Full payment routes the application to Mayor approval", () => {
  const result = applyPaymentConfirmation(payableRecord, "ASM-2026-00318", undefined, "confirm", {
    ...completePaymentFields,
    amount: payableRecord.assessmentAmount,
  });
  assert.equal(result.record.paymentStatus, "Paid");
  assert.equal(result.record.currentStage, "Mayor's final approval");
  assert.equal(result.record.assignedOfficer, "Roberto P. Hababag");
});

test("Payment validation blocks unverified gateways, overpayments, and duplicate references", () => {
  assert.ok(
    validatePaymentConfirmation(
      "confirm",
      { ...completePaymentFields, gatewayStatus: "Pending verification" },
      payableRecord.assessmentAmount,
      [],
    ),
  );
  assert.ok(
    validatePaymentConfirmation(
      "confirm",
      { ...completePaymentFields, amount: 20_000 },
      payableRecord.assessmentAmount,
      [],
    ),
  );
  const first = applyPaymentConfirmation(payableRecord, "ASM-2026-00318", undefined, "confirm", completePaymentFields);
  assert.ok(
    validatePaymentConfirmation(
      "confirm",
      completePaymentFields,
      payableRecord.assessmentAmount,
      first.override.transactions,
    ),
  );
});

test("Rejected payments remain in the ledger without reducing the balance", () => {
  const result = applyPaymentConfirmation(payableRecord, "ASM-2026-00318", undefined, "reject", {
    ...completePaymentFields,
    gatewayStatus: "Failed",
    notes: "Gateway settlement could not verify this reference.",
  });
  assert.equal(result.override.transactions[0].status, "Rejected");
  assert.equal(
    calculatePaymentSummary(payableRecord.assessmentAmount, result.override.transactions).outstandingBalance,
    13_600,
  );
});

test("Payment reversal restores the balance and locks Mayor approval", () => {
  const paid = applyPaymentConfirmation(payableRecord, "ASM-2026-00318", undefined, "confirm", {
    ...completePaymentFields,
    amount: payableRecord.assessmentAmount,
  });
  const transactionId = paid.override.transactions[0].id;
  assert.equal(
    validatePaymentReversal(
      transactionId,
      "Duplicate settlement confirmed during reconciliation.",
      paid.override.transactions,
    ),
    "",
  );
  const reversed = applyPaymentReversal(
    paid.record,
    paid.override,
    transactionId,
    "Duplicate settlement confirmed during reconciliation.",
  );
  assert.equal(reversed.record.paymentStatus, "Reversed");
  assert.equal(reversed.record.currentStage, "Payment confirmation");
  assert.equal(reversed.override.transactions[0].status, "Reversed");
});

test("Mayor approval routes permits to controlled document generation", () => {
  const paid = { ...payableRecord, paymentStatus: "Paid" as const, currentStage: "Mayor's final approval" };
  const fields = createDefaultMayorFields({ ...paid, type: "Renewal" });
  const result = applyMayorDecision({ ...paid, type: "Renewal" }, undefined, "approve", fields);
  assert.equal(result.record.status, "Ready to issue");
  assert.equal(result.record.currentStage, "Permit generation");
  assert.equal(result.record.permitNumber, paid.permitNumber);
  assert.equal(result.override.status, "Approved");
  const reviews = createOfficeReviews(
    result.record,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    result.override,
  );
  assert.match(
    createProcessingGates(result.record, createApplicationRequirements(result.record), reviews)[4].detail,
    /permit generation/,
  );
});

test("Mayor approval routes closure applications to certificate generation", () => {
  const paidClosure = { ...payableRecord, type: "Closure" as const, paymentStatus: "Paid" as const };
  const result = applyMayorDecision(paidClosure, undefined, "approve", createDefaultMayorFields(paidClosure));
  assert.equal(result.record.status, "Ready to issue");
  assert.equal(result.record.currentStage, "Closure certificate generation");
});

test("Mayor return and deferral require operational reasons", () => {
  const fields = createDefaultMayorFields(payableRecord);
  assert.ok(validateMayorDecision("return", { ...fields, remarks: "Short" }, payableRecord.type));
  assert.ok(validateMayorDecision("defer", { ...fields, remarks: "Short" }, payableRecord.type));
  assert.equal(
    validateMayorDecision(
      "return",
      { ...fields, remarks: "Treasurer must reconcile the final assessment." },
      payableRecord.type,
    ),
    "",
  );
});

test("Mayor return assigns the selected processing office", () => {
  const fields = {
    ...createDefaultMayorFields(payableRecord),
    returnDestination: "Treasurer assessment",
    remarks: "Reconcile the assessment basis before final approval.",
  };
  const result = applyMayorDecision(payableRecord, undefined, "return", fields);
  assert.equal(result.record.status, "Under review");
  assert.equal(result.record.currentStage, "Treasurer assessment");
  assert.equal(result.record.assignedOfficer, "Rogelio M. Funes");
});

test("Payment reversal invalidates an existing Mayor approval without erasing its audit history", () => {
  const paid = { ...payableRecord, paymentStatus: "Paid" as const, currentStage: "Mayor's final approval" };
  const approved = applyMayorDecision(paid, undefined, "approve", createDefaultMayorFields(paid));
  const invalidated = invalidateMayorApprovalForPaymentReversal(approved.record, approved.override);
  assert.equal(invalidated.status, "Not started");
  assert.equal(invalidated.events.length, 2);
  assert.equal(invalidated.events[0].action, "Mayor final approval recorded");
  assert.equal(invalidated.events[1].action, "Mayor approval invalidated");
});

test("Permit generation creates a controlled number, QR token, and immutable version", () => {
  const ready = {
    ...payableRecord,
    type: "Renewal" as const,
    status: "Ready to issue" as const,
    currentStage: "Permit generation",
    paymentStatus: "Paid" as const,
  };
  const fields = createDefaultPermitDocumentFields(ready);
  const result = applyPermitDocumentAction(ready, undefined, "generate", fields);
  assert.equal(result.record.currentStage, "For e-signature");
  assert.equal(result.record.permitNumber, `MATNOG-BP-${ready.fiscalPeriod}-${ready.id.slice(-5)}`);
  assert.equal(result.override.status, "For signature");
  assert.equal(result.override.versions.length, 1);
  assert.match(result.override.qrToken, new RegExp(`^MTG-${ready.fiscalPeriod}-`));
});

test("Closure generation uses a certificate number and no validity end date", () => {
  const readyClosure = {
    ...payableRecord,
    type: "Closure" as const,
    status: "Ready to issue" as const,
    currentStage: "Closure certificate generation",
    paymentStatus: "Paid" as const,
  };
  const fields = createDefaultPermitDocumentFields(readyClosure);
  assert.equal(fields.effectiveUntil, "");
  assert.equal(validatePermitDocument("generate", fields, readyClosure.type), "");
  const result = applyPermitDocumentAction(readyClosure, undefined, "generate", fields);
  assert.equal(result.record.permitNumber, `MATNOG-CC-${readyClosure.fiscalPeriod}-${readyClosure.id.slice(-5)}`);
});

test("Document generation validates dates, signatory, conditions, and numbering", () => {
  const fields = createDefaultPermitDocumentFields(payableRecord);
  assert.ok(validatePermitDocument("generate", { ...fields, documentNumber: "BP-318" }, payableRecord.type));
  assert.ok(validatePermitDocument("generate", { ...fields, signatoryName: "" }, payableRecord.type));
  assert.ok(validatePermitDocument("generate", { ...fields, conditions: "Short" }, payableRecord.type));
  assert.ok(
    validatePermitDocument(
      "generate",
      { ...fields, effectiveFrom: "2026-12-31", effectiveUntil: "2026-01-01" },
      payableRecord.type,
    ),
  );
});

test("Regeneration preserves prior document versions", () => {
  const ready = { ...payableRecord, status: "Ready to issue" as const, currentStage: "Permit generation" };
  const fields = createDefaultPermitDocumentFields(ready);
  const first = applyPermitDocumentAction(ready, undefined, "generate", fields);
  const second = applyPermitDocumentAction(first.record, first.override, "generate", {
    ...fields,
    productionNotes: "Corrected the document production note for version two.",
  });
  assert.deepEqual(
    second.override.versions.map((version) => version.version),
    [1, 2],
  );
  assert.equal(second.override.versions[0].documentNumber, second.override.versions[1].documentNumber);
});

test("Payment reversal invalidates a generated document while retaining its versions", () => {
  const ready = { ...payableRecord, status: "Ready to issue" as const, currentStage: "Permit generation" };
  const generated = applyPermitDocumentAction(ready, undefined, "generate", createDefaultPermitDocumentFields(ready));
  const invalidated = invalidatePermitDocumentForPaymentReversal(generated.record, generated.override);
  assert.equal(invalidated.record.permitNumber, "Pending");
  assert.equal(invalidated.override.status, "Invalidated");
  assert.equal(invalidated.override.versions.length, 1);
  assert.equal(invalidated.override.events.at(-1)?.action, "Generated document invalidated");
});

test("Signature and release workflow closes a closure application and activates verification", () => {
  const ready = {
    ...payableRecord,
    type: "Closure" as const,
    status: "Ready to issue" as const,
    currentStage: "For e-signature",
  };
  const document = applyPermitDocumentAction(
    ready,
    undefined,
    "generate",
    createDefaultPermitDocumentFields(ready),
  ).override;
  const fields = createDefaultPermitReleaseFields(ready, document);
  const sent = applyPermitReleaseAction(ready, document, undefined, "send", fields);
  assert.equal(sent.override.signatureStatus, "Sent");
  assert.equal(sent.record.currentStage, "Awaiting e-signature");
  const signed = applyPermitReleaseAction(sent.record, document, sent.override, "signed", fields);
  assert.equal(signed.override.releaseStatus, "Ready for release");
  assert.equal(signed.record.currentStage, "Ready for release");
  const released = applyPermitReleaseAction(signed.record, document, signed.override, "release", {
    ...fields,
    recipientIdentification: "PhilSys ending 3180",
    acknowledgmentConfirmed: true,
  });
  assert.equal(released.record.status, "Closed");
  assert.equal(released.record.currentStage, "Completed");
  assert.equal(released.override.verificationStatus, "Active");
});

test("Controlled release remains locked until signing and acknowledgment are complete", () => {
  const ready = { ...payableRecord, status: "Ready to issue" as const, currentStage: "For e-signature" };
  const document = applyPermitDocumentAction(
    ready,
    undefined,
    "generate",
    createDefaultPermitDocumentFields(ready),
  ).override;
  const fields = createDefaultPermitReleaseFields(ready, document);
  assert.ok(validatePermitReleaseAction("release", fields));
  const sent = applyPermitReleaseAction(ready, document, undefined, "send", fields);
  const signed = applyPermitReleaseAction(sent.record, document, sent.override, "signed", fields);
  assert.ok(validatePermitReleaseAction("release", fields, signed.override));
  assert.equal(
    validatePermitReleaseAction(
      "release",
      { ...fields, recipientIdentification: "Driver license ending 3010", acknowledgmentConfirmed: true },
      signed.override,
    ),
    "",
  );
});

test("Signature exceptions preserve attempt history and allow resend", () => {
  const ready = { ...payableRecord, status: "Ready to issue" as const, currentStage: "For e-signature" };
  const document = applyPermitDocumentAction(
    ready,
    undefined,
    "generate",
    createDefaultPermitDocumentFields(ready),
  ).override;
  const fields = createDefaultPermitReleaseFields(ready, document);
  const sent = applyPermitReleaseAction(ready, document, undefined, "send", fields);
  const failed = applyPermitReleaseAction(sent.record, document, sent.override, "failed", {
    ...fields,
    signatureNotes: "DocuSign callback reported an expired signing envelope.",
  });
  const resent = applyPermitReleaseAction(failed.record, document, failed.override, "send", {
    ...fields,
    envelopeReference: `${fields.envelopeReference}-R2`,
  });
  assert.deepEqual(
    resent.override.attempts.map((attempt) => attempt.status),
    ["Failed", "Sent"],
  );
});

test("Final release synchronizes active permits and business closures", () => {
  const business = MATNOG_BUSINESS_DIRECTORY[0];
  const permitRecord = { ...payableRecord, type: "Renewal" as const };
  const permitDocument = applyPermitDocumentAction(
    permitRecord,
    undefined,
    "generate",
    createDefaultPermitDocumentFields(permitRecord),
  ).override;
  const active = synchronizeReleasedBusiness(business, permitRecord, permitDocument, "2026-09-23");
  assert.equal(active.status, "Active");
  assert.equal(active.permitNumber, permitDocument.documentNumber);
  const closed = synchronizeReleasedBusiness(
    business,
    { ...permitRecord, type: "Closure" },
    permitDocument,
    "2026-09-23",
  );
  assert.equal(closed.status, "Closed");
  assert.equal(closed.permitNumber, business.permitNumber);
});
