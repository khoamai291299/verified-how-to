-- Master Prompt #4 §19 — ảnh minh họa do TÁC GIẢ cung cấp cho một How-To, tách
-- biệt rõ khỏi attempt_report_image (ảnh KẾT QUẢ THẬT do người thử gửi lên).
-- Cố ý không dùng chung bucket/khái niệm để không làm mờ ranh giới
-- Evidence ≠ Truth: một cái là minh họa tác giả kỳ vọng, một cái là bằng
-- chứng thật đã xảy ra. Nullable — không có ảnh vẫn là trạng thái hợp lệ.
alter table how_to add column hero_image_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'how-to-hero-images',
  'how-to-hero-images',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;
