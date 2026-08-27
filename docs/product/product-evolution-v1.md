# Product Evolution V1 — Superseding Decisions

**Trạng thái:** [QUYẾT ĐỊNH] — chấp nhận bởi founder, 2026-08-27.
**Vai trò:** Tài liệu này KHÔNG sửa lại `discovery.md` hay `mvp-definition.md`.
Nó ghi nhận tường minh những điểm mà giai đoạn tiếp theo của sản phẩm (Product
Evolution V1) thay thế các quyết định đã khóa trước đó — theo đúng nguyên tắc
"identify the conflict explicitly rather than silently changing history".
Hai tài liệu gốc vẫn giữ nguyên làm hồ sơ lịch sử của giai đoạn MVP 7 ngày.

## 1. Bối cảnh

MVP 7 ngày (`mvp-definition.md`) đã hoàn thành mục tiêu hẹp của nó: kiểm chứng
loop tạo → khám phá → thử → gửi báo cáo là khả thi về mặt thao tác. Founder đã
xác nhận muốn tiến sang giai đoạn kế tiếp — mở rộng sản phẩm theo hướng một nền
tảng tri thức thực hành thật sự, thay vì tiếp tục giới hạn trong phạm vi MVP.

## 2. Các điểm khóa bị thay thế tường minh

### 2.1. Tìm kiếm (thay thế `mvp-definition.md` §11)

`mvp-definition.md` §11 khóa: "Không tìm kiếm/lọc/tag" là non-goal.

**[QUYẾT ĐỊNH MỚI]** Tìm kiếm nay là một năng lực cốt lõi của sản phẩm (Search
V1), theo đúng vai trò được mô tả trong product-vision của Product Evolution
V1: tìm theo tiêu đề, mô tả, và nguyên liệu.

### 2.2. Thuật ngữ hiển thị cho người dùng (thay thế Phụ lục của `mvp-definition.md` và §8 của `discovery.md`)

Bảng thuật ngữ gốc khóa cứng "Bằng chứng" (Evidence) là từ hiển thị bắt buộc
xuyên suốt UI.

**[QUYẾT ĐỊNH MỚI]** "Evidence"/"Bằng chứng" tiếp tục là khái niệm nội bộ đúng
đắn (phân biệt Evidence ≠ Truth vẫn là nguyên tắc thiết kế nền tảng — xem mục
3 bên dưới, KHÔNG bị thay đổi). Nhưng ngôn ngữ hiển thị cho người dùng chuyển
sang giọng thân thiện hơn, giảm cảm giác "đang bị yêu cầu chứng minh":

| Khái niệm | Nhãn UI cũ | Nhãn UI mới |
|---|---|---|
| Attempt Report (tổng quan) | Bằng chứng | Phản hồi thực tế |
| Một Attempt Report | Báo cáo (đã thử) | Lần thử |
| CTA gửi | Gửi kết quả | Chia sẻ kết quả |
| Trạng thái rỗng | Chưa có bằng chứng thực tế | Chưa có ai chia sẻ kết quả |
| Xóa một Attempt Report | Xóa báo cáo | Xóa lần thử |

Tên bảng CSDL, tên biến code, tên class CSS (`attempt_report`, `evidence-*`)
**không đổi** — đây là chi tiết kỹ thuật nội bộ, không phải ngôn ngữ sản phẩm.

### 2.3. Mô hình dữ liệu — 4 thực thể (thay thế `database-schema-proposal-v1.md` §"Đúng 4 thực thể")

**[QUYẾT ĐỊNH MỚI]** Thêm 2 thực thể mới:

- **`dish`** — "món" mà người dùng muốn làm/tìm (vd: "Bánh xèo"). Một Dish có
  thể có nhiều How-To (nhiều cách làm khác nhau cho cùng một món).
- **`how_to_ingredient`** — nguyên liệu có cấu trúc, thuộc về một How-To cụ
  thể (không phải một catalog nguyên liệu toàn cục — xem mục 4 để biết lý do
  phạm vi này được chọn cho V1).

`how_to` có thêm cột `dish_id` (nullable, tham chiếu `dish`).

Toàn bộ 4 thực thể gốc (`how_to`, `how_to_step`, `attempt_report`,
`attempt_report_image`) giữ nguyên, không đổi cấu trúc.

## 3. Điều KHÔNG thay đổi

- **Evidence ≠ Truth** vẫn là nguyên tắc thiết kế cao nhất (`design-direction.md`
  §1.1). Việc đổi nhãn hiển thị ở mục 2.2 là thay đổi giọng điệu, không phải
  từ bỏ nguyên tắc — sản phẩm vẫn không tuyên bố "đã xác minh" ở bất kỳ đâu.
- Không Trust Score, không rating tổng hợp thay thế dữ liệu Attempt thật.
- Không tài khoản/đăng nhập trong phạm vi V1 này.
- Không fabricate dữ liệu — mọi nội dung Dish/Ingredient được thêm cho 7
  How-To hiện có là nội dung thật do phiên làm việc này biên soạn dựa trên nội
  dung gốc, không phải dữ liệu giả lập trình bày như dữ liệu người dùng thật.

## 4. Phạm vi V1 — cố ý hoãn lại

Theo đúng nguyên tắc "kiến trúc nhỏ nhất đủ mạnh để phát triển tiếp, không ép
phải viết lại lần nữa" của Product Evolution V1, các phần sau **cố ý chưa
triển khai** ở V1 này (không phải bị quên):

- **Category/taxonomy đa chiều** (bữa ăn, dịp, phong cách, loại món, ẩm thực)
  — chưa cần thiết cho Search V1 hoạt động; thêm sau khi có đủ nội dung thật
  để taxonomy có ý nghĩa.
- **Ingredient catalog toàn cục/canonical** (chuẩn hóa "trứng gà" ở nhiều
  How-To thành một Ingredient dùng chung) — `how_to_ingredient` hiện tại là
  dữ liệu cấu trúc nhưng phạm vi theo từng How-To, không phải một graph
  nguyên liệu toàn cục. Việc này đủ để Search V1 tìm theo tên nguyên liệu.
- **Media của tác giả** (hero image, step image/video) — mô hình Evidence
  media (ảnh người dùng gửi kèm Attempt) không đổi; ảnh minh họa do tác giả
  How-To cung cấp chưa được triển khai ở V1 này.
- **Discover biên tập** (mục "được thử nhiều nhất", collection theo mùa...)
  — Discover V1 vẫn là danh sách, có thêm ô tìm kiếm.

## 5. Ghi chú migration

Xem `supabase/migrations/` cho SQL cụ thể. Migration chỉ thêm bảng/cột mới
(additive), không xóa hay sửa dữ liệu hiện có — không có rủi ro mất dữ liệu.
