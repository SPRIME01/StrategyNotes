// CodeMirror 6 ADAPTER for the EditorSurface port. This is the ONLY place that
// imports @codemirror/* — NoteEditor depends on the port, not on CodeMirror, so
// the editor engine is reversible.
//
// Semantics: edits PLAIN MARKDOWN. Decorations are a PROJECTION of that
// markdown via the neutral token model (editor/tokens.ts). ((ULID)) refs render
// as inline TRANSCLUSION widgets (the referenced node's content), except on the
// cursor's line where the raw `((ULID))` stays editable. The source text is
// never mutated. Clicks → onOpenNote intent (meaning stays outside the surface).

import { useEffect, useRef } from "react";
import { EditorState, Compartment, StateEffect, StateField, type Range } from "@codemirror/state";
import {
  EditorView, keymap, placeholder as cmPlaceholder, ViewPlugin, Decoration, WidgetType,
  type DecorationSet, type Rect, type ViewUpdate,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";
import type { EditorSurface, EditorSurfaceProps, RefTarget } from "../port";
import { tokenizeMarkdown, isResolved } from "../tokens";

// ── ref-cache state + effect (resolved ((ULID)) → content) ──
const setRef = StateEffect.define<{ id: string; node: RefTarget | null }>();
const refCacheField = StateField.define<Map<string, RefTarget | null>>({
  create: () => new Map(),
  update(val, tr) {
    let next: Map<string, RefTarget | null> | null = null;
    for (const e of tr.effects) {
      if (e.is(setRef)) {
        if (!next) next = new Map(val);
        next.set(e.value.id, e.value.node);
      }
    }
    return next ?? val;
  },
});

interface DecoConfig {
  noteTitles: string[];
  resolveRef?: (id: string) => Promise<RefTarget | null>;
  onOpenNote?: (id: string) => void;
}

function buildDecorations(view: EditorView, cfg: DecoConfig): DecorationSet {
  const doc = view.state.doc.toString();
  const tokens = tokenizeMarkdown(doc);
  const cache = view.state.field(refCacheField, false) ?? new Map<string, RefTarget | null>();
  const selLine = view.state.doc.lineAt(view.state.selection.main.head).number;
  const ranges: Range<Decoration>[] = [];
  for (const tk of tokens) {
    if (tk.kind === "callout") {
      const line = view.state.doc.lineAt(tk.start);
      ranges.push(Decoration.line({ class: `tok-callout tok-callout-${tk.variant}` }).range(line.from));
      continue;
    }
    if (tk.kind === "ref") {
      const refLine = view.state.doc.lineAt(tk.start).number;
      // On the cursor's line: leave the raw `((ULID))` editable.
      if (refLine === selLine) continue;
      if (cfg.resolveRef && cache.has(tk.id)) {
        ranges.push(Decoration.replace({ widget: new TransclusionWidget(tk.id, cache.get(tk.id) ?? null, cfg.onOpenNote) }).range(tk.start, tk.end));
      } else {
        ranges.push(Decoration.mark({ class: "tok-ref" }).range(tk.start, tk.end));
      }
      continue;
    }
    const cls =
      tk.kind === "tag" ? "tok-tag"
      : isResolved(tk.title, cfg.noteTitles) ? "tok-link"
      : "tok-link tok-link-unresolved";
    ranges.push(Decoration.mark({ class: cls }).range(tk.start, tk.end));
  }
  return Decoration.set(ranges, true);
}

function decoPlugin(cfg: DecoConfig) {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      pending = new Set<string>();
      constructor(v: EditorView) { this.decorations = buildDecorations(v, cfg); this.kick(v); }
      update(u: ViewUpdate) {
        const resolved = u.transactions.some((t) => t.effects.some((e) => e.is(setRef)));
        if (u.docChanged || u.viewportChanged || u.selectionSet || resolved) {
          this.decorations = buildDecorations(u.view, cfg);
        }
        if (u.docChanged || u.viewportChanged) this.kick(u.view);
      }
      // Fire resolveRef for any ref not yet cached/pending.
      kick(v: EditorView) {
        if (!cfg.resolveRef) return;
        const cache = v.state.field(refCacheField, false) ?? new Map();
        const ids = new Set<string>();
        for (const t of tokenizeMarkdown(v.state.doc.toString())) if (t.kind === "ref") ids.add(t.id);
        for (const id of ids) {
          if (cache.has(id) || this.pending.has(id)) continue;
          this.pending.add(id);
          cfg.resolveRef(id)
            .then((node) => v.dispatch({ effects: setRef.of({ id, node }) }))
            .catch(() => { this.pending.delete(id); });
        }
      }
    },
    { decorations: (v: { decorations: DecorationSet }) => v.decorations },
  );
}

/** Inline transclusion widget: renders the referenced node's title + snippet.
 *  Click → onOpenNote(id). The raw `((ULID))` text it replaces stays canonical. */
class TransclusionWidget extends WidgetType {
  constructor(private id: string, private target: RefTarget | null, private onOpen?: (id: string) => void) { super(); }
  eq(other: TransclusionWidget) { return other.id === this.id && !!other.target === !!this.target && other.target?.title === this.target?.title; }
  toDOM() {
    const el = document.createElement("span");
    el.className = "tok-transclusion";
    el.setAttribute("data-ref", this.id);
    if (!this.target) {
      el.textContent = "((unresolved))";
    } else {
      const t = document.createElement("span"); t.className = "tc-title"; t.textContent = this.target.title || "Untitled"; el.appendChild(t);
      const body = (this.target.body || "").replace(/\s+/g, " ").trim();
      if (body) { const b = document.createElement("span"); b.className = "tc-body"; b.textContent = " — " + body.slice(0, 48); el.appendChild(b); }
    }
    if (this.onOpen) el.onclick = () => this.onOpen!(this.id);
    return el;
  }
  ignoreEvent() { return false; }
}

export const CodeMirrorSurface: EditorSurface = function CodeMirrorSurface(props: EditorSurfaceProps) {
  const { value, onChange, onCursor, placeholder, autoFocus, noteTitles, onOpenNote, resolveRef } = props;
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const cfgComp = useRef(new Compartment());

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
      onCursorRef.current?.({ pos, rect: rect ? { left: rect.left, top: rect.top, bottom: rect.bottom } : null });
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
          refCacheField,
          cfgComp.current.of(decoPlugin({ noteTitles, resolveRef, onOpenNote })),
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

  useEffect(() => {
    const v = view.current;
    if (!v) return;
    const cur = v.state.doc.toString();
    if (cur !== value) v.dispatch({ changes: { from: 0, to: cur.length, insert: value } });
  }, [value]);

  // Re-run decorations when the graph view (noteTitles) or resolvers change.
  useEffect(() => {
    const v = view.current;
    if (!v) return;
    v.dispatch({ effects: cfgComp.current.reconfigure(decoPlugin({ noteTitles, resolveRef, onOpenNote })) });
  }, [noteTitles, resolveRef, onOpenNote]);

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
