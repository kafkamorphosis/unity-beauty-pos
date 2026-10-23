import { describe, expect, it } from "vitest";
import { createScanBurstDetector } from "./scan-burst";

function typeAll(d: ReturnType<typeof createScanBurstDetector>, keys: string[], gap: number, start = 0) {
  return keys.map((k, i) => d.handleKey(k, start + i * gap));
}

describe("createScanBurstDetector", () => {
  it("recognises a fast burst ending in Enter as a scan", () => {
    const d = createScanBurstDetector();
    const results = typeAll(d, [..."8801234567890", "Enter"], 10);
    expect(results[0]).toEqual({ preventDefault: false, burstStart: true, scan: null });
    expect(results.slice(1, 13).every((r) => r.preventDefault)).toBe(true);
    expect(results[13]).toEqual({ preventDefault: true, burstStart: false, scan: "8801234567890" });
  });
  it("ignores human typing", () => {
    const d = createScanBurstDetector();
    const results = typeAll(d, [..."abcd", "Enter"], 150);
    expect(results.every((r) => !r.preventDefault && r.scan === null)).toBe(true);
  });
  it("requires minLength characters", () => {
    const d = createScanBurstDetector();
    expect(typeAll(d, [..."123", "Enter"], 10).at(-1)!.scan).toBeNull();
  });
  it("resets the buffer after a pause", () => {
    const d = createScanBurstDetector();
    typeAll(d, [..."1234"], 10);
    expect(d.handleKey("x", 530).burstStart).toBe(true);
  });
  it("ignores Shift inside a burst", () => {
    const d = createScanBurstDetector();
    expect(typeAll(d, ["1", "2", "Shift", "3", "4", "Enter"], 10).at(-1)!.scan).toBe("1234");
  });
});
