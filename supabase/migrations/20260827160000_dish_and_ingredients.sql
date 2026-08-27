-- Product Evolution V1 — mở rộng có chủ đích, additive-only.
-- Xem docs/product/product-evolution-v1.md để biết quyết định thay thế
-- các khóa MVP trước đó (search, thuật ngữ UI, mô hình 4 thực thể).
-- Không xóa/sửa bảng hiện có, không mất dữ liệu.

-- ============================================================
-- dish
-- "Món" người dùng muốn làm/tìm — một Dish có thể có nhiều How-To
-- (nhiều cách làm khác nhau cho cùng một món).
-- ============================================================
create table dish (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  created_at timestamptz not null default now()
);

alter table how_to add column dish_id uuid references dish (id);

create index how_to_dish_id_idx on how_to (dish_id);

-- ============================================================
-- how_to_ingredient
-- Nguyên liệu có cấu trúc, theo TỪNG How-To (không phải catalog nguyên liệu
-- toàn cục/canonical — cố ý hoãn lại, xem product-evolution-v1.md §4).
-- quantity/unit là text tự do (vd: "1 ít", "vừa đủ") thay vì numeric có đơn
-- vị chuẩn hóa — tránh over-engineer trước khi có nhu cầu thật.
-- ============================================================
create table how_to_ingredient (
  id uuid primary key default gen_random_uuid(),
  how_to_id uuid not null references how_to (id) on delete cascade,
  position integer not null check (position > 0),
  group_name text,
  name text not null check (length(trim(name)) > 0),
  quantity text,
  unit text,
  preparation text,
  is_required boolean not null default true,
  unique (how_to_id, position)
);

create index how_to_ingredient_how_to_id_idx on how_to_ingredient (how_to_id);

-- ============================================================
-- Row Level Security — cùng thế deny-by-default với các bảng hiện có.
-- Server Action dùng service_role sẽ bypass RLS theo thiết kế của Supabase.
-- ============================================================
alter table dish enable row level security;
alter table how_to_ingredient enable row level security;
