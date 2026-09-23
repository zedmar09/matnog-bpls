import { MATNOG_BUSINESS_DIRECTORY } from "../data/matnog-business-directory";
import type { ApplicationWizardValues } from "../types/application-wizard";
import {
  applicationValuesForBusiness,
  createApplicationRecord,
  requirementsFor,
  validateApplicationWizard,
} from "./application-wizard-utils";
import assert from "node:assert/strict";
import test from "node:test";

test("application requirements adapt to transaction and risk", () => {
  const business = MATNOG_BUSINESS_DIRECTORY[0];
  assert.ok(requirementsFor("New", business).length > requirementsFor("Closure", business).length);
});

test("wizard validation blocks missing transaction and evidence fields", () => {
  const business = MATNOG_BUSINESS_DIRECTORY[0];
  const values = applicationValuesForBusiness("Amendment", business);
  const errors = validateApplicationWizard(values, requirementsFor("Amendment", business));
  assert.ok(errors.amendmentType);
  assert.ok(errors.requirements);
  assert.ok(errors.declarationAccepted);
});

test("submitted application is normalized for the masterlist", () => {
  const business = MATNOG_BUSINESS_DIRECTORY[0];
  const requirements = requirementsFor("Renewal", business);
  const values: ApplicationWizardValues = {
    ...applicationValuesForBusiness("Renewal", business),
    requirements: Object.fromEntries(requirements.map((item) => [item.id, "reuse"])),
    declarationAccepted: true,
  };
  const record = createApplicationRecord(values, business, 1, "submit");
  assert.equal(record.status, "Submitted");
  assert.equal(record.businessId, business.id);
  assert.equal(record.requirementsComplete, record.requirementsTotal);
});
