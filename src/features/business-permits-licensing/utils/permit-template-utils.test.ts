import { MATNOG_PERMIT_TEMPLATES } from "../data/matnog-permit-templates";
import {
  createPermitTemplateDraftVersion,
  EMPTY_PERMIT_TEMPLATE_FILTERS,
  filterPermitTemplates,
  publishPermitTemplate,
  sortPermitTemplates,
  summarizePermitTemplates,
  validatePermitTemplateForm,
} from "./permit-template-utils";
import assert from "node:assert/strict";
import test from "node:test";

test("seeded templates keep one active version per document type and purpose", () => {
  const active = MATNOG_PERMIT_TEMPLATES.filter((record) => record.status === "Active");
  assert.equal(new Set(active.map((record) => `${record.documentType}:${record.purpose}`)).size, active.length);
  assert.equal(summarizePermitTemplates(MATNOG_PERMIT_TEMPLATES).total, 12);
});

test("draft versioning and publishing retire the previous active template", () => {
  const active = MATNOG_PERMIT_TEMPLATES.find((record) => record.status === "Active" && record.purpose === "Standard");
  assert.ok(active);
  const drafted = createPermitTemplateDraftVersion(MATNOG_PERMIT_TEMPLATES, active.id);
  const draft = drafted.find((record) => record.status === "Draft" && record.version > active.version);
  assert.ok(draft);
  const published = publishPermitTemplate(drafted, draft.id);
  assert.equal(published.find((record) => record.id === draft.id)?.status, "Active");
  assert.equal(published.find((record) => record.id === active.id)?.status, "Archived");
});

test("template validation, filtering, and sorting enforce production controls", () => {
  const active = MATNOG_PERMIT_TEMPLATES.find((record) => record.status === "Active");
  assert.ok(active);
  assert.equal(validatePermitTemplateForm({ ...active, changeNotes: "Valid controlled template configuration." }), "");
  assert.ok(validatePermitTemplateForm({ ...active, numberingPattern: "BP-123" }));
  const drafts = filterPermitTemplates(MATNOG_PERMIT_TEMPLATES, { ...EMPTY_PERMIT_TEMPLATE_FILTERS, status: "Draft" });
  assert.equal(drafts.length, 3);
  const sorted = sortPermitTemplates(MATNOG_PERMIT_TEMPLATES, "usageCount", "desc");
  assert.ok(sorted[0].usageCount >= sorted[sorted.length - 1].usageCount);
});
