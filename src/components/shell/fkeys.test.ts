import { describe, expect, it } from "vitest";
import { fKeyRoute, F_KEYS } from "./fkeys";

describe("fKeyRoute", () => {
  it("maps F1–F4 to Kassa, Ombor, Buyurtmalar, Tekpe", () => {
    expect(fKeyRoute("F1")).toBe("/");
    expect(fKeyRoute("F2")).toBe("/ombor");
    expect(fKeyRoute("F3")).toBe("/buyurtmalar");
    expect(fKeyRoute("F4")).toBe("/tekpe");
  });
  it("ignores other keys", () => {
    expect(fKeyRoute("F9")).toBeNull();
    expect(fKeyRoute("a")).toBeNull();
  });
  it("labels each page with its key", () => {
    expect(F_KEYS["/ombor"]).toBe("F2");
  });
});
