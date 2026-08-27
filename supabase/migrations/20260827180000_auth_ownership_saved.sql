-- Product Evolution V1 — Authentication + ownership + Saved items.
-- Xem docs/product/product-evolution-v1.md §6 cho quyết định thay thế
-- "Không tài khoản/đăng nhập" đã khóa trước đó. Additive-only, không xóa/sửa
-- dữ liệu hiện có — 7 how_to/17 attempt_report hiện tại (kể cả của founder)
-- giữ nguyên user_id = NULL ("không chủ sở hữu"), KHÔNG gán ngược cho bất kỳ
-- tài khoản nào.

alter table how_to add column user_id uuid references auth.users (id) on delete set null;
alter table attempt_report add column user_id uuid references auth.users (id) on delete set null;

create index how_to_user_id_idx on how_to (user_id);
create index attempt_report_user_id_idx on attempt_report (user_id);

-- ============================================================
-- saved_how_to
-- Người dùng lưu một How-To để xem lại sau. Không phải "like"/phản ứng công
-- khai — chỉ hiển thị cho chính người lưu.
-- ============================================================
create table saved_how_to (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  how_to_id uuid not null references how_to (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, how_to_id)
);

create index saved_how_to_user_id_idx on saved_how_to (user_id);

-- Cùng thế deny-by-default với các bảng hiện có — Server Action dùng
-- service_role sẽ bypass RLS; ủy quyền thật (kiểm tra user_id = người đang
-- đăng nhập) nằm ở tầng Server Action, không phải RLS (đã chấp nhận từ đầu).
alter table saved_how_to enable row level security;
