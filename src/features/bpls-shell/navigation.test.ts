import { BPLS_NAVIGATION } from "./navigation";
import assert from "node:assert/strict";
import test from "node:test";

test("BPLS navigation contains the approved top-level modules", () => {
  assert.deepEqual(
    BPLS_NAVIGATION.map((item) => item.label),
    ["Dashboard", "Applications", "Businesses", "Reviews", "Payments", "Permits", "Reports", "Administration"],
  );
});

test("navigation destinations are unique and use internal absolute paths", () => {
  const destinations = BPLS_NAVIGATION.flatMap((item) => [
    item.href,
    ...(item.children?.map((child) => child.href) ?? []),
  ]);

  for (const href of destinations) {
    assert.match(href, /^\//);
  }

  const submenuDestinations = BPLS_NAVIGATION.flatMap((item) => item.children?.map((child) => child.href) ?? []);
  assert.equal(new Set(submenuDestinations).size, submenuDestinations.length);
});
