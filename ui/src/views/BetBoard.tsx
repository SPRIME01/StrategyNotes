// Bet Board — layout family B (Board): columns of state.
//
// Columns are Rails, not cards. Every column states its count and says what it
// means when empty. A blocked bet shows its unmet requirements AND the control
// that clears them, because a red flag without a path is the compliance-auditor
// failure (PRODUCT.md).

import { useState } from "react";
import { Check, Pencil, Plus, Target, X } from "lucide-react";
import { useTypedNodes } from "../hooks/useTypedNodes";
import { api, type GateResult } from "../api";
import { PageHead } from "../components/layout/PageHead";
import { Button } from "../components/ui/button";
import { AsyncState } from "../components/ui/async";
import { Field, Input } from "../components/ui/field";
import { Rail, RegionTitle, Surface } from "../components/ui/surface";
import { useToast } from "../components/ui/toast";
import {
  ConfirmButton, GateResult as GateVerdict, NodeTypeChip,
  RequirementList, StatusChip, type Requirement,
} from "../atoms";
import { facetHref, facetHrefOr, nodeHref } from "./FacetPage";
import { fmBool, fmFilled, fmList, fmString, nodeExcerpt, nodeTitle } from "../lib/node";
import { cn } from "../lib/utils";

const BET_REQS: [string, string][] = [
  ["linked_choice", "linked choice"],
  ["assumptions", "assumptions"],
  ["counterevidence_reviewed", "counterevidence reviewed"],
  ["success_metric", "success metric"],
  ["kill_criteria", "kill criteria"],
  ["owner", "owner"],
];

type ColId = "draft" | "blocked" | "approved" | "killed";

const COLUMNS: { id: ColId; label: string; empty: string }[] = [
  { id: "draft", label: "Draft", empty: "No drafts. Capture a bet as a note, then promote it." },
  { id: "blocked", label: "Blocked", empty: "Nothing blocked by a gate." },
  { id: "approved", label: "Approved", empty: "No approved bets yet." },
  { id: "killed", label: "Killed", empty: "Nothing killed." },
];

interface EditForm {
  owner: string;
  kill_criteria: string;
  success_metric: string;
  assumptions: string;
  counterevidence_reviewed: boolean;
}

const EMPTY_FORM: EditForm = {
  owner: "",
  kill_criteria: "",
  success_metric: "",
  assumptions: "",
  counterevidence_reviewed: false,
};

export function BetBoard({ caseId }: { caseId?: string | null }) {
  const { nodes, loading, error, reload } = useTypedNodes("strategy_bet");
  const [gate, setGate] = useState<Record<string, GateResult>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EditForm>(EMPTY_FORM);
  const [thesis, setThesis] = useState("");
  const [drafting, setDrafting] = useState(false);
  const { notify } = useToast();

  const colOf = (id: string, status: string) => {
    const st = status.toLowerCase();
    if (st === "approved") return "approved" as const;
    if (st === "killed") return "killed" as const;
    if (st === "blocked" || gate[id]?.status === "blocked") return "blocked" as const;
    return "draft" as const;
  };

  const grouped = (col: ColId) =>
    nodes.filter((b) => colOf(b.id, fmString(b, "status")) === col);

  const approve = async (id: string, title: string) => {
    try {
      const r = await api.approveBet(id);
      setGate((g) => ({ ...g, [id]: r }));
      notify(
        r.status === "approved"
          ? `Approved "${title}". A decision record was written.`
          : `"${title}" is blocked by a gate.`,
        r.status === "approved" ? "ok" : "bad",
      );
      reload();
    } catch {
      setGate((g) => ({ ...g, [id]: { status: "blocked", failed_gates: ["unreachable"] } }));
      notify("The server did not respond. Nothing was approved.", "bad");
    }
  };

  const kill = async (b: (typeof nodes)[number]) => {
    const title = nodeTitle(b);
    try {
      await api.killBet(b.id);
      notify(
        `Killed "${title}". The bet stays in the vault, so its history can still be traced.`,
        "info",
      );
      reload();
    } catch {
      notify("The server did not respond. The bet is unchanged.", "bad");
    }
  };

  const startEdit = (b: (typeof nodes)[number]) => {
    setEditingId(b.id);
    setForm({
      owner: fmString(b, "owner"),
      kill_criteria: fmString(b, "kill_criteria"),
      success_metric: fmString(b, "success_metric"),
      assumptions: fmList(b, "assumptions").join(", "),
      counterevidence_reviewed: fmBool(b, "counterevidence_reviewed"),
    });
  };

  const save = async (b: (typeof nodes)[number]) => {
    try {
      await api.patchNode(b.id, {
        frontmatter: {
          ...b.frontmatter,
          owner: form.owner,
          kill_criteria: form.kill_criteria,
          success_metric: form.success_metric,
          assumptions: form.assumptions.split(",").map((s) => s.trim()).filter(Boolean),
          counterevidence_reviewed: form.counterevidence_reviewed,
        },
      });
      setEditingId(null);
      notify("Bet requirements saved.", "ok");
      reload();
    } catch {
      notify("The server did not respond. Nothing was saved.", "bad");
    }
  };

  /** Draft a bet. The server picks the id and the `draft` status; the board only
   *  re-reads markdown (INV-DUR — nothing is optimistically faked in the UI). */
  const draft = async () => {
    const text = thesis.trim();
    if (!text || !caseId || drafting) return;
    setDrafting(true);
    try {
      await api.draftBet(caseId, text);
      setThesis("");
      notify("Drafted a bet. A bet cannot be approved until its requirements are filled in.", "ok");
      reload();
    } catch {
      notify("The bet could not be drafted. Nothing was written.", "bad");
    } finally {
      setDrafting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHead
        kicker="strategy"
        title="Bet Board"
        sub="A bet is a falsifiable commitment. It cannot be approved until its assumptions, counterevidence review, success metric, kill criteria, and owner are all recorded."
      />

      {/* Creation lives above the columns so it survives the empty state — a
          board with no bets must still be able to receive its first one. */}
      {caseId ? (
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void draft();
          }}
        >
          <label htmlFor="new-bet-thesis" className="sr-only">
            Bet thesis
          </label>
          <Input
            id="new-bet-thesis"
            className="min-w-0 flex-1"
            placeholder="What are you willing to be wrong about?"
            value={thesis}
            onChange={(e) => setThesis(e.target.value)}
          />
          <Button type="submit" variant="default" size="md" disabled={!thesis.trim() || drafting}>
            <Plus className="size-3.5" aria-hidden="true" />
            {drafting ? "Drafting…" : "Draft bet"}
          </Button>
        </form>
      ) : (
        <p className="t-body text-faint">
          A bet belongs to a case. Pick one in the app bar to draft a bet here.
        </p>
      )}

      <AsyncState
        label="bets"
        loading={loading}
        error={error}
        onRetry={reload}
        empty={nodes.length === 0}
        noun="bets"
        emptyHint="A strategy bet is a claim you are willing to be wrong about. Draft one above: the board gives it a `draft` status, and it stays a draft until every requirement is recorded and the approval gate passes."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => {
            const items = grouped(col.id);
            return (
              <Rail key={col.id} className="min-w-0">
                <Surface tone={2} className="shrink-0 px-2.5 py-1.5">
                  <RegionTitle count={items.length}>{col.label}</RegionTitle>
                </Surface>
                <div className="flex flex-col gap-1.5">
                  {items.length === 0 ? (
                    <p className="t-body px-1 py-3 text-[13px] text-faint">{col.empty}</p>
                  ) : (
                    items.map((b) =>
                      editingId === b.id ? (
                        <EditCard
                          key={b.id}
                          title={nodeTitle(b)}
                          form={form}
                          setForm={setForm}
                          onSave={() => save(b)}
                          onCancel={() => setEditingId(null)}
                        />
                      ) : (
                        <BetCard
                          key={b.id}
                          bet={b}
                          col={col.id}
                          gate={gate[b.id] ?? null}
                          onApprove={() => approve(b.id, nodeTitle(b))}
                          onEdit={() => startEdit(b)}
                          onKill={() => kill(b)}
                        />
                      ),
                    )
                  )}
                </div>
              </Rail>
            );
          })}
        </div>
      </AsyncState>
    </div>
  );
}

function requirementsOf(b: { frontmatter: Record<string, unknown> }): Requirement[] {
  return BET_REQS.map(([key, label]) => ({
    key,
    label,
    filled:
      key === "assumptions"
        ? fmList(b as never, key).length > 0
        : key === "counterevidence_reviewed"
          ? fmBool(b as never, key)
          : fmFilled(b as never, key),
  }));
}

function BetCard({
  bet,
  col,
  gate,
  onApprove,
  onEdit,
  onKill,
}: {
  bet: { id: string; type: string; frontmatter: Record<string, unknown> };
  col: ColId;
  gate: GateResult | null;
  onApprove: () => void;
  onEdit: () => void;
  onKill: () => void;
}) {
  const reqs = requirementsOf(bet);
  const unmet = reqs.filter((r) => !r.filled).length;
  const actionable = col === "draft" || col === "blocked";

  return (
    <Surface
      tone={2}
      className={cn(
        "min-w-0 p-2.5",
        col === "blocked" && "border border-gate-bad/35",
        col === "approved" && "border border-gate-ok/25",
        col === "killed" && "opacity-60",
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <NodeTypeChip type={bet.type} to={facetHref("type", bet.type)} />
        <StatusChip status={fmString(bet as never, "status", "draft")} to={facetHrefOr("status", fmString(bet as never, "status"))} />
      </div>
      <a href={nodeHref(bet.id)} className="t-row mt-1.5 block break-any hover:underline">
        {nodeExcerpt(bet as never, 180)}
      </a>

      <RequirementList
        className="mt-2"
        requirements={reqs}
        action={
          unmet > 0 ? (
            <Button size="sm" onClick={onEdit} title="Fill in the unmet requirements">
              <Pencil className="size-3" aria-hidden="true" />
              Fill {unmet} requirement{unmet === 1 ? "" : "s"}
            </Button>
          ) : undefined
        }
      />

      <GateVerdict gate={gate} className="mt-2" />

      {actionable && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-border pt-2">
          <Button
            size="sm"
            variant={unmet === 0 ? "default" : "outline"}
            onClick={onApprove}
            title="Run the bet approval gate"
          >
            <Target className="size-3.5" aria-hidden="true" />
            Approve bet
          </Button>
          <Button size="sm" variant="ghost" onClick={onEdit}>
            Edit
          </Button>
          <ConfirmButton
            className="ml-auto"
            label="Kill it"
            onConfirm={onKill}
          >
            Kill
          </ConfirmButton>
        </div>
      )}

      {col === "approved" && (
        <div className="mt-2.5 flex items-center gap-1.5 border-t border-border pt-2">
          <span className="flex items-center gap-1 text-[11px] text-gate-ok">
            <Check className="size-3" aria-hidden="true" />
            Decision record written
          </span>
          <ConfirmButton className="ml-auto" label="Kill it" onConfirm={onKill}>
            Kill
          </ConfirmButton>
        </div>
      )}

      {col === "killed" && (
        <p className="mt-2 flex items-center gap-1 text-[11px] text-faint">
          <X className="size-3" aria-hidden="true" />
          Kept for the record. A killed bet is still evidence.
        </p>
      )}
    </Surface>
  );
}

function EditCard({
  title,
  form,
  setForm,
  onSave,
  onCancel,
}: {
  title: string;
  form: EditForm;
  setForm: React.Dispatch<React.SetStateAction<EditForm>>;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <Surface tone={2} className="border border-primary/40 p-2.5">
      <p className="t-row break-any">{title}</p>
      <div className="mt-2 flex flex-col gap-2">
        <Field label="Owner" htmlFor={`f-owner-${title}`}>
          <Input
            id={`f-owner-${title}`}
            value={form.owner}
            onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
            placeholder="Lead Strategist"
          />
        </Field>
        <Field label="Success metric" htmlFor={`f-metric-${title}`}>
          <Input
            id={`f-metric-${title}`}
            value={form.success_metric}
            onChange={(e) => setForm((f) => ({ ...f, success_metric: e.target.value }))}
            placeholder="5 pilot customers in 30 days"
          />
        </Field>
        <Field label="Kill criteria" htmlFor={`f-kill-${title}`}>
          <Input
            id={`f-kill-${title}`}
            value={form.kill_criteria}
            onChange={(e) => setForm((f) => ({ ...f, kill_criteria: e.target.value }))}
            placeholder="Fewer than 3 signups after 20 interviews"
          />
        </Field>
        <Field label="Assumptions" hint="Comma separated" htmlFor={`f-assume-${title}`}>
          <Input
            id={`f-assume-${title}`}
            value={form.assumptions}
            onChange={(e) => setForm((f) => ({ ...f, assumptions: e.target.value }))}
            placeholder="speed matters most, founders build fast"
          />
        </Field>
        <label className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <input
            type="checkbox"
            checked={form.counterevidence_reviewed}
            onChange={(e) => setForm((f) => ({ ...f, counterevidence_reviewed: e.target.checked }))}
            className="size-3.5 accent-[var(--color-primary)]"
          />
          I have reviewed the counterevidence
        </label>
        <div className="flex gap-1.5">
          <Button size="sm" onClick={onSave}>
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </Surface>
  );
}
