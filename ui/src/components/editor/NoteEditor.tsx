// TASK-E03 / N19 / N20 — NoteEditor. The editing surface is CodeMirror 6
// (markdown, line-wrap, dark theme). Owns the draft, debounced autosave (1s),
// and the unified trigger detection for [[ wikilink, # tag, / command, @ mention.
// Overlays anchor at the caret via coordsAtPos.
//
// ponytail ceiling: decorations (callout widgets, block-as-node / ((ref))) are a
// follow-on ViewPlugin slice. This is the surface + caret-anchored overlays.

import { useEffect, useRef, useState } from "react";
import {
  AutocompleteDropdown,
  detectCompletion,
} from "../notes";
import { CommandPalette, type BlockCommand } from "./CommandPalette";
import { MentionAutocomplete, type MentionResult } from "./MentionAutocomplete";
import { BlockRefMenu } from "./BlockRefMenu";
import { TypeSelector } from "./TypeSelector";
import type { EditorSurface, CursorInfo } from "../../editor/port";
import { CodeMirrorSurface } from "../../editor/adapters/CodeMirrorSurface";
import { blockAtCursor, deriveBlockTitle, promoteBlockEdit, listBlocks, referenceBlock, type BlockItem } from "../../editor/block";
import type { SaveState } from "./EditorHeader";
import { fmString, type GraphNode } from "../../lib/node";

export type { SaveState };

/** The editor edits a full graph node (type + frontmatter + body). Title lives
 * in frontmatter; the editor reads it via fmString. */
export type Note = GraphNode;

export type TriggerType = "wikilink" | "tag" | "command" | "mention" | "blockref";

export interface TriggerState {
  type: TriggerType;
  startPos: number;
  partial: string;
}

export interface NoteEditorProps {
  note: Note;
  /** Note titles for wikilink + mention search. */
  noteTitles: string[];
  /** Tags for # completion. */
  tags?: string[];
  /** Notes (id+title+preview) for the mention panel. */
  mentionCandidates?: MentionResult[];
  /** Called with every body keystroke. */
  onChange?: (body: string) => void;
  /** Called on title edits. */
  onTitleChange?: (title: string) => void;
  /** Debounced save (parent persists). */
  onSave: (body: string) => void;
  onMentionInsert?: (title: string) => void;
  onPromote?: (newId: string, type: string) => void;
  /** Open a note when a [[link]]/((ref)) chip is clicked (meaning stays outside the surface). */
  onOpenNote?: (titleOrId: string) => void;
  /** Block-as-node (PRD-002): mint a node from a block; return its ULID. */
  onPromoteBlock?: (title: string, body: string) => Promise<string | null>;
  /** Resolve a ((ULID)) ref to its content for rendered transclusion. */
  resolveRef?: (id: string) => Promise<{ title: string; body: string } | null>;
  saveState?: SaveState;
  /** Editor surface port (default: CodeMirror). Inject to swap the engine. */
  Surface?: EditorSurface;
  /** Search notes by title for the @mention panel (async). */
  searchNotes?: (q: string) => Promise<MentionResult[]>;
  placeholder?: string;
  debounceMs?: number;
}

export function NoteEditor({
  note,
  noteTitles,
  tags = [],
  mentionCandidates,
  onChange,
  onTitleChange,
  onSave,
  onMentionInsert,
  onPromote,
  onOpenNote,
  onPromoteBlock,
  resolveRef,
  saveState = "idle",
  Surface = CodeMirrorSurface,
  searchNotes,
  placeholder,
  debounceMs = 1000,
}: NoteEditorProps) {
  const [draft, setDraft] = useState(note.body ?? "");
  const [trigger, setTrigger] = useState<TriggerState | null>(null);
  const [mentionResults, setMentionResults] = useState<MentionResult[] | null>(null);
  const [cursor, setCursor] = useState<CursorInfo | null>(null);
  const cursorRef = useRef<CursorInfo | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset draft when the note changes.
  useEffect(() => { setDraft(note.body ?? ""); }, [note.id, note.body]);

  // Cancel pending save on unmount.
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const scheduleSave = (body: string) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onSave(body), debounceMs);
  };

  const handleTextChange = (text: string) => {
    setDraft(text);
    onChange?.(text);
    setTrigger(detectTrigger(text, cursorRef.current?.pos ?? text.length));
    scheduleSave(text);
  };

  const handleCursor = (info: CursorInfo) => {
    cursorRef.current = info;
    setCursor(info);
    // Re-evaluate trigger on caret move (e.g. navigating into an existing [[ ).
    setTrigger(detectTrigger(draft, info.pos));
  };

  const closeTrigger = () => setTrigger(null);

  // ── command: insert markdown prefix at the trigger's line start ──
  const applyCommand = (cmd: BlockCommand) => {
    if (cmd.action === "promote-block") { void promoteBlock(); return; }
    if (!trigger) return;
    const before = draft.slice(0, trigger.startPos);
    const after = draft.slice(trigger.startPos + trigger.partial.length);
    // Replace the whole `/...` token with the command's insert + a newline cursor.
    const insert = cmd.insert ?? "";
    const next = before.slice(0, before.length - trigger.partial.length - 1) + insert + after;
    setDraft(next);
    onChange?.(next);
    scheduleSave(next);
    closeTrigger();
  };

  // ── block-as-node (PRD-002): promote the current block to a first-class node ──
  // Mint a node via the parent, then transclude it in-place as ((ULID)). The
  // reference is canonical markdown → backlinks + address come for free.
  const promoteBlock = async () => {
    closeTrigger();
    if (!onPromoteBlock) return;
    const pos = cursorRef.current?.pos ?? draft.length;
    const title = deriveBlockTitle(draft, pos);
    const body = blockAtCursor(draft, pos).content;
    if (!body) return;
    const id = await onPromoteBlock(title, body);
    if (!id) return;
    const next = promoteBlockEdit(draft, pos, id);
    if (next == null) return;
    setDraft(next);
    onChange?.(next);
    scheduleSave(next);
  };

  // ── block reference (`((`): reference any block in the note; it's promoted
  // to a node and transcluded at both sites (markdown-resident, single source). ──
  const applyBlockRef = async (blk: BlockItem) => {
    if (!trigger || !onPromoteBlock) { closeTrigger(); return; }
    const id = await onPromoteBlock(deriveBlockTitle(blk.content, 0), blk.content);
    closeTrigger();
    if (!id) return;
    const triggerEnd = trigger.startPos + 2 + trigger.partial.length;
    const next = referenceBlock(draft, { start: trigger.startPos, end: triggerEnd }, blk, id);
    setDraft(next);
    onChange?.(next);
    scheduleSave(next);
  };

  // ── wikilink/tag: replace the partial token ──
  const applyCompletion = (value: string) => {
    if (!trigger) return;
    const insert = trigger.type === "wikilink" ? `${value}]]` : value;
    const next =
      draft.slice(0, trigger.startPos) + insert + draft.slice(trigger.startPos + trigger.partial.length);
    setDraft(next);
    onChange?.(next);
    scheduleSave(next);
    closeTrigger();
  };

  // ── mention: insert [[Title]] and notify parent ──
  const applyMention = (m: MentionResult) => {
    if (!trigger) return;
    const insert = `[[${m.title}]]`;
    const next =
      draft.slice(0, trigger.startPos) + insert + draft.slice(trigger.startPos + trigger.partial.length);
    setDraft(next);
    onChange?.(next);
    scheduleSave(next);
    onMentionInsert?.(m.title);
    closeTrigger();
    setMentionResults(null);
  };

  // Async mention search.
  useEffect(() => {
    if (trigger?.type !== "mention" || !searchNotes) { setMentionResults(null); return; }
    let cancelled = false;
    searchNotes(trigger.partial).then((r) => { if (!cancelled) setMentionResults(r); });
    return () => { cancelled = true; };
  }, [trigger, searchNotes]);

  // Caret-anchored overlay style (fixed to viewport; rect is screen coords).
  const overlayStyle = (place: "above" | "below"): React.CSSProperties => {
    const r = cursor?.rect;
    if (!r) return { display: "none" };
    const top = place === "above" ? r.top - 8 : r.bottom + 4;
    return { position: "fixed", left: r.left, top, transform: place === "above" ? "translateY(-100%)" : undefined, zIndex: 50 };
  };

  return (
    <div className="relative flex h-full flex-col">
      {/* title */}
      <div className="border-b bg-surface-1 px-6 py-4">
        <div className="mb-1.5">
          <TypeSelector id={note.id} currentType={note.type} onPromoted={onPromote} />
        </div>
        <input
          value={fmString(note, "title", "")}
          onChange={(e) => {
            onTitleChange?.(e.target.value);
            scheduleSave(draft);
          }}
          placeholder="Untitled"
          className="w-full bg-transparent text-2xl font-normal tracking-tight outline-none"
          style={{ fontFamily: "var(--font-display)" }}
        />
        <div className="mt-1 flex items-center gap-2 text-[11px] text-faint">
          <span className="font-mono">{note.id.slice(0, 18)}</span>
          {saveState === "saving" && <span className="text-muted-ink">saving…</span>}
        </div>
      </div>

      {/* body — editor surface (port; CodeMirror is the default adapter) */}
      <div className="relative min-h-0 flex-1">
        <Surface
          value={draft}
          onChange={handleTextChange}
          onCursor={handleCursor}
          noteTitles={noteTitles}
          tags={tags}
          onOpenNote={onOpenNote}
          resolveRef={resolveRef}
          autoFocus
          placeholder={placeholder ?? "Write in markdown. [[Title]] wikilink · #tag · / for blocks · @ to mention."}
        />

        {/* overlays — anchored at the caret (adapter-neutral) */}
        {trigger?.type === "command" && (
          <div style={overlayStyle("below")}>
            <CommandPalette query={trigger.partial} onSelect={applyCommand} onClose={closeTrigger} />
          </div>
        )}
        {trigger?.type === "mention" && (
          <div style={overlayStyle("above")}>
            <MentionAutocomplete
              query={trigger.partial}
              results={mentionResults ?? mentionCandidates ?? []}
              onSelect={applyMention}
              onClose={() => { closeTrigger(); setMentionResults(null); }}
            />
          </div>
        )}
        {trigger?.type === "blockref" && (
          <div style={overlayStyle("above")}>
            <BlockRefMenu
              query={trigger.partial}
              blocks={listBlocks(draft)}
              onSelect={(b) => void applyBlockRef(b)}
              onClose={closeTrigger}
            />
          </div>
        )}
        {(trigger?.type === "wikilink" || trigger?.type === "tag") && (
          <div style={overlayStyle("above")}>
            <AutocompleteDropdown
              state={{ type: trigger.type, startPos: trigger.startPos, partial: trigger.partial }}
              noteTitles={noteTitles}
              allTags={tags}
              onSelect={applyCompletion}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Detect which trigger (if any) is active at the cursor.
// Extends notes/detectCompletion with `/` (command) and `@` (mention).
export function detectTrigger(text: string, cursor: number): TriggerState | null {
  const before = text.slice(0, cursor);
  const after = text.slice(cursor);

  // `/` command — only at line start or in an otherwise-empty line.
  const lineStart = before.lastIndexOf("\n") + 1;
  const linePrefix = before.slice(lineStart);
  const slashMatch = linePrefix.match(/^\/([\w-]*)$/);
  if (slashMatch && !/^\s*\S/.test(after)) {
    return { type: "command", startPos: lineStart, partial: slashMatch[1] };
  }

  // `@` mention — anywhere, word-boundary preceded.
  const atMatch = before.match(/(?:^|\s)@([\w\s-]*)$/);
  if (atMatch) {
    const startPos = before.length - atMatch[1].length;
    return { type: "mention", startPos, partial: atMatch[1].trim() };
  }

  // `((` block reference — open parens not yet closed by `))`, same line.
  const parenOpen = before.lastIndexOf("((");
  if (parenOpen !== -1 && parenOpen >= lineStart) {
    const afterOpen = before.slice(parenOpen + 2);
    if (!afterOpen.includes("))") && !afterOpen.includes("\n")) {
      return { type: "blockref", startPos: parenOpen, partial: afterOpen };
    }
  }

  // Reuse wikilink + tag detection from the notes module.
  const c = detectCompletion(text, cursor);
  if (c.type) return { type: c.type, startPos: c.startPos, partial: c.partial };

  return null;
}
