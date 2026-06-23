# Remediation Plan

**Source Design:** StrategyNotes Product UI Design
**Project ID:** `37b89c16-284e-4de4-82fd-dadb39e9792d`
**Generated:** 2026-06-23

---

## Token Remediation (High Priority)

### [TASK-001] Add missing surface tokens

**Component:** Design tokens
**File:** `ui/src/index.css:20-25`
**Classification:** UNFAITHFUL
**Source spec:**

```css
--surface-2: oklch(24% 0.009 264);
--surface-3: oklch(28% 0.011 264);
--surface-4: oklch(32% 0.013 264);
```

**Current state:** Only surface-1 and secondary exist
**Fix:** Add to `@theme` block:

```css
--color-surface-2: oklch(24% 0.009 264);
--color-surface-3: oklch(28% 0.011 264);
--color-surface-4: oklch(32% 0.013 264);
```

**Risk:** None - additive change
**Shadcn constraint:** These are custom tokens, no override needed

---

### [TASK-002] Add border-strong token

**Component:** Design tokens
**File:** `ui/src/index.css:36`
**Classification:** UNFAITHFUL
**Source spec:** `--border-strong: oklch(34% 0.011 264)`
**Current state:** Only `--color-border` exists
**Fix:** Add to `@theme` block:

```css
--color-border-strong: oklch(34% 0.011 264);
```

**Risk:** None - additive change
**Shadcn constraint:** N/A

---

### [TASK-003] Add accent-dim and accent-ink tokens

**Component:** Design tokens
**File:** `ui/src/index.css:80-82`
**Classification:** UNFAITHFUL
**Source spec:**

```css
--accent-dim: oklch(76% 0.11 219 / 0.13);
--accent-ink: oklch(82% 0.12 219);
```

**Current state:** Only `--color-primary` exists
**Fix:** Add to `@theme` block:

```css
--color-accent-dim: oklch(76% 0.11 219 / 0.13);
--color-accent-ink: oklch(82% 0.12 219);
```

**Risk:** None - additive change
**Shadcn constraint:** N/A

---

### [TASK-004] Add radius scale tokens

**Component:** Design tokens
**File:** `ui/src/index.css:14`
**Classification:** UNFAITHFUL
**Source spec:**

```css
--r-sm: 4px;
--r-lg: 10px;
--r-xl: 14px;
```

**Current state:** Only `--radius: 7px` exists
**Fix:** Add to `@theme` block:

```css
--radius-sm: 4px;
--radius-lg: 10px;
--radius-xl: 14px;
```

**Risk:** None - additive change
**Shadcn constraint:** Update Tailwind config to expose `rounded-sm`, `rounded-lg`, `rounded-xl` utilities

---

## Component Remediation (Critical)

### [TASK-005] Fix ProofLevelBadge dot indicator

**Component:** ProofLevelBadge
**File:** `ui/src/atoms.tsx:60-74`
**Classification:** BROKEN
**Source spec:**

```css
.proof::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
```

**Current state:** Uses `<span className="inline-block w-1.5 h-1.5">` (1.5px = 6px at default scale)
**Fix:** Verify the span renders at 6px. If using Tailwind, `w-1.5` = 6px which is correct. If visual inspection shows smaller, update to:

```tsx
<span className="inline-block w-[6px] h-[6px] rounded-full bg-current opacity-60" />
```

**Risk:** Low - visual only
**Shadcn constraint:** N/A

---

### [TASK-006] Fix GateStatusBadge dot+ring indicator

**Component:** GateStatusBadge
**File:** `ui/src/atoms.tsx:35-58`
**Classification:** BROKEN
**Source spec:**

```css
.gate::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 0 2px color-mix(in oklch, currentColor 22%, transparent);
}
```

**Current state:** No visual indicator, just text in badge
**Fix:** Add dot with ring shadow before the text:

```tsx
<Badge variant={variant} className="...">
  <span
    className="w-[7px] h-[7px] rounded-full bg-current"
    style={{
      boxShadow: "0 0 0 2px color-mix(in oklch, currentColor 22%, transparent)",
    }}
  />
  {gate.status === "approved" ? "approved" : "blocked"}
</Badge>
```

**Risk:** Medium - requires testing `color-mix()` browser support (Chrome 111+, Firefox 113+, Safari 16.4+)
**Shadcn constraint:** N/A

---

### [TASK-007] Fix EvidenceStateBadge pill shape

**Component:** EvidenceStateBadge
**File:** `ui/src/atoms.tsx:85-95`
**Classification:** UNFAITHFUL
**Source spec:**

```css
.pill {
  border-radius: 999px;
  border: 1px solid var(--border-strong);
}
.pill.Drafted {
  border-style: dashed;
}
```

**Current state:** Uses standard badge border-radius, no dashed state
**Fix:** Create dedicated Pill component or add `rounded-full` and conditional dashed border:

```tsx
<Badge
  variant={variant}
  className={cn("rounded-full", state === "Drafted" && "border-dashed")}
>
  {state}
</Badge>
```

**Risk:** Low - visual only
**Shadcn constraint:** Add `border-dashed` variant support to badge.tsx or use className override
**depends-on:** TASK-002 (border-strong token)

---

### [TASK-008] Fix MaturityChip dashed border state

**Component:** MaturityChip
**File:** `ui/src/atoms.tsx:97-115`
**Classification:** UNFAITHFUL
**Source spec:**

```css
.mat.Drafted {
  border: 1px dashed var(--border-strong);
}
.mat.Reviewed {
  border: 1px solid var(--border-strong);
  background: var(--surface-2);
}
```

**Current state:** All states use same border style
**Fix:** Add conditional border styling:

```tsx
<Badge
  variant={variant}
  className={cn(
    maturity === "Drafted" && "border-dashed border-border-strong",
    maturity === "Reviewed" && "border-solid border-border-strong bg-surface-2"
  )}
>
```

**Risk:** Low - visual only
**Shadcn constraint:** Requires border-strong and surface-2 tokens
**depends-on:** TASK-001, TASK-002

---

### [TASK-009] Add typography utility classes

**Component:** Typography system
**File:** `ui/src/index.css` (bottom)
**Classification:** BROKEN (h1), UNFAITHFUL (kicker base)
**Source spec:**

```css
.kicker {
  font: 600 11px/1.35 var(--font-ui);
  letter-spacing: 0.01em;
  color: var(--muted);
}
.h1 {
  font: 500 20px/1.25 var(--font-header);
  letter-spacing: -0.01em;
}
```

**Current state:** Only .kicker.uc variant implemented inline; .h1 not implemented
**Fix:** Add to index.css:

```css
/* Typography utilities */
.kicker {
  font: 600 11px/1.35 var(--font-sans);
  letter-spacing: 0.01em;
  color: var(--color-muted-ink);
}
.kicker-uc {
  font: 600 10.5px/1 var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-muted-ink);
}
.h1 {
  font: 500 20px/1.25 var(--font-sans);
  letter-spacing: -0.01em;
}
```

**Risk:** Low - additive CSS
**Shadcn constraint:** N/A

---

### [TASK-010] Fix badge font-size and padding

**Component:** Badge base
**File:** `ui/src/components/ui/badge.tsx:10-30`
**Classification:** UNFAITHFUL
**Source spec:**

```css
.badge {
  font: 600 10px/1 var(--mono);
  padding: 3px 6px;
  border: 1px solid var(--border-strong);
}
```

**Current state:** Uses Tailwind `text-xs` (12px), `px-2 py-0.5` (8px 2px)
**Fix:** Update badgeVariants base class:

```tsx
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md font-mono text-[10px] leading-none font-semibold px-1.5 py-[3px] border",
  // ...
);
```

**Risk:** Medium - affects all badge instances, requires visual regression testing
**Shadcn constraint:** Overriding shadcn defaults; document in component

---

### [TASK-011] Fix navigation element type

**Component:** Sidebar navigation
**File:** `ui/src/App.tsx:96-104`
**Classification:** BROKEN
**Source spec:** `<nav><a href="...">` semantic HTML structure
**Current state:** Uses `<button>` elements
**Fix:** Replace buttons with anchors:

```tsx
<nav className="flex-1 overflow-auto p-2">
  {NAV_ITEMS.map((item) => (
    <a
      key={item.id}
      href={`#${item.id}`}
      onClick={(e) => {
        e.preventDefault();
        setActiveTab(item.id);
      }}
      className={cn(
        "relative flex items-center gap-2 px-4 py-1.5 rounded-md text-sm",
        activeTab === item.id && "bg-surface-3",
      )}
    >
      {item.label}
    </a>
  ))}
</nav>
```

**Risk:** Low - semantic improvement, no visual change
**Shadcn constraint:** N/A

---

### [TASK-012] Fix navigation active indicator

**Component:** Sidebar navigation active state
**File:** `ui/src/App.tsx:96-104`
**Classification:** BROKEN
**Source spec:**

```css
.nav a.on::before {
  content: "";
  position: absolute;
  left: 4px;
  top: 9px;
  bottom: 9px;
  width: 2px;
  border-radius: 2px;
  background: var(--accent);
}
```

**Current state:** Uses background color only, no pseudo-element bar
**Fix:** Add before pseudo-element via Tailwind arbitrary variant:

```tsx
<a
  className={cn(
    "relative flex items-center gap-2 px-4 pl-5 py-1.5 rounded-md text-sm",
    activeTab === item.id && [
      "bg-surface-3",
      "before:absolute before:left-1 before:top-2 before:bottom-2",
      "before:w-0.5 before:rounded-full before:bg-primary"
    ]
  )}
>
```

**Risk:** Low - visual enhancement
**Shadcn constraint:** N/A
**depends-on:** TASK-011

---

### [TASK-013] Fix navigation padding asymmetry

**Component:** Sidebar navigation
**File:** `ui/src/App.tsx:96-104`
**Classification:** UNFAITHFUL
**Source spec:** `padding: 7px 10px 7px 16px` (asymmetric - larger left padding)
**Current state:** `px-2 py-1.5` (symmetric 8px 6px)
**Fix:** Update padding classes:

```tsx
className = "... py-[7px] pr-[10px] pl-4 ...";
```

**Risk:** Low - visual only
**Shadcn constraint:** N/A
**depends-on:** TASK-011

---

## Execution Order

### Phase 1: Tokens (no dependencies)

- TASK-001: Surface tokens
- TASK-002: Border-strong token
- TASK-003: Accent-dim/ink tokens
- TASK-004: Radius scale

### Phase 2: Typography (no dependencies)

- TASK-009: Typography utility classes

### Phase 3: Component Fixes (depend on Phase 1)

- TASK-005: ProofLevelBadge dot (independent)
- TASK-006: GateStatusBadge dot+ring (independent)
- TASK-010: Badge font-size/padding (independent)
- TASK-007: EvidenceStateBadge pill (depends-on: TASK-002)
- TASK-008: MaturityChip dashed border (depends-on: TASK-001, TASK-002)

### Phase 4: Navigation (sequential)

- TASK-011: Navigation element type
- TASK-012: Navigation active indicator (depends-on: TASK-011)
- TASK-013: Navigation padding (depends-on: TASK-011)

---

## Verification Checklist

- [ ] All new tokens visible in browser dev tools
- [ ] ProofLevelBadge shows 6px dot before text
- [ ] GateStatusBadge shows 7px dot with ring shadow
- [ ] EvidenceStateBadge uses pill shape (rounded-full)
- [ ] "Drafted" states show dashed borders
- [ ] Badge text is 10px, padding is 3px 6px
- [ ] Navigation uses `<a>` elements (check Accessibility tree)
- [ ] Active nav item shows 2px accent bar on left
- [ ] No visual regressions in existing components
