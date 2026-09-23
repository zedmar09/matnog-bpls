import { MATNOG_PERMIT_REGISTRY } from "../data/matnog-permit-registry";
import {
  createSeededPermitVerificationActivity,
  EMPTY_PERMIT_VERIFICATION_FILTERS,
  filterPermitVerificationActivity,
  resolveStaffPermitVerification,
  sortPermitVerificationActivity,
  summarizePermitVerificationActivity,
} from "./permit-verification-utils";
import assert from "node:assert/strict";
import test from "node:test";

test("staff verification resolves supported registry references", () => {
  const record = MATNOG_PERMIT_REGISTRY[0];
  for (const reference of [record.qrToken, record.documentNumber, record.applicationId]) {
    assert.equal(
      resolveStaffPermitVerification(MATNOG_PERMIT_REGISTRY, reference).record?.documentNumber,
      record.documentNumber,
    );
  }
  assert.equal(
    resolveStaffPermitVerification(MATNOG_PERMIT_REGISTRY, record.businessId).record?.businessId,
    record.businessId,
  );
  assert.equal(resolveStaffPermitVerification(MATNOG_PERMIT_REGISTRY, "unknown").outcome, "Not found");
});

test("verification activity provides production-like outcomes and daily summary", () => {
  const activity = createSeededPermitVerificationActivity(MATNOG_PERMIT_REGISTRY);
  const outcomes = new Set(activity.map((record) => record.outcome));
  assert.equal(activity.length, 42);
  assert.ok(outcomes.has("Verified"));
  assert.ok(outcomes.has("Not found"));
  assert.ok(outcomes.has("Suspended") || outcomes.has("Revoked"));
  assert.equal(summarizePermitVerificationActivity(activity).today, 18);
});

test("verification activity filters and sorts operational fields", () => {
  const activity = createSeededPermitVerificationActivity(MATNOG_PERMIT_REGISTRY);
  const failed = filterPermitVerificationActivity(activity, {
    ...EMPTY_PERMIT_VERIFICATION_FILTERS,
    outcome: "Not found",
  });
  assert.ok(failed.length > 0);
  assert.ok(failed.every((record) => record.outcome === "Not found"));
  const sorted = sortPermitVerificationActivity(activity, "checkedAt", "desc");
  assert.ok(sorted.length > 1);
  assert.ok(sorted[0].checkedAt >= sorted[sorted.length - 1].checkedAt);
});
