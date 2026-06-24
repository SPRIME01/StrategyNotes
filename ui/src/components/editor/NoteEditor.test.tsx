import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, act, cleanup } from "@testing-library/react";
import { NoteEditor } from "./NoteEditor";
import type { Note } from "./NoteEditor";

const NOTE: Note = { id: "01J..NOTE1", type: "note", frontmatter: { title: "Test note" }, body: "hello" };

function bodyOf(container: HTMLElement) {
  return container.querySelector("textarea") as HTMLTextAreaElement;
}

describe("NoteEditor", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => { vi.useRealTimers(); cleanup(); });

  it("renders the note title and body", () => {
    const { container } = render(<NoteEditor note={NOTE} noteTitles={[]} onSave={() => {}} />);
    expect((container.querySelector("input") as HTMLInputElement).value).toBe("Test note");
    expect(bodyOf(container).value).toBe("hello");
  });

  it("debounces save until the debounce window elapses", () => {
    const onSave = vi.fn();
    const { container } = render(<NoteEditor note={NOTE} noteTitles={[]} onSave={onSave} debounceMs={1000} />);
    const ta = bodyOf(container);
    fireEvent.change(ta, { target: { value: "edited" } });
    expect(onSave).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1000); });
    expect(onSave).toHaveBeenCalledWith("edited");
  });

  it("coalesces rapid edits into one save", () => {
    const onSave = vi.fn();
    const { container } = render(<NoteEditor note={NOTE} noteTitles={[]} onSave={onSave} debounceMs={1000} />);
    const ta = bodyOf(container);
    fireEvent.change(ta, { target: { value: "a" } });
    act(() => { vi.advanceTimersByTime(400); });
    fireEvent.change(ta, { target: { value: "ab" } });
    act(() => { vi.advanceTimersByTime(400); });
    fireEvent.change(ta, { target: { value: "abc" } });
    expect(onSave).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1000); });
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith("abc");
  });
});
