# Rebuild V6 — Phase C: Homepage Composition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the homepage's default (non-search, non-filtered) composition around topic-first discovery, fix a real Vietnamese-diacritic search bug, make Evidence a first-class explained concept, and reskin the two curated shelves as horizontal-scroll rows — without touching the underlying data-fetching logic, which is already correct and real-data-only.

**Architecture:** All work is in `app/page.tsx` (one file, ~665 lines, server component, `force-dynamic`) and `app/globals.css`. No new routes — everything continues to live on `/`, with `id="chu-de"` and `id="tim-kiem"` anchors that the Phase B nav rail already links to.

**Tech Stack:** Next.js 16 (App Router), React 19, Supabase, plain CSS. No new dependencies.

**Spec:** `docs/product/rebuild-v6-composition-decisions.md` §2, `docs/product/rebuild-v6-current-state-gap.md` §D

## Global Constraints

- Vietnamese for all UI copy; English only in code/identifiers.
- Never fabricate metrics, ratings, or popularity — every number already comes from real data in this file; do not add anything that doesn't.
- The "Sắp có" topic cards must NOT be interactive elements pretending to lead somewhere — use non-interactive markup (`<span>`/`<div>`, not `<a>`/`<button>`), per the no-dead-controls principle already established in this project.
- Only the DEFAULT homepage state (`isBrowsingHome === true`, i.e. no `q`, no `category`) gets the new topic/evidence-explainer sections — the search-results and category-filtered states keep their existing simpler header (this is intentional per the composition decision doc, not a gap).
- Every visual change must be verified with `npx tsc --noEmit`, `npm run lint`, `npm run build`, and real Playwright screenshots at 1440 and 390.
- Do not delete or restructure the existing data-fetching logic (`searchHowToIds`, ingredient discovery, stories, tally/specimen logic) — only Task 1 touches `searchHowToIds`'s matching logic specifically; everything else is presentation-layer reorganization of already-correct data.

---

### Task 1: Fix Vietnamese diacritic-insensitive search

**Files:**
- Create: `lib/text-normalize.ts`
- Modify: `app/page.tsx` (`searchHowToIds` function only)

**Interfaces:**
- Produces: `stripDiacritics(input: string): string` — pure function, no I/O. Consumed by the modified `searchHowToIds`.

- [ ] **Step 1: Reproduce the bug first**

Before changing anything, confirm the bug: visit `http://localhost:3000/?q=banh+xeo` (dev server should already be running; if not, `npm run dev`) and confirm it shows "Chưa tìm thấy cách làm nào cho 'banh xeo'" even though "Bánh xèo" exists. Take a screenshot as your before-evidence.

- [ ] **Step 2: Write `lib/text-normalize.ts`**

```ts
/**
 * Bỏ dấu tiếng Việt để so khớp tìm kiếm không phân biệt dấu — tìm kiếm hiện
 * tại dùng ilike thuần trên chuỗi có dấu, nên "banh xeo" không khớp được
 * "Bánh xèo". Không dùng extension Postgres (unaccent) để tránh phụ thuộc
 * schema mới cho một bản sửa lỗi tìm kiếm — kho dữ liệu hiện tại đủ nhỏ để so
 * khớp phía ứng dụng.
 */
export function stripDiacritics(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}
```

- [ ] **Step 3: Rewrite `searchHowToIds` to match on stripped text**

Read the current `searchHowToIds` function in `app/page.tsx` in full first (it does 3 parallel Supabase `ilike` queries against `how_to`, `dish`, `how_to_ingredient`). Replace the `ilike`-based filtering with: fetch the full candidate columns for each of the 3 tables (no `ilike` filter — `select(...)` with no `.ilike()`/`.or()` call; this dataset is currently 7 how_to rows and a small ingredient list, so an unfiltered fetch is not a real performance concern), then filter and score in JavaScript using `stripDiacritics()` on both the query and each candidate field. Preserve the exact same scoring logic (5 points exact-title match, 3 points title/description substring or dish match, 2 points ingredient match, `matchedIngredients` tracking) — only the match-test itself changes from `ilike` substring to `stripDiacritics(field).includes(stripDiacritics(query))`.

Keep the function's signature and return type (`Promise<Map<string, SearchMatch>>`) identical — nothing calling `searchHowToIds` should need to change.

- [ ] **Step 4: Verify the fix**

Run `npx tsc --noEmit && npm run build`. Then re-visit `/?q=banh+xeo` and confirm "Bánh xèo" now appears in results. Also re-test a few existing working searches (e.g. `/?q=trứng`, `/?q=bánh xèo` with correct diacritics) to confirm you haven't broken already-working accented search — same results, same ranking order.

- [ ] **Step 5: Commit**

```bash
git add lib/text-normalize.ts app/page.tsx
git commit -m "fix: make homepage search diacritic-insensitive"
```

---

### Task 2: Topic-first discovery entry point + contextual search anchor

**Files:**
- Modify: `app/page.tsx` (JSX only, in the `isBrowsingHome` branch of the returned markup — read the current file first, the relevant JSX is the `<form role="search">` and the `<section className="hero">` block)
- Modify: `app/globals.css` (new `.topic-discovery`/`.topic-card*` rules)

**Interfaces:**
- Produces: `id="chu-de"` and `id="tim-kiem"` DOM anchors that Phase B's `NavRail` component already links to (`/#chu-de`, `/#tim-kiem`) — if Phase B hasn't landed yet in this session, that's fine, these ids just won't be linked to yet.

- [ ] **Step 1: Read the current file first**

Read `app/page.tsx`'s full return JSX (the `<main className="main-list">` block) before editing — this session has been iterating on this file, confirm the search form and hero section still look as described in this brief.

- [ ] **Step 2: Add the topic-discovery section, ONLY when `isBrowsingHome` is true**

Immediately after `<main className="main-list">` opens, before the search form, add (this must be conditional — it should NOT appear on search-results or category-filtered views, matching the Global Constraints):

```tsx
{isBrowsingHome && (
  <section id="chu-de" className="topic-discovery" aria-label="Chọn chủ đề">
    <h2 className="topic-discovery-heading">Bạn đang quan tâm điều gì?</h2>
    <div className="topic-cards">
      <div className="topic-card topic-card-active" aria-current="true">
        <svg className="topic-card-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 12a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="topic-card-name">Ẩm thực</span>
      </div>
      {["Thủ công", "Làm đẹp", "Sửa chữa", "Công nghệ"].map((name) => (
        <div key={name} className="topic-card topic-card-soon" aria-disabled="true">
          <span className="topic-card-name">{name}</span>
          <span className="topic-card-badge">Sắp có</span>
        </div>
      ))}
    </div>
  </section>
)}
```

The icon path is a simple abstract "bowl/steam" glyph — if it doesn't render cleanly at a small size, you may adjust the path (your judgment, same constraint as the rest of this project: no checkmark/badge/seal shapes, keep it a thin open stroke matching the existing brand-icon/bottom-nav icon style). The 4 "Sắp có" cards are plain `<div>`s, not links or buttons — they must not be focusable/interactive elements, since they don't lead anywhere real (`aria-disabled="true"` plus no `tabIndex`/`role="button"` is correct; do not make them keyboard-focusable).

- [ ] **Step 3: Give the search form the anchor id and a contextual placeholder**

Add `id="tim-kiem"` to the existing `<form role="search" ...>` element (the ID goes on the `<form>` so the anchor scrolls the whole search block into view, not just the input). Change the input's placeholder from `"Tìm theo tên, nguyên liệu…"` to `"Tìm món ăn, nguyên liệu, cách làm…"` — this is "contextual" in the sense that Ẩm thực is the only real topic right now (per the composition decision doc, there's no live topic-switching to react to, so a single food-specific placeholder is the honest current-state implementation, not a partial one).

- [ ] **Step 4: Verify**

Run `npx tsc --noEmit && npm run build`. Screenshot `/` at 1440 and 390: confirm the topic section renders above the search form, Ẩm thực reads as visually active/selected, the 4 "Sắp có" cards read as clearly inactive/muted (not clickable-looking), and `/?q=...`/`/?category=...` views do NOT show the topic section. Also confirm `/#chu-de` and `/#tim-kiem` (typed directly in the browser) scroll to the right sections.

- [ ] **Step 5: CSS for `.topic-discovery`/`.topic-card*`**

Add to `app/globals.css` — your judgment on exact spacing/sizing following the existing token system (`var(--space-*)`, `var(--radius-*)`, `var(--shadow-*)` from the design-system phase, `var(--color-ember)` for the active state). Requirements: `.topic-cards` is a `flex` row that wraps on narrow screens; `.topic-card` has real padding and a card-like shape (not a thin pill — the composition decision doc explicitly wants these to read as "discovery objects, not pill buttons"); `.topic-card-active` gets a visible accent border/background using `var(--color-ember)`/`var(--color-ember-tint)`; `.topic-card-soon` gets reduced opacity and a small muted `.topic-card-badge` (background `var(--color-line-soft)`, small text) reading "Sắp có".

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx app/globals.css
git commit -m "feat: add topic-first discovery entry point to homepage"
```

---

### Task 3: Evidence explainer section (fold in real story examples)

**Files:**
- Modify: `app/page.tsx` (add a new section; the existing "Chuyện xảy ra khi thử" `stories` section is being replaced/repositioned by this task, not duplicated — see Step 2)
- Modify: `app/globals.css` (new `.evidence-explainer*` rules; the old `.story-*` rules may be reused or renamed at your judgment — check what's still referenced elsewhere before deleting anything)

**Interfaces:**
- Consumes: the existing `stories` array already computed earlier in `DiscoverPage` (real attempt-report notes with photos, already correctly filtered/sorted — do not change how `stories` is computed).

- [ ] **Step 1: Read the current file first**

Read the current `{stories.length > 0 && (...)}` block in `app/page.tsx` (renders `.story-card` items with image/result/note/source) — you'll be moving and reframing this content, not deleting the underlying data logic above it.

- [ ] **Step 2: Replace the standalone "Chuyện xảy ra khi thử" section with an Evidence-explainer section that includes it**

Remove the existing `{stories.length > 0 && (<section aria-label="Chuyện xảy ra khi thử" ...>...)}` block, and in its place (same position in the JSX, still only within `isBrowsingHome` — check: is this block currently already scoped to `isBrowsingHome`? The `stories` array itself is only populated `if (isBrowsingHome)`, so the section naturally won't render otherwise, but confirm this explicitly), add:

```tsx
<section className="evidence-explainer" aria-label="Evidence hoạt động thế nào">
  <div className="evidence-explainer-steps">
    <div className="evidence-step">
      <span className="evidence-step-index">1</span>
      <h3>Cách làm</h3>
      <p>Hướng dẫn từng bước cho một món hoặc một kỹ thuật.</p>
    </div>
    <div className="evidence-step">
      <span className="evidence-step-index">2</span>
      <h3>Báo cáo đã thử</h3>
      <p>Một người thật làm theo, rồi ghi lại điều gì đã thật sự xảy ra.</p>
    </div>
    <div className="evidence-step">
      <span className="evidence-step-index">3</span>
      <h3>Bằng chứng</h3>
      <p>Các báo cáo tích lũy lại theo thời gian — thành công, một phần, hay thất bại.</p>
    </div>
  </div>
  <p className="evidence-explainer-caveat">
    Bằng chứng không có nghĩa là hệ thống xác nhận điều này đúng — đó là những gì người
    đã thử ghi nhận lại.
  </p>
  {stories.length > 0 && (
    <div className="evidence-explainer-examples">
      {stories.map((s) => (
        <Link key={s.reportId} href={`/how-to/${s.howToId}`} className="story-card">
          {s.imageUrl && <img src={s.imageUrl} alt="" className="story-image" />}
          <div className="story-body">
            <p className="story-result" data-result={s.result}>
              {RESULT_LABELS[s.result]}
            </p>
            <p className="story-note">"{s.note}"</p>
            <p className="story-source">
              {s.dishName && !s.howToTitle.toLowerCase().includes(s.dishName.toLowerCase())
                ? `${s.dishName} · `
                : ""}
              {s.howToTitle}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )}
</section>
```

This keeps the existing `.story-card`/`.story-image`/`.story-body`/`.story-result`/`.story-note`/`.story-source` classes and CSS as-is (reused, not duplicated) — only the outer wrapper section changes from a standalone "Chuyện xảy ra khi thử" shelf to being the concrete-examples half of the Evidence explainer. If `stories.length === 0`, the explainer's 3-step block and caveat text still render (they're not data-dependent) — this section should NOT be wrapped in `{stories.length > 0 && ...}` at the top level, only the examples sub-block should be.

- [ ] **Step 3: CSS for `.evidence-explainer*`**

Add `.evidence-explainer` (a distinct visual band — your judgment, could use `var(--color-paper-deep)` or `var(--color-kraft-tint)` background to set it apart, consistent with this project's existing convention of using the kraft/evidence-adjacent palette specifically for Evidence-related surfaces), `.evidence-explainer-steps` (3-column grid on desktop, stacked on mobile), `.evidence-step`, `.evidence-step-index` (a circular numbered badge, similar treatment to the existing numbered steps on the How-To detail page — check `app/globals.css` for that pattern and reuse the visual language, don't invent an unrelated style), `.evidence-explainer-caveat` (smaller, muted text), `.evidence-explainer-examples` (reuse `.story-grid`'s existing layout rules if suitable, or adjust minimally).

- [ ] **Step 4: Verify**

Run `npx tsc --noEmit && npm run build`. Screenshot `/` at 1440 and 390: confirm the 3-step explainer renders with the caveat text, and the real story examples (Bánh xèo's 2 real-feeling notes) appear underneath as concrete illustrations. Confirm this section does NOT appear on `/?q=...` or `/?category=...` views (same as before).

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx app/globals.css
git commit -m "feat: make Evidence a first-class explained concept on homepage"
```

---

### Task 4: Reskin curated shelves as horizontal-scroll rows

**Files:**
- Modify: `app/globals.css` (`.featured-grid`, `.ingredient-discovery` rules only)

**Interfaces:**
- No JSX/data changes — this task is CSS-only. `FeaturedCard`/ingredient-tile markup in `app/page.tsx` stays exactly as-is.

- [ ] **Step 1: Read current rules first**

`.featured-grid` (currently `display: grid; grid-template-columns: 1fr;` with a `@media (min-width: 640px)` breakpoint) and `.ingredient-discovery` (currently `display: flex; flex-wrap: wrap;`) — grep for both in `app/globals.css` to find current exact state (this session has touched this file heavily, confirm before editing).

- [ ] **Step 2: Convert both to horizontal-scroll shelves**

Change `.featured-grid` to a horizontal-scrolling flex row: `display: flex; flex-wrap: nowrap; overflow-x: auto; gap: var(--space-md); scroll-snap-type: x mandatory; padding-bottom: var(--space-xs);` (the bottom padding gives room for a visible scrollbar without clipping card shadows). Its children (`.featured-card`, rendered by `FeaturedCard`) need `flex: 0 0 auto;` and a fixed/min width (e.g. `min-width: 16rem;` or similar — your judgment, should show roughly 2.5-3 cards on a 1440px viewport and scroll smoothly on mobile) plus `scroll-snap-align: start;`. Remove the old `@media (min-width: 640px)` grid-column-count rule since it no longer applies.

Change `.ingredient-discovery` the same way: `flex-wrap: nowrap; overflow-x: auto; scroll-snap-type: x mandatory;` (keep existing `gap`), and give `.ingredient-tile` `scroll-snap-align: start;` (it's already `flex: 0 0 auto` per the existing rule, confirm this is still true).

Add a `prefers-reduced-motion` consideration only if you introduce any new transition (scroll-snap itself doesn't need one; skip this if you added no new `transition` property).

- [ ] **Step 3: Verify**

Run `npx tsc --noEmit && npm run build`. Screenshot `/` at 1440 and 390: confirm both shelves now scroll horizontally (you can verify by checking the container's `scrollWidth > clientWidth` via a quick Playwright evaluate, or by taking a screenshot after programmatically scrolling the container and confirming the visible cards changed) rather than wrapping to multiple rows or stacking full-width. Confirm no horizontal overflow of the PAGE itself (only the shelf containers should scroll, not the whole viewport) — this is important, re-check `main.main-list`/body for unwanted horizontal scroll at 390px.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "feat: reskin curated shelves as horizontal-scroll rows"
```

---

### Task 5: Full regression + V5-vs-V6 visual gate

**Files:** none (verification only)

- [ ] **Step 1: Type/lint/build**

Run `npx tsc --noEmit && npm run lint && npm run build` — clean (aside from the pre-existing `<img>` warnings already noted as out of scope elsewhere in this project's docs).

- [ ] **Step 2: Full journey screenshot pass**

At 1440, 1024, and 390: homepage (default state), `/?q=bánh xèo` (search results, confirm topic/evidence sections correctly absent), `/?q=banh xeo` (confirm the Task 1 fix works end-to-end in the full rendered page, not just the data layer), `/?category=<any real slug>` (confirm same), a How-To detail page, a Dish page (confirm nothing broke elsewhere from the CSS changes in Tasks 2-4).

- [ ] **Step 3: Visual transformation self-check**

Compare your new homepage screenshot against `docs/product/rebuild-v6-current-state-gap.md`'s `home-1440.png`/`home-390.png` (described in that doc, or re-generate the old versions aren't kept as files — compare against the written description in that doc's §B/§D instead). Answer honestly in your report: does the homepage now open with a decision (topic selection) instead of reading straight into content? Does a second navigational layer exist that didn't before (this task doesn't add the nav rail — that's a separate plan — but confirm the topic/evidence sections are genuinely new structure, not just restyled old structure)? Is there real content between the search bar and the first card shelf that didn't exist before (the evidence explainer)? If any answer is "no, it's the same as before," say so plainly in your report rather than describing it favorably — the controller needs the honest signal to decide whether more work is needed.

- [ ] **Step 4: Data-integrity check**

Same read-only pattern as prior phases — confirm row counts unchanged (`dish`, `how_to`, `attempt_report`, `auth.users`). This plan makes no data writes.

- [ ] **Step 5: Commit**

Only if you find and fix something during this pass; otherwise this task is verification-only and needs no commit.
