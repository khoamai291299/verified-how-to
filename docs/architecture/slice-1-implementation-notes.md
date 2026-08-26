# Slice 1 Implementation Notes — Data Foundation

**Trạng thái:** Ghi chú implementation-level, **không phải** tài liệu quyết định sản phẩm/kiến trúc. Không thay thế hay chỉnh sửa `docs/architecture/database-schema-proposal-v1.md`.
**Ngày:** 2026-08-26
**Mục đích:** Ghi lại các lựa chọn cụ thể mà `database-schema-proposal-v1.md` §14 và `implementation-plan-v1.md` §8 đã phân loại là **implementation-level (loại A)** — implementation có quyền tự chọn, không cần founder duyệt, miễn không đổi phạm vi sản phẩm/kiến trúc đã chấp nhận.

## Lựa chọn đã thực hiện

| Chi tiết | Giá trị đã chọn | Vì sao |
|---|---|---|
| Kiểu khóa chính | `uuid` với `default gen_random_uuid()` | Đúng cơ chế đã nêu trong `database-schema-proposal-v1.md` §4; dùng extension `pgcrypto` (đã bật ở migration) — đây là cơ chế chuẩn của Postgres/Supabase hiện đại cho `gen_random_uuid()`. |
| Cách biểu diễn `result` | `text` + `CHECK (result IN ('success','partial','failed'))` | Đúng đề xuất chính trong `database-schema-proposal-v1.md` §4.3/§11 (không dùng Postgres ENUM, không dùng lookup table) — lý do: đơn giản hơn để sửa/đổi giá trị sau này, không cần ALTER TYPE. |
| Tên bucket Supabase Storage | `attempt-report-images` | Không tài liệu nào ghim tên cụ thể — chọn tên mô tả rõ mục đích, đúng quy ước snake/kebab-case của Supabase. |
| `allowed_mime_types` của bucket | `image/jpeg`, `image/png`, `image/webp` | Khớp chính xác với `CHECK` constraint trên `attempt_report_image.mime_type` ở migration — hai lớp kiểm tra (Storage + DB) nhất quán với nhau. |
| `file_size_limit` của bucket | 5 MB (5242880 bytes) / ảnh | Không tài liệu nào ghim con số cụ thể (`database-schema-proposal-v1.md` §14 xác nhận đây là điểm mở). 5MB là giới hạn hợp lý cho ảnh chụp từ điện thoại mà không tạo ma sát bất hợp lý cho luồng gửi Attempt Report — có thể điều chỉnh ở slice sau nếu thực tế cho thấy cần khác. |
| Bucket public hay private | **Private** (`public = false`) | Nhất quán với thế deny-by-default của RLS trên 4 bảng ứng dụng — không có policy nào cho `anon`/`authenticated`; chỉ Server Action dùng `service_role` (bypass) mới thao tác được. Việc hiển thị ảnh cho người xem (qua signed URL hoặc endpoint riêng) là công việc của slice sau. |
| Supabase client library | `@supabase/supabase-js` (client cơ bản), không dùng `@supabase/ssr` | MVP không có auth/session người dùng — giá trị chính của `@supabase/ssr` (đồng bộ session qua cookie) không áp dụng. Dùng package cơ bản, nhỏ gọn hơn, đúng nguyên tắc "boring". |
| Vị trí migration | `supabase/migrations/20260826105831_initial_schema.sql` + `supabase/migrations/20260826110015_storage_bucket.sql` | Tách hai file: file đầu (4 bảng + constraint + RLS) kiểm chứng được bằng Postgres thường; file sau (bucket Storage) chỉ áp dụng được trên project Supabase thật (bảng `storage.buckets` là hạ tầng riêng của Supabase, không tồn tại trên Postgres thường) — tách để ranh giới kiểm chứng rõ ràng, trung thực. |

## Không thực hiện ở Slice 1 (có chủ đích)

- Không áp dụng migration lên một Supabase project thật — chưa có credential nào khả dụng trong môi trường này. Xem báo cáo cuối Slice 1 để biết chính xác những gì đã/chưa được kiểm chứng.
- Không tạo storage policy nào cho `anon`/`authenticated` (đúng thế deny-by-default).
- Không sinh TypeScript type tự động từ schema thật (`supabase gen types typescript`) — cần kết nối project thật. Chỉ có một type tối thiểu viết tay (`AttemptReportResult`) ở `lib/supabase/types.ts`.
- Không xây upload UI, không CRUD, không luồng xóa — thuộc các slice sau.

Tài liệu này không thay đổi bất kỳ quyết định sản phẩm hay kiến trúc nào đã chấp nhận — nó chỉ ghi lại các lựa chọn implementation-level đã được phân loại là thuộc quyền tự quyết của implementation.
