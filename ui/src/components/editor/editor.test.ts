// Pure-logic tests for the editor screen: trigger detection, date formatting,
// callout parsing, journal template. These cover the non-trivial behavior
// without coupling to the DOM.

import { describe, it, expect } from "vitest";
import { detectTrigger } from "./NoteEditor";
import { formatJournalDate } from "./EditorHeader";
import { parseCallout } from "./CalloutBlock";
import { JOURNAL_TEMPLATE } from "../journal/JournalDateNav";

describe("detectTrigger", () => {
  it("detects / command at line start", () => {
    const t = detectTrigger("Hello\n/h", 8);
    expect(t?.type).toBe("command");
    expect(t?.partial).toBe("h");
  });

  it("detects / command on an empty first line", () => {
    const t = detectTrigger("/hea", 4);
    expect(t?.type).toBe("command");
    expect(t?.partial).toBe("hea");
  });

  it("does not treat a mid-text slash as a command", () => {
    const t = detectTrigger("a path /usr/bin", 16);
    expect(t?.type).not.toBe("command");
  });

  it("detects @ mention after a space", () => {
    const t = detectTrigger("see @jon", 8);
    expect(t?.type).toBe("mention");
    expect(t?.partial).toBe("jon");
  });

  it("detects [[ wikilink", () => {
    const t = detectTrigger("link [[Spe", 10);
    expect(t?.type).toBe("wikilink");
    expect(t?.partial).toBe("Spe");
  });

  it("detects # tag", () => {
    const t = detectTrigger("tag #evi", 8);
    expect(t?.type).toBe("tag");
    expect(t?.partial).toBe("evi");
  });

  it("returns null with no active trigger", () => {
    expect(detectTrigger("just writing", 12)).toBeNull();
  });
});

describe("formatJournalDate", () => {
  it("formats with ordinal day", () => {
    expect(formatJournalDate(new Date(2026, 5, 22))).toBe("Jun 22nd, 2026");
    expect(formatJournalDate(new Date(2026, 5, 1))).toBe("Jun 1st, 2026");
    expect(formatJournalDate(new Date(2026, 5, 2))).toBe("Jun 2nd, 2026");
    expect(formatJournalDate(new Date(2026, 5, 3))).toBe("Jun 3rd, 2026");
    expect(formatJournalDate(new Date(2026, 5, 11))).toBe("Jun 11th, 2026");
    expect(formatJournalDate(new Date(2026, 5, 21))).toBe("Jun 21st, 2026");
    expect(formatJournalDate(new Date(2026, 5, 23))).toBe("Jun 23rd, 2026");
  });
});

describe("parseCallout", () => {
  it("parses a tip callout with title", () => {
    expect(parseCallout("> [!tip] Working with blocks")).toEqual({ variant: "tip", title: "Working with blocks" });
  });
  it("parses a warn callout case-insensitively", () => {
    expect(parseCallout("> [!WARN] ")).toEqual({ variant: "warn", title: undefined });
  });
  it("returns null for a normal quote", () => {
    expect(parseCallout("> just a quote")).toBeNull();
  });
});

describe("JOURNAL_TEMPLATE", () => {
  it("includes the formatted date heading and sections", () => {
    const tpl = JOURNAL_TEMPLATE(new Date(2026, 5, 22));
    expect(tpl).toContain("# Jun 22nd, 2026");
    expect(tpl).toContain("## Today's Focus");
    expect(tpl).toContain("## Notes");
    expect(tpl).toContain("## Links & References");
  });
});
