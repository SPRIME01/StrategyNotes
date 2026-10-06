// Calendar view — the commitment set read as time (INV-TIME, SDS-CAL).
// Mocks the api at the boundary so the assertions are about grouping, order and
// the export contract, not about HTTP.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CalendarView } from "./CalendarView";
import { api } from "../api";

const WORK = { id: "01W1", type: "work_package", frontmatter: { title: "Ship 1-day onboarding" }, body: "" };

// Written deliberately out of schedule order, plus one whose window cannot be
// read — nothing may be dropped, and nothing may sort ahead of a real window.
const T_LATER = {
  id: "01T2",
  type: "timebox",
  frontmatter: {
    work_package: "01W1",
    status: "committed",
    expected_output: "review evidence",
    scheduled_start: "2026-07-02T09:00:00Z",
    scheduled_end: "2026-07-02T10:00:00Z",
    estimate: { pomos: 2 },
  },
  body: "",
};
const T_EARLIER = {
  id: "01T1",
  type: "timebox",
  frontmatter: {
    work_package: "01W1",
    status: "committed",
    expected_output: "ship draft",
    scheduled_start: "2026-07-01T13:00:00Z",
    scheduled_end: "2026-07-01T14:00:00Z",
    estimate: { pomos: 4 },
  },
  body: "",
};
const T_BROKEN = {
  id: "01T3",
  type: "timebox",
  frontmatter: { work_package: "01W1", status: "committed", scheduled_start: "not-a-date" },
  body: "",
};

const NODES: Record<string, unknown> = { "01W1": WORK, "01T1": T_EARLIER, "01T2": T_LATER, "01T3": T_BROKEN };

vi.mock("../api", () => ({
  api: {
    nodesByType: vi.fn(),
    getNode: vi.fn(),
    exportIcs: vi.fn(),
  },
}));

/** True when `b` comes after `a` in the document. */
function follows(a: Element, b: Element): boolean {
  return (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
}

describe("CalendarView", () => {
  // This vitest config runs without globals, so RTL's auto-cleanup never
  // registers — without this, each test queries the previous test's DOM too.
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.nodesByType).mockImplementation((ty: string) =>
      Promise.resolve(ty === "timebox" ? ["01T2", "01T3", "01T1"] : ["01W1"]),
    );
    vi.mocked(api.getNode).mockImplementation((id: string) =>
      Promise.resolve(NODES[id] as never),
    );
  });

  it("groups timeboxes by day in schedule order and keeps the unreadable one visible", async () => {
    render(<CalendarView />);
    await waitFor(() => expect(screen.getByText("ship draft")).toBeTruthy());

    // Schedule order, not write order: Jul 1 before Jul 2.
    expect(follows(screen.getByText("ship draft"), screen.getByText("review evidence"))).toBe(true);
    // The timebox with no readable window is shown last under its own heading —
    // present, not silently dropped.
    expect(follows(screen.getByText("review evidence"), screen.getByText(/Undated/))).toBe(true);
    expect(screen.getByText("no window")).toBeTruthy();
    // Rows resolve the work package they name and carry the reserved cost.
    expect(screen.getAllByText("Ship 1-day onboarding").length).toBe(3);
    expect(screen.getByText("4p")).toBeTruthy();
  });

  it("exports the whole commitment set as one .ics file", async () => {
    vi.mocked(api.exportIcs).mockResolvedValue({
      ics: "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nEND:VCALENDAR\r\n",
    });
    const createObjectURL = vi.fn(() => "blob:test");
    const revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    render(<CalendarView />);
    await waitFor(() => expect(screen.getByText("ship draft")).toBeTruthy());

    fireEvent.click(screen.getByRole("button", { name: /Export \.ics/ }));
    await waitFor(() => expect(api.exportIcs).toHaveBeenCalledTimes(1));

    expect(click).toHaveBeenCalledTimes(1);
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledTimes(1);
    click.mockRestore();
  });

  it("offers a way to the planner instead of an export with nothing to export", async () => {
    vi.mocked(api.nodesByType).mockImplementation((ty: string) =>
      Promise.resolve(ty === "timebox" ? [] : ["01W1"]),
    );
    render(<CalendarView />);
    await waitFor(() =>
      expect(screen.getByRole("link", { name: /Work \/ Timebox planner/ })).toBeTruthy(),
    );
    // INV-CAL: an empty calendar exports nothing, so there is no button to press.
    expect(screen.queryByRole("button", { name: /Export \.ics/ })).toBeNull();
  });
});
