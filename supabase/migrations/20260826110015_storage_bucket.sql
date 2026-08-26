-- Slice 1 — Data Foundation
-- Bucket Supabase Storage cho ảnh Attempt Report.
-- Chỉ ảnh tối đa 3 tấm/report (ràng buộc sản phẩm, mvp-definition.md §4) — không video.
--
-- Tên bucket, allowed_mime_types, file_size_limit là lựa chọn implementation-level
-- (không được ghim bởi tài liệu đã chấp nhận nào) — xem
-- docs/architecture/slice-1-implementation-notes.md để biết lý do chọn.
--
-- Private (public = false), không tạo storage policy nào cho anon/authenticated
-- => cùng thế deny-by-default với RLS trên các bảng ứng dụng. Server Action dùng
-- service_role sẽ bypass, giống hệt cách RLS được xử lý ở migration trước.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'attempt-report-images',
  'attempt-report-images',
  false,
  5242880, -- 5 MB / ảnh
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;
