// Shared note store: loads nodes from the API as full GraphNodes (type +
// frontmatter + body), owns create/save/delete/retype, and derives the autocomplete
// sources (titles + tags). The editor and the strategy screens share this same
// node shape — one graph, many lenses.

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { collectTags } from "../components/notes";
import { fmString, type GraphNode } from "../lib/node";
import type { SaveState } from "../components/editor/NoteEditor";

export const PRIMARY_STRATEGY_TYPES = [
  "note",
  "evidence_item",
  "strategic_claim",
  "strategy_bet",
  "work_package",
  "timebox",
  "source",
  "value_claim",
] as const;

export function useNotes(typeFilter: string = "all") {
  const [notes, setNotes] = useState<GraphNode[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const types = typeFilter === "all" ? PRIMARY_STRATEGY_TYPES : [typeFilter];
      const allIds = (
        await Promise.all(types.map((ty) => api.nodesByType(ty).catch(() => [])))
      ).flat();
      const uniqueIds = Array.from(new Set(allIds));
      const items = await Promise.all(
        uniqueIds.slice(0, 200).map((id) =>
          api.getNode(id).then((n) => n as unknown as GraphNode).catch(() => null)
        ),
      );
      setNotes(items.filter((n): n is GraphNode => n !== null));
    } catch { /* backend not running */ }
    setLoading(false);
  }, [typeFilter]);

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
      const existing = notes.find((n) => n.id === id);
      if (existing && existing.type !== "note") {
        const fm = { ...existing.frontmatter };
        if (title !== undefined) fm.title = title;
        await api.patchNode(id, { body, frontmatter: fm });
      } else {
        await api.updateNote(id, body, title);
      }
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
  }, [notes]);

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

  // Update a note's type in place without dropping it from the editor
  const retype = useCallback((id: string, newType: string) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, type: newType } : n)));
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
    create, save, patch, retype, remove, reload: load, noteTitles, tags,
  };
}
