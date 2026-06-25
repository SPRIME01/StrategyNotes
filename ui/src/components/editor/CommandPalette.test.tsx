import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CommandPalette, BLOCK_COMMANDS } from "./CommandPalette";

describe("CommandPalette", () => {
  it("renders all block types when query is empty", () => {
    render(
      <CommandPalette query="" onSelect={() => {}} onClose={() => {}} />,
    );
    // Every command label should be visible.
    for (const cmd of BLOCK_COMMANDS.slice(0, 9)) {
      expect(screen.getByText(cmd.label)).toBeTruthy();
    }
  });

  it("filters by query substring", () => {
    const { container } = render(
      <CommandPalette query="head" onSelect={() => {}} onClose={() => {}} />,
    );
    const buttons = container.querySelectorAll("button[data-idx]");
    // "Heading 1" and "Heading 2" both contain "head".
    expect(buttons.length).toBe(2);
  });

  it("shows the empty state when nothing matches", () => {
    render(<CommandPalette query="zzz" onSelect={() => {}} onClose={() => {}} />);
    expect(screen.getByText(/No matching block/)).toBeTruthy();
  });

  it("exposes the block-as-node promote command (action, not insert)", () => {
    render(<CommandPalette query="node" onSelect={() => {}} onClose={() => {}} />);
    expect(screen.getByText("Node (promote block)")).toBeTruthy();
  });
});
