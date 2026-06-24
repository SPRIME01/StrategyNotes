// Textarea ADAPTER for the EditorSurface port. Exists to PROVE the port is
// real: a second, dependency-free implementation that NoteEditor can use
// interchangeably with CodeMirrorSurface. It renders no decorations (plain
// markdown only) but fulfills the full contract — value/onChange/onCursor/
// noteTitles/tags/onOpenNote. Use as a fallback, an a11y-simple mode, or a
// test double. Swapping is a one-prop change: `<NoteEditor Surface={TextareaSurface} />`.

import type { EditorSurface, EditorSurfaceProps, CursorInfo } from "../port";

export const TextareaSurface: EditorSurface = function TextareaSurface(props: EditorSurfaceProps) {
  const { value, onChange, onCursor, placeholder } = props;
  const emit = (el: HTMLTextAreaElement) => {
    const pos = el.selectionStart ?? value.length;
    onCursor?.({ pos, rect: null });
  };
  return (
    <textarea
      className="h-full w-full resize-none bg-surface-2 px-6 py-5 font-mono text-sm leading-relaxed outline-none"
      style={{ fontFamily: "var(--font-mono)" }}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onKeyUp={(e) => emit(e.target as HTMLTextAreaElement)}
      onClick={(e) => emit(e.target as HTMLTextAreaElement)}
    />
  );
};

// CursorInfo re-exported for callers that build adapters.
export type { CursorInfo };
