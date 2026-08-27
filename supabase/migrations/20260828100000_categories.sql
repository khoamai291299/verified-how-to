-- Master Prompt #4 — taxonomy tối thiểu đủ dùng cho khám phá theo chiều.
-- Hai chiều thật, không phải danh sách tag tùy tiện: "phuong_phap" (cách chế
-- biến) và "loai_mon" (vai trò trong bữa ăn). Cố ý KHÔNG dựng bảng "dimension"
-- riêng — một cột text đủ cho quy mô này, đúng nguyên tắc kiến trúc nhỏ nhất.
create table category (
  id uuid primary key default gen_random_uuid(),
  dimension text not null check (dimension in ('phuong_phap', 'loai_mon')),
  name text not null,
  slug text not null unique,
  position int not null default 0
);

create table how_to_category (
  how_to_id uuid not null references how_to (id) on delete cascade,
  category_id uuid not null references category (id) on delete cascade,
  primary key (how_to_id, category_id)
);

create index how_to_category_category_id_idx on how_to_category (category_id);

alter table category enable row level security;
alter table how_to_category enable row level security;
