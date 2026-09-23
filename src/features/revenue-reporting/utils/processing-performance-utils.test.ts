import { MATNOG_APPLICATION_DIRECTORY } from "@/features/business-permits-licensing/data/matnog-application-directory";

import {
  calendarDays,
  classifyProcessingSla,
  EMPTY_PROCESSING_FILTERS,
  filterProcessingPerformance,
  processingPerformanceToCsv,
  projectProcessingPerformance,
  summarizeProcessingPerformance,
} from "./processing-performance-utils";
import assert from "node:assert/strict";
import test from "node:test";

test("calculates calendar-day durations without time-of-day drift", () => {
  assert.equal(calendarDays("2026-09-20 23:00", "2026-09-23"), 3);
});

test("classifies open and terminal SLA outcomes", () => {
  const source = MATNOG_APPLICATION_DIRECTORY[0];
  assert.equal(classifyProcessingSla({ ...source, status: "Under review", targetRelease: "2026-09-22" }), "Overdue");
  assert.equal(classifyProcessingSla({ ...source, status: "Under review", targetRelease: "2026-09-25" }), "Due soon");
  assert.equal(
    classifyProcessingSla({ ...source, status: "Issued", targetRelease: "2026-09-20", updatedAt: "2026-09-19 10:00" }),
    "Completed on time",
  );
});

test("projects and filters the complete performance register", () => {
  const projected = projectProcessingPerformance(MATNOG_APPLICATION_DIRECTORY);
  assert.equal(projected.length, 184);
  const overdue = filterProcessingPerformance(projected, { ...EMPTY_PROCESSING_FILTERS, slaState: "Overdue" });
  assert.ok(overdue.length > 0);
  assert.ok(overdue.every((row) => row.slaState === "Overdue" && !row.terminal));
});

test("summaries and export use the filtered result set", () => {
  const projected = projectProcessingPerformance(MATNOG_APPLICATION_DIRECTORY);
  const summary = summarizeProcessingPerformance(projected);
  assert.equal(summary.total, 184);
  assert.ok(summary.completed > 0);
  assert.ok(summary.averageTurnaround > 0);
  const csv = processingPerformanceToCsv(projected.slice(0, 1));
  assert.match(csv, /Elapsed days/);
  assert.match(csv, /APP-2026-/);
});
