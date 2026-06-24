import { describe, it, expect } from "vitest";
import { tokenizeMarkdown, isResolved } from "./tokens";

describe("tokenizeMarkdown", () => {
  it("captures #tags with their offsets (excluding leading space)", () => {
    const t = tokenizeMarkdown("foo #evidence bar");
    const tag = t.find((x) => x.kind === "tag")!;
    expect(tag).toMatchObject({ kind: "tag", name: "evidence", start: 4, end: 13 });
  });

  it("captures [[wikilinks]]", () => {
    const t = tokenizeMarkdown("see [[My Note]] now");
    const wl = t.find((x) => x.kind === "wikilink")!;
    expect(wl).toMatchObject({ kind: "wikilink", title: "My Note" });
    expect(wl.end - wl.start).toBe("[[My Note]]".length);
  });

  it("captures ((ULID)) block refs", () => {
    const id = "01J" + "0".repeat(23);
    const t = tokenizeMarkdown(`ref ((${id})) end`);
    const r = t.find((x) => x.kind === "ref")!;
    expect(r).toMatchObject({ kind: "ref", id });
  });

  it("captures > [!tip] callout fences with variant + title", () => {
    const t = tokenizeMarkdown("> [!tip] Working with blocks");
    const c = t.find((x) => x.kind === "callout")!;
    expect(c).toMatchObject({ kind: "callout", variant: "tip", title: "Working with blocks" });
  });

  it("parses warn + info callout variants case-insensitively", () => {
    const t = tokenizeMarkdown("> [!WARN] x\n> [!INFO]");
    expect(t.filter((x) => x.kind === "callout").map((x) => (x as { variant: string }).variant)).toEqual(["warn", "info"]);
  });

  it("returns tokens sorted by position", () => {
    const t = tokenizeMarkdown("#a [[b]] #c");
    const starts = t.map((x) => x.start);
    expect([...starts].sort((a, b) => a - b)).toEqual(starts);
  });

  it("does not fabricate tokens for plain text", () => {
    expect(tokenizeMarkdown("just some words")).toEqual([]);
  });
});

describe("isResolved", () => {
  it("matches known titles case-insensitively", () => {
    expect(isResolved("My Note", ["my note", "other"])).toBe(true);
    expect(isResolved("Missing", ["my note"])).toBe(false);
  });
});
