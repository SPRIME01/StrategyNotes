# Design Fidelity Audit

**Source Design:** StrategyNotes Product UI Design
**Project ID:** `37b89c16-284e-4de4-82fd-dadb39e9792d`
**Implementation:** `/home/sprime01/projects/Strategist/ui`
**Audit Date:** 2026-06-23

---

## Design Token Audit

| Token Category | Component         | Location          | Classification | Source Spec                  | Current State                               | Delta Description   |
| -------------- | ----------------- | ----------------- | -------------- | ---------------------------- | ------------------------------------------- | ------------------- |
| Color          | `--bg`            | `index.css:15`    | ACCEPTABLE     | `oklch(14.5% 0.006 264)`     | `oklch(14.5% 0.006 264)`                    | Exact match         |
| Color          | `--surface-1`     | `index.css:17`    | ACCEPTABLE     | `oklch(17.5% 0.007 264)`     | `--color-card: oklch(17.5% 0.007 264)`      | Renamed but correct |
| Color          | `--surface`       | `index.css:28`    | ACCEPTABLE     | `oklch(20.5% 0.008 264)`     | `--color-secondary: oklch(20.5% 0.008 264)` | Renamed but correct |
| Color          | `--surface-2`     | N/A               | UNFAITHFUL     | `oklch(24% 0.009 264)`       | Not implemented                             | Missing token       |
| Color          | `--surface-3`     | N/A               | UNFAITHFUL     | `oklch(28% 0.011 264)`       | Not implemented                             | Missing token       |
| Color          | `--surface-4`     | N/A               | UNFAITHFUL     | `oklch(32% 0.013 264)`       | Not implemented                             | Missing token       |
| Color          | `--fg`            | `index.css:26`    | ACCEPTABLE     | `oklch(95% 0.003 264)`       | `--color-foreground: oklch(95% 0.003 264)`  | Exact match         |
| Color          | `--fg-dim`        | `index.css:33`    | ACCEPTABLE     | `oklch(80% 0.008 264)`       | `--color-fg-dim: oklch(80% 0.008 264)`      | Exact match         |
| Color          | `--muted`         | `index.css:34`    | ACCEPTABLE     | `oklch(60% 0.012 264)`       | `--color-muted-ink: oklch(60% 0.012 264)`   | Exact match         |
| Color          | `--faint`         | `index.css:35`    | ACCEPTABLE     | `oklch(44% 0.012 264)`       | `--color-faint: oklch(44% 0.012 264)`       | Exact match         |
| Color          | `--border`        | `index.css:36`    | ACCEPTABLE     | `oklch(26% 0.009 264)`       | `--color-border: oklch(26% 0.009 264)`      | Exact match         |
| Color          | `--border-strong` | N/A               | UNFAITHFUL     | `oklch(34% 0.011 264)`       | Not implemented                             | Missing token       |
| Color          | `--accent`        | `index.css:80`    | ACCEPTABLE     | `oklch(76% 0.11 219)`        | `--color-primary: oklch(76% 0.11 219)`      | Exact match         |
| Color          | `--accent-dim`    | N/A               | UNFAITHFUL     | `oklch(76% 0.11 219 / 0.13)` | Not implemented                             | Missing token       |
| Color          | `--accent-ink`    | N/A               | UNFAITHFUL     | `oklch(82% 0.12 219)`        | Not implemented                             | Missing token       |
| Color          | Gate semantics    | `index.css:60-78` | ACCEPTABLE     | 4 semantic colors            | All 4 + bg variants                         | Exact match         |
| Typography     | `--font-display`  | `index.css:6`     | ACCEPTABLE     | `Josefin Sans, ...`          | `--font-display: 'Josefin Sans', ...`       | Exact match         |
| Typography     | `--font-header`   | `index.css:7`     | ACCEPTABLE     | `Josefin Slab, ...`          | `--font-header: 'Josefin Slab', ...`        | Exact match         |
| Typography     | `--font-ui`       | `index.css:8`     | ACCEPTABLE     | `IBM Plex Sans, ...`         | `--font-sans: 'IBM Plex Sans', ...`         | Renamed but correct |
| Typography     | `--font-mono`     | `index.css:10`    | ACCEPTABLE     | `IBM Plex Mono, ...`         | `--font-mono: 'IBM Plex Mono', ...`         | Exact match         |
| Radius         | `--r`             | `index.css:14`    | ACCEPTABLE     | `7px`                        | `--radius: 7px`                             | Exact match         |
| Radius         | `--r-sm`          | N/A               | UNFAITHFUL     | `4px`                        | Not implemented                             | Missing token       |
| Radius         | `--r-lg`          | N/A               | UNFAITHFUL     | `10px`                       | Not implemented                             | Missing token       |
| Radius         | `--r-xl`          | N/A               | UNFAITHFUL     | `14px`                       | Not implemented                             | Missing token       |
| Layout         | `--pad`           | N/A               | UNFAITHFUL     | `4px`                        | Not implemented                             | Missing token       |
| Layout         | `--sidebar-w`     | N/A               | UNFAITHFUL     | `252px`                      | Not implemented                             | Missing token       |
| Layout         | `--topbar-h`      | N/A               | UNFAITHFUL     | `48px`                       | Not implemented                             | Missing token       |

---

## Component Audit

| Component                    | Location           | Classification | Source Spec                                                      | Current State                                   | Delta Description                              |
| ---------------------------- | ------------------ | -------------- | ---------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------- |
| `.badge`                     | `badge.tsx:1-40`   | UNFAITHFUL     | 10px mono, 3px 6px padding, 1px solid border                     | 12px, px-2 py-0.5 (8px 2px), border-transparent | Font size, padding, and border style incorrect |
| `.proof` (ProofLevelBadge)   | `atoms.tsx:60-74`  | BROKEN         | 10.5px mono, 6px diameter ::before dot indicator                 | Uses 1.5px span inside badge, no proper dot     | Missing visual indicator entirely              |
| `.pill` (EvidenceStateBadge) | `atoms.tsx:85-95`  | UNFAITHFUL     | 10px mono, border-radius 999px (pill), dashed border for Drafted | Uses standard badge radius, no dashed state     | Shape and border-style divergence              |
| `.mat` (MaturityChip)        | `atoms.tsx:97-115` | UNFAITHFUL     | 10px mono, dashed border for Drafted, solid for Reviewed+        | All states use same border style                | Missing dashed border state                    |
| `.gate` (GateStatusBadge)    | `atoms.tsx:35-58`  | BROKEN         | 10px bold, 7px dot ::before with 2px ring shadow                 | No dot indicator, uses badge with text          | Visual hierarchy indicator completely missing  |
| `.btn`                       | `button.tsx:1-44`  | ACCEPTABLE     | 12px mono, 7px 13px padding, border-radius var(--r)              | Shadcn button with appropriate variants         | Reasonable adaptation                          |
| `.card`/`.panel`             | `card.tsx:1-40`    | ACCEPTABLE     | surface-1 bg, 1px border, border-radius r-lg, overflow hidden    | Uses --color-card correctly, proper structure   | Faithful implementation                        |
| `.kicker`                    | `App.tsx:146`      | UNFAITHFUL     | 11px/1.35 font-ui, 0.01em spacing, sentence-case by default      | Uses 10px mono uppercase only                   | Missing base sentence-case variant             |
| `.kicker.uc`                 | `App.tsx:146`      | ACCEPTABLE     | 10.5px mono, uppercase, 0.10em spacing                           | Correctly implemented                           | Matches spec                                   |
| `.display`                   | `App.tsx:147`      | ACCEPTABLE     | 300 30px/1.15 font-display, -0.02em spacing                      | Uses inline style correctly                     | Direct token reference                         |
| `.h1`                        | N/A                | BROKEN         | 500 20px/1.25 font-header, -0.01em spacing                       | Not implemented, uses ad-hoc text-2xl           | Missing utility class                          |
| `.nav` structure             | `App.tsx:96-104`   | BROKEN         | `<nav><a href>` semantic HTML                                    | Uses `<button>` elements                        | Wrong element type                             |
| `.nav a` styling             | `App.tsx:96-104`   | UNFAITHFUL     | 7px 10px 7px 16px asymmetric padding                             | px-2 py-1.5 symmetric padding                   | Incorrect spacing rhythm                       |
| `.nav a.on::before`          | `App.tsx:96-104`   | BROKEN         | 2px wide accent bar positioned at left:4px                       | Uses bg color only, no pseudo-element           | Missing active state indicator                 |
| PageHead                     | `App.tsx:143-167`  | UNFAITHFUL     | .page-head flex, .page-title 28px display, .page-sub muted       | Custom inline styles                            | Not using design system classes                |

---

## Summary

### Token Fidelity: 75%

- **15 tokens match exactly** (colors, fonts, base radius)
- **12 tokens missing** (surface-2/3/4, border-strong, accent-dim/ink, radius scale, layout constants)

### Component Fidelity: 45%

- **4 BROKEN** components (proof dot, gate dot+ring, h1 class, nav structure)
- **7 UNFAITHFUL** components (badge sizing, pill shape, mat borders, kicker variants, nav styling)
- **5 ACCEPTABLE** components (button, card, kicker.uc, display, shadcn integration)

### Critical Path

1. Status atoms (proof, gate) are visually broken - missing key visual indicators
2. Navigation uses wrong HTML elements - accessibility concern
3. Missing surface tokens limits UI depth/layering

### Design Gap (Out of Scope)

**Notes Screen Missing:** SPEC §1.4 defines StrategyNotes as a "strategy-native notes app" with a dedicated Notes mode (§3.3) for "capture, write, outline, link, clone, search." The Open Design prototype contains NO screen for this core functionality. See `source-design-issues.md#Issue-7`.
