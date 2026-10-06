# UI refinement: Hallmark + Impeccable

Durable lessons from UI-UX-REFINE-001. Not spec material — process knowledge that does not fit
in SPEC.md or PLAN.md but changed how the work had to be done. Links: `PRODUCT.md`, `DESIGN.md`,
`SPEC.md` §11.4, `.agents/reports/adversarial_system_ui_hci_audit.md`.

---

## 1. A single 900-line `App.tsx` is the root cause of UI sameness

**Slice:** UI-UX-REFINE-001 · **IDs:** SDS-UI, PRD-001

Nine views were composed inline in one component that also owned the shell, the routes, and
every view's state. Because they were written in one sitting by one hand, they converged on
identical structure: `PageHead` → `grid-cols-N` of `Card`. Fixing the *styling* of that file
would have left the sameness intact, because the sameness was in the structure.

**Lesson:** when several surfaces look alike, check whether they are *also* composed by the same
code before reaching for a design token. Splitting one file into nine, each with a declared
layout family, changed the visual result more than any colour or spacing decision. Declaring the
families in `DESIGN.md` first is what made the split defensible rather than arbitrary.

## 2. Measured > eyeballed, always

**Slice:** UI-UX-REFINE-001 · **IDs:** SDS-UI

Every serious defect found here was invisible to typecheck, build, the 69 unit tests, and
careful desktop review:

| Defect | Found by |
|---|---|
| `main` measured **586px inside a 375px viewport**, clipped by `overflow-hidden` | measuring at 375px |
| `aria-current` on 0 of 12 nav links | counting in the DOM |
| Heading order `H1 → H3`, H2 skipped app-wide | reading the heading sequence |
| Capacity meter showing **two different numbers on one screen** | screenshot comparison |
| Focus ring silently deleted by `focus-visible:outline-none` | forcing `:focus-visible` and reading computed style |
| 21 `INV-*` identifiers in user-visible copy | grepping rendered text |
| 8 permanently-disabled ghost controls | counting `button[disabled]` |

**Lesson:** a UI audit that only reads code finds the copy problems. A UI audit that only looks
at desktop screenshots finds the layout problems. Neither finds the accessibility or the
honesty-of-state problems. Write the measurement.

## 3. Tailwind's utility layer outranks `@layer base` — a global a11y rule can be silently deleted

**Slice:** UI-UX-REFINE-001 · **IDs:** SDS-UI, INV-PORT (by analogy: a rule that looks global but is local)

`index.css` declared the product's focus ring in `@layer base { :focus-visible { outline: 2px solid } }`.
The `Button` and `Input` primitives both carried `focus-visible:outline-none`, which Tailwind
emits into `@layer utilities`. Utilities win. Every button and input in the app had **no focus
ring**, and the global rule still looked correct in the stylesheet.

**Lesson:** a global rule that any component can override is not a global rule. When a design
system must guarantee something (the focus ring, the reading measure, the motion reduction),
either enforce it with `!important`-equivalent specificity or remove the escape hatches. The
defence that worked here was a comment naming the exact failure next to the rule, plus a grep
gate (`grep -rn 'focus-visible:outline-none'`) added to the verification step.

## 4. "A red flag without a path to clear it" was the product's single worst UI failure

**Slice:** UI-UX-REFINE-001 · **IDs:** INV-BET, INV-VALUE, INV-EVID, SPEC §11.4

The Proof Burden panel showed nine questions, eight as an unanswered `—`, and put the only way
to answer them in a separate widget below two `<select>`s and nine chips. The audit had already
named this shape as "a compliance clerk failing an audit", and it was right: the UI displayed
obligation and withheld capability.

Fixing it was not a restyle. It required folding the link affordance **into each question row**,
so the state and the action that clears it are the same object. The Bet Board had the mirror
problem in a different direction: it printed the same six requirement labels twice, once as
state and once as six buttons. The fix was state once, one action.

**Lesson:** for any product with backend-owned gates, "blocked" is a compound UI concept, not a
badge. Model it as a component (`RequirementList` here) and never compose it by hand per view.
If the component cannot say what clears the flag, the flag should not be rendered yet.

## 5. Two answers to one question on one screen is the fastest way to lose trust

**Slice:** UI-UX-REFINE-001 · **IDs:** INV-TIME, INV-WORK

The workspace bar computed committed pomos as `max(timeboxes, committedWorkPackages)`; the
Cockpit computed it as `sum(timeboxes)`. Both rendered a capacity meter. Same viewport, same
concept, `6/24p` and `0/24p`.

**Lesson:** derived numbers must have exactly one owner. Extract it to a hook
(`useWorkspace`) and pass it down; do not let two screens each call the same hook and combine
it differently. When a numeric concept appears in more than one place, that is a design
constraint, not a coincidence.

## 6. Infrastructure identity leaks into reading surfaces through the back door

**Slice:** UI-UX-REFINE-001 · **IDs:** INV-ID, INV-PORT

Removing `Approve [INV-BET]` from buttons was easy. The subtle leak was `nodeTitle()`: it
falls back to `node.id.slice(0, 18)` when a node has no title, so a shared "resolve an id to a
title" helper stored an 18-character ULID and rendered it as though it were a name. Trace lines,
source references, placements, and the runbook's work package all inherited it.

**Lesson:** a convenience fallback in a low-level accessor becomes visible UI copy at every call
site. When a helper's fallback is infrastructure identity, the helper must distinguish
"has a title" from "has no title" (`humanTitle()` returns `null`) rather than inventing one.
Audit the fallback, not just the happy path.

## 7. Structural sameness and good visual taste are independent axes

**Slice:** UI-UX-REFINE-001 · **IDs:** SDS-UI

The existing token layer was genuinely good: a dark instrument palette, one restrained cyan
accent, mono reserved for data that is evidence of work, depth by tone instead of outline. It
survived the whole pass untouched except for additions. Meanwhile the surfaces built on top of
it were structurally indistinguishable.

**Lesson:** do not let "the design system looks fine" conclude "the UI is fine". Hallmark's
structural audit and Impeccable's UX/technical critique answered different questions, and only
the structural one found the macro problem. Conversely, re-skinning would have destroyed the
one thing that was already right. Redesign the structure, preserve the surface.

## 8. Motion-cut was the right call for this product and cost nothing

**Slice:** UI-UX-REFINE-001 · **IDs:** SDS-UI

No animation library is installed. The temptation was to add one for "delight". It was not
justified: this product's emotional register is *the app refuses to let you claim what you have
not earned*. A celebratory transition on a gate result contradicts the thesis. What shipped is a
120ms background transition on state the user caused, a 160ms fade on an async swap, and a toast
that slides 6px — all disabled under `prefers-reduced-motion`.

**Lesson:** "no motion library installed" is not a constraint to route around, it is usually a
statement about the product's register. Check whether the motion would contradict the thesis
before adding the dependency.

## 9. Route with the platform you already have

**Slice:** UI-UX-REFINE-001 · **IDs:** PRD-001, SDS-UI

Eleven views needed deep links, `aria-current`, and a working Back button. The reflex is
`react-router`. The implementation is `window.location.hash` plus one `hashchange` listener
(~20 lines, no dependency). It delivered all three properties and survived every verification
probe.

**Lesson:** a nav requirement ("a view is linkable and Back works") is a behaviour, not a
library. Write the smallest thing that has the behaviour. If the app ever needs nested routes,
nested params, or route-level code splitting, revisit.
