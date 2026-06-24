// Shared note store: loads nodes from the API as full GraphNodes (type +
// frontmatter + body), owns create/save/delete, and derives the autocomplete
// sources (titles + tags). The editor and the strategy screens share this same
// node shape — one graph, many lenses.

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { collectTags } from "../components/notes";
import { fmString, type GraphNode } from "../lib/node";
import type { SaveState } from "../components/editor/NoteEditor";

export function useNotes() {
  const [notes, setNotes] = useState<GraphNode[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const ids = await api.nodesByType("note");
      const items = await Promise.all(ids.slice(0, 200).map((id) => api.getNode(id)));
      setNotes(items.map((n) => n as unknown as GraphNode));
    } catch { /* backend not running */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const active = useMemo(() => notes.find((n) => n.id === activeId) ?? null, [notes, activeId]);

  const create = useCallback(async (title = "Untitled note", body = "") => {
    try {
      const n = await api.createNote(title, body);
      const item = n as unknown as GraphNode;
      setNotes((prev) => [item, ...prev]);
      setActiveId(item.id);
      return item;
    } catch { return null; }
  }, []);

  const save = useCallback(async (id: string, body: string, title?: string) => {
    setSaveState("saving");
    try {
      await api.updateNote(id, body, title);
      setNotes((prev) => prev.map((n) => {
        if (n.id !== id) return n;
        const fm = { ...n.frontmatter };
        if (title !== undefined) fm.title = title;
        return { ...n, body, frontmatter: fm };
      }));
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }, []);

  // Local-only patch: updates the in-memory note (e.g. live list preview)
  // without hitting the API. Persistence is the debounced `save`.
  const patch = useCallback((id: string, body: string, title?: string) => {
    setNotes((prev) => prev.map((n) => {
      if (n.id !== id) return n;
      const fm = { ...n.frontmatter };
      if (title !== undefined) fm.title = title;
      return { ...n, body, frontmatter: fm };
    }));
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await api.deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      setActiveId((cur) => (cur === id ? null : cur));
    } catch { /* backend not running */ }
  }, []);

  const noteTitles = useMemo(
    () => notes.map((n) => fmString(n, "title")).filter((t) => t && t !== "Untitled note"),
    [notes],
  );
  const tags = useMemo(() => collectTags(notes.map((n) => ({ body: n.body ?? "" }))).map((t) => t.name), [notes]);

  return {
    notes, active, activeId, setActiveId, saveState, loading,
    create, save, patch, remove, reload: load, noteTitles, tags,
  };
}
