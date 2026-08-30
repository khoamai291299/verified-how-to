-- Quick-facts (thời gian nấu / khẩu phần) — quyết định founder 2026-08-31
-- (design-gap-analysis-v4.md §3 mục P1.6). Additive, nullable — KHÔNG bịa dữ
-- liệu cho 7 How-To hiện có, giữ NULL cho tới khi có số liệu thật. UI phải
-- ẩn quick-fact khi giá trị NULL, không hiển thị placeholder/số giả.
alter table how_to add column duration_minutes integer check (duration_minutes is null or duration_minutes > 0);
alter table how_to add column servings integer check (servings is null or servings > 0);
