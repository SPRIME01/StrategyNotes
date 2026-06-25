// Block-as-node helpers (PRD-002: every outline item can be a first-class
// node). ADAPTER-NEUTRAL — pure functions over the markdown string + a cursor
// position. The editor orchestrates: it mints a node (via the API), then
// transcludes it in-place as `((ULID))`. The reference stays in canonical
// markdown, so it round-trips and the backend's body_refs give the block
// backlinks + an address. No hidden editor model.

const ULID = "[0-9A-HJKMNP-TV-Z]{26}";

/** A `((ULID))` transclusion reference for a node id. */
export function blockRef(id: string): string {
  return `((${id}))`;
}

/** True if a string is already a `((ULID))` block reference. */
export function isBlockRef(s: string): boolean {
  return new RegExp(`^\\(\\(${ULID}\\)\\)$`).test(s.trim());
}

export interface LineSpan {
  start: number;
  end: number;
  marker: string; // leading list/quote/heading marker, e.g. "- " or "> "
  content: string; // the block text without the marker
}

/** The line/block containing `cursorPos`. */
export function blockAtCursor(text: string, cursorPos: number): LineSpan {
  const start = text.lastIndexOf("\n", Math.max(0, cursorPos - 1)) + 1;
  const nl = text.indexOf("\n", cursorPos);
  const end = nl === -1 ? text.length : nl;
  const line = text.slice(start, end);
  const m = line.match(/^(\s*(?:[-*+] |\d+\. |>+ |#+ )?)([\s\S]*)$/);
  return { start, end, marker: m?.[1] ?? "", content: (m?.[2] ?? "").trim() };
}

/**
 * Replace the block at `cursorPos` with a `((nodeId))` transclusion, keeping
 * the list/quote marker. Returns null if the block has no content (nothing to
 * promote) or is already a bare block ref.
 */
export function promoteBlockEdit(text: string, cursorPos: number, nodeId: string): string | null {
  const blk = blockAtCursor(text, cursorPos);
  if (!blk.content || isBlockRef(blk.content)) return null;
  const newLine = blk.marker + blockRef(nodeId);
  return text.slice(0, blk.start) + newLine + text.slice(blk.end);
}

/** Derive a node title from a block's content (first few words). */
export function deriveBlockTitle(text: string, cursorPos: number, maxWords = 6): string {
  const content = blockAtCursor(text, cursorPos).content;
  const words = content.replace(/^#+\s*/, "").split(/\s+/).filter(Boolean);
  return words.slice(0, maxWords).join(" ") || "Block";
}
