import { describe, it, expect } from "vitest";
import { nodeToConcept, exportOkfBundle, synthesizeIndex, parseConceptFile, splitConcepts, isReservedOkfName } from "./okf";
import type { GraphNode } from "./node";

function ev(id: string, text: string, extra: Record<string, unknown> = {}): GraphNode {
  return { id, type: "evidence_item", frontmatter: { text, proof_level: "Observed", status: "Accepted", ...extra }, body: "" };
}

describe("OKF export", () => {
  it("renders a concept doc with required `type` frontmatter (OKF §9)", () => {
    const out = nodeToConcept(ev("01J..E1", "speed is key"));
    expect(out.startsWith("---\n")).toBe(true);
    expect(out).toMatch(/^type: evidence_item/m);
    expect(out).toMatch(/^proof_level: Observed/m);
  });

  it("preserves unknown frontmatter keys (INV-PORT / OKF §4.1)", () => {
    const out = nodeToConcept(ev("01J..E1", "x", { custom_field: "kept" }));
    expect(out).toMatch(/custom_field: kept/);
  });

  it("serializes typed edges as the SN `edges` extension", () => {
    const n: GraphNode = {
      id: "01J..C1", type: "strategic_claim", frontmatter: { statement: "speed wins" },
      body: "",
    };
    n.frontmatter.edges = [{ to: "01J..E1", edge_type: "supports" }];
    const out = nodeToConcept(n);
    expect(out).toMatch(/edges:/);
    expect(out).toMatch(/edge_type: supports/);
  });

  it("synthesizes an index grouped by type", () => {
    const idx = synthesizeIndex([ev("01J..E1", "a"), ev("01J..E2", "b")], "My Case");
    expect(idx).toContain("## evidence_item (2)");
    expect(idx).toContain("My Case");
  });

  it("builds a full bundle with index + concepts + log", () => {
    const bundle = exportOkfBundle([ev("01J..E1", "a")], "## 2026-06-23\n- created E1", "Case");
    expect(bundle).toContain('okf_version: "0.1"');
    expect(bundle).toContain("# Case");
    expect(bundle).toContain("type: evidence_item");
    expect(bundle).toContain("Directory Update Log");
  });
});

describe("OKF import parsing", () => {
  it("parses a concept doc into type + frontmatter yaml + body", () => {
    const text = "---\ntype: evidence_item\nproof_level: Observed\ntitle: Speed\n---\n\nSpeed is key.\n";
    const c = parseConceptFile(text)!;
    expect(c.type).toBe("evidence_item");
    expect(c.frontmatterYaml).toContain("proof_level: Observed");
    expect(c.body.trim()).toBe("Speed is key.");
  });

  it("defaults to note when frontmatter is absent", () => {
    const c = parseConceptFile("just body text")!;
    expect(c.type).toBe("note");
    expect(c.body).toBe("just body text");
  });

  it("splits a concatenated bundle (round-trip) into multiple concepts", () => {
    const bundle = [
      "---\ntype: note\ntitle: A\n---\nbody-a",
      "---\ntype: evidence_item\ntitle: B\n---\nbody-b",
    ].join("\n\n");
    const concepts = splitConcepts(bundle);
    expect(concepts).toHaveLength(2);
    expect(concepts.map((c) => c.type)).toEqual(["note", "evidence_item"]);
  });

  it("detects reserved OKF filenames", () => {
    expect(isReservedOkfName("index.md")).toBe(true);
    expect(isReservedOkfName("log.md")).toBe(true);
    expect(isReservedOkfName("tables/orders.md")).toBe(false);
  });
});
