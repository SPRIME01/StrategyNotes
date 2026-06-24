// Graph hooks — every screen reads the vault through these. No screen owns
// data; each is a derived view (the Logseq/Obsidian model). Both hooks resolve
// raw API nodes into typed GraphNode accessors (lib/node.ts).

import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import type { GraphNode } from "../lib/node";

/** List + resolve all nodes of a type. The workhorse for every strategy screen. */
export function useTypedNodes(ty: string) {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const ids = await api.nodesByType(ty);
      const resolved = await Promise.all(
        ids.slice(0, 200).map((id) =>
          api.getNode(id).then((n) => n as unknown as GraphNode).catch(() => null),
        ),
      );
      setNodes(resolved.filter((n): n is GraphNode => n !== null));
    } catch (e) {
      // Backend not running / empty vault — honest empty state, not fake data.
      setNodes([]);
      setError(e instanceof Error ? e.message : "unreachable");
    }
    setLoading(false);
  }, [ty]);

  useEffect(() => { load(); }, [load]);

  return { nodes, loading, error, reload: load };
}

/** Resolve a single node by id (for trace/detail views). */
export function useNode(id: string | null) {
  const [node, setNode] = useState<GraphNode | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) { setNode(null); return; }
    setLoading(true);
    api.getNode(id)
      .then((n) => setNode(n as unknown as GraphNode))
      .catch(() => setNode(null))
      .finally(() => setLoading(false));
  }, [id]);

  return { node, loading };
}
