# Rebuild V6 — Phase B: Design System Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the two pending additive Supabase migrations and lay the visual-craft foundation (elevation, honest placeholder-art, display typography, brandmark, seed-content transparency, quick-facts) that every later rebuild phase (C–H) builds on.

**Architecture:** This is a Next.js App Router project with zero component library and one hand-rolled `app/globals.css` (2175 lines, CSS custom-property tokens already established — colors, spacing, radius). No JS test framework exists (no vitest/jest); this project's established verification method is `tsc`/`next build`/`eslint` plus real Playwright screenshots (see `docs/product/visual-audit-v5.md`, `docs/product/design-gap-analysis-v4.md`). Every task below follows that pattern instead of unit tests.

**Tech Stack:** Next.js 16 (App Router), React 19, Supabase (`@supabase/ssr`, `@supabase/supabase-js`), plain CSS custom properties. Explicitly **not** adding Tailwind/shadcn (see spec §4).

**Spec:** `docs/product/rebuild-v6-design-direction.md`

## Global Constraints

- Vietnamese for all UI copy; English only in code/identifiers (`project-language-rule` memory).
- Never fabricate ratings/popularity/verification; never present seed/demo content as real without the `is_seed_content` label (spec §5).
- Never replace or "improve" the synthetic Evidence photos to look more like real food — only the true "no photo" placeholder art may change (spec §2, §7).
- Migrations are additive-only; do not touch the 2 orphan `dish` rows or the ambiguous `attempt_report` row from `docs/product/data-integrity-note-2026-08-31.md`.
- No new runtime dependencies (spec §4).
- Every visual change must be verified with `npx tsc --noEmit`, `npm run lint`, `npm run build`, and a real Playwright screenshot at 1440 and 390 widths — not source-reading alone.

---

### Task 1: Apply pending migrations and commit the data-integrity trail

**Files:**
- Apply (no edits needed, already written): `supabase/migrations/20260831090000_seed_content_flag.sql`, `supabase/migrations/20260831091500_how_to_quick_facts.sql`
- Commit: those two files + `docs/product/data-integrity-note-2026-08-31.md`

**Interfaces:**
- Produces: `how_to.is_seed_content boolean not null default false`, `attempt_report.is_seed_content boolean not null default false`, `how_to.duration_minutes integer null`, `how_to.servings integer null` — every later task in this plan reads these columns.

- [ ] **Step 1: Confirm pending status against the linked remote project**

Run: `npx supabase migration list`
Expected: the two 2026-08-31 migrations show an empty `remote` field (not yet applied); all earlier ones show a matching remote timestamp. If anything else is pending or the list looks different from this, stop and report — do not push blind.

- [ ] **Step 2: Push the migrations**

Run: `npx supabase db push`
Expected: both `20260831090000` and `20260831091500` apply successfully with no errors. This is a real write to the founder's shared dev/production Postgres — additive-only (`add column ... default`), already founder-authorized (spec §5), but announce it happened rather than doing it silently.

- [ ] **Step 3: Verify columns exist and backfill matches the documented list**

Run:
```bash
cd /Users/dangkhoa/Project/verified-how-to && cat > /tmp/verify-seed-flag.mjs <<'EOF'
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8")
    .split("\n").filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data: howTos } = await supabase.from("how_to").select("id, title, is_seed_content, duration_minutes, servings");
console.log(howTos);
const { data: reports } = await supabase.from("attempt_report").select("id, is_seed_content");
console.log("seed reports:", reports.filter(r => r.is_seed_content).length, "/ total:", reports.length);
EOF
node /tmp/verify-seed-flag.mjs
rm /tmp/verify-seed-flag.mjs
```
Expected: 6 How-Tos with `is_seed_content: true` (all except Bánh xèo `d1313dd7-...`), `duration_minutes`/`servings` both `null` for all 7 (no fabricated values), and exactly 15 of the attempt reports flagged `is_seed_content: true` (matching the migration's explicit ID list — 17 total minus the founder's real one minus the ambiguous one).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260831090000_seed_content_flag.sql supabase/migrations/20260831091500_how_to_quick_facts.sql docs/product/data-integrity-note-2026-08-31.md
git commit -m "$(cat <<'EOF'
feat: apply is_seed_content and quick-facts migrations

Additive-only, founder-authorized in rebuild-v6-design-direction.md §5.
Backfill verified against content-seed-log.md's explicit ID list, not
inferred. duration_minutes/servings left NULL for all 7 existing How-Tos
— no fabricated data.
EOF
)"
```

---

### Task 2: Elevation and display-type tokens

**Files:**
- Modify: `app/globals.css:65-76` (token block)

**Interfaces:**
- Produces: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--font-size-display` — consumed by Tasks 3 and 5.

- [ ] **Step 1: Add the tokens**

In `app/globals.css`, after the existing `--radius-lg: 18px;` line (part of the `:root` block, currently lines 65-68) and before the `/* ---- Measure ---- */` comment, add:

```css
  /* ---- Elevation: chưa từng có token nào trước bản V6 — mọi card chỉ phân
     biệt bằng viền 1px, khiến trang phẳng đều như nhau. Dùng tông ink ấm
     (không đen thuần) để giữ tinh thần "giấy". ---- */
  --shadow-sm: 0 1px 2px rgba(23, 20, 15, 0.06);
  --shadow-md: 0 6px 16px rgba(23, 20, 15, 0.08);
  --shadow-lg: 0 16px 32px rgba(23, 20, 15, 0.12);

  /* ---- Display type: 1 cỡ riêng cho hero/heading cấp 1 thật sự (không áp
     dụng cho <h1> chung — trang search/category dùng h1 cho tiêu đề ngữ
     cảnh, không cần cỡ display). ---- */
  --font-size-display: clamp(2.25rem, 1.85rem + 2vw, 3.5rem);
```

- [ ] **Step 2: Verify no syntax breakage**

Run: `npx tsc --noEmit && npm run build`
Expected: both succeed with no new errors (CSS custom properties aren't type-checked, but a broken `:root` block would surface as a build/runtime CSS parse issue — confirm the page still renders by checking build output has no CSS-related warnings).

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: add elevation and display-type design tokens"
```

---

### Task 3: Give cards real elevation, turn the "Cách làm khác" row-list into cards

**Files:**
- Modify: `app/globals.css:402-408` (`.auth-card`), `app/globals.css:1514-1539` (`.featured-card` / hover), `app/globals.css:1599-1610` (`.howto-entry`)

**Interfaces:**
- Consumes: `--shadow-sm/md/lg` from Task 2.

- [ ] **Step 1: Give `.auth-card` a real resting shadow**

Replace the existing line
```css
  box-shadow: 0 1px 2px rgba(31, 28, 22, 0.04);
```
inside `.auth-card` (`app/globals.css:402`) with:
```css
  box-shadow: var(--shadow-md);
```

- [ ] **Step 2: Give `.featured-card` a resting shadow, not just a hover one**

In `app/globals.css`, the `.featured-card` rule (around line 1514) currently has no `box-shadow` at rest. Add one line to that rule:
```css
  box-shadow: var(--shadow-sm);
```
Then update its hover rule (around line 1535):
```css
.featured-card:hover,
.featured-card:has(.featured-card-stretched-link:focus-visible) {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

- [ ] **Step 3: Convert `.howto-entry` from a bordered table row to a card**

Replace the current rule (`app/globals.css:1599`):
```css
.howto-entry {
  padding: var(--space-md) 0;
  border-top: 1px solid var(--color-line-soft);
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: var(--space-md);
}

.howto-list li:last-child .howto-entry {
  border-bottom: 1px solid var(--color-line-soft);
}
```
with:
```css
.howto-entry {
  padding: var(--space-md);
  margin-bottom: var(--space-sm);
  border-radius: var(--radius-lg);
  background: var(--color-paper-raised);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: var(--space-md);
  transition: box-shadow 0.16s ease;
}

.howto-list li:last-child .howto-entry {
  margin-bottom: 0;
}

.howto-entry:hover,
.howto-entry:has(a:focus-visible) {
  box-shadow: var(--shadow-md);
}

@media (prefers-reduced-motion: reduce) {
  .howto-entry {
    transition: none;
  }
}
```

- [ ] **Step 4: Visual verification**

Run the project's dev server (`npm run dev`, already running on port 3000 per this session) and take fresh Playwright screenshots of `/` (desktop 1440 + mobile 390) and the Dish page. Confirm: the "Cách làm khác" list now reads as a stack of distinct cards with visible separation and a soft shadow, not a bordered table; the auth card and featured "Được thử nhiều nhất" cards visibly lift off the page.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css
git commit -m "feat: replace flat borders with a real elevation system on cards"
```

---

### Task 4: Redesign the true "no photo" placeholder art

**Files:**
- Modify: `app/globals.css:1698-1703` (`.specimen-empty`)

**Interfaces:**
- Consumes: existing `--color-line`, `--color-line-soft`, `--color-paper-deep` tokens.
- No signature change — `.specimen-empty` keeps being a plain `<span>` with no children, used identically at `app/page.tsx:108,183,559` and inside `.ingredient-tile`/`.featured-card-image` contexts. Only the CSS changes.

- [ ] **Step 1: Replace the diagonal-hatch pattern with a concentric-ring motif**

This applies **only** to How-Tos/Dishes with genuinely zero attempts or photos (e.g. "Rau muống luộc") — it must stay visually distinct from the seed-content gradient photos handled in Task 6, so a viewer never confuses "no data yet" with "here is a (demo) photo." Replace `app/globals.css:1698-1703`:
```css
.specimen-empty {
  display: block;
  width: 100%;
  height: 100%;
  background-image: repeating-linear-gradient(135deg, var(--color-line) 0 1px, transparent 1px 8px);
}
```
with:
```css
/* Chưa có ảnh kết quả thật nào — mô típ 2 vòng tròn đồng tâm + 1 chấm giữa,
   tông màu trung tính thấp bão hòa, CỐ Ý khác hẳn màu ấm rực của ảnh
   seed/demo thật (xem .evidence-seed-badge) để không ai nhầm "chưa có dữ
   liệu" với "đây là một tấm ảnh". */
.specimen-empty {
  display: block;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 50% 50%, var(--color-line) 0 5%, transparent 5% 100%),
    radial-gradient(
      circle at 50% 50%,
      transparent 0 34%,
      var(--color-line-soft) 34% 38%,
      transparent 38% 58%,
      var(--color-line-soft) 58% 62%,
      transparent 62% 100%
    ),
    var(--color-paper-deep);
}
```

- [ ] **Step 2: Visual verification**

Screenshot `/dish/<rau-muống-id>` (the one How-To seeded with 0 attempts) and the homepage's "Cách làm khác" list where it appears. Confirm it reads as a deliberate abstract mark, not a placeholder that looks broken, and is visually distinguishable from the warm-toned seed photo circles elsewhere on the same page.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: redesign empty-specimen placeholder as a deliberate mark"
```

---

### Task 5: Brandmark + home-hero display type

**Files:**
- Modify: `app/layout.tsx:35-40` (`.brand` link contents)
- Modify: `app/globals.css:154-170` (`.brand`, add `.brand-icon`)
- Modify: `app/page.tsx:503` (home hero `<h1>`)
- Modify: `app/globals.css` (add `.home-hero-heading`, near `.product-thesis` at line 1227)

**Interfaces:**
- Consumes: `--color-ember`, `--color-ember-deep` (existing), `--font-size-display` (Task 2).

- [ ] **Step 1: Add a small inline SVG brandmark**

In `app/layout.tsx`, replace:
```tsx
          <Link href="/" className="brand">
            <span className="brand-word">
              Verified <span>How-To</span>
            </span>
            <span className="brand-kicker">sổ tay thực hành thật</span>
          </Link>
```
with:
```tsx
          <Link href="/" className="brand">
            <span className="brand-row">
              <svg className="brand-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 13.5 9.5 19 20 6"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="brand-word">
                Verified <span>How-To</span>
              </span>
            </span>
            <span className="brand-kicker">sổ tay thực hành thật</span>
          </Link>
```
This is a single checkmark-like stroke, not a certification badge/seal shape — the design-direction.md §2 cultural constraint against "con dấu đỏ" (official red stamp) imagery applies to badges/seals, not a simple line mark; keep it a thin open stroke, no circle/shield outline around it, to stay clearly on the "a mark of completion", not "an official seal" side of that line.

- [ ] **Step 2: Style the brandmark**

In `app/globals.css`, inside the `.brand` rule area, add after `.brand` (around line 160):
```css
.brand-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.brand-icon {
  width: 1.1rem;
  height: 1.1rem;
  color: var(--color-ember);
  flex: 0 0 auto;
}
```

- [ ] **Step 3: Give the home hero heading its own display-size class**

In `app/page.tsx:503`, change:
```tsx
              <h1>Không chỉ cho bạn biết cách làm</h1>
```
to:
```tsx
              <h1 className="home-hero-heading">Không chỉ cho bạn biết cách làm</h1>
```
Do **not** touch the other two `<h1>` usages in this file (search-results heading at line 485, category heading at line 495) — those are contextual page titles, not the marketing hero, and should keep the existing `h1` size.

In `app/globals.css`, add near `.product-thesis` (around line 1227):
```css
.home-hero-heading {
  font-size: var(--font-size-display);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.05;
  margin-bottom: var(--space-sm);
}
```

- [ ] **Step 4: Visual verification**

Screenshot `/` at 1440 and 390. Confirm: a small checkmark-style glyph sits to the left of the "Verified How-To" wordmark in the header at both sizes without breaking the sticky header's height; the home hero headline is now noticeably larger/more editorial than the search/category page titles, and doesn't overflow or wrap awkwardly at 390px.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/globals.css app/page.tsx
git commit -m "feat: add brandmark icon and display-scale home hero heading"
```

---

### Task 6: Label seed/demo Evidence transparently on the How-To detail page

**Files:**
- Modify: `app/how-to/[id]/page.tsx:71-77` (`AttemptReportView` type), `:153-157` (how_to select), `:209-213` (attempt_report select), `:261-268` (reportViews mapping), `:94-136` (`EvidenceTicketItem`)
- Modify: `app/globals.css` (new `.evidence-seed-badge` rule, near `.evidence-ticket`/`.evidence-result`)

**Interfaces:**
- Consumes: `attempt_report.is_seed_content` (Task 1).
- Produces: `AttemptReportView.is_seed_content: boolean` — any later phase touching this file's evidence rendering must keep this field.

- [ ] **Step 1: Select the new column**

In `app/how-to/[id]/page.tsx:209-213`, change the `attempt_report` select from:
```ts
    .select("id, result, note, submitted_at, user_id")
```
to:
```ts
    .select("id, result, note, submitted_at, user_id, is_seed_content")
```

- [ ] **Step 2: Thread it through the type and the view mapping**

In the `AttemptReportView` type (`:71-77`), add the field:
```ts
type AttemptReportView = {
  id: string;
  result: AttemptReportResult;
  note: string | null;
  submitted_at: string;
  user_id: string | null;
  is_seed_content: boolean;
  images: AttemptReportImageView[];
};
```
In the `reportViews` mapping (`:261-268`), add it to the object literal:
```ts
  const reportViews: AttemptReportView[] = (reports ?? []).map((report) => ({
    id: report.id,
    result: report.result as AttemptReportResult,
    note: report.note,
    submitted_at: report.submitted_at,
    user_id: report.user_id,
    is_seed_content: report.is_seed_content,
    images: imagesByReportId.get(report.id) ?? [],
  }));
```

- [ ] **Step 3: Render the label in `EvidenceTicketItem`**

In `EvidenceTicketItem` (`:94-136`), inside `<div className="field-note-margin">`, right after the `evidence-result` paragraph, add:
```tsx
            <p className="evidence-result" data-result={report.result}>
              {RESULT_LABELS[report.result]}
            </p>
            {report.is_seed_content && <p className="evidence-seed-badge">Nội dung minh họa</p>}
```

- [ ] **Step 4: Style the badge**

In `app/globals.css`, near the `.evidence-result` rule, add:
```css
.evidence-seed-badge {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: var(--color-ink-faint);
  margin-top: 0.2rem;
}
```
Mono + muted color matches how this page already marks "data about the data" (timestamps use mono) rather than inventing a new visual language for it.

- [ ] **Step 5: Verify with real data**

Run: `npx tsc --noEmit && npm run build`. Then screenshot `/how-to/d1313dd7-5e03-4edb-a95f-9c713707aeb1` (Bánh xèo). Confirm: the two seed-flagged attempt reports on this How-To show "Nội dung minh họa" under their result label; the founder's own real attempt report (`421dd8c8-...`) does **not** show the label.

- [ ] **Step 6: Commit**

```bash
git add app/how-to/\[id\]/page.tsx app/globals.css
git commit -m "feat: label seed/demo Evidence transparently on How-To detail"
```

---

### Task 7: Show real quick-facts (duration/servings) when present

**Files:**
- Modify: `app/how-to/[id]/page.tsx:153-157` (how_to select), `:297-361` (hero render block)

**Interfaces:**
- Consumes: `how_to.duration_minutes`, `how_to.servings` (Task 1). Both are nullable — this task must render nothing when both are null, per spec §5/§7 ("không bịa dữ liệu").

- [ ] **Step 1: Select the new columns**

In `app/how-to/[id]/page.tsx:153-157`, change:
```ts
    .select("id, title, description, expected_outcome, user_id, hero_image_path, dish:dish_id(id, name)")
```
to:
```ts
    .select("id, title, description, expected_outcome, user_id, hero_image_path, duration_minutes, servings, dish:dish_id(id, name)")
```

- [ ] **Step 2: Render a quick-facts line, only when data exists**

In the hero block, right after the `supporting-text` description paragraph (`:325`) and before the `categoryTags` block (`:327`), add:
```tsx
          {(howTo.duration_minutes !== null || howTo.servings !== null) && (
            <p className="quick-facts">
              {howTo.duration_minutes !== null && <span>{howTo.duration_minutes} phút</span>}
              {howTo.duration_minutes !== null && howTo.servings !== null && <span aria-hidden="true"> · </span>}
              {howTo.servings !== null && <span>{howTo.servings} khẩu phần</span>}
            </p>
          )}
```

- [ ] **Step 3: Style it**

In `app/globals.css`, near `.supporting-text` (around line 1263), add:
```css
.quick-facts {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--color-ink-soft);
  margin-bottom: var(--space-md);
}

.quick-facts span + span {
  margin-left: 0.15rem;
}
```

- [ ] **Step 4: Verify nothing is fabricated**

Run: `npx tsc --noEmit && npm run build`. Screenshot `/how-to/d1313dd7-5e03-4edb-a95f-9c713707aeb1` — since Task 1's backfill leaves `duration_minutes`/`servings` `null` for all 7 existing How-Tos, **confirm the quick-facts line does not render at all** on any current How-To. (The UI is only exercised once a real value exists — Phase F's Create/Edit rebuild adds the input; this task is the honest read-path only.)

- [ ] **Step 5: Commit**

```bash
git add app/how-to/\[id\]/page.tsx app/globals.css
git commit -m "feat: render duration/servings quick-facts when real data exists"
```

---

### Task 8: Full-phase regression check

**Files:** none (verification only)

- [ ] **Step 1: Type/lint/build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: all three clean, no new errors/warnings beyond the pre-existing `<img>` warning already noted as out of scope in `visual-audit-v5.md` §7.

- [ ] **Step 2: Full-page Playwright screenshot pass**

Re-run the screenshot script used during Phase A research (`home`, `saved`, `profile`, `signin`, `create`, `howto-detail`, `dish-detail`) at 1440 and 390. Visually confirm every change from Tasks 2–7 is present and nothing regressed (no broken layouts, no overflow, no lost content).

- [ ] **Step 3: Confirm no test residue**

Run the same read-only query pattern as Task 1 Step 3 against `dish`/`how_to`/`attempt_report`/`auth.users` row counts. Confirm they're unchanged from before this plan started (this plan creates no test data — Tasks 1-7 are schema/CSS/markup only).

- [ ] **Step 4: Update the design-direction doc's roadmap table**

In `docs/product/rebuild-v6-design-direction.md`, mark Phase B as done in the §6 table (change the Phase B row's note or add a trailing "— Xong (2026-08-31)").

- [ ] **Step 5: Commit**

```bash
git add docs/product/rebuild-v6-design-direction.md
git commit -m "docs: mark Phase B (design system foundation) complete"
```
