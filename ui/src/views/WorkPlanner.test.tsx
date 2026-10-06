// Work / Timebox creation (S-CREATE-001, INV-WORK). A work package hangs off a
// bet — so the planner has to say that before the user hits a 400, not after.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WorkPlanner } from "./WorkPlanner";
import { api } from "../api";

const BET = {
  id: "01B1",
  type: "strategy_bet",
  frontmatter: { status: "approved", case: "01CASE1" },
  body: "Speed is the defensible advantage",
};

vi.mock("../api", () => ({
  api: {
    nodesByType: vi.fn(),
    getNode: vi.fn(),
    createWorkPackage: vi.fn(),
    patchNode: vi.fn(),
    scheduleTimebox: vi.fn(),
    commitWorkPackage: vi.fn(),
  },
}));

const noWork = () => {
  vi.mocked(api.nodesByType).mockImplementation((ty: string) =>
    Promise.resolve(ty === "strategy_bet" ? ["01B1"] : []),
  );
  vi.mocked(api.getNode).mockImplementation(() => Promise.resolve(BET as never));
};

describe("WorkPlanner — draft a work package", () => {
  afterEach(cleanup);
  beforeEach(() => {
    vi.clearAllMocks();
    noWork();
    vi.mocked(api.createWorkPackage).mockResolvedValue({ id: "01W1" });
  });

  it("creates a package bound to the active case and a bet, then clears the field", async () => {
    render(<WorkPlanner caseId="01CASE1" />);
    await waitFor(() => expect(screen.getByLabelText("Work package objective")).toBeTruthy());

    fireEvent.change(screen.getByLabelText("Work package objective"), {
      target: { value: "Ship the one-day onboarding" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Add package/ }));

    await waitFor(() => expect(api.createWorkPackage).toHaveBeenCalledTimes(1));
    expect(api.createWorkPackage).toHaveBeenCalledWith(
      "01CASE1",
      "01B1",
      "Ship the one-day onboarding",
    );
    await waitFor(() =>
      expect((screen.getByLabelText("Work package objective") as HTMLInputElement).value).toBe(""),
    );
  });

  it("refuses the form without a case and says why", async () => {
    render(<WorkPlanner caseId={null} />);
    await waitFor(() => expect(screen.getByText(/belongs to a case/)).toBeTruthy());
    expect(screen.queryByLabelText("Work package objective")).toBeNull();
    expect(api.createWorkPackage).not.toHaveBeenCalled();
  });

  it("points at the bet board instead of offering a package with nothing to hang on", async () => {
    vi.mocked(api.nodesByType).mockResolvedValue([]);
    render(<WorkPlanner caseId="01CASE1" />);
    await waitFor(() => expect(screen.getByText(/INV-WORK/)).toBeTruthy());

    const link = screen.getByRole("link", { name: /Draft a bet/ });
    expect(link.getAttribute("href")).toBe("#bets");
    expect(screen.queryByLabelText("Work package objective")).toBeNull();
    expect(api.createWorkPackage).not.toHaveBeenCalled();
  });
});
