# V6 — Báo cáo khoảng cách trạng thái hiện tại (Current-State Gap Report)

**Trạng thái:** [PHÂN TÍCH] — audit thật qua Playwright (33 ảnh chụp, 1440/1024/390px, 11
màn hình) sau khi Phase A+B của rebuild đã xong (`rebuild-v6-design-direction.md`,
commit `bea2bef`). Không tin vào nhãn "đã đạt" của các vòng trước — đánh giá lại từ đầu
theo đúng yêu cầu founder.
**Ngày:** 2026-08-31.
**Kết luận một câu:** Phase B đã sửa đúng vấn đề nó nhắm tới (elevation, placeholder
art, seed-labeling) — nhưng đó là vấn đề *chất lượng bề mặt*, không phải vấn đề *thành
phần sản phẩm*. Bố cục, điều hướng, và mô hình tương tác **chưa hề thay đổi** so với
trước Phase A. Đặt cạnh nhau, người dùng thường sẽ khó nhận ra V5 và trạng thái hiện tại
là hai bản thiết kế khác nhau — chúng chỉ khác nhau ở độ hoàn thiện của cùng một bố cục.

---

## A. Kiến trúc hiện tại

**Routes** (`app/`, Next.js App Router, mọi route `force-dynamic`):
`/` (Khám phá + tìm kiếm + kết quả, cùng 1 route xử lý cả 3 trạng thái qua query params
`q`/`category`), `/how-to/[id]`, `/how-to/[id]/edit`, `/how-to/new`, `/dish/[id]`,
`/saved`, `/profile`, `/sign-in`, `/sign-up`, `/sign-out`, `/forgot-password`,
`/reset-password`, `/auth/confirm`.

**Component/logic layout:** không có thư mục `components/` riêng — mỗi route tự chứa
component của nó (co-located). `lib/supabase/` chứa 6 module (client browser/server,
session, categories, dish, hero-image, types). `lib/ingredient-parser.ts` là parser
nguyên liệu ngôn ngữ tự nhiên tất định (không AI).

**Data model (Supabase Postgres):** `dish` 1—N `how_to` 1—N (`how_to_step`,
`how_to_ingredient`, `attempt_report`); `attempt_report` 1—N `attempt_report_image`;
`how_to` N—N `category` qua `how_to_category`; `saved_how_to` (user_id, how_to_id).
Cột trust-liên-quan: `how_to.is_seed_content`, `attempt_report.is_seed_content`,
`how_to.duration_minutes`/`servings` (cả hai NULL cho 7 How-To thật hiện có).

**Điều hướng hiện tại:** desktop = 1 thanh ngang cố định (`site-header`, wordmark +
brandmark trái, Đăng nhập/+Chia sẻ phải, không có mục điều hướng nào khác ngay cả khi
đã đăng nhập ngoài "Đã lưu"/"Hồ sơ"/"+Tạo cách làm" dạng text link). Mobile = bottom nav
4 mục cố định (`app/bottom-nav.tsx`): Khám phá / Đã lưu / Tạo / Hồ sơ (ẩn danh: Khám phá
/ Đăng nhập / Đăng ký). **Không có nav rail, không có drawer, không có khái niệm chủ đề
(topic) ở bất kỳ đâu trong điều hướng.**

**Kiến trúc tìm kiếm hiện tại** (`app/page.tsx:44-66`, hàm `searchHowToIds`): 3 truy vấn
Postgres `ilike` song song (title/description của `how_to`, `name` của `dish`, `name`
của `how_to_ingredient`), gộp kết quả, chấm điểm đơn giản theo loại khớp. **Không có
full-text search, không có chuẩn hóa dấu tiếng Việt, không có ngữ nghĩa/AI** — đây là
lựa chọn có chủ đích ghi trong comment (`"cố ý, không dùng full-text search/semantic"`),
nhưng hệ quả thực tế: tìm "banh xeo" (không dấu) trả về **0 kết quả** cho "Bánh xèo" (có
dấu) — xác nhận trực tiếp qua ảnh chụp `search-results-1440.png`. Đây là một khoảng
trống chức năng thật, không phải giả định.

**Luồng xác thực:** Supabase Auth chuẩn (đăng nhập/đăng ký/đăng xuất/quên-đặt lại mật
khẩu/xác nhận email/gửi lại xác nhận), dùng chung `AuthShell` 2 cột ở ≥900px (thêm ở
V5). Route bảo vệ bằng redirect `?redirectTo=`.

## B. Vấn đề thị giác/sản phẩm cụ thể (quan sát thật, không suy đoán)

1. **Trang chủ là một trang cuộn dài đơn khối, không phải một mặt bằng khám phá.** Ở
   390px, trang chủ cao **5253px** (`home-390.png`) — search → hero text → chip loại
   món/cách chế biến → hàng ảnh nguyên liệu → lưới "được thử nhiều nhất" → 2 thẻ "chuyện
   xảy ra khi thử" → danh sách đầy đủ "cách làm khác". Không có phân vùng theo chủ đề,
   không có lựa chọn ngữ cảnh nào định hình lại nội dung bên dưới.
2. **Không có khái niệm chủ đề (topic) ở bất kỳ đâu.** Không có "Bạn đang quan tâm điều
   gì?", không selector Ẩm thực/Thủ công/..., không trạng thái "Sắp có" cho các domain
   tương lai. Sản phẩm hiện đọc như một trang duy nhất cho một loại nội dung, đúng như
   lo ngại founder nêu ("sản phẩm trông như mãi mãi chỉ là web công thức nấu ăn").
3. **Tìm kiếm không có ngữ cảnh, không có placeholder động, không chuẩn hóa dấu.** Một ô
   input tĩnh "Tìm theo tên, nguyên liệu…" xuất hiện giống hệt nhau dù vào từ đâu. Bug
   thật: "banh xeo" không dấu → 0 kết quả (mục A).
4. **Không có vùng hero/khám phá bằng hình ảnh.** "Hero" hiện tại là text-only (tiêu đề +
   thesis + mô tả) — không có hình ảnh biên tập/khám phá nào, chỉ có ảnh Evidence thật
   (hoặc placeholder) xuất hiện muộn hơn trong các card.
5. **Evidence chưa được giải thích như một khái niệm sản phẩm ở trang chủ.** Có số liệu
   thật (17 lần thử · 10 ảnh) nhưng không có đoạn giải thích "How-To → Attempt Report →
   Evidence, Evidence không phải xác nhận hệ thống" — khái niệm chỉ lộ ra gián tiếp qua
   nhãn trên trang chi tiết.
6. **How-To detail: không có ảnh hero khi tác giả chưa upload** (`howto-detail-1440.png`
   — Bánh xèo không có `hero_image_path`, trang bắt đầu thẳng bằng breadcrumb/eyebrow,
   không có vùng ảnh nào kể cả placeholder). Vi phạm trực tiếp yêu cầu "1. Hero image"
   ở đầu hệ thống phân cấp How-To detail của mission.
7. **Card "Được thử nhiều nhất"/"Cách làm khác" đã có elevation (Phase B) nhưng bố cục
   card — ảnh vuông trái + text phải, hoặc ảnh tròn trên + text dưới — không đổi từ
   trước Phase A.** Đây chính là kiểu "chỉ khác token/shadow" mà mission mô tả là THẤT
   BẠI nếu là toàn bộ sự khác biệt.
8. **Trang Dish gần như trống với 1 How-To** (đã xác nhận ở audit V5 cũ, vẫn đúng ở
   `dish-detail-1440.png`) — không có gì lấp đầy ngoài 1 hàng.
9. **Không có nav rail/drawer nào — độ sâu điều hướng chỉ 1 cấp (4 mục cố định).** Với
   IA sắp mở rộng (đa chủ đề, bộ sưu tập, chia sẻ), 1 thanh ngang + bottom nav 4 mục sẽ
   không đủ chỗ chứa mà không thêm cấp điều hướng.
10. **Trang chủ, Dish, trang xác thực đều dùng đúng 1 mẫu bố cục** (search-box-on-top,
    single-column card stack) — không có sự phân hóa bố cục theo mục đích trang.

## C. Hiện tại → Mục tiêu V6

| Khu vực | Hiện tại | Mục tiêu V6 |
|---|---|---|
| Điều hướng desktop | 1 thanh ngang, 3 link | Nav rail trái, thu gọn được, hỗ trợ Khám phá/Tìm kiếm/Chủ đề/Đã lưu/Chia sẻ/Hồ sơ |
| Điều hướng mobile | Bottom nav 4 mục cố định | Giữ mô hình bottom nav/drawer nhưng phản ánh đúng IA mới (không chỉ 4 mục cứng) |
| Trang chủ | 1 trang cuộn dài, không phân vùng chủ đề | Section 1: chọn chủ đề → định hình lại nội dung bên dưới; chỉ Ẩm thực hoạt động thật |
| Tìm kiếm | 1 ô tĩnh, ilike không chuẩn hóa dấu | Tìm kiếm theo ngữ cảnh chủ đề, placeholder động, và (tối thiểu) chuẩn hóa dấu tiếng Việt để sửa bug "banh xeo" |
| Vùng khám phá bằng ảnh | Không có | Vùng hero/khám phá hình ảnh thật hoặc placeholder-art có chủ đích, không phải text-only |
| Evidence ở trang chủ | Số liệu rời rạc, không giải thích khái niệm | 1 đoạn giải thích rõ How-To/Attempt/Evidence + "Evidence ≠ xác nhận hệ thống" |
| How-To hero | Không có gì nếu tác giả chưa upload ảnh | Placeholder-art có chủ đích khi chưa có ảnh (tái dùng hệ `.specimen-empty` đã có) |
| Card danh sách | Bố cục ảnh-trái/text-phải hoặc ảnh-tròn không đổi từ V5 | Bố cục card mới nhất quán với ngôn ngữ khám phá mới |
| Dish page | Gần trống với 1 How-To | Cảm giác trang bộ sưu tập/so sánh, không phải bản ghi CSDL |

## D. Phép thử chuyển đổi thị giác (mục bắt buộc)

**Điều gì phải khác biệt rõ ràng giữa trạng thái hiện tại và V6:**

1. Trang chủ phải mở đầu bằng một quyết định (chọn chủ đề) thay vì đọc thẳng vào nội
   dung — thay đổi **mô hình tương tác**, không chỉ hình ảnh.
2. Phải xuất hiện một lớp điều hướng thứ hai (nav rail hoặc tương đương) không tồn tại
   hiện nay — thay đổi **cấu trúc trang**, không chỉ style của thanh hiện có.
3. Tìm kiếm phải phản hồi khác nhau tùy ngữ cảnh vào (từ nav rail vs. từ chip chủ đề) —
   thay đổi **hành vi**, không chỉ đặt lại placeholder tĩnh.
4. Phải có ít nhất một vùng hình ảnh/khám phá thật ở phía trên trang chủ trước khi chạm
   tới danh sách card đầu tiên — hiện tại là 0.
5. Nếu chụp lại trang chủ sau khi hoàn thành và so với `home-1440.png`/`home-390.png`
   trong báo cáo này, một người dùng bình thường phải nói được "đây là hai bản thiết kế
   khác nhau" — không phải "bản này gọn/đẹp hơn bản kia".

Nếu sau khi triển khai, câu trả lời cho "trang chủ vẫn đọc như một danh sách CSDL có
card đẹp hơn?" là CÓ — chưa đạt, tiếp tục thiết kế lại phần bố cục/tương tác, không chỉ
phần thị giác.
