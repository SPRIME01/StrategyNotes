// Phase E component test. Proves an organism renders server data and reacts to
// the API. fetch is mocked so the test runs without a live server.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TraceExplorer } from "./organisms";

describe("TraceExplorer organism", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          reachable: ["01HZXAAAAAAAAAAAAAAAAAAAA01", "01HZXBBBBBBBBBBBBBBBBBBBB02"],
        }),
      })) as unknown as typeof fetch
    );
  });

  it("renders reachable nodes after a trace", async () => {
    render(<TraceExplorer />);
    const input = screen.getByPlaceholderText("source node id");
    const button = screen.getByText("trace");
    fireEvent.change(input, { target: { value: "01HZXCCCCCCCCCCCCCCCCCCCC03" } });
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText((c) => c.includes("nodes reachable"))).toBeTruthy();
      expect(screen.getByText("01HZXAAAAAAAAAAAAAAAAAAAA01")).toBeTruthy();
    });
  });
});
