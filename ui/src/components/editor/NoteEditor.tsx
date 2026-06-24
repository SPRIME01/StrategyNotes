// TASK-E03 — NoteEditor. Wraps the editing surface (textarea; CodeMirror is
// TASK-N19/N20, not yet done — ponytail: ship the textarea that works, mark
// the ceiling). Owns the draft, debounced autosave (1s), and the unified
// trigger detection for [[ wikilink, # tag, / command, @ mention.
//
// ponytail ceiling: textarea + overlay dropdowns. Upgrade to CodeMirror 6 when
// block-level decorations (callout widgets, syntax regions) are required.

import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import {
  AutocompleteDropdown,
  detectCompletion,
} from "../notes";
import { CommandPalette, type BlockCommand } from "./CommandPalette";
import { MentionAutocomplete, type MentionResult } from "./MentionAutocomplete";
import { TypeSelector } from "./TypeSelector";
import type { SaveState } from "./EditorHeader";
import { fmString, type GraphNode } from "../../lib/node";

export type { SaveState };

/** The editor edits a full graph node (type + frontmatter + body). Title lives
 * in frontmatter; the editor reads it via fmString. */
export type Note = GraphNode;

export type TriggerType = "wikilink" | "tag" | "command" | "mention";

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
  saveState?: SaveState;
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
  saveState = "idle",
  searchNotes,
  placeholder,
  debounceMs = 1000,
}: NoteEditorProps) {
  const [draft, setDraft] = useState(note.body ?? "");
  const [trigger, setTrigger] = useState<TriggerState | null>(null);
  const [mentionResults, setMentionResults] = useState<MentionResult[] | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset draft when the note changes.
  useEffect(() => { setDraft(note.body ?? ""); }, [note.id, note.body]);

  // Cancel pending save on unmount.
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const scheduleSave = (body: string) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onSave(body), debounceMs);
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const cursor = e.target.selectionStart ?? text.length;
    setDraft(text);
    onChange?.(text);
    setTrigger(detectTrigger(text, cursor));
    scheduleSave(text);
  };

  const closeTrigger = () => setTrigger(null);

  // ── command: insert markdown prefix at the trigger's line start ──
  const applyCommand = (cmd: BlockCommand) => {
    if (!trigger) return;
    const before = draft.slice(0, trigger.startPos);
    const after = draft.slice(trigger.startPos + trigger.partial.length);
    // Replace the whole `/...` token with the command's insert + a newline cursor.
    const insert = cmd.insert;
    const next = before.slice(0, before.length - trigger.partial.length - 1) + insert + after;
    setDraft(next);
    onChange?.(next);
    scheduleSave(next);
    closeTrigger();
    requestAnimationFrame(() => taRef.current?.focus());
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
    requestAnimationFrame(() => taRef.current?.focus());
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
    requestAnimationFrame(() => taRef.current?.focus());
  };

  // Async mention search.
  useEffect(() => {
    if (trigger?.type !== "mention" || !searchNotes) { setMentionResults(null); return; }
    let cancelled = false;
    searchNotes(trigger.partial).then((r) => { if (!cancelled) setMentionResults(r); });
    return () => { cancelled = true; };
  }, [trigger, searchNotes]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") { closeTrigger(); setMentionResults(null); }
    // Let the dropdown components handle up/down/enter via their own handlers
    // when open; here we only short-circuit Escape.
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

      {/* body */}
      <div className="relative min-h-0 flex-1">
        <textarea
          ref={taRef}
          value={draft}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? "Write in markdown. [[Title]] wikilink · #tag · / for blocks · @ to mention."}
          className="h-full w-full resize-none bg-surface-2 px-6 py-5 font-mono text-sm leading-relaxed outline-none"
          style={{ fontFamily: "var(--font-mono)" }}
        />

        {/* overlays — anchored bottom of the textarea region */}
        {trigger?.type === "command" && (
          <CommandPalette
            query={trigger.partial}
            onSelect={applyCommand}
            onClose={closeTrigger}
            anchor={() => taRef.current}
          />
        )}
        {trigger?.type === "mention" && (
          <MentionAutocomplete
            query={trigger.partial}
            results={mentionResults ?? mentionCandidates ?? []}
            onSelect={applyMention}
            onClose={() => { closeTrigger(); setMentionResults(null); }}
          />
        )}
        {(trigger?.type === "wikilink" || trigger?.type === "tag") && (
          <AutocompleteDropdown
            state={{ type: trigger.type, startPos: trigger.startPos, partial: trigger.partial }}
            noteTitles={noteTitles}
            allTags={tags}
            onSelect={applyCompletion}
          />
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

  // Reuse wikilink + tag detection from the notes module.
  const c = detectCompletion(text, cursor);
  if (c.type) return { type: c.type, startPos: c.startPos, partial: c.partial };

  return null;
}
