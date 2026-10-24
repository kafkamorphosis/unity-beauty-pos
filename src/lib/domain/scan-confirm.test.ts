import { describe, expect, it } from "vitest";
import { createScanConfirmer, isPlausibleBarcode } from "./scan-confirm";

describe("isPlausibleBarcode", () => {
  it("checks the EAN/UPC check digit", () => {
    expect(isPlausibleBarcode("8801234567893")).toBe(true); // EAN-13
    expect(isPlausibleBarcode("8801234567890")).toBe(false);
    expect(isPlausibleBarcode("96385074")).toBe(true); // EAN-8
    expect(isPlausibleBarcode("96385075")).toBe(false);
    expect(isPlausibleBarcode("036000291452")).toBe(true); // UPC-A
  });
  it("lets other codes through when they look like a code", () => {
    expect(isPlausibleBarcode("ABC-123")).toBe(true);
    expect(isPlausibleBarcode("12")).toBe(false);
    expect(isPlausibleBarcode("")).toBe(false);
  });
});

describe("createScanConfirmer", () => {
  it("accepts a code only once two frames in a row agree", () => {
    const confirm = createScanConfirmer({ frames: 2, repeatMs: 1500 });
    expect(confirm("8801234567893", 0)).toBe(false);
    expect(confirm("8801234567893", 125)).toBe(true);
  });
  it("a one-frame misread never gets through", () => {
    const confirm = createScanConfirmer({ frames: 2, repeatMs: 1500 });
    expect(confirm("8801234567893", 0)).toBe(false);
    expect(confirm("96385074", 125)).toBe(false); // phantom read in between
    expect(confirm("8801234567893", 250)).toBe(false);
    expect(confirm("8801234567893", 375)).toBe(true);
  });
  it("ignores codes with a wrong check digit", () => {
    const confirm = createScanConfirmer({ frames: 2, repeatMs: 1500 });
    expect(confirm("8801234567890", 0)).toBe(false);
    expect(confirm("8801234567890", 125)).toBe(false);
  });
  it("does not repeat while the camera stays on the same code, but does after a pause", () => {
    const confirm = createScanConfirmer({ frames: 2, repeatMs: 1500 });
    confirm("8801234567893", 0);
    expect(confirm("8801234567893", 125)).toBe(true);
    expect(confirm("8801234567893", 250)).toBe(false);
    expect(confirm("8801234567893", 1000)).toBe(false); // still pointed at it
    expect(confirm("8801234567893", 2600)).toBe(false); // first frame after the pause
    expect(confirm("8801234567893", 2725)).toBe(true);
  });
  it("a different product is accepted straight after", () => {
    const confirm = createScanConfirmer({ frames: 2, repeatMs: 1500 });
    confirm("8801234567893", 0);
    confirm("8801234567893", 125);
    expect(confirm("96385074", 250)).toBe(false);
    expect(confirm("96385074", 375)).toBe(true);
  });
});
