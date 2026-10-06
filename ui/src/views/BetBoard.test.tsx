// Bet Board creation (S-CREATE-001). A board that can only display bets is a
// report; a board that can receive its first bet is a tool. Mocks the api at
// the boundary so the assertions are about the contract, not about HTTP.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ToastProvider } from "../components/ui/toast";
import { BetBoard } from "./BetBoard";
import { api } from "../api";

const BET = {
  id: "01B1",
  type: "strategy_bet",
  frontmatter: {
    status: "draft",
    case: "01CASE1",
    thesis: "Speed is the defensible advantage",
    assumptions: ["ICP rewards delivery speed"],
    counterevidence_reviewed: true,
    success_metric: "time to first value",
    kill_criteria: "no lift after 3 cycles",
    owner: "sam",
  },
  body: "",
};

vi.mock("../api", () => ({
  api: {
    nodesByType: vi.fn(),
    getNode: vi.fn(),
    draftBet: vi.fn(),
    approveBet: vi.fn(),
    killBet: vi.fn(),
    patchNode: vi.fn(),
  },
}));

describe("BetBoard — draft a bet", () => {
  afterEach(cleanup);
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.nodesByType).mockResolvedValue(["01B1"]);
    vi.mocked(api.getNode).mockResolvedValue(BET as never);
    vi.mocked(api.draftBet).mockResolvedValue({ id: "01B2" });
  });

  it("drafts a bet against the active case and clears the field", async () => {
    render(<ToastProvider><BetBoard caseId="01CASE1" /></ToastProvider>);
    await waitFor(() => expect(screen.getByText(/Speed is the defensible advantage/)).toBeTruthy());

    const input = screen.getByLabelText("Bet thesis");
    fireEvent.change(input, { target: { value: "  Delivery speed wins the segment  " } });
    fireEvent.click(screen.getByRole("button", { name: /Draft bet/ }));

    await waitFor(() => expect(api.draftBet).toHaveBeenCalledTimes(1));
    expect(api.draftBet).toHaveBeenCalledWith("01CASE1", "Delivery speed wins the segment");
    // The field clears only after the server accepted it — not before.
    await waitFor(() => expect((screen.getByLabelText("Bet thesis") as HTMLInputElement).value).toBe(""));
  });

  it("will not draft a bet without a case, and says why", async () => {
    render(<ToastProvider><BetBoard caseId={null} /></ToastProvider>);
    await waitFor(() => expect(screen.getByText(/Speed is the defensible advantage/)).toBeTruthy());

    expect(screen.queryByLabelText("Bet thesis")).toBeNull();
    expect(screen.getByText(/belongs to a case/)).toBeTruthy();

    // Nothing to press, so nothing to get wrong.
    expect(api.draftBet).not.toHaveBeenCalled();
  });

  it("keeps the field when the server refuses, so the thesis is not lost", async () => {
    vi.mocked(api.draftBet).mockRejectedValue(new Error("boom"));
    render(<ToastProvider><BetBoard caseId="01CASE1" /></ToastProvider>);
    await waitFor(() => expect(screen.getByText(/Speed is the defensible advantage/)).toBeTruthy());

    const input = screen.getByLabelText("Bet thesis") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "not written anywhere" } });
    fireEvent.click(screen.getByRole("button", { name: /Draft bet/ }));

    await waitFor(() => expect(api.draftBet).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByText(/could not be drafted/)).toBeTruthy());
    expect((screen.getByLabelText("Bet thesis") as HTMLInputElement).value).toBe("not written anywhere");
  });
});
