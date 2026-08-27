# Phân tích khoảng cách thiết kế — V4

**Trạng thái:** [PHÂN TÍCH] — Phase 0 của mission "Product Rebuild V4". Không có thay
đổi code trong tài liệu này — đây là audit + nghiên cứu, dừng lại để trình bày kết
quả trước khi vào Phase 1 (design system) theo đúng yêu cầu §32.
**Ngày:** 2026-08-28.
**Dựa trên:** kiểm tra trực tiếp mã nguồn hiện tại (`app/`, `lib/`, `supabase/migrations/`),
ảnh chụp màn hình thật qua Playwright của sản phẩm hiện tại VÀ của cookpad.com/vn
(trang chủ + kết quả tìm kiếm "bánh xèo", chụp trong phiên làm việc này — không phải
suy diễn từ trí nhớ về Cookpad).

## 0. Bối cảnh quan trọng trước khi đọc bảng bên dưới

Đây đã là vòng thiết kế thứ ba trong phiên làm việc này (V1 "sổ tay giấy/kraft" →
V2 tinh chỉnh cùng ngôn ngữ → V3 **đã pivot hẳn**: nền gần-trắng thay giấy be, màu
hành động chính đổi từ navy sang ember (đỏ cam, đã kiểm chứng contrast 6.2:1 bằng
script, không áng chừng), mono bị giới hạn lại chỉ cho dữ liệu số thật, kệ "Được thử
nhiều nhất" đã thành lưới ảnh thật thay vì danh sách dòng, ảnh hero How-To đã chuyển
lên đầu trang kiểu tạp chí). Cùng vòng đó đã thêm: parser nguyên liệu ngôn ngữ tự
nhiên, luồng quên/đặt lại mật khẩu, mục "Chuyện xảy ra khi thử" ở trang chủ, khung so
sánh nhiều cách làm ở trang Món, và trang Đã lưu đã dùng cùng dữ liệu mẫu vật/tally
thật như Khám phá.

Bảng bên dưới đánh giá **trạng thái sau V3**, không phải trạng thái nguyên thủy —
một số mục mission liệt kê là vấn đề ("cảm giác CRUD", "mono khắp nơi", "màu navy
SaaS chung chung") đã được xử lý ở vòng trước và được ghi nhận là vậy.

## 1. Cookpad — quan sát thật (không suy diễn)

Ảnh chụp thật qua Playwright, 1440px:

- **Trang chủ KHÔNG dày đặc** — trái với mô tả trong các mission trước. Chỉ có: logo,
  ô tìm kiếm lớn ở giữa, một banner khuyến mãi, một lưới 8 ô "Từ khóa thịnh hành"
  (ảnh món ăn thật + chữ phủ), 2 thẻ "Gói Premium". Hết. Không có feed công thức nào
  ở trạng thái chưa đăng nhập.
- **Mật độ thật nằm ở trang kết quả tìm kiếm**: danh sách một cột, thẻ nằm ngang gọn
  (~120px thumbnail vuông + tiêu đề + thời gian/khẩu phần + tên tác giả + icon lưu),
  không có rating sao giả, có dải "tìm kiếm tương tự" dạng chip, có lưới ảnh-từ-khóa
  phụ ("12 ý tưởng để nấu ăn với...") chen giữa danh sách, filter ở cột phải, phân
  trang cuối trang.
- **Điều hướng desktop là sidebar trái**, không phải thanh ngang.
- Không thấy cơ chế nào tương đương "Phản hồi thực tế" — Cookpad không có khái niệm
  "lần thử thật/kết quả thật", đây thực sự là khoảng trống thị trường của VHKP.

**Rút ra được, không sao chép:** lưới ảnh-từ-khóa là một cơ chế khám phá dùng dữ
liệu thật (câu tìm kiếm thật) rất hợp với nguyên tắc "không bịa độ phổ biến" —
đáng áp dụng dưới tên khác. Mật độ danh sách kết quả tìm kiếm của Cookpad (thumbnail
nhỏ, nhiều dòng/màn hình) là mẫu tốt cho trang kết quả của VHKP, vốn hiện tại đã khá
gần dạng này (`.howto-entry`) nhưng thumbnail to hơn (108–132px) nên mật độ thấp hơn.

## 2. Bảng khoảng cách

| Khu vực | VHKP hiện tại (sau V3) | Tham chiếu Cookpad | Vấn đề còn lại | Hướng đề xuất | Ưu tiên |
|---|---|---|---|---|---|
| Brand | Wordmark "Verified How-To" + kicker mono nhỏ, không icon | Icon mũ đầu bếp trong vòng tròn cam, đơn giản, dễ nhận | Không có biểu tượng riêng, chỉ có chữ — khó nhận diện ở kích thước nhỏ (tab icon, app icon tương lai) | Thiết kế 1 icon/wordmark nhỏ gọn (không bắt buộc phải là hình vẽ phức tạp — có thể là chữ lồng hoặc 1 ký hiệu trừu tượng gợi "lần thử/gạch kiểm") | P2 |
| Navigation | Thanh ngang trên cùng + bottom nav mobile riêng (đã redesign V3) | Sidebar trái cố định | Đã có mô hình mobile riêng biệt (không sao chép Cookpad) — đạt yêu cầu "không copy". Thanh ngang desktop ổn cho quy mô sản phẩm hiện tại | Giữ nguyên; không có lý do sản phẩm để chuyển sang sidebar | — (đạt) |
| Homepage | Hero + search lớn + chip category + lưới ảnh "Được thử nhiều nhất" + "Chuyện xảy ra khi thử" + danh sách đầy đủ | Rất tối giản: search + 1 lưới từ khóa | VHKP hero/thesis text hơi dài so với Cookpad's minimal-first-viewport — nhưng thesis text đó CHÍNH LÀ sự khác biệt sản phẩm (không phải chỉ recipe site), nên rút ngắn quá sẽ mất thông điệp | Rút gọn đoạn `supporting-text` dưới thesis (hiện 2 câu) còn 1 câu; không đổi cấu trúc | P2 |
| Discovery theo ý định | Chip category 2 chiều (loại món / cách chế biến) | Lưới ảnh từ khóa thịnh hành (dữ liệu tìm kiếm thật) | VHKP chưa có cơ chế "khám phá không cần gõ" bằng ảnh — chip chữ thuần kém hấp dẫn thị giác hơn | Thêm 1 hàng "Khám phá theo nguyên liệu" dùng ảnh mẫu vật thật của các How-To có nguyên liệu phổ biến nhất (dữ liệu thật từ `how_to_ingredient`, đếm tần suất — không bịa) | P1 |
| Search input | 1 ô + nút "Tìm", đặt trong hero | Ô tìm kiếm là yếu tố thị giác trung tâm duy nhất của trang chủ | Đã khá nổi bật sau V3 (to, viền dày, nút ember đặc). Không có gợi ý/autocomplete | Thêm gợi ý tìm kiếm gần đây/phổ biến dạng chip ngay dưới ô search (dữ liệu thật: top ingredient/dish names) | P2 |
| Search results | Cùng `.howto-entry` với trang chủ — thumbnail 108–132px, 1 dòng meta | Thumbnail nhỏ (~120px vuông), mật độ cao, có "vì sao khớp" | Đã có `match-reason` ("Khớp vì có ...") — đạt yêu cầu giải thích khớp. Mật độ thấp hơn Cookpad vì thumbnail responsive lớn hơn | Giữ nguyên cho danh sách đầy đủ (đây là trang duyệt chậm, không phải trang kết quả tìm kiếm với hàng trăm mục — quy mô nội dung hiện tại là 7 How-To, mật độ cao không tạo giá trị thật) | — (không cần, quy mô nội dung chưa đòi hỏi) |
| Không có kết quả | 1 dòng text + link "Xóa bộ lọc" | N/A (Cookpad hiếm khi trắng tay do kho nội dung khổng lồ) | Trạng thái rỗng hiện tại là ngõ cụt, không gợi ý gì tiếp theo | Thêm gợi ý: danh sách Dish phổ biến, hoặc link "Xem tất cả cách làm" nổi bật hơn, có thể gợi ý theo nguyên liệu gần đúng | P1 |
| Filter | Category 2 chiều dạng chip, không có sort | Sort theo "Mới nhất / Phù hợp" + filter premium riêng | Không có sort — với 7 How-To chưa cần, nhưng kiến trúc nên sẵn sàng | Không xây filter/sort mới ở quy mô 7 item (§30 "không xây filter không có dữ liệu đứng sau"). Hoãn tới khi nội dung đủ lớn | P3 (hoãn có chủ đích) |
| Dish | Hero + thống kê thật + khung "So sánh các cách làm" khi >1 method (đã thêm ở vòng trước) | Không có khái niệm Dish/method tách biệt | Đạt — đây chính là điểm khác biệt sản phẩm mission yêu cầu, đã triển khai | — (đạt) |
| How-To detail | Hero ảnh full-width lên đầu (đã chuyển ở V3) → eyebrow/title → nguyên liệu 2 cột → bước đánh số ember → kết quả mong đợi → rail "Phản hồi thực tế" sticky | N/A — không có tương đương | Chưa có "thời gian/khẩu phần" quick-facts bar — schema hiện tại (`how_to`) không có cột `duration`/`servings` | Thêm quick-facts CHỈ nếu có dữ liệu thật để hiển thị; hiện DB không có các cột này — KHÔNG bịa. Cần quyết định sản phẩm: có thêm cột không, hay bỏ qua mục này | P1 (cần quyết định schema trước khi làm UI) |
| Ingredients | 2 cột responsive, số lượng mono căn phải, nhóm theo `group_name` | Không hiển thị structured, chỉ text tường thuật trong công thức | VHKP đã tốt hơn Cookpad ở điểm này (structured, scannable) | Giữ nguyên | — (đạt) |
| Steps | Số thứ tự tròn viền ember, không có ảnh bước | N/A | Chưa hỗ trợ ảnh cho từng bước (schema `how_to_step` chỉ có `instruction`) | Cần migration thêm cột ảnh nếu muốn — đánh giá độ ưu tiên thấp vì tác giả hiện tại (7 How-To) chưa có nhu cầu thật | P3 (hoãn, chưa có nhu cầu thật) |
| Attempt Report | Nút mời "Bạn đã thử chưa?" → 3 nút kết quả to + textarea + 3 ô ảnh → submit nhẹ nhàng | N/A | Đã nhẹ nhàng, không giống form database. Đã kiểm thử thật qua Playwright (tài khoản dùng thử, đã xóa) | Giữ nguyên | — (đạt) |
| Real feedback hiển thị | Rail sticky, vạch kraft bên trái, ảnh kết quả dạng lưới sạch (không hiệu ứng Polaroid) | N/A | Đạt yêu cầu "không database form", đã bỏ hiệu ứng photo-prop ở V2 | Giữ nguyên | — (đạt) |
| Create/Edit | 1 trang cuộn dọc, có eyebrow từng phần, parser nguyên liệu ngôn ngữ tự nhiên đã hoạt động thật (đã test qua Playwright) | N/A | Vẫn là 1 trang dài, không có "Xem trước" trước khi đăng | Thêm bước xem trước (client-side, không cần route mới) trước nút "Đăng cách làm" | P1 |
| Ingredient parsing | Textarea → "Tách nguyên liệu" → điền vào các dòng có thể sửa → xác nhận khi submit | N/A | Đạt đúng kiến trúc "AI/parser đề xuất, người dùng xác nhận" mission yêu cầu | Giữ nguyên; phần mở rộng AI fallback vẫn hoãn có chủ đích (chưa có bằng chứng cần) | — (đạt) |
| Authentication | Đăng nhập/đăng ký/đăng xuất/quên-đặt lại mật khẩu đều có, dùng chung `.auth-card` | N/A | Chưa có "Gửi lại email xác nhận" khi người dùng chưa xác nhận mà cố đăng nhập; thông báo xác nhận email còn là text mặc định của Supabase (không tuỳ biến được từ đây — cần dashboard) | Thêm resend-confirmation nếu Supabase trả lỗi "email not confirmed" khi đăng nhập | P1 |
| Profile | Tên + email + link Đã lưu + danh sách Cách làm đã tạo + danh sách Lần thử + nút đăng xuất | N/A | Đúng như mission mô tả "3 How-Tos / 5 Attempts" — vẫn khá giống bảng thống kê hơn "trang cá nhân" | Thêm avatar (khởi tạo từ chữ cái đầu tên, không cần upload thật ở vòng này), sắp xếp lại thành các khối card thay vì list thuần | P2 |
| Saved | Cùng specimen/tally thật với Discover (đã sửa ở vòng trước) | N/A | Đạt | Giữ nguyên | — (đạt) |
| Mobile | Bottom nav riêng, không phải thu nhỏ desktop, đã QA ở 375px | Sidebar trái ẩn thành hamburger | Đạt yêu cầu "không sao chép mù quáng" | Giữ nguyên | — (đạt) |
| Loading | Có `.skeleton` CSS nhưng chưa thấy dùng ở component nào | N/A | Trang list/detail là Server Component (`force-dynamic`) nên không có loading client-side — Next.js sẽ dùng `loading.tsx` nếu có, hiện KHÔNG có file này ở bất kỳ route nào | Thêm `loading.tsx` cho `/`, `/how-to/[id]`, `/dish/[id]` dùng class `.skeleton` đã có sẵn nhưng chưa dùng | P1 |
| Empty state | Có nhưng tối giản ("Chưa có cách làm nào", "Chưa có ai chia sẻ kết quả") | N/A | Chấp nhận được cho quy mô hiện tại, không giả tạo | Giữ nguyên; không thêm minh hoạ trang trí không cần thiết | — (đủ) |
| Error state | `app/error.tsx`, `app/not-found.tsx` tồn tại, thông điệp tiếng Việt, không lộ lỗi kỹ thuật | N/A | Đạt | Giữ nguyên | — (đạt) |
| Accessibility | focus-visible rõ ràng, label đầy đủ, không dùng màu đơn thuần cho kết quả (luôn kèm chữ), `prefers-reduced-motion` tôn trọng | N/A | Chưa chạy audit tự động (axe/Lighthouse) — chỉ kiểm tra thủ công qua code + Playwright | Chạy 1 lượt axe-core qua Playwright cho các trang chính trước khi coi Phase 5 hoàn tất | P1 |

## 3. Danh sách ưu tiên

**P0 — chưa phát hiện mục nào thực sự "product-breaking" ở trạng thái hiện tại.**
Không tạo ra P0 giả để có nội dung — nếu có, sẽ là bug chức năng, không phải thiếu
sót thẩm mỹ, và audit code hiện chưa thấy bug chức năng nào còn mở.

**P1 — giá trị cao, nên làm tiếp theo:**
1. `loading.tsx` cho các route chính (dùng `.skeleton` đã có, chưa được dùng).
2. Resend-confirmation-email khi đăng nhập thất bại do email chưa xác nhận.
3. Bước "Xem trước" trong Create/Edit trước khi đăng.
4. Trạng thái "không có kết quả" hữu ích hơn (gợi ý Dish phổ biến).
5. "Khám phá theo nguyên liệu" trên trang chủ — dữ liệu thật, tần suất nguyên liệu.
6. Quyết định sản phẩm: có thêm `duration`/`servings` vào schema `how_to` không —
   đây là quyết định cần founder xác nhận trước khi động vào schema (§25: "không
   sửa schema chỉ vì lý do thị giác" — đây là lý do chức năng thật nếu được chọn).
7. Chạy audit accessibility tự động (axe-core) cho các trang chính.

**P2 — polish có giá trị nhưng không khẩn:**
1. Icon/wordmark riêng cho brand.
2. Rút gọn đoạn supporting-text dưới thesis ở trang chủ.
3. Gợi ý tìm kiếm dạng chip dưới ô search.
4. Profile dạng khối card + avatar chữ cái đầu.

**P3 — hoãn có chủ đích, không phải bị quên:**
1. Ảnh cho từng bước (cần migration, chưa có nhu cầu thật từ 7 How-To hiện có).
2. Filter/sort nâng cao (chưa có đủ nội dung để filter có ý nghĩa).
3. AI-assisted ingredient fallback (parser tất định đã đủ, chưa có bằng chứng cần AI).
4. Collections riêng biệt với Saved (đã hoãn từ product-evolution-v1.md, giữ nguyên).

## 4. Việc KHÔNG làm ở vòng này, và vì sao

- Không đổi lại navigation sang sidebar kiểu Cookpad — thanh ngang + bottom nav
  riêng cho mobile đã đúng mission "không sao chép Cookpad", và phù hợp quy mô IA
  hiện tại (5 mục chính, không cần sidebar).
- Không xây search filter/sort mới — 7 How-To không tạo đủ tín hiệu để bất kỳ sort
  nào có ý nghĩa; thêm control không có dữ liệu đứng sau vi phạm §10 "no dead
  controls".
- Không đổi lại palette/typography lần thứ 4 — palette V3 (ember/near-white) đã được
  kiểm chứng contrast bằng script, đã visual-QA qua Playwright ở 5 breakpoint, và
  chưa nhận được phản hồi cụ thể nào về ĐIỂM GÌ sai trong ảnh đã gửi. Tiếp tục thay
  đổi palette mà không có phản hồi cụ thể là đoán mò, không phải thiết kế.

## 5. Câu hỏi cần founder xác nhận trước khi vào Phase 1

1. Có đồng ý với danh sách P1 ở trên là bước tiếp theo, hay có mục nào cần đổi thứ
   tự?
2. Về "quick facts" (thời gian/khẩu phần) ở How-To detail: có muốn thêm cột
   `duration_minutes`/`servings` thật vào schema (migration additive), hay bỏ qua
   mục này vì chưa có dữ liệu thật cho 7 How-To hiện có?
3. Bảng ở mục 2 đánh dấu nhiều khu vực là "— (đạt)" dựa trên trạng thái sau 3 vòng
   thiết kế trước. Nếu founder cho rằng khu vực nào trong số đó thực ra CHƯA đạt,
   xin chỉ rõ khu vực + vấn đề cụ thể thay vì yêu cầu "rebuild toàn bộ" — để tránh
   lặp lại việc thiết kế lại từ đầu mà không có tín hiệu cụ thể về điều gì sai.
