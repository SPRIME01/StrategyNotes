# Source Design Issues

**Source Design:** StrategyNotes Product UI Design
**Project ID:** `37b89c16-284e-4de4-82fd-dadb39e9792d`
**Audit Date:** 2026-06-23

---

## Overview

The source design contains internal inconsistencies between `DESIGN.md` (specification document) and `index.html` (CSS prototype). These defects should NOT be propagated to the implementation. Where the implementation differs from the spec due to these issues, the implementation is marked ACCEPTABLE.

---

## Token Inconsistencies

### Issue #1: Hue Angle Mismatch

**Location:** `DESIGN.md:16-22` vs `index.html:23-28`
**Category:** INCONSISTENT
**Severity:** Warning

**Description:**

- DESIGN.md specifies hue **255** for the canvas palette (blue-purple)
- index.html CSS uses hue **264** throughout (blue-gray)

**Impact:** The entire color temperature of the UI differs between spec and prototype.

**Recommendation:** Use **264** (from index.html) as it appears to be the intentionally evolved value. The implementation correctly uses 264.

---

### Issue #2: Lightness Value Drift

**Location:** `DESIGN.md:23-26` vs `index.html:30-33`
**Category:** INCONSISTENT
**Severity:** Warning

**Description:**

| Token      | DESIGN.md | index.html | Delta |
| ---------- | --------- | ---------- | ----- |
| `--fg`     | 94%       | 95%        | +1%   |
| `--fg-dim` | 78%       | 80%        | +2%   |
| `--muted`  | 58%       | 60%        | +2%   |
| `--faint`  | 42%       | 44%        | +2%   |

**Impact:** Text colors are slightly lighter in the prototype than specified.

**Recommendation:** Use values from **index.html** (prototype). The +2% lightness improves readability on dark backgrounds. The implementation correctly uses the prototype values.

---

### Issue #3: Font Stack Mismatch (CRITICAL)

**Location:** `DESIGN.md:41-44` vs `index.html:49-52`
**Category:** INCONSISTENT
**Severity:** Critical

**Description:**

**DESIGN.md specifies:**

```css
--font-display:
  "Iowan Old Style", "Charter", "Source Serif Pro", Georgia, serif;
--font-ui: -apple-system, "Inter", system-ui, sans-serif;
--font-mono: "JetBrains Mono", "IBM Plex Mono", ui-monospace, Menlo, monospace;
```

**index.html uses:**

```css
--font-display: "Josefin Sans", system-ui, sans-serif;
--font-header: "Josefin Slab", Georgia, serif;
--font-ui: "IBM Plex Sans", system-ui, -apple-system, sans-serif;
--font-mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
```

**Impact:**

- DESIGN.md calls for serif display font (Iowan Old Style) but prototype uses sans-serif (Josefin Sans)
- Prototype introduces `--font-header` (Josefin Slab) which does not exist in the spec
- The design philosophy in DESIGN.md section 2 states "The serif display is the signature" but the prototype contradicts this

**Recommendation:** The prototype font stack (Josefin Sans/Slab + IBM Plex) is the evolved design decision. The serif fonts in DESIGN.md are likely outdated. **Use the prototype fonts.** The implementation correctly follows the prototype.

---

### Issue #4: Accent Token Values Differ

**Location:** `DESIGN.md:32-33` vs `index.html:39-40`
**Category:** INCONSISTENT
**Severity:** Warning

**Description:**

| Token                    | DESIGN.md | index.html |
| ------------------------ | --------- | ---------- |
| `--accent-dim` alpha     | 0.16      | 0.13       |
| `--accent-ink` lightness | 70%       | 82%        |

**Impact:** Accent text (`--accent-ink`) is significantly lighter in prototype (82%) vs spec (70%), affecting text prominence.

**Recommendation:** Use **index.html values** (0.13 alpha, 82% lightness). The lighter accent-ink provides better visual balance. The implementation should use these values when adding the tokens.

---

### Issue #5: Semantic Color Desaturation

**Location:** `DESIGN.md:35-38` vs `index.html:42-45`
**Category:** INCONSISTENT
**Severity:** Warning

**Description:**

| Token    | DESIGN.md             | index.html            |
| -------- | --------------------- | --------------------- |
| `--ok`   | `oklch(80% 0.16 150)` | `oklch(78% 0.13 152)` |
| `--bad`  | `oklch(72% 0.19 25)`  | `oklch(70% 0.16 24)`  |
| `--warn` | `oklch(82% 0.15 80)`  | `oklch(80% 0.12 78)`  |
| `--info` | `oklch(78% 0.10 245)` | `oklch(76% 0.08 245)` |

**Impact:** Semantic colors are desaturated (lower chroma) in the prototype, making state indicators subtler.

**Recommendation:** The implementation already uses the **index.html values** and should continue to do so. The desaturation is intentional for a calmer, more "instrument-like" UI aesthetic.

---

## Structural Issues

### Issue #6: Missing Theme Toggle Accessibility

**Location:** `index.html:133-150`
**Category:** AMBIGUOUS
**Severity:** Note

**Description:** The `.theme-toggle` button has no ARIA label or accessible name. The button contains only icon spans.

```html
<button class="theme-toggle">
  <span class="theme-ico theme-ico-light">sun</span>
  <span class="theme-ico theme-ico-dark">moon</span>
</button>
```

**Recommendation:** Add `aria-label="Toggle theme"` to the button. This is a design spec omission that the implementation should correct.

---

### Issue #7: Missing Notes Screen (CRITICAL)

**Location:** Open Design NAV structure vs `SPEC.md:§1.3, §1.4, §3.3, §4.1, §12.1`
**Category:** INCOMPLETE
**Severity:** Critical

**Description:**

The SPEC explicitly defines StrategyNotes as a "strategy-native **notes app**" with a dedicated Notes mode. However, the Open Design prototype contains NO screen for note-taking.

**SPEC Requirements:**

| Section   | Requirement                                                            |
| --------- | ---------------------------------------------------------------------- |
| **§1.3**  | Notes layer: "Markdown-native nodes, outlines, bodies, links, backlinks, tags, clones" |
| **§1.4**  | "StrategyNotes is a **strategy-native notes app**"                     |
| **§3.3**  | Notes **mode**: "Capture, write, outline, link, clone, search"         |
| **§4.1**  | Node types include `note`, `journal`                                   |
| **§12.1** | MVP scope: "Notes substrate (markdown nodes, refs, backlinks, tags, clones, daynotes)" |

**Open Design NAV (missing Notes):**

```
Reality:    Case Cockpit, Evidence Inbox
Strategy:   Trace Explorer, Bet Board
Execution:  Work/Timebox Planner, Execution Runbook
Learning:   Daynote Ledger, VRD/Value
Governance: Agent Drafts
```

**Impact:**

- No UI exists for the core "capture, write, outline, link, clone, search" workflow
- `note` and `journal` node types have no dedicated creation/editing interface
- DaynoteLedger is for **activity capture** (automatic logging), not note writing
- The product's identity as a "notes app" is unrepresented in the UI

**Recommendation:**

This is a **design gap**, not an implementation deviation. The implementation should:

1. Request a Notes screen design from Open Design, OR
2. Design a Notes view based on SPEC §3.3 requirements:
   - Markdown editor with wikilink support
   - Backlink panel
   - Tag management
   - Clone/transclusion UI
   - Full-text search integration

**Note:** This issue is flagged for **design team follow-up**, not immediate remediation in the existing audit scope.

---

## Summary

| Issue                    | Status                | Implementation Action               |
| ------------------------ | --------------------- | ----------------------------------- |
| Hue 255 vs 264           | Use 264               | Already correct                     |
| Lightness drift          | Use prototype values  | Already correct                     |
| Font stack mismatch      | Use prototype fonts   | Already correct                     |
| Accent token values      | Use prototype values  | Add tokens with prototype values    |
| Semantic desaturation    | Use prototype values  | Already correct                     |
| Theme toggle a11y        | Fix in implementation | Add aria-label                      |
| **Missing Notes screen** | **Design gap**        | **Request design or build from SPEC** |

---

## Authoritative Source Decision

For this audit, **index.html (the prototype)** is treated as the canonical design source, with DESIGN.md serving as historical reference. The prototype represents the evolved design decisions.

When implementing missing tokens (surface-2/3/4, accent-dim/ink, etc.), extract values from **index.html CSS**, not DESIGN.md.
