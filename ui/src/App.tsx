// App shell — routes to a view, owns the workspace bar and the shortcuts.
//
// DESIGN.md §7/§8: one layout family per view, real hash routes, no chrome
// theater. The old 932-line file mixed nine views into one component, which is
// precisely why every surface looked the same. Each view now lives in views/ and
// belongs to a declared layout family.

import { useState } from "react";
import { Sidebar, type ViewId } from "./components/layout/Sidebar";
import { AppShell, PageBody, WorkspaceBar } from "./components/layout/AppShell";
import { PageHead, useHashRoute } from "./components/layout/PageHead";
import { ToastProvider, useToast } from "./components/ui/toast";
import { ShortcutsHelp, useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useWorkspace } from "./hooks/useWorkspace";
import { api } from "./api";

import { NotesScreen } from "./views/NotesScreen";
import { JournalView } from "./views/JournalView";
import { CockpitView } from "./views/CockpitView";
import { EvidenceInbox } from "./views/EvidenceInbox";
import { DocBrowser } from "./views/DocBrowser";
import { BetBoard } from "./views/BetBoard";
import { TraceExplorer } from "./views/TraceExplorer";
import { WorkPlanner } from "./views/WorkPlanner";
import { CalendarView } from "./views/CalendarView";
import { ExecutionRunbook } from "./views/ExecutionRunbook";
import { DaynoteLedger } from "./views/DaynoteLedger";
import { ValueView } from "./views/ValueView";
import { AgentDrafts } from "./views/AgentDrafts";
import { FacetPage, type FacetDim } from "./views/FacetPage";
import { NodePage } from "./views/NodePage";

const VALID: ViewId[] = [
  "notes", "journal", "cockpit", "evidence", "docs", "bets",
  "trace", "work", "calendar", "runbook", "daynote", "vrd", "agent",
];

/**
 * Two routes are not nav destinations — they are *derived* pages reached by
 * clicking a status, a tag, or a node:
 *
 *   #facet/<dim>/<value>   everything carrying that status / type / tag
 *   #node/<ulid>           one node, its references both ways
 *
 * They render inside the shell (so Back, the rail and the workspace bar still
 * work) but the rail keeps `cockpit` current, because neither is a place you
 * navigate to — you arrive at one by following a link out of something else.
 */
type Derived =
  | { kind: "facet"; dim: FacetDim; value: string }
  | { kind: "node"; id: string }
  | null;

function parseDerived(route: string): Derived {
  if (route.startsWith("facet/")) {
    const [, dim, ...rest] = route.split("/");
    const value = decodeURIComponent(rest.join("/"));
    if ((dim === "status" || dim === "type" || dim === "tag") && value) {
      return { kind: "facet", dim, value };
    }
    return null;
  }
  if (route.startsWith("node/")) {
    const id = route.slice("node/".length);
    return id ? { kind: "node", id } : null;
  }
  return null;
}

export function App() {
  return (
    <ToastProvider>
      <Shell />
    </ToastProvider>
  );
}

function Shell() {
  const [view, navigate] = useHashRoute<ViewId>("cockpit");
  const ws = useWorkspace();
  const { notify } = useToast();
  const [pendingNoteId, setPendingNoteId] = useState<string | null>(null);

  // An unknown hash should not blank the app.
  const derived = parseDerived(view);
  const active: ViewId = VALID.includes(view) ? view : "cockpit";

  const { helpOpen, setHelpOpen, shortcuts } = useKeyboardShortcuts([
    {
      combo: "mod+n",
      description: "New note",
      allowInInput: true,
      action: async () => {
        try {
          const n = await api.createNote("Untitled note");
          setPendingNoteId(String(n.id));
          notify("Note created.", "ok");
        } catch {
          // Never silently swallow: say what happened instead of navigating away.
          notify("Could not create a note. The local server did not respond.", "bad");
          return;
        }
        navigate("notes");
      },
    },
    {
      combo: "mod+j",
      description: "Go to today's journal",
      allowInInput: true,
      action: () => navigate("journal"),
    },
  ]);

  // The editor screens own their own full 3-panel layout (DESIGN.md §9).
  if (active === "notes") {
    return (
      <NotesScreen
        onSelectView={navigate}
        initialNoteId={pendingNoteId}
        onCreated={() => setPendingNoteId(null)}
      />
    );
  }
  if (active === "journal") {
    return <JournalView onSelectView={navigate} />;
  }

  return (
    <AppShell
      active={active}
      onSelect={navigate}
      onNewPage={() => navigate("notes")}
      bar={
        <WorkspaceBar
          cases={ws.cases}
          caseId={ws.caseId}
          onCaseChange={ws.setCaseId}
          committed={ws.committedPomos}
          available={ws.capacityAvailable}
          online={ws.online}
        />
      }
    >
      <PageBody>
        {derived?.kind === "facet" && <FacetPage dim={derived.dim} value={derived.value} />}
        {derived?.kind === "node" && <NodePage id={derived.id} />}
        {!derived && (
          <>
            {active === "cockpit" && (
              <CockpitView onNavigate={navigate} committedPomos={ws.committedPomos} />
            )}
            {active === "evidence" && <EvidenceInbox />}
            {active === "docs" && <DocBrowser caseId={ws.caseId} />}
            {active === "bets" && <BetBoard caseId={ws.caseId} />}
            {active === "trace" && <TraceExplorer />}
            {active === "work" && <WorkPlanner caseId={ws.caseId} />}
            {active === "calendar" && <CalendarView />}
            {active === "runbook" && <ExecutionRunbook onNavigate={navigate} />}
            {active === "daynote" && <DaynoteLedger />}
            {active === "vrd" && <ValueView />}
            {active === "agent" && <AgentDrafts />}
          </>
        )}
      </PageBody>

      <ShortcutsHelp
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        shortcuts={shortcuts}
      />
    </AppShell>
  );
}

export { PageHead, Sidebar };
