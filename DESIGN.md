# StrategyNotes — Design System

> Authority for visual and interaction decisions. `PRODUCT.md` is authority for
> who this is for. This file is authority for how it looks and behaves.
> Refinement must conform here unless evidence shows the system itself is wrong.

**Genre:** modern-minimal · **Register:** product (tool) · **Motion:** motion-cut

---

## 1. Visual philosophy

**Precision instrument, not consumer SaaS.** Austere, verifiable, unsentimental.
The interface states what is true, what is unsupported, and what will be refused,
then gets out of the way. It never congratulates, encourages, or gamifies.

Three commitments that follow from that:

1. **Evidence over assertion.** Every visual state is derived from real data. A missing
   value renders as an em dash with a label, never as `0`. No invented metrics, no
   decorative progress.
2. **Show the teeth.** A gate that blocks is shown blocking. The blocked state and the
   one-click path that clears it appear together, always. Never a red flag alone.
3. **No chrome theater.** No manifestos in the header, no gradients, no glows, no
   glass, no hero. Chrome that says nothing is deleted, not styled.

**Anti-references:** a compliance auditor; a read-only dashboard suite; a generic PKM app;
a mechanical project manager; anything that rewards filled sections over passed gates.

## 2. Color

**Strategy: Restrained.** Tinted neutrals plus exactly one accent. The accent carries
identity and interactive state, nothing else.

| Role | Token | Use |
|---|---|---|
| Canvas | `--color-background` | The page. Deepest ink. |
| Surface | `--color-surface-1/2/3` | Depth by tone, not by outline. `-1` chrome, `-2` rows, `-3` wells. |
| Hairline | `--color-border` | Separation only. Never decoration. |
| Accent | `--color-primary` | Interactive affordance, selected state, the current case. One accent, ≤10% of surface. |
| Gate ok / bad / warn / info | `--color-gate-*` | Paired ink plus a 10% tint. Reserved for gate semantics. |

Rules:

- Never `#000` or `#fff`. Every neutral is tinted toward the cool hue.
- Accent is not decoration. If something is cyan because it looks nice, it is wrong.
- Gate colors never appear on non-gate content, and vice versa. A red border means blocked,
  not emphasis.
- Status is never color alone. Every gate and status badge carries a text label.
- Proof level and node type keep a stable hue so the same node reads the same in every view.

## 3. Typography

Three families with strict jobs. **Mono is for data that is evidence of work** — IDs,
proof levels, pomo costs, counts, timestamps, gate labels, timestamps, raw ids. Never for prose.

| Family | Role |
|---|---|
| IBM Plex Sans | All prose, labels, headings, UI text. |
| Josefin Sans | Display only: the page title and the one headline per view. Never for controls. |
| IBM Plex Mono | Every datum. `font-variant-numeric: tabular-nums` on all numerics. |

**Scale** — five steps, each ≥1.25× the previous. No other sizes exist.

| Step | Class | Size / weight | Job |
|---|---|---|---|
| Display | `.t-display` | 26px / 500, -0.02em | One per view. The view's name. |
| Section | `.t-section` | 15px / 600 | Region titles inside a view. |
| Row | `.t-row` | 14px / 500 | The name of a thing in a list. |
| Body | `.t-body` | 14px / 400, 1.55 | Prose. Max 75ch measure. |
| Label | `.t-label` | 11px / 600, 0.08em, uppercase | Field labels, group labels. Never a heading. |
| Datum | `.t-datum` | 11px mono, tabular | Counts, ids, costs, statuses. |

Rules:

- Hierarchy comes from weight and role contrast, not from size alone.
- Never italic display type. Never an italicised word in a heading.
- All-caps is reserved for `.t-label` and `.t-datum`. A status reads in its own case,
  never shouted.
- Node types read as domain nouns in sentence case: `work package`, not `WORK_PACKAGE`.
- Body measure caps at 75ch. Editor prose caps at 68ch.

## 4. Spacing and rhythm

4px base scale: `1 · 2 · 3 · 4 · 6 · 8 · 12 · 16 · 24 · 32`.

- **Rhythm varies by role.** Page padding is generous (`24px` desktop, `16px` narrow).
  Row padding is tight (`8px 12px`). Density is not uniform monotony; it follows the job.
- Vertical between sections: `24px`. Between rows: `4px`. Inside a row: `8px`.
- Horizontal gutters between columns: `16px`.
- Content measure: views cap at `1440px`; reading surfaces cap at `75ch`.

## 5. Surface hierarchy

Five containers, each with a distinct job. **Picking the wrong one is a bug.**

| Primitive | Job | Signature |
|---|---|---|
| `Surface` | Neutral grouped content. The default. | tone 1, hairline border, `r-lg` |
| `Well` | Code, frontmatter, raw text, log output. Monospace. | tone 2, no border, `r-md`, scrolls |
| `Callout` | Carries a gate or status meaning. | tint from gate palette, full border, **no side stripe** |
| `Rail` | Vertical grouping inside a narrow column. | tone 2, left-aligned content |
| `Row` | One item in a list. The workhorse. | transparent, hairline separator, hover tone 2 |

Rules:

- **A list is not a stack of cards.** `Row` inside a bordered `Surface`, never nine
  bordered cards. Nested cards are always wrong.
- Every interactive `Row` gets an explicit selected state. Selection is accent, not shadow.
- Elevation is tone, not shadow. Only overlays (popover, command palette) cast shadow.
- No `border-left/right > 1px` as a colored accent. Ever.

## 6. Component voice

Primitives in `components/ui`. Every one is product-specific; nothing is an unmodified
shadcn default.

- **Button.** `default` is a solid accent block, one per view maximum. `outline` is a
  hairline. `ghost` is text-weight-only. `danger` is a red text-weight-only ghost — destructive
  actions are never the solid, prominent thing. Sizes: `sm` `md` `icon`. Every variant ships
  default · hover · focus-visible · active · disabled.
- **Badge.** Mono, `10px`, tabular. Variants encode *meaning only*: `gate-ok` `gate-bad`
  `gate-warn` `gate-info` `accent` `neutral`. Never used for decoration.
- **NodeTypeChip.** Node type in sentence case with its stable hue. Replaces raw type strings.
- **StatusChip.** `Drafted / Reviewed / Accepted / Validated / Claimed / Superseded` in one
  case convention, always with the same color mapping across every view.
- **RequirementList.** A gate's unmet requirements. The single component that renders
  "blocked and here's how to fix it". Never hand-rolled per view.
- **GateResult.** The verdict chip plus `failed_gates[]`. Announced via `aria-live`.
- **Meter.** `role="progressbar"`, labelled, always paired with its numeric reading.
  The only horizontal fill in the product, labeled as price, never progress.
- **AsyncState.** The only legal way to render an async region: loading skeleton, empty
  state, or error state. Each names what will appear and how to make the first one.
- **Toast.** Non-blocking feedback. Replaces every `alert()`.

## 7. Navigation

- **App shell:** fixed left rail ≥ `1024px`; collapsible to an icon rail at `768–1023px`;
  overlay drawer below `768px`. The rail is the single source of truth for the view tree
  and is shared verbatim by the editor screens.
- Nav items are real routes with `aria-current="page"`. A view is linkable and Back works.
- Six groups in lifecycle order: Notes · Reality · Strategy · Execution · Learning · Governance.
- Active item: accent left bar plus tone-3 fill plus accent text. Never accent fill alone.
- Group labels are `.t-label` at `--color-muted-ink`.
- Rail footer holds the primary create action and its shortcut hint.

## 8. Layout families

Four macro-layout families. Every view belongs to exactly one. Assigning a view to a
family it does not belong to is what produced the previous sameness.

### A · Ledger — rows of records under one header
Work Planner · Daynote Ledger · VRD / Value · Evidence Inbox · Agent Draft Inbox
`PageHead` → optional filter bar → one `Surface` holding `Row`s → optional trailing `Surface`.
Rows carry a leading name column, a middle metadata cluster, and a right action cluster.
One-column at `≥1024`, actions wrap beneath at `<1024`.

### B · Board — state columns
Bet Board
Filter bar → column track (`4 → 2 → 1` at `1600 / 1024 / 768`) → per-column count header →
`Row`s. Columns are `Rail`s, not cards. A column with nothing in it says so.

### C · Explorer — a spine and an inspector
Trace Explorer
Root selector → two-panel split (`1fr 380px`, stacking `<1024`) → a full-width
`Callout` band beneath for contradiction state. The inspector shows frontmatter in a `Well`.

### D · Reading — a document with a margin
Generated docs
Tab strip → measure-capped article → `Row`-style entries with right-aligned chips.
Never cards. Measure capped at 75ch.

Plus one non-family surface: the **3-panel editor** (list · editor · context) used by
Notes and Journal, which has its own layout rules in §9.

## 9. Editor surfaces

- 3 panels: list rail (fixed `300px`) · editor (fluid, `min-w-0`) · context panel (`280px`,
  collapsible, `⌘\` to toggle).
- Below `1024px` the context panel becomes an overlay. Below `768px` the list rail becomes a
  drawer and the editor takes the full width. Never let fixed chrome exceed the viewport.
- **Context panel order is by frequency of use:** Proof Burden first (it is the product),
  then Linked, then Placements, then Quick Actions. Quick Actions was previously last and
  overflowed the fold.
- Proof Burden renders only questions the user can actually answer, and each unanswered
  answerable question carries its link affordance inline.

## 10. Interaction conventions

- **Gate-first.** Every mutating action returns a gate result. The result is rendered
  inline where the action happened, announced politely, and states what to do next.
- **Vocabulary is the product's, not the spec's.** Buttons read "Approve bet", not
  "Approve [INV-BET]". Invariant IDs live in a tooltip and in the Trace view only.
- **Blocked is paired with actionable.** A blocked state never appears without the control
  that resolves it.
- **Missing is not zero.** Unset values render as `—`. Never `0`, never `0p`.
- **Destructive actions confirm.** Kill, reject, delete. And they are visually quiet.
- **Feedback is non-blocking.** Toasts, never `alert()`. Capture uses real inline forms,
  never `prompt()`.
- **No dead controls.** A control without a handler does not render.
- Keyboard: `⌘N` new note, `⌘J` journal, `⌘\` context panel, `⌘K` command palette,
  `?` shortcuts, `Esc` closes. Every control is reachable and visibly focused.

## 11. Motion philosophy

Motion-cut. No animation library. The only motion is a state change the user caused.

- Allowed: a `120ms` ease-out background transition on hover and selection; a
  `160ms` opacity fade on an async region swap; a toast that slides in over `180ms`.
- Forbidden: layout animation, entrance animation, parallax, glow, shimmer, bounce,
  anything decorative, anything on scroll.
- All motion is wrapped in `@media (prefers-reduced-motion: reduce) { transition: none }`.
- Loading uses a static, content-shaped skeleton. A shimmer is decoration.

## 12. Density

Compact by default. This is a working instrument scanned all day, not a landing page.

- Row height `36–52px`. Page title `26px`, not `48px`.
- Page vertical padding `24px`. Rail width `252px`. Row horizontal padding `12px`.
- Empty regions are filled with real content or removed. No page may end at 45% of the
  viewport with an inert void beneath it.

## 13. CTA hierarchy

One primary action per view, and it is the one that moves the case forward.

- Order of prominence: **primary** (solid accent, one per view) → **outline** (the other
  real actions) → **ghost** (tertiary) → **danger ghost** (destructive, quiet).
- The Next Best Action is the single loudest element on the Cockpit and carries its action.
- A view with no primary action gets one from its Next Best Action, not from bolding everything.

## 14. Responsive principles

| Breakpoint | Rule |
|---|---|
| `≥1600` | Full layout. Four board columns. |
| `1024–1599` | Two board columns. Inspector drops below explorer. |
| `768–1023` | App rail collapses to icons. Context panel overlays. Ledger rows wrap actions. |
| `<768` | App nav becomes a drawer. Single column everywhere. No fixed chrome wider than the viewport. |

Hard rules: no horizontal page scroll at any width; `overflow-x: clip` on root and body;
image-bearing tracks use `minmax(0, 1fr)`; no two-line clickable text; long unbroken strings
wrap with `overflow-wrap: anywhere`.

## 15. Accessibility contract

- `aria-current="page"` on the active nav item.
- One `h1` per view; `h2` for regions; `h3` only inside a region. No skipped levels.
- `aria-live="polite"` on every gate result, toast, and async region that swaps content.
- Every interactive element has an accessible name. Icon-only controls get `aria-label`.
- Focus is always visible: a `2px` accent ring with offset, on every focusable element.
- `Meter` is a `role="progressbar"` with `aria-valuenow/min/max` and an accessible name.
- No nested interactive elements. A row's destructive control is a sibling, never a child.
- No emoji as iconography. Icons come from `lucide-react` with accessible names.
- Color is never the sole carrier of meaning.
