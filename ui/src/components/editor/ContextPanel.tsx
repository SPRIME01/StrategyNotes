// TASK-E04 — Context panel. Collapsible container (open/closed state owned by
// EditorLayout) composing the Linked, Quick Actions, and Proof Burden sections
// for the currently active note. Proof Burden (SPEC §11.4) replaces the old
// static "Core Concepts" section — it reads the node's typed edges.

import type { ReactNode } from "react";
import { SectionLabel } from "../../atoms";
import { LinkedSection } from "./LinkedSection";
import { QuickActionsSection } from "./QuickActionsSection";
import { ProofBurdenPanel } from "./ProofBurdenPanel";
import { CloneSection } from "./CloneSection";
import type { GraphNode } from "../../lib/node";

export interface ContextPanelProps {
  node: GraphNode | null;
  onNavigateNote?: (id: string) => void;
  onNewNote?: () => void;
  onLinkItem?: () => void;
  onShare?: () => void;
  /** Notify parent to reload after an edge is created (Proof Burden refresh). */
  onLinked?: () => void;
  /** Override sections for testing or composition. */
  linked?: ReactNode;
  actions?: ReactNode;
  proof?: ReactNode;
}

export function ContextPanel({
  node,
  onNavigateNote,
  onNewNote,
  onLinkItem,
  onShare,
  onLinked,
  linked,
  actions,
  proof,
}: ContextPanelProps) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <SectionLabel>Linked</SectionLabel>
      {linked ?? (node
        ? <LinkedSection noteId={node.id} onNavigate={onNavigateNote} />
        : <EmptyHint>No note selected.</EmptyHint>)}

      <SectionLabel>Proof Burden</SectionLabel>
      {proof ?? <ProofBurdenPanel node={node} onLinked={onLinked} />}

      <SectionLabel>Clones</SectionLabel>
      <CloneSection id={node?.id ?? null} onCloned={onLinked} />

      <SectionLabel>Quick Actions</SectionLabel>
      {actions ?? (
        <QuickActionsSection onNewNote={onNewNote} onLinkItem={onLinkItem} onShare={onShare} />
      )}
    </div>
  );
}

function EmptyHint({ children }: { children: ReactNode }) {
  return <p className="text-xs text-muted-foreground">{children}</p>;
}
