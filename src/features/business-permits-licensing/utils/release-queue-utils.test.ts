import { MATNOG_APPLICATION_DIRECTORY } from "../data/matnog-application-directory";
import { MATNOG_SIGNATURE_DOCUMENTS, MATNOG_SIGNATURE_RELEASES } from "../data/matnog-signature-workflow";
import {
  createReleaseQueue,
  EMPTY_RELEASE_QUEUE_FILTERS,
  filterReleaseQueue,
  sortReleaseQueue,
  summarizeReleaseQueue,
} from "./release-queue-utils";
import assert from "node:assert/strict";
import test from "node:test";

test("release queue contains only signed, unreleased controlled documents", () => {
  const queue = createReleaseQueue(MATNOG_APPLICATION_DIRECTORY, MATNOG_SIGNATURE_DOCUMENTS, MATNOG_SIGNATURE_RELEASES);
  assert.ok(queue.length >= 7);
  assert.ok(queue.every((record) => record.status === "Ready to issue"));
  assert.ok(queue.every((record) => record.currentStage === "Ready for release"));
  assert.ok(queue.every((record) => record.readinessComplete <= record.readinessTotal));
});

test("finalized releases leave the release queue", () => {
  const signed = MATNOG_SIGNATURE_RELEASES.find((release) => release.signatureStatus === "Signed");
  assert.ok(signed);
  const releases = MATNOG_SIGNATURE_RELEASES.map((release) =>
    release.applicationId === signed.applicationId ? { ...release, releaseStatus: "Released" as const } : release,
  );
  const queue = createReleaseQueue(MATNOG_APPLICATION_DIRECTORY, MATNOG_SIGNATURE_DOCUMENTS, releases);
  assert.equal(
    queue.some((record) => record.id === signed.applicationId),
    false,
  );
});

test("release queue filters, sorts, and summarizes readiness", () => {
  const queue = createReleaseQueue(MATNOG_APPLICATION_DIRECTORY, MATNOG_SIGNATURE_DOCUMENTS, MATNOG_SIGNATURE_RELEASES);
  const ready = filterReleaseQueue(queue, { ...EMPTY_RELEASE_QUEUE_FILTERS, readiness: "Ready to finalize" });
  assert.ok(ready.length > 0);
  assert.ok(ready.every((record) => record.acknowledgmentConfirmed));
  const sorted = sortReleaseQueue(queue, "daysWaiting", "desc");
  assert.ok(sorted.length > 0);
  assert.ok(sorted[0].daysWaiting >= sorted[sorted.length - 1].daysWaiting);
  const summary = summarizeReleaseQueue(queue);
  assert.equal(summary.total, queue.length);
  assert.equal(summary.ready, ready.length);
});
