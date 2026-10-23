import { expect, it } from "vitest";
import { createDeduper } from "./dedupe";

it("ignores the same code within the window", () => {
  const accept = createDeduper(1500);
  expect(accept("A", 0)).toBe(true);
  expect(accept("A", 1000)).toBe(false);
  expect(accept("B", 1100)).toBe(true);
  expect(accept("A", 2600)).toBe(true);
});
