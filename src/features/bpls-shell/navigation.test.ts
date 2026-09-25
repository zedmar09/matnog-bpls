import { HOME_ITEM, NAV_SECTIONS } from "./navigation";
import assert from "node:assert/strict";
import test from "node:test";

test("home item points to dashboard", () => {
  assert.equal(HOME_ITEM.label, "Home");
  assert.equal(HOME_ITEM.path, "/");
});

test("navigation sections contain the core BPLS modules", () => {
  const allLabels = NAV_SECTIONS.flatMap((section) => section.items.map((item) => item.label));
  assert.deepEqual(allLabels, [
    "Applications",
    "Businesses",
    "Assessment",
    "Payments",
    "Reviews",
    "Permits",
    "Compliance",
  ]);
});

test("navigation destinations are unique and use internal absolute paths", () => {
  const destinations = NAV_SECTIONS.flatMap((section) =>
    section.items.flatMap((item) => item.children?.map((child) => child.path) ?? [item.path].filter(Boolean)),
  );

  for (const path of destinations) {
    assert.match(path!, /^\//);
  }

  assert.equal(new Set(destinations).size, destinations.length);
});
