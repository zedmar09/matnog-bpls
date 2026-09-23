import { MATNOG_APPLICATION_DIRECTORY } from "../data/matnog-application-directory";
import type { MayorReviewOverride } from "../types/application-detail";
import {
  createFinalApprovalQueue,
  EMPTY_FINAL_APPROVAL_FILTERS,
  filterFinalApprovalQueue,
  sortFinalApprovalQueue,
  summarizeFinalApprovalQueue,
} from "./final-approval-utils";
import assert from "node:assert/strict";
import test from "node:test";

test("seeded final approval cases satisfy every decision gate", () => {
  const queue = createFinalApprovalQueue(MATNOG_APPLICATION_DIRECTORY, []);

  assert.equal(queue.length, 23);
  assert.equal(
    queue.every((record) => record.paymentStatus === "Paid"),
    true,
  );
  assert.equal(
    queue.every((record) => record.requirementsComplete === record.requirementsTotal),
    true,
  );
  assert.equal(
    queue.every((record) => record.assignedOfficer === "Roberto P. Hababag"),
    true,
  );
  assert.equal(summarizeFinalApprovalQueue(queue).total, 23);
});

test("deferred decisions remain visible while approved and returned cases leave the queue", () => {
  const record = createFinalApprovalQueue(MATNOG_APPLICATION_DIRECTORY, [])[0];
  if (!record) throw new Error("Expected final approval fixtures.");
  const base: MayorReviewOverride = {
    applicationId: record.id,
    sourceStatus: record.status,
    status: "In review",
    decisionReference: `MAY-2026-${record.id.slice(-5)}`,
    decisionDate: "2026-09-23",
    effectiveFrom: "2026-09-23",
    effectiveUntil: "2026-12-31",
    permitClassification: "Renewal business permit",
    returnDestination: "BPLO completeness review",
    conditions: "Subject to continuing compliance.",
    remarks: "Decision deferred pending executive validation of the submitted endorsement.",
    actor: "Roberto P. Hababag",
    updatedAt: "2026-09-23 21:00",
    events: [],
  };

  const deferred = createFinalApprovalQueue([record], [base]);
  const approved = createFinalApprovalQueue([record], [{ ...base, status: "Approved" }]);
  const returned = createFinalApprovalQueue([record], [{ ...base, status: "For correction" }]);

  assert.equal(deferred[0]?.decisionState, "Deferred");
  assert.equal(approved.length, 0);
  assert.equal(returned.length, 0);
});

test("final approval filtering and sorting cover operational fields", () => {
  const queue = createFinalApprovalQueue(MATNOG_APPLICATION_DIRECTORY, []);
  const target = queue[0];
  if (!target) throw new Error("Expected final approval fixtures.");

  const filtered = filterFinalApprovalQueue(queue, {
    ...EMPTY_FINAL_APPROVAL_FILTERS,
    search: target.ownerName,
    type: target.type,
    riskLevel: target.riskLevel,
  });
  const sorted = sortFinalApprovalQueue(queue, "assessmentAmount", "desc");

  assert.equal(
    filtered.some((record) => record.id === target.id),
    true,
  );
  assert.equal(sorted[0]?.assessmentAmount >= (sorted.at(-1)?.assessmentAmount ?? 0), true);
});
