import { useEffect, useState } from "react";
import { api } from "../api";
import { useNode } from "./useTypedNodes";
import { nodeTitle } from "../lib/node";

/**
 * Resolve a node id to its human title, once, cached in-process.
 *
 * Node references are pervasive in this UI (source chunks, links, placements).
 * Resolving each one inline meant either a ULID wall or a request per row. This
 * keeps a single memo so the same id is fetched once per session, and callers
 * render a short fallback rather than infrastructure identity.
 */
const cache = new Map<string, string | null>();
const types = new Map<string, string>();
const inflight = new Map<string, Promise<void>>();

/**
 * A node's human title, or null.
 *
 * `nodeTitle` now falls back to the node's excerpt before the id, so this is
 * only "no human content at all" — in which case a caller-supplied fallback
 * reads better than an empty string would.
 */
function humanTitle(n: unknown): string | null {
  const g = n as { id?: string; frontmatter?: Record<string, unknown>; body?: string };
  const t = nodeTitle(g as never);
  return g.id && t === g.id.slice(0, 18) ? null : t || null;
}

async function resolve(id: string): Promise<void> {
  if (cache.has(id)) return;
  if (inflight.has(id)) return inflight.get(id);
  const p: Promise<void> = api
    .getNode(id)
    .then((n) => {
      cache.set(id, humanTitle(n));
    })
    .catch(() => {
      cache.set(id, null);
    })
    .finally(() => {
      inflight.delete(id);
    });
  inflight.set(id, p);
  return p;
}

export function useNodeTitle(id: string | null | undefined) {
  const [title, setTitle] = useState<string | null>(() => (id ? cache.get(id) ?? null : null));

  useEffect(() => {
    if (!id) {
      setTitle(null);
      return;
    }
    if (cache.has(id)) {
      setTitle(cache.get(id) ?? null);
      return;
    }
    let alive = true;
    void resolve(id).then(() => {
      if (alive) setTitle(cache.get(id) ?? null);
    });
    return () => {
      alive = false;
    };
  }, [id]);

  return title;
}

/** Resolve many ids at once (trace lines, placements, backlinks). */
export function useNodeTitles(ids: string[]) {
  const [, tick] = useState(0);
  useEffect(() => {
    let alive = true;
    const missing = ids.filter((i) => !cache.has(i));
    if (missing.length) {
      void Promise.all(missing.map(resolve)).then(() => {
        if (alive) tick((n) => n + 1);
      });
    }
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(",")]);

  const map = new Map<string, string | null>();
  for (const i of ids) map.set(i, cache.get(i) ?? null);
  return map;
}

export interface NodeRef {
  title: string | null;
  type: string;
}

/**
 * Resolve many ids to title AND type in one pass, cached per session.
 * The trace spine needs both: a human name to read and a stable hue to see.
 */
export function useNodeRefs(ids: string[]) {
  const key = ids.join(",");
  const [, tick] = useState(0);

  useEffect(() => {
    let alive = true;
    const missing = ids.filter((i) => !cache.has(i));
    if (missing.length) {
      void Promise.all(
        missing.map((id) =>
          api
            .getNode(id)
            .then((n) => {
              const g = n as { type?: string };
              cache.set(id, humanTitle(n));
              types.set(id, typeof g.type === "string" ? g.type : "note");
            })
            .catch(() => {
              cache.set(id, null);
              types.set(id, "note");
            }),
        ),
      ).then(() => {
        if (alive) tick((n) => n + 1);
      });
    }
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const map = new Map<string, NodeRef>();
  for (const i of ids) {
    map.set(i, { title: cache.get(i) ?? null, type: types.get(i) ?? "note" });
  }
  return map;
}

export { useNode };
