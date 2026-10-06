// Generated docs — layout family D (Reading): tab strip → measure-capped article.
//
// The six strategy documents are generated views over the graph, not files. The
// article is capped to a reading measure and entries are rows, not cards.

import { useState } from "react";
import { PageHead } from "../components/layout/PageHead";
import { GeneratedDoc } from "./GeneratedDoc";
import { DOC_SPECS } from "./docSpecs";
import { cn } from "../lib/utils";

export function DocBrowser({ caseId }: { caseId?: string | null }) {
  const [activeId, setActiveId] = useState(DOC_SPECS[0].id);
  const active = DOC_SPECS.find((d) => d.id === activeId) ?? DOC_SPECS[0];

  return (
    <div className="flex flex-col gap-4">
      <PageHead
        kicker="generated"
        title={active.title}
        sub={active.intro}
      />

      <div
        role="tablist"
        aria-label="Strategy documents"
        className="flex flex-wrap gap-1 border-b"
      >
        {DOC_SPECS.map((d) => (
          <button
            key={d.id}
            role="tab"
            aria-selected={d.id === activeId}
            aria-controls={`docpanel-${d.id}`}
            id={`doctab-${d.id}`}
            onClick={() => setActiveId(d.id)}
            title={d.title}
            className={cn(
              "t-fast -mb-px border-b-2 px-3 py-1.5 t-label",
              d.id === activeId
                ? "border-primary text-foreground"
                : "border-transparent text-muted-ink hover:text-foreground",
            )}
          >
            {d.id}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`docpanel-${active.id}`}
        aria-labelledby={`doctab-${active.id}`}
        className="min-w-0"
      >
        <GeneratedDoc spec={active} caseId={caseId} />
      </div>

    </div>
  );
}
