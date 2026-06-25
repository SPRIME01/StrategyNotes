// Proves a generated document is a live view over the graph: it renders the
// nodes a section queries (and honors filters — e.g. ERD shows only accepted
// evidence). Mocks the api at the boundary.

import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { GeneratedDoc } from "./GeneratedDoc";
import type { DocSpec } from "./GeneratedDoc";
import { api } from "../api";

const accepted = { id: "01J..EV1", type: "evidence_item", frontmatter: { text: "speed is key", proof_level: "Observed", status: "Accepted", source_chunk: "01J..SC1" }, body: "" };
const drafted = { id: "01J..EV2", type: "evidence_item", frontmatter: { text: "maybe churn", proof_level: "Hypothesized", status: "Drafted" }, body: "" };

vi.mock("../api", () => ({
  api: {
    nodesByType: vi.fn().mockResolvedValue(["01J..EV1", "01J..EV2"]),
    getNode: vi.fn().mockImplementation((id: string) =>
      Promise.resolve(id.endsWith("EV1") ? accepted : drafted),
    ),
  },
}));

const erdSpec: DocSpec = {
  id: "erd", title: "Evidence Reality Dossier", kicker: "REALITY", intro: "test",
  sections: [{
    label: "Accepted Evidence",
    nodeType: "evidence_item",
    fields: [{ key: "source_chunk", label: "source" }],
    filter: (n) => String(n.frontmatter.status).toLowerCase() === "accepted",
  }],
};

describe("GeneratedDoc", () => {
  it("renders only the nodes that pass the section filter (ERD = accepted)", async () => {
    render(<GeneratedDoc spec={erdSpec} />);
    await waitFor(() => expect(screen.getByText("speed is key")).toBeTruthy());
    // accepted shown
    expect(screen.getByText("speed is key")).toBeTruthy();
    // drafted filtered out
    expect(screen.queryByText("maybe churn")).toBeNull();
    // section count reflects filtered set
    expect(screen.getByText("1")).toBeTruthy();
  });

  it("case-scopes a section that declares a caseField", async () => {
    const inCase = { id: "01J..O1", type: "ord", frontmatter: { statement: "in-case outcome", case: "01J..CASE" }, body: "" };
    const other = { id: "01J..O2", type: "ord", frontmatter: { statement: "other-case outcome", case: "01J..OTHER" }, body: "" };
    vi.mocked(api.nodesByType).mockResolvedValueOnce(["01J..O1", "01J..O2"]);
    vi.mocked(api.getNode).mockImplementation((id: string) =>
      Promise.resolve(id.endsWith("O1") ? inCase : other),
    );
    const spec: DocSpec = {
      id: "ord", title: "ORD", kicker: "O", intro: "t",
      sections: [{ label: "Outcome Requirements", nodeType: "ord", caseField: "case" }],
    };
    render(<GeneratedDoc spec={spec} caseId="01J..CASE" />);
    await waitFor(() => expect(screen.getByText("in-case outcome")).toBeTruthy());
    expect(screen.queryByText("other-case outcome")).toBeNull();
  });
});
