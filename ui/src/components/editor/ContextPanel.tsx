// Context panel — collapsible container (state owned by EditorLayout) composing
// the sections of the Proof Burden for the active note.
//
// Section order is by frequency of use (DESIGN.md §9). Quick Actions was last,
// which meant it fell off the bottom of the panel on a 900px-tall window.

import type { ReactNode } from "react";
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
  onAddToGraph?: () => void;
  onShare?: () => void;
  /** Notify parent to reload after an edge is created. */
  onLinked?: () => void;
  /** Override sections for composition or testing. */
  linked?: ReactNode;
  actions?: ReactNode;
  proof?: ReactNode;
  clones?: ReactNode;
}

export function ContextPanel({
  node,
  onNavigateNote,
  onNewNote,
  onLinkItem,
  onAddToGraph,
  onShare,
  onLinked,
  linked,
  actions,
  proof,
  clones,
}: ContextPanelProps) {
  return (
    <div className="flex flex-col gap-5 p-3">
      <section>
        {proof ?? <ProofBurdenPanel node={node} onLinked={onLinked} />}
      </section>

      <section className="flex flex-col gap-1.5">
        <h2 className="t-label text-muted-ink">Linked here</h2>
        {linked ??
          (node ? (
            <LinkedSection noteId={node.id} onNavigate={onNavigateNote} />
          ) : (
            <p className="t-body text-muted-foreground">No note selected.</p>
          ))}
      </section>

      <section>
        {clones ?? <CloneSection id={node?.id ?? null} onCloned={onLinked} />}
      </section>

      <section className="flex flex-col gap-1.5">
        <h2 className="t-label text-muted-ink">Quick actions</h2>
        {actions ?? (
          <QuickActionsSection
            onNewNote={onNewNote}
            onLinkItem={onLinkItem}
            onAddToGraph={onAddToGraph}
            onShare={onShare}
          />
        )}
      </section>
    </div>
  );
}
