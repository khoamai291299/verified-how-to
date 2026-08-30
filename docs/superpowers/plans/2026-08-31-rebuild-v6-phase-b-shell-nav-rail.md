# Rebuild V6 — Phase B: Shell & Nav Rail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real, collapsible desktop nav rail (Khám phá/Tìm kiếm/Chủ đề/Đã lưu/Chia sẻ kiến thức/Hồ sơ) to the application shell, simplifying the existing top header to match, without touching the mobile bottom-nav pattern (already correct).

**Architecture:** Next.js App Router, no component library, `app/globals.css` custom-property tokens. New client component `app/nav-rail.tsx` (collapse state, active-route highlighting, localStorage persistence) rendered from `app/layout.tsx` alongside a simplified `site-header`. Desktop-only (≥1024px) — mobile keeps the existing `BottomNav`.

**Tech Stack:** Next.js 16 (App Router), React 19, plain CSS custom properties. No new dependencies.

**Spec:** `docs/product/rebuild-v6-composition-decisions.md` §1, `docs/product/rebuild-v6-current-state-gap.md` §D (nav rail is one of the 5 required visible-transformation signals)

## Global Constraints

- Vietnamese for all UI copy; English only in code/identifiers.
- No new runtime dependencies.
- Every nav-rail item must have a real destination — no decorative/dead links (rebuild-v6-composition-decisions.md §1 lists the exact 6 items and their exact destinations).
- Respect `prefers-reduced-motion` for the collapse/expand transition.
- Every visual change must be verified with `npx tsc --noEmit`, `npm run lint`, `npm run build`, and real Playwright screenshots at 1440 and 390 (mobile must show NO rail, only the existing bottom nav — confirm no regression there).
- Anonymous vs. authenticated states must both render correctly (anon: "Đăng nhập" replaces "Hồ sơ"; "Đã lưu"/"Chia sẻ kiến thức" still visible but route to sign-in with `redirectTo`).

---

### Task 1: NavRail component + layout wiring + header simplification

**Files:**
- Create: `app/nav-rail.tsx`
- Modify: `app/layout.tsx` (simplify `site-header`, add the shell wrapper + `<NavRail>`)
- Modify: `app/globals.css` (new `.app-shell`/`.app-shell-main`/`.nav-rail*` rules; header rules may need trimming if `Đã lưu`/profile-link/sign-out styles become dead code — check before removing)

**Interfaces:**
- Produces: `NavRail({ authed: boolean }): JSX.Element` — a client component. Later Phase C work will add `id="chu-de"` and `id="tim-kiem"` anchors on the homepage that this rail's links point to (`/#chu-de`, `/#tim-kiem`) — those ids don't exist yet, which is expected and harmless (the links just navigate to `/` with no scroll effect until Phase C lands in this same session).

- [ ] **Step 1: Read current files first**

Read `app/layout.tsx` and `app/bottom-nav.tsx` in full, and `app/globals.css`'s `HEADER / DESKTOP NAV` section (search for `.site-header`, `.brand`, `.site-nav`, `.nav-text-link`, `.button-primary`), before writing any code — confirm the current structure matches what's described below (this session has been iterating on this file all day; line numbers WILL have drifted, find things by selector/content, not line number).

- [ ] **Step 2: Create `app/nav-rail.tsx`**

A client component (`"use client"`) taking `{ authed: boolean }`. Requirements:

- Uses `usePathname()` from `next/navigation` for active-state (only exact-match `/` counts as "Khám phá" active — don't attempt scroll-spy for the two hash-anchor items, that's out of scope).
- Local state `collapsed: boolean`, initialized `false` (expanded) for SSR consistency, synced from `localStorage.getItem("vhkp-nav-rail-collapsed")` in a `useEffect` on mount, and written back to `localStorage` whenever toggled.
- Renders `<nav className="nav-rail" aria-label="Điều hướng chính" data-collapsed={collapsed}>` containing, in order:
  1. A collapse/expand toggle button (simple `<svg>` chevron icon, `aria-label="Thu gọn điều hướng"` / `"Mở rộng điều hướng"` depending on state, `aria-pressed={collapsed}`).
  2. **Khám phá** → `<Link href="/">` — reuse a compass-style icon (you can copy/adapt `CompassIcon` from `app/bottom-nav.tsx` — it's a small inline SVG, fine to duplicate into this file since there's no shared icon module yet; don't create a new shared-icons file for 2 consumers, that's premature abstraction for this task).
  3. **Tìm kiếm** → `<Link href="/#tim-kiem">` — a search/magnifying-glass icon.
  4. **Chủ đề** → `<Link href="/#chu-de">` — a grid/tag icon.
  5. **Đã lưu** → `<Link href={authed ? "/saved" : "/sign-in?redirectTo=/saved"}>` — reuse/adapt `BookmarkIcon` pattern from `bottom-nav.tsx`.
  6. **Chia sẻ kiến thức** → `<Link href={authed ? "/how-to/new" : "/sign-in?redirectTo=/how-to/new"} className="nav-rail-item nav-rail-item-accent">` — visually distinguished (accent background), reuse/adapt `PlusIcon` pattern.
  7. **Hồ sơ** → `<Link href={authed ? "/profile" : "/sign-in?redirectTo=/profile"}>` — label reads "Hồ sơ" when authed, "Đăng nhập" when anonymous; reuse/adapt `UserIcon`/`SignInIcon` pattern (swap icon based on `authed`, same as `BottomNav` already does for its anon state).
- Every `<Link>` gets a `<span>` label next to its icon; when `data-collapsed="true"`, CSS hides the label and shows a native `title` attribute (simplest real tooltip — no need for a custom tooltip component for this task).
- Each item gets `aria-current="page"` when its route matches (via the same `current()` helper pattern already in `bottom-nav.tsx` — you can duplicate/adapt that small function, it's 4 lines).

- [ ] **Step 3: Wire it into `app/layout.tsx`**

Simplify `site-header`'s authenticated branch: remove the `Đã lưu` text link, the display-name/Hồ sơ text link, and `<SignOutButton />` from the header (the nav rail now owns Đã lưu/Hồ sơ, and `SignOutButton` already exists on `/profile` — confirmed present at `app/profile/page.tsx`, so removing it from the header loses no functionality). The authed header should end up rendering just the `+Chia sẻ kiến thức` primary button (kept from the existing anon branch's pattern, reused for both states now — anon sees `Đăng nhập` + `Đăng ký`, authed sees just `+ Chia sẻ kiến thức`, matching `rebuild-v6-composition-decisions.md`'s intent that the rail is now the home for Đã lưu/Hồ sơ).

Then wrap `{children}` in a shell:

```tsx
<div className="app-shell">
  <NavRail authed={user !== null} />
  <div className="app-shell-main">
    {children}
  </div>
</div>
```

Keep `<footer>`, the bottom-nav spacer, and `<BottomNav>` exactly where they are today (siblings after the shell, not inside `.app-shell-main`) — footer should span full width below the rail, and `BottomNav` is already mobile-only via existing CSS.

Import `NavRail` from `./nav-rail`.

- [ ] **Step 4: CSS for the shell and rail**

In `app/globals.css`, add (exact values are your judgment — follow the existing token system, e.g. `var(--color-paper)`, `var(--space-*)`, `var(--shadow-*)` from Task 2 of the prior design-system plan; don't invent a parallel token set):

- `.app-shell { display: block; }` at default (mobile/tablet), switching to `display: flex;` at `@media (min-width: 1024px)`.
- `.nav-rail { display: none; }` by default, `display: flex; flex-direction: column;` at `≥1024px` — fixed width when expanded (e.g. `14rem`) and a narrower width when `[data-collapsed="true"]` (e.g. `4.5rem`), with a `width`/`transition` (guarded by `prefers-reduced-motion`, matching the existing pattern in this file for `.featured-card`/`.howto-entry`).
- `.app-shell-main { flex: 1; min-width: 0; }`.
- `.nav-rail-item` styling consistent with existing `.nav-text-link`/`.button-primary` visual language (don't invent an unrelated new button style) — active state uses `aria-current="page"` as the CSS hook (`.nav-rail-item[aria-current="page"]`), not a manually-toggled class.
- `.nav-rail-item-accent` gets a filled/accent treatment analogous to `.button-primary`.
- When `[data-collapsed="true"]`, hide `.nav-rail-item span` (the label) and center the icons.

- [ ] **Step 5: Verify**

Run `npx tsc --noEmit && npm run lint && npm run build`. Then real Playwright screenshots:
- 1440px: homepage and one other page (e.g. How-To detail) — confirm the rail renders on the left with 6 real items, collapse toggle works (click it, re-screenshot, confirm width/labels change), and the header now shows only brand + primary CTA (no duplicate Đã lưu/Hồ sơ links).
- 390px: same two pages — confirm NO rail renders, `BottomNav` still renders exactly as before (unchanged), no layout regression, no horizontal overflow.
- Confirm anonymous state (not logged in — this is the only state testable without creating an account, which is fine, that's the state this project actually runs in in this session): rail shows "Đăng nhập" instead of "Hồ sơ", and clicking "Đã lưu"/"Chia sẻ kiến thức" navigates to the correct `?redirectTo=` sign-in URL.
- Confirm `localStorage` persistence: toggle collapsed, reload the page, confirm it stays collapsed (Playwright: reload the page in the same context/page object, don't open a new context).

- [ ] **Step 6: Commit**

```bash
git add app/nav-rail.tsx app/layout.tsx app/globals.css
git commit -m "feat: add collapsible desktop nav rail, simplify header"
```

---

### Task 2: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Regression screenshot pass**

Screenshot all pages this session has previously captured (home, how-to detail, dish detail, saved, profile, sign-in, create — anonymous state) at 1440 and 390, confirm nothing from prior phases (elevation, placeholder-art, seed labels, brandmark) regressed by this shell change.

- [ ] **Step 2: Data-integrity check**

Same read-only pattern as prior phases (`dish`/`how_to`/`attempt_report`/`auth.users` row counts) — confirm unchanged (this task touches no data).

- [ ] **Step 3: Commit**

Only if the doc needs a status update — otherwise no commit needed for this task; a clean verification pass with no code changes doesn't require one.
