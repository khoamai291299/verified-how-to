-- Slice 1 — Data Foundation
-- Đúng 4 thực thể đã chấp nhận (docs/architecture/database-schema-proposal-v1.md).
-- Không bảng users, không cột user_id, không cột trust/verification/confidence/rating (Evidence ≠ Truth).

create extension if not exists "pgcrypto";

-- ============================================================
-- how_to
-- description nullable — quyết định đã chấp nhận 2026-08-26.
-- ============================================================
create table how_to (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  description text,
  expected_outcome text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- how_to_step
-- Thứ tự bước xác định bằng position + UNIQUE(how_to_id, position).
-- "How-To phải có ≥1 step" là ràng buộc tầng ứng dụng — không thể enforce
-- bằng constraint đơn giản ở đây (database-schema-proposal-v1.md §6).
-- ============================================================
create table how_to_step (
  id uuid primary key default gen_random_uuid(),
  how_to_id uuid not null references how_to (id) on delete cascade,
  position integer not null check (position > 0),
  instruction text not null check (length(trim(instruction)) > 0),
  unique (how_to_id, position)
);

-- ============================================================
-- attempt_report
-- result là sự kiện tự báo cáo (self-reported), không phải phán quyết hệ thống.
-- Lưu mã tiếng Anh; ứng dụng ánh xạ sang nhãn tiếng Việt ở slice sau.
-- ============================================================
create table attempt_report (
  id uuid primary key default gen_random_uuid(),
  how_to_id uuid not null references how_to (id) on delete cascade,
  result text not null check (result in ('success', 'partial', 'failed')),
  note text,
  submitted_at timestamptz not null default now()
);

-- Index thật sự cần: lấy Evidence của một How-To, sắp theo thời gian
-- (database-schema-proposal-v1.md §7 — index duy nhất được xác định là cần thiết).
create index attempt_report_how_to_id_submitted_at_idx
  on attempt_report (how_to_id, submitted_at);

-- ============================================================
-- attempt_report_image
-- position giới hạn 1..3 + UNIQUE(attempt_report_id, position)
-- => tối đa 3 ảnh/report được enforce ở DB (đã xác minh ngữ nghĩa ở database-schema-proposal-v1.md §4.4).
-- storage_path chỉ là tham chiếu — file thật nằm ở Supabase Storage.
-- ============================================================
create table attempt_report_image (
  id uuid primary key default gen_random_uuid(),
  attempt_report_id uuid not null references attempt_report (id) on delete cascade,
  storage_path text not null check (length(trim(storage_path)) > 0),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  size_bytes integer not null check (size_bytes > 0),
  position integer not null check (position between 1 and 3),
  unique (attempt_report_id, position)
);

-- ============================================================
-- Row Level Security — defense-in-depth, không phải authorization (đã chấp nhận 2026-08-26).
-- Bật RLS, KHÔNG tạo policy nào => deny-by-default cho anon/authenticated.
-- Server Action dùng service_role sẽ bypass RLS theo thiết kế của Supabase.
-- ============================================================
alter table how_to enable row level security;
alter table how_to_step enable row level security;
alter table attempt_report enable row level security;
alter table attempt_report_image enable row level security;
