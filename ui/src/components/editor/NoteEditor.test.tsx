import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { EditorView } from "@codemirror/view";
import { NoteEditor } from "./NoteEditor";
import type { Note } from "./NoteEditor";

const NOTE: Note = { id: "01J..NOTE1", type: "note", frontmatter: { title: "Test note" }, body: "hello" };

/** Drive CodeMirror via its public API (findFromDOM + dispatch) — the canonical
 *  test path, since jsdom can't simulate contentEditable input events. */
function setCmText(container: HTMLElement, text: string) {
  const editorEl = container.querySelector(".cm-editor") as HTMLElement | null;
  if (!editorEl) throw new Error("cm-editor not found");
  const view = EditorView.findFromDOM(editorEl);
  if (!view) throw new Error("EditorView not found");
  view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text } });
}

describe("NoteEditor", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => { vi.useRealTimers(); cleanup(); });

  it("renders the note title and body content", () => {
    const { container } = render(<NoteEditor note={NOTE} noteTitles={[]} onSave={() => {}} />);
    expect((container.querySelector("input") as HTMLInputElement).value).toBe("Test note");
    expect(container.textContent).toContain("hello");
  });

  it("debounces save until the debounce window elapses", () => {
    const onSave = vi.fn();
    const { container } = render(<NoteEditor note={NOTE} noteTitles={[]} onSave={onSave} debounceMs={1000} />);
    setCmText(container, "edited");
    expect(onSave).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1000); });
    expect(onSave).toHaveBeenCalledWith("edited");
  });

  it("coalesces rapid edits into one save", () => {
    const onSave = vi.fn();
    const { container } = render(<NoteEditor note={NOTE} noteTitles={[]} onSave={onSave} debounceMs={1000} />);
    setCmText(container, "a");
    act(() => { vi.advanceTimersByTime(400); });
    setCmText(container, "abc");
    expect(onSave).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1000); });
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith("abc");
  });
});
