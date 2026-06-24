import { describe, it, expect } from "vitest";
import {
  fmString, fmList, fmBool, nodeTitle, nodeExcerpt, fmFilled, type GraphNode,
} from "./node";

function node(fm: Record<string, unknown>, body = "", type = "note"): GraphNode {
  return { id: "01J..XYZ", type, frontmatter: fm, body };
}

describe("node accessors", () => {
  it("reads a scalar string", () => {
    expect(fmString(node({ proof_level: "Observed" }), "proof_level")).toBe("Observed");
  });
  it("coerces number/bool to string", () => {
    expect(fmString(node({ pomos: 6 }), "pomos")).toBe("6");
    expect(fmString(node({ done: true }), "done")).toBe("true");
  });
  it("falls back when key missing", () => {
    expect(fmString(node({}), "nope", "—")).toBe("—");
    expect(fmString(node({}), "nope")).toBe("");
  });
  it("reads arrays defensively", () => {
    expect(fmList(node({ assumptions: ["01J..A1", "01J..A2"] }), "assumptions")).toEqual(["01J..A1", "01J..A2"]);
    expect(fmList(node({}), "assumptions")).toEqual([]);
    expect(fmList(node({ assumptions: "not-array" }), "assumptions")).toEqual([]);
  });
  it("reads bool flags", () => {
    expect(fmBool(node({ counterevidence_reviewed: true }), "counterevidence_reviewed")).toBe(true);
    expect(fmBool(node({ counterevidence_reviewed: "true" }), "counterevidence_reviewed")).toBe(true);
    expect(fmBool(node({}), "x")).toBe(false);
  });
  it("derives title from frontmatter, then body, then id", () => {
    expect(nodeTitle(node({ title: "T" }))).toBe("T");
    expect(nodeTitle(node({}, "# Heading\nrest"))).toBe("Heading");
    expect(nodeTitle(node({}))).toBe("01J..XYZ");
  });
  it("builds an excerpt preferring typed text fields", () => {
    expect(nodeExcerpt(node({ text: "speed is key" }))).toBe("speed is key");
    expect(nodeExcerpt(node({ statement: "x".repeat(200) }))).toHaveLength(121); // 120 + …
  });
  it("detects filled vs empty fields", () => {
    expect(fmFilled(node({ assumptions: ["a"] }), "assumptions")).toBe(true);
    expect(fmFilled(node({ assumptions: [] }), "assumptions")).toBe(false);
    expect(fmFilled(node({ kill_criteria: "x<1%" }), "kill_criteria")).toBe(true);
    expect(fmFilled(node({ owner: null }), "owner")).toBe(false);
  });
});
