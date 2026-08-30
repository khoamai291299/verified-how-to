-- Minh bạch nội dung demo/seed — xem docs/product/content-seed-log.md và
-- quyết định founder 2026-08-31 (visual-audit-v5.md mục 9 câu 1-2).
-- Additive-only: cột mới, default false, KHÔNG xóa/sửa dữ liệu hiện có.
--
-- is_seed_content = true nghĩa là "nội dung minh họa cho mục đích demo",
-- KHÔNG phải hoạt động thật của founder/người dùng. UI dùng cột này để gắn
-- nhãn rõ ràng, không ngụ ý xác nhận hệ thống cho nội dung demo (nguyên tắc
-- design-direction.md §1.1 "Evidence thật, không phải xác nhận hệ thống").
alter table how_to add column is_seed_content boolean not null default false;
alter table attempt_report add column is_seed_content boolean not null default false;

-- ============================================================
-- Backfill — theo ĐÚNG danh sách ID đã đối chiếu trực tiếp với
-- docs/product/content-seed-log.md qua Supabase service role (2026-08-31),
-- không suy đoán. Dùng danh sách include tường minh (không phải loại trừ)
-- để không vô tình đánh dấu nhầm nội dung thật thêm sau này.
-- ============================================================

-- 6 How-To demo (giữ nguyên How-To thật "Bánh xèo" d1313dd7-... KHÔNG đổi).
update how_to set is_seed_content = true
where id in (
  '47bcb38c-ee9a-4a08-904d-2f2a9bde0d78', -- Cơm chiên hạt rời
  '585d4acf-55f2-4fa0-a992-4b9d33bb0575', -- Luộc trứng lòng đào
  'e03fbdf9-88c9-47d5-94d2-754eae3ff886', -- Hành phi giòn
  'c5d83110-2187-4761-ad64-094c905f9faf', -- Cà phê phin
  '9cbb08f0-7870-4c7e-9ce8-2d2204ee15b2', -- Gà chiên giòn
  'b8e21e81-560d-4881-9f82-76e278b07679'  -- Rau muống luộc
);

-- 15 Attempt Report demo. KHÔNG đánh dấu:
--   - 421dd8c8-... : Attempt Report thật của founder (content-seed-log.md).
--   - fb4bf316-... : Attempt Report còn MƠ HỒ trên How-To "Rau muống luộc"
--     (How-To vốn được seed cố ý để 0 lượt thử) — theo quyết định founder
--     2026-08-31, KHÔNG tự suy đoán, giữ như hoạt động thật cho tới khi
--     founder xác nhận khác. Xem docs/product/data-integrity-note-2026-08-31.md.
update attempt_report set is_seed_content = true
where id in (
  'ad0daa78-fae1-4036-92f3-3698075179ba',
  '6a0a3c79-581a-43c9-a9cd-f1b24ab84c32',
  'c4ce8546-eff7-42e4-8684-55b56aa5c117',
  '8c1611c1-ba53-477b-9584-19760b404ba5',
  '81f36293-5b7a-4ab2-961e-b72b401edc0c',
  '363feedb-72a7-4a8c-ad65-43c77f34b8d8',
  'c40a05bf-ad20-4cf4-a256-92679be4ff6b',
  'f3d9b42b-c0f8-4bde-9e89-13f1f3f897c0',
  'ae58a2e3-f560-48fb-9822-ac5ce05f9de5',
  '35ceefdc-cfa2-4ca5-85fc-e22005936d12',
  '8f606f3b-ab80-4232-96e6-78b8b2f20981',
  '9b7e0a84-efaf-4ab4-a25e-6c783b1b7982',
  '7bf8f2e9-1470-4514-889a-70ecd389d358',
  'bed95d2f-682a-4bc3-a135-17afa181463c',
  '7016db09-c944-481d-af9e-31f6ae727697'
);
