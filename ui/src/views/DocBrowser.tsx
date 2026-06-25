// Document browser — the single generated-docs surface. Tabs across
// ERD/ORD/SLD/EDS/VSD; each renders its GeneratedDoc spec. Every doc is a
// living view over the graph (regenerated on open), not a static file.

import { useState } from "react";
import { GeneratedDoc } from "./GeneratedDoc";
import { DOC_SPECS } from "./docSpecs";
import { cn } from "../lib/utils";

export function DocBrowser({ caseId }: { caseId?: string | null }) {
  const [activeId, setActiveId] = useState(DOC_SPECS[0].id);
  const active = DOC_SPECS.find((d) => d.id === activeId) ?? DOC_SPECS[0];

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1 border-b">
        {DOC_SPECS.map((d) => (
          <button
            key={d.id}
            onClick={() => setActiveId(d.id)}
            className={cn(
              "border-b-2 px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors",
              d.id === activeId
                ? "border-primary text-foreground"
                : "border-transparent text-muted-ink hover:text-foreground",
            )}
            title={d.title}
          >
            {d.id.toUpperCase()}
          </button>
        ))}
      </div>
      <GeneratedDoc spec={active} caseId={caseId} />
    </div>
  );
}
