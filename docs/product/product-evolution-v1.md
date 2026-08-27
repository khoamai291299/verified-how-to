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

### 2.4. Tài khoản/Đăng nhập (thay thế mục 3 gốc "Không tài khoản/đăng nhập trong phạm vi V1 này")

**[QUYẾT ĐỊNH MỚI, 2026-08-28]** Founder xác nhận thêm xác thực thật: Supabase
Auth (email/mật khẩu). Không có bảng "profile" riêng — tên hiển thị lưu trong
`user_metadata` của `auth.users`, tránh một bảng chỉ để giữ một cột.

- `how_to` và `attempt_report` có thêm cột `user_id` (nullable, tham chiếu
  `auth.users`, `on delete set null`). 7 How-To và 17 Lần thử **hiện có tại
  thời điểm migration giữ nguyên `user_id = NULL`** ("không chủ sở hữu") —
  **không** gán ngược cho bất kỳ tài khoản nào, kể cả tài khoản của founder.
  Đây là lựa chọn tường minh, không phải thiếu sót: nội dung MVP là công sức
  chung ở giai đoạn chưa có khái niệm tài khoản.
- Bảng mới `saved_how_to` (người dùng lưu một How-To để xem lại — riêng tư,
  không phải phản ứng công khai).
- **Ủy quyền xóa dựa trên quyền sở hữu**: chỉ chủ sở hữu thật (`user_id` khớp
  người đang đăng nhập) mới xóa được How-To/Lần thử của chính mình qua UI.
  Nội dung không chủ (`user_id IS NULL`, gồm toàn bộ dữ liệu founder có trước
  migration này) **không thể xóa qua luồng người dùng đã đăng nhập** — nút xóa
  bị ẩn hoàn toàn với mọi người xem, kể cả chính founder nếu đăng nhập bằng
  tài khoản mới. Đây vừa là hệ quả tự nhiên của mô hình sở hữu, vừa là một lớp
  bảo vệ cấu trúc cho dữ liệu MVP thật.
- Tạo How-To và gửi Lần thử ("Chia sẻ kết quả") nay **yêu cầu đăng nhập** —
  nhất quán với việc đây là hành động gắn với danh tính thật, không còn ẩn
  danh. Xem trang How-To vẫn hoàn toàn công khai, không yêu cầu đăng nhập.
- Xác thực luôn được server tự kiểm tra lại qua `getCurrentUser()` trong mỗi
  Server Action — không bao giờ tin `user_id` do client gửi lên. Giữ nguyên
  kiến trúc "RLS là defense-in-depth, ủy quyền thật ở tầng application code"
  đã chấp nhận từ MVP: client Supabase phiên đăng nhập (anon key, qua
  `@supabase/ssr`) chỉ dùng để biết "ai đang đăng nhập"; toàn bộ truy vấn dữ
  liệu vẫn qua client `service_role` hiện có.

**Phạm vi round này cố ý dừng ở đây** — Sửa/Edit How-To, Category, và
Collection (được nêu trong yêu cầu mở rộng sản phẩm rộng hơn) chưa triển khai,
để dành cho round kế tiếp.

### 2.5. Master Prompt #4 — Categories, Edit, ảnh minh họa, Home biên tập (2026-08-28)

**[QUYẾT ĐỊNH MỚI]** Thay thế các mục "cố ý hoãn lại" tương ứng ở mục 4 gốc
(giữ nguyên bên dưới làm hồ sơ, đã gạch chú thích trạng thái mới):

- **Category** — hai chiều thật (`phuong_phap`: Chiên/Luộc/Pha chế;
  `loai_mon`: Món chính/Món phụ/Ăn vặt & Gia vị/Đồ uống), một bảng
  `category` + bảng nối `how_to_category`, KHÔNG có bảng "dimension" riêng
  (một cột text đủ ở quy mô 2 chiều × ~4 giá trị/chiều). 7 How-To hiện có
  được gán category thật dựa trên nội dung thật (vd: Bánh xèo → Chiên +
  Món chính), không suy diễn/tạo dữ liệu giả. Lọc theo category là một tham
  số bổ sung cho cùng route Discover/Search (`/?category=slug`), không phải
  một trang riêng.
- **Sửa How-To** — chủ sở hữu thật (`user_id` khớp) có thể sửa toàn bộ nội
  dung: món, tiêu đề, mô tả, nguyên liệu, bước, kết quả mong đợi, category,
  ảnh minh họa. Cùng luật ủy quyền với xóa: nội dung không chủ (dữ liệu
  founder trước khi có tài khoản) không sửa được qua UI, kể cả bởi chính
  founder nếu đăng nhập tài khoản mới. Form Sửa dùng chung component với
  form Tạo (`app/how-to/how-to-form.tsx`) — không viết lại hai lần.
- **Ảnh minh họa tác giả** (`how_to.hero_image_path`, bucket riêng
  `how-to-hero-images`) — CỐ Ý tách biệt hoàn toàn khỏi
  `attempt_report_image` cả ở storage lẫn UI (chú thích tường minh "không
  phải ảnh kết quả thật" khi hiển thị). Đây là ranh giới trực tiếp bảo vệ
  nguyên tắc Evidence ≠ Truth: nếu ảnh tác giả và ảnh kết quả thật dùng
  chung một khái niệm hiển thị, danh sách Khám phá sẽ trông "đã được chứng
  minh" trước khi có ai thật sự thử. Vì lý do này, ảnh minh họa **chỉ hiện
  trên trang chi tiết How-To ở vòng này** — KHÔNG dùng làm ảnh mẫu vật
  (specimen) trên Khám phá/Dish, nơi ảnh mẫu vật tiếp tục chỉ đến từ ảnh
  bằng chứng thật. Đây là quyết định thiết kế có cân nhắc, không phải thiếu
  sót — mở rộng ảnh minh họa lên danh sách cần một lượt thiết kế riêng để
  không làm mờ tín hiệu "chưa ai thử".
- **Home biên tập** — kệ "Được thử nhiều nhất" xếp theo số lần thử THẬT
  (không phải độ phổ biến bịa đặt), chỉ hiện khi ở trạng thái Trang chủ gốc
  (không tìm kiếm, không lọc category) và có ít nhất một How-To đã có người
  thử. Danh sách đầy đủ bên dưới loại bỏ các mục đã ở kệ để tránh trùng lặp
  thị giác trên một kho nội dung nhỏ.
- **Discover = Search** — không tạo route `/search` riêng. Một route
  (`/`) xử lý cả duyệt và tìm kiếm bằng query param `q` (đã có từ Search
  V1) cộng `category` (mới) — tránh phân mảnh trải nghiệm khám phá thành
  nhiều trang gần giống nhau.

## 3. Điều KHÔNG thay đổi

- **Evidence ≠ Truth** vẫn là nguyên tắc thiết kế cao nhất (`design-direction.md`
  §1.1). Việc đổi nhãn hiển thị ở mục 2.2 là thay đổi giọng điệu, không phải
  từ bỏ nguyên tắc — sản phẩm vẫn không tuyên bố "đã xác minh" ở bất kỳ đâu.
- Không Trust Score, không rating tổng hợp thay thế dữ liệu Attempt thật. Tài
  khoản (mục 2.4) chỉ xác định *ai đã viết gì* — không biến thành điểm uy tín.
- Không fabricate dữ liệu — mọi nội dung Dish/Ingredient được thêm cho 7
  How-To hiện có là nội dung thật do phiên làm việc này biên soạn dựa trên nội
  dung gốc, không phải dữ liệu giả lập trình bày như dữ liệu người dùng thật.

## 4. Phạm vi V1 — cố ý hoãn lại

Theo đúng nguyên tắc "kiến trúc nhỏ nhất đủ mạnh để phát triển tiếp, không ép
phải viết lại lần nữa" của Product Evolution V1, các phần sau **cố ý chưa
triển khai** ở V1 này (không phải bị quên):

- ~~Category/taxonomy~~ — **đã triển khai ở mục 2.5** (Master Prompt #4).
- **Ingredient catalog toàn cục/canonical** (chuẩn hóa "trứng gà" ở nhiều
  How-To thành một Ingredient dùng chung) — `how_to_ingredient` hiện tại là
  dữ liệu cấu trúc nhưng phạm vi theo từng How-To, không phải một graph
  nguyên liệu toàn cục. Việc này đủ để Search V1 tìm theo tên nguyên liệu.
  Vẫn hoãn.
- ~~Media của tác giả (hero image)~~ — **đã triển khai ở mục 2.5**, phạm vi
  trang chi tiết. Step image/video vẫn hoãn.
- **Discover biên tập nâng cao** (collection theo mùa, "mới được thử",...)
  — kệ "Được thử nhiều nhất" đã có (mục 2.5); các kệ biên tập khác cần
  nhiều nội dung thật hơn để có ý nghĩa.
- ~~Sửa How-To sau khi đăng~~ — **đã triển khai ở mục 2.5**.
- **Collection do người dùng tự tạo** (khác với `saved_how_to`, vốn chỉ là một
  danh sách lưu phẳng của cá nhân, không có tên/mô tả/chia sẻ công khai).
  Vẫn hoãn.

## 5. Ghi chú migration

Xem `supabase/migrations/` cho SQL cụ thể. Migration chỉ thêm bảng/cột mới
(additive), không xóa hay sửa dữ liệu hiện có — không có rủi ro mất dữ liệu.
