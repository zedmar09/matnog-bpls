import { MATNOG_BUSINESS_DIRECTORY } from "../data/matnog-business-directory";
import { EMPTY_BUSINESS_REGISTRATION } from "../types/business-registration";
import {
  businessRecordToRegistrationValues,
  createRegisteredBusiness,
  mergeBusinessRecords,
  updateBusinessRecord,
  upsertBusinessRecord,
  validateBusinessRegistration,
} from "./business-registration-utils";
import assert from "node:assert/strict";
import test from "node:test";

const complete = {
  ...EMPTY_BUSINESS_REGISTRATION,
  registeredName: "Matnog Gateway Trading Enterprise",
  tradeName: "Matnog Gateway Trading",
  registrationNumber: "DTI-2026-123456",
  registrationDate: "2026-09-23",
  tin: "123-456-789-000",
  ownerName: "Maria D. Santos",
  contactNumber: "09171234567",
  email: "maria@example.com",
  activityCategory: "Retail and wholesale" as const,
  primaryActivity: "Retail of general merchandise",
  psicCode: "47190",
  barangay: "Pawa",
  street: "National Road",
  employeeCount: "4",
  maleEmployees: "2",
  femaleEmployees: "2",
  capitalization: "500000",
  grossSales: "800000",
  startOfOperations: "2026-09-01",
  declarationAccepted: true,
};

test("registration validation identifies incomplete required fields", () => {
  const errors = validateBusinessRegistration(EMPTY_BUSINESS_REGISTRATION);
  assert.ok(Object.keys(errors).length >= 12);
  assert.equal(errors.registeredName, "Enter the registered business name.");
  assert.equal(errors.declarationAccepted, "Confirm the registration declaration.");
});

test("registration validation accepts a complete business", () => {
  assert.deepEqual(validateBusinessRegistration(complete), {});
});

test("registered business is normalized for the masterlist", () => {
  const record = createRegisteredBusiness(complete, 129);
  assert.equal(record.id, `BIZ-${new Date().getFullYear()}-0129`);
  assert.equal(record.status, "For application");
  assert.equal(record.permitNumber, "Not issued");
  assert.equal(record.address, "National Road, Barangay Pawa, Matnog, Sorsogon");
});

test("editing preserves business and permit identity", () => {
  const source = MATNOG_BUSINESS_DIRECTORY[0];
  const values = businessRecordToRegistrationValues(source);
  const updated = updateBusinessRecord(source, {
    ...values,
    tradeName: "Updated Trade Name",
    declarationAccepted: true,
  });
  assert.equal(updated.id, source.id);
  assert.equal(updated.permitNumber, source.permitNumber);
  assert.equal(updated.status, source.status);
  assert.equal(updated.tradeName, "Updated Trade Name");
});

test("overrides replace seeded records without duplication", () => {
  const source = MATNOG_BUSINESS_DIRECTORY[0];
  const override = { ...source, tradeName: "Updated Trade Name" };
  const stored = upsertBusinessRecord([], override);
  const merged = mergeBusinessRecords(MATNOG_BUSINESS_DIRECTORY, stored);
  assert.equal(merged.filter((record) => record.id === source.id).length, 1);
  assert.equal(merged.find((record) => record.id === source.id)?.tradeName, "Updated Trade Name");
});
