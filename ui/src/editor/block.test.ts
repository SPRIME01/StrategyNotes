import { describe, it, expect } from "vitest";
import { blockAtCursor, promoteBlockEdit, deriveBlockTitle, blockRef, isBlockRef } from "./block";

describe("block-as-node helpers", () => {
  it("locates the block at the cursor with its marker + content", () => {
    const text = "intro\n- ship onboarding\n- next";
    const blk = blockAtCursor(text, 9); // inside "ship onboarding"
    expect(blk.marker).toBe("- ");
    expect(blk.content).toBe("ship onboarding");
  });

  it("deriveBlockTitle takes the first words", () => {
    const text = "- Ship the one day onboarding flow now";
    expect(deriveBlockTitle(text, 5)).toBe("Ship the one day onboarding flow"); // 6 words
  });

  it("promoteBlockEdit replaces the block with ((ULID)), keeping the marker", () => {
    const text = "intro\n- ship onboarding\n- next";
    const id = "01J" + "0".repeat(23);
    const out = promoteBlockEdit(text, 9, id);
    expect(out).toBe(`intro\n- ((${id}))\n- next`);
  });

  it("returns null when the block is empty", () => {
    expect(promoteBlockEdit("- \nrest", 1, "01J" + "0".repeat(23))).toBeNull();
  });

  it("returns null when the block is already a bare ((ref))", () => {
    const id = "01J" + "0".repeat(23);
    expect(promoteBlockEdit(`- ((${id}))`, 3, id)).toBeNull();
  });

  it("blockRef / isBlockRef round-trip", () => {
    const id = "01J" + "0".repeat(23);
    expect(blockRef(id)).toBe(`((${id}))`);
    expect(isBlockRef(blockRef(id))).toBe(true);
    expect(isBlockRef("not a ref")).toBe(false);
  });

  it("handles a quoted block marker", () => {
    const out = promoteBlockEdit("> some quote", 3, "01J" + "0".repeat(23));
    expect(out).toMatch(/^> \(\([0-9A-Z]{26}\)\)$/);
  });
});
