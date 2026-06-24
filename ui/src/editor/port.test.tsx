// Proves the port seam: NoteEditor runs with a NON-CodeMirror adapter
// (TextareaSurface). If the surface contract were coupled to CodeMirror, this
// would fail. This is the reversibility guarantee, tested.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, fireEvent, act } from "@testing-library/react";
import { NoteEditor } from "../components/editor/NoteEditor";
import { TextareaSurface } from "./adapters/TextareaSurface";
import type { Note } from "../components/editor/NoteEditor";

const NOTE: Note = { id: "01J..NOTE1", type: "note", frontmatter: { title: "T" }, body: "hello" };

describe("EditorSurface port — reversibility", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => { vi.useRealTimers(); cleanup(); });

  it("NoteEditor works with the textarea adapter (no CodeMirror)", () => {
    const onSave = vi.fn();
    const { container } = render(
      <NoteEditor note={NOTE} noteTitles={[]} onSave={onSave} Surface={TextareaSurface} debounceMs={1000} />,
    );
    // TextareaSurface renders a real <textarea>, not a .cm-editor.
    expect(container.querySelector("textarea")).toBeTruthy();
    expect(container.querySelector(".cm-editor")).toBeNull();

    const ta = container.querySelector("textarea") as HTMLTextAreaElement;
    fireEvent.change(ta, { target: { value: "via textarea adapter" } });
    act(() => { vi.advanceTimersByTime(1000); });
    expect(onSave).toHaveBeenCalledWith("via textarea adapter");
  });
});
