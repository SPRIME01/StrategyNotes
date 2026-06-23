// Phase 2 Notes components: autocomplete, tags bar, chips.
// Kept textarea-based (no CodeMirror yet) — the autocomplete overlay sits
// on top of the textarea. Ponytail: smallest change that delivers the feature.

import { useMemo } from "react";
import { cn } from "../../lib/utils";

// ─── Tag collection ───

export interface TagInfo {
  name: string;
  count: number;
}

export function collectTags(notes: { body: string }[]): TagInfo[] {
  const counts = new Map<string, number>();
  for (const n of notes) {
    const matches = n.body.matchAll(/#([\w-]+)/g);
    const seen = new Set<string>();
    for (const m of matches) {
      if (!seen.has(m[1])) {
        seen.add(m[1]);
        counts.set(m[1], (counts.get(m[1]) ?? 0) + 1);
      }
    }
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// ─── TagsBar (TASK-N18) ───

export function TagsBar({
  tags,
  activeTag,
  onSelect,
}: {
  tags: TagInfo[];
  activeTag: string | null;
  onSelect: (tag: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "thin" }}>
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
          activeTag === null ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-surface-3",
        )}
      >
        All
      </button>
      {tags.map((t) => (
        <TagChip
          key={t.name}
          tag={t.name}
          count={t.count}
          active={activeTag === t.name}
          onClick={() => onSelect(activeTag === t.name ? null : t.name)}
        />
      ))}
    </div>
  );
}

// ─── TagChip (TASK-N13) ───

export function TagChip({
  tag,
  count,
  active,
  onClick,
}: {
  tag: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-2.5 py-1 text-xs font-mono transition-colors",
        active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-surface-3 hover:text-foreground",
      )}
    >
      #{tag}
      {count !== undefined && <span className="ml-1 opacity-50">{count}</span>}
    </button>
  );
}

// ─── WikilinkChip (TASK-N12) ───

export function WikilinkChip({
  title,
  resolved,
  onClick,
}: {
  title: string;
  resolved: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-mono transition-colors",
        resolved
          ? "text-primary hover:bg-primary/10 underline-offset-2 hover:underline"
          : "text-gate-warn border border-dashed border-border-strong",
      )}
      title={resolved ? `Open: ${title}` : `Unresolved: ${title}`}
    >
      {!resolved && <span className="text-[9px]">⚠</span>}
      {title}
    </button>
  );
}

// ─── Autocomplete (TASK-N21, N22) ───

export type CompletionType = "wikilink" | "tag" | null;

export interface CompletionState {
  type: CompletionType;
  startPos: number;
  partial: string;
}

/**
 * Detect the current completion context in a textarea.
 * Returns null if no active completion (not inside [[... or #...).
 */
export function detectCompletion(text: string, cursorPos: number): CompletionState {
  // Wikilink: look backwards from cursor for [[ without closing ]]
  const before = text.slice(0, cursorPos);
  const wlOpen = before.lastIndexOf("[[");
  if (wlOpen !== -1) {
    const afterOpen = before.slice(wlOpen + 2);
    if (!afterOpen.includes("]]") && !afterOpen.includes("\n")) {
      return { type: "wikilink", startPos: wlOpen + 2, partial: afterOpen };
    }
  }
  // Tag: look backwards for # at word boundary
  const hashMatch = before.match(/(?:^|\s)#([\w-]*)$/);
  if (hashMatch) {
    const hashPos = before.length - hashMatch[0].length + (hashMatch[0].startsWith("#") ? 0 : 1);
    return { type: "tag", startPos: hashPos + 1, partial: hashMatch[1] };
  }
  return { type: null, startPos: 0, partial: "" };
}

/**
 * Autocomplete overlay for the textarea editor. Shows filtered results
 * for wikilinks (note titles) or tags, depending on the completion context.
 */
export function AutocompleteDropdown({
  state,
  noteTitles,
  allTags,
  onSelect,
}: {
  state: CompletionState;
  noteTitles: string[];
  allTags: string[];
  onSelect: (value: string) => void;
}) {
  const results = useMemo(() => {
    if (!state.type) return [];
    const q = state.partial.toLowerCase();
    if (state.type === "wikilink") {
      return noteTitles
        .filter((t) => t.toLowerCase().includes(q))
        .slice(0, 8);
    }
    return allTags
      .filter((t) => t.toLowerCase().includes(q))
      .slice(0, 8);
  }, [state, noteTitles, allTags]);

  if (results.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-1 rounded-lg border bg-surface-2 shadow-lg overflow-hidden z-50">
      {results.map((r) => (
        <button
          key={r}
          onClick={() => onSelect(r)}
          className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-surface-3 transition-colors"
        >
          {state.type === "wikilink" ? (
            <>
              <span className="font-mono text-primary text-xs">[[</span>
              <span>{r}</span>
              <span className="font-mono text-primary text-xs">]]</span>
            </>
          ) : (
            <span className="font-mono text-muted-foreground text-xs">#{r}</span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Sort control ───

export type SortMode = "recent" | "alpha";

export function SortControl({ value, onChange }: { value: SortMode; onChange: (s: SortMode) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortMode)}
      className="rounded-md border bg-surface-1 px-2 py-1 text-xs text-muted-foreground outline-none"
    >
      <option value="recent">Recent</option>
      <option value="alpha">A–Z</option>
    </select>
  );
}

// ─── CloneIndicator (TASK-N15) ───

export function CloneIndicator({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-mono text-muted-foreground"
      title={`Cloned to ${count} location${count > 1 ? "s" : ""}`}
    >
      ◈ {count}
    </span>
  );
}

// ─── PromoteMenu (TASK-N28) ───

const PROMOTE_OPTIONS = [
  { type: "evidence_item", label: "Evidence Item" },
  { type: "strategic_claim", label: "Strategic Claim" },
  { type: "strategy_bet", label: "Strategy Bet" },
  { type: "outcome_requirement", label: "Outcome Requirement" },
  { type: "value_claim", label: "Value Claim" },
];

export function PromoteMenu({ onPromote }: { onPromote: (type: string) => void }) {
  return (
    <select
      defaultValue=""
      onChange={(e) => { if (e.target.value) { onPromote(e.target.value); e.target.value = ""; } }}
      className="rounded-md border bg-surface-1 px-2 py-1 text-xs text-muted-foreground outline-none"
    >
      <option value="" disabled>Promote to…</option>
      {PROMOTE_OPTIONS.map((o) => (
        <option key={o.type} value={o.type}>{o.label}</option>
      ))}
    </select>
  );
}
