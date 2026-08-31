# V6 — Quyết định bố cục: Shell & Trang chủ (Phase B + C)

**Trạng thái:** [QUYẾT ĐỊNH] — quyết định kiến trúc/bố cục cụ thể để đóng đúng khoảng
cách nêu ở `rebuild-v6-current-state-gap.md` §D. Nằm trong ranh giới tự quyết đã được
founder cấp (chi tiết implementation/UX/component); không mở lại phạm vi sản phẩm.
**Ngày:** 2026-08-31.

## 1. Shell — Nav rail (Phase B)

**[QUYẾT ĐỊNH]**

- **Desktop ≥1024px:** thay `site-header` hiện tại (chỉ có wordmark + 2 nút) bằng: 1
  header mỏng trên cùng (brandmark + nút "Chia sẻ kiến thức"/Đăng nhập, giữ nguyên vị
  trí phải) + 1 nav rail trái cố định, thu gọn được (icon-only + tooltip khi thu gọn,
  trạng thái lưu qua `localStorage`, mặc định mở rộng).

  > **Làm rõ (bổ sung sau review đóng Phase B, 2026-08-31):** "cố định" ở đây nghĩa là
  > nav rail là một phần tử cấu trúc THƯỜNG TRỰC của page shell — luôn có mặt trong
  > layout, không render có điều kiện theo route — KHÔNG phải là nó ghim lại trên màn
  > hình khi cuộn. Việc ghim thật theo viewport (`position: sticky`) hiện bị vô hiệu
  > hóa bởi một rule có từ trước phase này, `html, body { overflow-x: hidden }` trong
  > `app/globals.css`, vốn phá `position: sticky` trên toàn site (kể cả `.site-header`
  > hiện có, cũng bị ảnh hưởng, không liên quan gì đến Phase B). Sửa hành vi scroll-
  > container này ở phạm vi toàn site là việc ngoài phạm vi wave fix này — cần một điều
  > tra riêng, không gộp vào đây.
- **Mục nav rail thật, có đích thật** (không mục nào là link chết):
  - **Khám phá** → `/`
  - **Tìm kiếm** → `/#tim-kiem` (cuộn tới + focus ô tìm kiếm bằng JS nhỏ, không phải
    trang riêng — tìm kiếm đã sống trên `/`, tạo trang riêng sẽ trùng lặp giả tạo)
  - **Chủ đề** → `/#chu-de` (cuộn tới vùng chọn chủ đề — lý do tương tự, không tạo
    route giả cho một khái niệm sống trên trang chủ)
  - **Đã lưu** → `/saved` (ẩn danh: vẫn hiện mục, click → `/sign-in?redirectTo=/saved`)
  - **Chia sẻ kiến thức** → `/how-to/new` (accent nổi bật, tương tự badge "Tạo" đã có ở
    bottom nav hiện tại)
  - **Hồ sơ** → `/profile` (ẩn danh: hiện "Đăng nhập" thay vì "Hồ sơ")
- **Mobile:** giữ nguyên `BottomNav` hiện có (4 mục, đã được `design-gap-analysis-v4.md`
  xác nhận là mô hình đúng, "không sao chép mù quáng thu nhỏ sidebar"). Không nhân bản
  "Tìm kiếm"/"Chủ đề" thành mục riêng ở mobile — cả hai đã nằm trên `/`, nơi mục "Khám
  phá" đã dẫn tới.
- **Footer:** giữ nguyên dòng thesis hiện tại ở bản này — mở rộng footer đầy đủ (§21 của
  brief) là việc của Phase I, không trộn vào Phase B để tránh làm loãng thay đổi cấu
  trúc chính (nav rail).

## 2. Trang chủ — Bố cục mới (Phase C)

**[QUYẾT ĐỊNH]** Thứ tự từ trên xuống, thay thế hoàn toàn bố cục hiện tại (search-box-
đầu-trang → text hero → chip → danh sách):

1. **Khám phá theo chủ đề** (`id="chu-de"`): tiêu đề "Bạn đang quan tâm điều gì?" + hàng
   thẻ chủ đề thị giác (không phải pill chữ thuần). Danh sách chủ đề: Ẩm thực (hoạt động
   thật), Thủ công/Làm đẹp/Sửa chữa/Công nghệ (hiển thị "Sắp có", không bấm được để trả
   kết quả giả — chỉ là thẻ mờ + nhãn, không phải nút chết vì chúng không giả vờ dẫn tới
   đâu). **Ẩm thực được chọn mặc định** (đây là chủ đề duy nhất có dữ liệu thật — bắt
   người dùng phải bấm chọn thứ duy nhất có thật là ma sát giả tạo, không phải trung
   thực hơn).
2. **Tìm kiếm theo ngữ cảnh** (`id="tim-kiem"`): ô tìm kiếm hiện có, đặt lại placeholder
   theo chủ đề đang chọn ("Tìm món ăn, nguyên liệu, cách làm…" khi Ẩm thực chọn). **Sửa
   bug tìm kiếm không dấu** (mục A của gap report): chuẩn hóa cả chuỗi truy vấn và cột so
   sánh bằng cách bỏ dấu tiếng Việt trước khi so `ilike` — không cần full-text
   search/pgroonga, chỉ cần một hàm bỏ dấu tất định ở tầng ứng dụng hoặc `unaccent()` của
   Postgres nếu extension đã bật (kiểm tra trước khi chọn cách nào).
3. **Vùng khám phá/hero:** **[GIẢ ĐỊNH — quyết định kỹ thuật, không phải sản phẩm]**
   Không dùng ảnh biên tập dàn dựng (stock/licensed) — phiên làm việc này không có kênh
   nào để tìm nguồn ảnh hợp pháp đáng tin cậy, và founder chưa cung cấp asset thật. Thay
   vào đó: một khối editorial mạnh bằng typography + trực quan hóa dữ liệu Evidence thật
   (ví dụ: dải chấm màu theo kết quả — tái dùng đúng cơ chế `hero-evidence-dots` đã có —
   phóng to thành yếu tố thị giác chính thay vì chi tiết nhỏ). Đây KHÔNG phải hero ảnh
   như brief mô tả lý tưởng — ghi nhận là giới hạn thật, không giả vờ đã làm được, và để
   ngỏ cho founder cung cấp ảnh thật sau.
4. **Evidence là khái niệm sản phẩm hạng nhất:** 1 khối giải thích 3 bước (How-To →
   Attempt Report → Evidence) + câu "Evidence không có nghĩa là hệ thống xác nhận điều
   này đúng — đó là những gì người đã thử ghi nhận lại" (nguyên văn tinh thần brief).
5. **Kệ nội dung theo chủ đề (Ẩm thực):** với 7 How-To thật, **không** tạo 5-6 kệ gần
   như trùng lặp chỉ để trông "đầy đủ" — vi phạm chính nguyên tắc "không xây control
   không có dữ liệu đứng sau" mà dự án này đã áp dụng nhất quán từ `design-gap-analysis-
   v4.md`. Giữ 3 kệ thật đã có dữ liệu đủ để có ý nghĩa, tái thiết kế thành bố cục kệ
   cuộn ngang thay vì khối xếp chồng: **Được thử nhiều nhất**, **Khám phá theo nguyên
   liệu**, **Cách làm khác** (đổi tên/tái tổ chức phần "chuyện xảy ra khi thử" thành ví
   dụ Evidence minh họa ngay trong khối giải thích ở mục 4, tránh trùng lặp ý).

## 3. Việc KHÔNG làm ở 2 phase này, và vì sao

- Không tạo trang "Chủ đề" hay "Tìm kiếm" riêng — dữ liệu/chức năng đã sống trên `/`,
  tạo route riêng chỉ để khớp tên mục brief là giả tạo.
- Không thêm ảnh stock/dàn dựng cho hero — không có nguồn hợp pháp đáng tin cậy trong
  phiên này; ghi nhận là giới hạn, không giả vờ.
- Không tạo 5+ kệ nội dung cho 7 How-To — giữ 3 kệ có ý nghĩa thật.
- Không đổi lại palette/font — không phải nguyên nhân của khoảng cách đã xác định.
- Không mở rộng footer đầy đủ trong Phase B/C — để Phase I.

## 4. Ranh giới quyết định founder — không đổi

Tự quyết mọi chi tiết implementation/UX/component. Chỉ hỏi lại nếu phát sinh: thay đổi
IA vượt phạm vi đã duyệt ở đây, thao tác dữ liệu phá hủy, tuyên bố trust/verification
mới, hoặc xóa/sửa Evidence còn mơ hồ.
