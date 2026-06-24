// Neutral markdown token model — the "projection" of canonical markdown into
// the things StrategyNotes renders as affordances: #tags, [[wikilinks]],
// ((ULID)) block refs, and > [!tip] callouts.
//
// This is ADAPTER-NEUTRAL: CodeMirror consumes it to build decorations, but a
// textarea/ProseMirror adapter or a non-editor consumer (note list, backlinks)
// could consume it too. It owns no editor state and no CodeMirror. It parses
// the same plain-markdown source that is saved to the vault — there is no
// hidden editor-only document model.
//
// Backend parity: these rules mirror core's body-ref semantics (tags, [[ ]],
// (( ))). Edges/type/status are NOT parsed here — they live in frontmatter and
// are owned by core + the gate-safe API.

export type CalloutVariant = "tip" | "warn" | "info";

export type Token =
  | { kind: "tag"; start: number; end: number; name: string }
  | { kind: "wikilink"; start: number; end: number; title: string }
  | { kind: "ref"; start: number; end: number; id: string }
  | { kind: "callout"; start: number; end: number; variant: CalloutVariant; title?: string };

const ULID = "[0-9A-HJKMNP-TV-Z]{26}";

/** Tokenize markdown into renderable affordance ranges (char offsets). */
export function tokenizeMarkdown(text: string): Token[] {
  const out: Token[] = [];

  // #tag — word-boundary preceded; decoration covers only `#name`.
  for (const m of text.matchAll(/(?:^|[\s(])#([\w-]+)/g)) {
    const name = m[1];
    const hashAt = (m.index ?? 0) + m[0].length - name.length - 1;
    out.push({ kind: "tag", start: hashAt, end: hashAt + name.length + 1, name });
  }
  // [[wikilink]]
  for (const m of text.matchAll(/\[\[([^\]\n]+)\]\]/g)) {
    out.push({ kind: "wikilink", start: m.index ?? 0, end: (m.index ?? 0) + m[0].length, title: m[1].trim() });
  }
  // ((ULID)) block reference
  for (const m of text.matchAll(new RegExp(`\\(\\((${ULID})\\)\\)`, "g"))) {
    out.push({ kind: "ref", start: m.index ?? 0, end: (m.index ?? 0) + m[0].length, id: m[1] });
  }
  // > [!tip|warn|info] title  (callout fence)
  for (const m of text.matchAll(/^>\s*\[!(tip|warn|info)\]\s*(.*)$/gim)) {
    const variant = m[1].toLowerCase() as CalloutVariant;
    out.push({
      kind: "callout",
      start: m.index ?? 0,
      end: (m.index ?? 0) + m[0].length,
      variant,
      title: m[2].trim() || undefined,
    });
  }
  return out.sort((a, b) => a.start - b.start);
}

/** A wikilink is "resolved" if a note with that title is known to the graph. */
export function isResolved(title: string, knownTitles: string[]): boolean {
  const t = title.toLowerCase();
  return knownTitles.some((k) => k.toLowerCase() === t);
}
