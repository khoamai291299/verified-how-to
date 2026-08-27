# Content Seed Log — 2026-08-27

**Trạng thái:** Ghi chú minh bạch, không phải quyết định sản phẩm. Mục đích duy nhất: giúp
người bảo trì sau này phân biệt nội dung seed/demo với hoạt động thật của người dùng.

## Vì sao có ghi chú này

Trước ngày này, production chỉ có đúng 1 How-To thật của founder (`Bánh xèo`), với nội dung
bước làm còn là placeholder kỹ thuật (`"1"`, `"2"`, `"3"`, `"4"`) từ giai đoạn kiểm thử chấp
nhận. Để sản phẩm thể hiện được ý tưởng cốt lõi (How-To + Attempt + Evidence → hiểu biết tích
lũy), một phiên làm việc đã thêm nội dung seed ban đầu.

## Founder's Bánh xèo (`d1313dd7-5e03-4edb-a95f-9c713707aeb1`)

- **Giữ nguyên:** `id`, `created_at`, và Attempt Report gốc (`421dd8c8-...`, kết quả "Thành
  công", nộp lúc 2026-08-27T06:02:30Z) — đây là dữ liệu thật của founder, không bị đụng tới.
- **Đã thay:** `description`, `expected_outcome`, và toàn bộ `how_to_step` — nội dung cũ rõ
  ràng là placeholder kỹ thuật (không phải nội dung founder chủ đích viết), được thay bằng
  công thức Bánh xèo đầy đủ, thực tế.
- 2 Attempt Report mới được thêm vào (1 "một phần", 1 "thành công") để minh hoạ vòng lặp
  bằng chứng — xem mục dưới.

## Nội dung seed mới (6 How-To)

Luộc trứng lòng đào chuẩn từng phút · Pha cà phê phin đậm đà · Làm hành phi giòn ·
Cơm chiên hạt rời · Gà chiên giòn ngoài chín đều bên trong · Luộc rau muống xanh giòn
(How-To này cố ý để 0 lượt thử, minh hoạ trạng thái "Chưa có lượt thử").

Toàn bộ nội dung (tiêu đề, mô tả, các bước, ghi chú Attempt) do phiên làm việc AI viết dựa
trên kiến thức nấu ăn phổ thông, **không sao chép** từ nguồn cụ thể nào. Kết quả Attempt
(Thành công / Một phần / Thất bại) được viết để minh hoạ tính nhạy cảm kỹ thuật thật của
từng phương pháp (ví dụ: vớt hành phi trễ → cháy đắng; dùng cơm nóng thay vì cơm nguội →
dính chảo) — đây là **nội dung demo hợp lý**, không phải tường thuật của một người dùng
thật đã thử.

## Bằng chứng hình ảnh (10 ảnh)

Tất cả ảnh đính kèm Attempt là **ảnh tổng hợp bằng script** (hình tròn màu mô phỏng một món
ăn trên đĩa), tạo bằng `python3` thuần túy, không dùng ảnh chụp thật. Ảnh được tải lên qua
đúng Supabase Storage bucket (`attempt-report-images`) mà ứng dụng thật dùng, để việc hiển
thị/xóa hoạt động đúng như dữ liệu thật — nhưng **không phải ảnh chụp món ăn thật**.

## Không có mô hình "tác giả"

Schema hiện tại (`database-schema-proposal-v1.md`) không có cột `user_id`/tác giả cho
`how_to` hay `attempt_report` — đúng theo quyết định MVP single-user. Ghi chú này vì vậy là
cơ chế minh bạch duy nhất hiện có; không có nhãn "seed"/"demo" nào được thêm vào UI hay
schema, vì làm vậy sẽ vượt phạm vi nội dung của phiên làm việc này.
