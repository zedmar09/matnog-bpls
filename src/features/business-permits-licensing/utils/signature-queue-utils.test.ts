import { MATNOG_APPLICATION_DIRECTORY } from "../data/matnog-application-directory";
import { MATNOG_SIGNATURE_DOCUMENTS, MATNOG_SIGNATURE_RELEASES } from "../data/matnog-signature-workflow";
import {
  createSignatureQueue,
  EMPTY_SIGNATURE_QUEUE_FILTERS,
  filterSignatureQueue,
  mergeSignatureReleases,
  sortSignatureQueue,
  summarizeSignatureQueue,
} from "./signature-queue-utils";
import assert from "node:assert/strict";
import test from "node:test";

test("seeded signature records expose every operational state", () => {
  const queue = createSignatureQueue(
    MATNOG_APPLICATION_DIRECTORY,
    MATNOG_SIGNATURE_DOCUMENTS,
    MATNOG_SIGNATURE_RELEASES,
  );
  assert.equal(queue.length, 23);
  assert.deepEqual(
    new Set(queue.map((record) => record.signatureStatus)),
    new Set(["Pending", "Sent", "Signed", "Declined", "Failed"]),
  );
  assert.ok(queue.every((record) => record.documentNumber.startsWith("MATNOG-")));
  assert.ok(queue.every((record) => record.documentVersion >= 1));
});

test("released documents leave the signature queue while local workflow state wins", () => {
  const seeded = MATNOG_SIGNATURE_RELEASES[0];
  const released = { ...seeded, releaseStatus: "Released" as const, signatureStatus: "Signed" as const };
  const releases = mergeSignatureReleases(MATNOG_SIGNATURE_RELEASES, [released]);
  const queue = createSignatureQueue(MATNOG_APPLICATION_DIRECTORY, MATNOG_SIGNATURE_DOCUMENTS, releases);
  assert.equal(
    queue.some((record) => record.id === released.applicationId),
    false,
  );
});

test("signature filtering, sorting, and summaries cover operational fields", () => {
  const queue = createSignatureQueue(
    MATNOG_APPLICATION_DIRECTORY,
    MATNOG_SIGNATURE_DOCUMENTS,
    MATNOG_SIGNATURE_RELEASES,
  );
  const failed = filterSignatureQueue(queue, { ...EMPTY_SIGNATURE_QUEUE_FILTERS, signatureStatus: "Failed" });
  assert.ok(failed.length > 0);
  assert.ok(failed.every((record) => record.signatureStatus === "Failed"));
  const sorted = sortSignatureQueue(queue, "daysInStage", "desc");
  assert.ok(sorted.length > 0);
  assert.ok(sorted[0].daysInStage >= sorted[sorted.length - 1].daysInStage);
  const summary = summarizeSignatureQueue(queue);
  assert.equal(summary.total, queue.length);
  assert.equal(
    summary.exceptions,
    queue.filter((record) => ["Declined", "Failed"].includes(record.signatureStatus)).length,
  );
});
