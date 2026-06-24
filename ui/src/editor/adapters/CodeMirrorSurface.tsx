// CodeMirror 6 ADAPTER for the EditorSurface port. This is the ONLY place that
// imports @codemirror/* — NoteEditor depends on the port, not on CodeMirror, so
// the editor engine is reversible (swap this file for a textarea/ProseMirror
// adapter implementing EditorSurface).
//
// Semantics (per the port contract): the surface edits PLAIN MARKDOWN. Tags,
// wikilinks, refs, and callouts are rendered as non-destructive DECORATIONS
// projected from `tokenizeMarkdown` — the source text is never mutated, only
// styled. Clicks on a link/ref map back to a markdown position and emit an
// `onOpenNote` intent (meaning stays outside the surface). Resolved/unresolved
// link state comes from `noteTitles` (the graph), not from the editor.

import { useEffect, useRef } from "react";
import { EditorState, Compartment, type Range } from "@codemirror/state";
import {
  EditorView, keymap, placeholder as cmPlaceholder, ViewPlugin, Decoration,
  type DecorationSet, type Rect, type ViewUpdate,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";
import type { EditorSurface, EditorSurfaceProps, CursorInfo } from "../port";
import { tokenizeMarkdown, isResolved } from "../tokens";

function buildDecorations(view: EditorView, noteTitles: string[]): DecorationSet {
  const doc = view.state.doc.toString();
  const tokens = tokenizeMarkdown(doc);
  const ranges: Range<Decoration>[] = [];
  for (const tk of tokens) {
    if (tk.kind === "callout") {
      const line = view.state.doc.lineAt(tk.start);
      ranges.push(Decoration.line({ class: `tok-callout tok-callout-${tk.variant}` }).range(line.from));
    } else {
      const cls =
        tk.kind === "tag" ? "tok-tag"
        : tk.kind === "ref" ? "tok-ref"
        : isResolved(tk.title, noteTitles) ? "tok-link"
        : "tok-link tok-link-unresolved";
      ranges.push(Decoration.mark({ class: cls }).range(tk.start, tk.end));
    }
  }
  return Decoration.set(ranges, true); // `true` = sort by position
}

function decoPlugin(noteTitles: string[]) {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      constructor(v: EditorView) { this.decorations = buildDecorations(v, noteTitles); }
      update(u: ViewUpdate) {
        if (u.docChanged || u.viewportChanged) this.decorations = buildDecorations(u.view, noteTitles);
      }
    },
    { decorations: (v: { decorations: DecorationSet }) => v.decorations },
  );
}

export const CodeMirrorSurface: EditorSurface = function CodeMirrorSurface(props: EditorSurfaceProps) {
  const { value, onChange, onCursor, placeholder, autoFocus, noteTitles, onOpenNote } = props;
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const cfg = useRef(new Compartment());

  const onChangeRef = useRef(onChange);
  const onCursorRef = useRef(onCursor);
  onChangeRef.current = onChange;
  onCursorRef.current = onCursor;

  useEffect(() => {
    if (!host.current) return;
    const emitCursor = (v: EditorView) => {
      const pos = v.state.selection.main.head;
      let rect: Rect | null = null;
      try { rect = v.coordsAtPos(pos) ?? null; } catch { rect = null; }
      const ci: CursorInfo = {
        pos,
        rect: rect ? { left: rect.left, top: rect.top, bottom: rect.bottom } : null,
      };
      onCursorRef.current?.(ci);
    };

    const v = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          history(),
          markdown(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          EditorView.lineWrapping,
          cmPlaceholder(placeholder ?? ""),
          cfg.current.of(decoPlugin(noteTitles)),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) onChangeRef.current(u.state.doc.toString());
            if (u.docChanged || u.selectionSet) emitCursor(v);
          }),
          theme,
        ],
      }),
      parent: host.current,
    });
    view.current = v;
    if (autoFocus) { try { v.focus(); } catch { /* jsdom: no layout */ } }
    emitCursor(v);
    return () => { v.destroy(); view.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value (note switch) without clobbering user input.
  useEffect(() => {
    const v = view.current;
    if (!v) return;
    const cur = v.state.doc.toString();
    if (cur !== value) v.dispatch({ changes: { from: 0, to: cur.length, insert: value } });
  }, [value]);

  // Re-run decorations when the known graph (noteTitles) changes.
  useEffect(() => {
    const v = view.current;
    if (!v) return;
    v.dispatch({ effects: cfg.current.reconfigure(decoPlugin(noteTitles)) });
  }, [noteTitles]);

  // Click-to-open: map a click to a markdown position, then to a token.
  const handleClick = (e: React.MouseEvent) => {
    const v = view.current;
    if (!v || !onOpenNote) return;
    const pos = v.posAtCoords({ x: e.clientX, y: e.clientY });
    if (pos == null) return;
    const tok = tokenizeMarkdown(v.state.doc.toString()).find((t) => t.start <= pos && pos <= t.end);
    if (tok?.kind === "wikilink") onOpenNote(tok.title);
    else if (tok?.kind === "ref") onOpenNote(tok.id);
  };

  return <div ref={host} className="cm-host h-full w-full overflow-hidden" onClick={handleClick} />;
};

const theme = EditorView.theme({
  "&": { backgroundColor: "var(--color-surface-2)", color: "var(--color-foreground)", height: "100%", fontSize: "13.5px" },
  ".cm-content": { fontFamily: "var(--font-mono)", padding: "20px 24px", caretColor: "var(--color-primary)" },
  ".cm-cursor": { borderLeftColor: "var(--color-primary)" },
  ".cm-gutters": { display: "none" },
  ".cm-placeholder": { color: "var(--color-faint)", fontStyle: "italic" },
  "&.cm-focused": { outline: "none" },
  ".cm-activeLine": { backgroundColor: "transparent" },
});
