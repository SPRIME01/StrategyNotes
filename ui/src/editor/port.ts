// Editor surface PORT (hexagonal boundary). NoteEditor depends on this, not on
// CodeMirror. Any adapter implementing `EditorSurface` can be injected:
// CodeMirror today; a textarea or ProseMirror adapter tomorrow. This makes the
// editor-engine choice reversible (AGENTS.md §10 Ports & Adapters — applied to
// the UI driving layer).
//
// CRITICAL INVARIANT: the surface edits PLAIN MARKDOWN. It may render
// affordances (chips, highlights, widgets) as a PROJECTION of that markdown,
// but it MUST NOT introduce a hidden editor-only document model. Meaning
// (node type, status, gates, typed edges, persistence) is owned by the
// markdown + core + the gate-safe API, never by the surface.

import type { ReactElement } from "react";

export interface CursorInfo {
  pos: number;
  /** Screen rect of the caret, for anchoring overlays (null if unavailable). */
  rect: { left: number; top: number; bottom: number } | null;
}

/** Lightweight content for rendered transclusion of a ((ULID)) ref. */
export interface RefTarget {
  title: string;
  body: string;
}

export interface EditorSurfaceProps {
  /** Canonical markdown text (the source of truth). */
  value: string;
  /** Emitted on every text change with the new full markdown string. */
  onChange: (text: string) => void;
  /** Emitted on caret move / doc change, for caret-anchored overlays. */
  onCursor?: (info: CursorInfo) => void;
  placeholder?: string;
  autoFocus?: boolean;
  /** Known note titles — lets the adapter mark [[links]] resolved/unresolved. */
  noteTitles: string[];
  /** Known tags — for #tag affordances. */
  tags: string[];
  /** Intent: open a note by title or id (clicked chip). Meaning stays outside. */
  onOpenNote?: (titleOrId: string) => void;
  /** Resolve a ((ULID)) block ref to its content, for rendered transclusion.
   *  The adapter renders the result inline; null = not found. */
  resolveRef?: (id: string) => Promise<RefTarget | null>;
}

export interface EditorSurface {
  (props: EditorSurfaceProps): ReactElement | null;
}
