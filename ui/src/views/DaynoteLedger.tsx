// Daynote Ledger — layout family A, single record.
//
// A daynote is an activity record, never fabricated proof. So this view is
// read-only by construction: it renders what the system recorded and nothing
// else.

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { api } from "../api";
import { PageHead } from "../components/layout/PageHead";
import { Field, Input } from "../components/ui/field";
import { AsyncState } from "../components/ui/async";
import { RegionTitle, Surface, Well } from "../components/ui/surface";

export function DaynoteLedger() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    api
      .daynote(date)
      .then((d) => {
        if (alive) setContent(d.content || "");
      })
      .catch((e) => {
        if (alive) {
          setContent("");
          setError(e);
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [date]);

  const lines = content.split("\n").filter((l) => l.trim());

  return (
    <div className="flex flex-col gap-4">
      <PageHead
        kicker="learning"
        title="Daynote Ledger"
        sub="Your activity, recorded by the system as you worked. Read it honestly. It is a record, not a claim."
      />

      <Surface className="w-fit px-3 py-2.5">
        <Field label="Date" htmlFor="daynote-date">
          <Input
            id="daynote-date"
            type="date"
            value={date}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            className="w-[180px]"
          />
        </Field>
      </Surface>

      <AsyncState
        label={`the daynote for ${date}`}
        loading={loading}
        error={error}
        onRetry={() => setDate((d) => d)}
      >
        <Surface className="flex min-w-0 flex-col">
          <div className="border-b px-3 py-2">
            <RegionTitle count={lines.length}>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3" aria-hidden="true" />
                {date}
              </span>
            </RegionTitle>
          </div>
          {lines.length === 0 ? (
            <p className="t-body px-3 py-6 text-muted-foreground">
              No activity was recorded on this day. Committing and scheduling work writes here
              automatically; nothing can add to it by hand.
            </p>
          ) : (
            <Well className="m-3">
              <pre className="m-0 break-any whitespace-pre-wrap">{lines.join("\n")}</pre>
            </Well>
          )}
        </Surface>
      </AsyncState>
    </div>
  );
}
