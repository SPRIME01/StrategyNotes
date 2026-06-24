// Proves the generated-view data path: useTypedNodes resolves IDs → typed
// GraphNodes via the API. Mocks fetch at the api boundary.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useTypedNodes } from "./useTypedNodes";

vi.mock("../api", () => ({
  api: {
    nodesByType: vi.fn().mockResolvedValue(["01J..E1", "01J..E2"]),
    getNode: vi.fn().mockImplementation((id: string) =>
      Promise.resolve({
        id,
        type: "evidence_item",
        frontmatter: { text: `evidence ${id}`, proof_level: "Observed", status: "Accepted" },
        body: "",
      }),
    ),
  },
}));

import { api } from "../api";

describe("useTypedNodes", () => {
  beforeEach(() => vi.clearAllMocks());

  it("resolves typed nodes from the graph", async () => {
    const { result } = renderHook(() => useTypedNodes("evidence_item"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(api.nodesByType).toHaveBeenCalledWith("evidence_item");
    expect(result.current.nodes).toHaveLength(2);
    expect(result.current.nodes[0].frontmatter.proof_level).toBe("Observed");
  });

  it("surfaces an honest empty state when the type is absent", async () => {
    vi.mocked(api.nodesByType).mockResolvedValueOnce([]);
    const { result } = renderHook(() => useTypedNodes("strategy_bet"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.nodes).toEqual([]);
  });
});
