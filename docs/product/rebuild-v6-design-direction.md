# Product Rebuild V6 — Định hướng thiết kế

**Trạng thái:** [QUYẾT ĐỊNH] founder (2026-08-31) khởi động lại một vòng rebuild sản
phẩm/thị giác toàn diện, không kế thừa các điểm "đã đạt" của `design-gap-analysis-v4.md` /
`visual-audit-v5.md` như bất biến — founder đánh giá lại: sản phẩm vẫn "trông như một CRUD
app có styling phủ lên trên", dưới chuẩn các sản phẩm tiêu dùng hiện đại (Cookpad, Pinterest,
Notion, Medium).
**Ngày:** 2026-08-31.
**Phạm vi:** Toàn bộ trải nghiệm — shell/nav, trang chủ, tìm kiếm, Dish, How-To, Evidence,
Attempt Report, Tạo/Sửa, Auth, Hồ sơ, Đã lưu, footer, responsive, a11y.
**Ranh giới quyết định founder** (không đổi so với brief): tôi có toàn quyền về chi tiết thị
giác/UX/component; chỉ dừng lại để hỏi founder về định hướng sản phẩm, thay đổi IA lớn, thao
tác dữ liệu phá hủy, thay đổi schema không thể đảo ngược, tuyên bố trust/verification, hoặc
xóa/sửa Evidence còn mơ hồ.

---

## 1. Đánh giá thị giác độc lập (2026-08-31, Playwright thật, không dựa vào audit cũ)

Chụp lại toàn bộ 7 màn hình chính (desktop 1440 + mobile 390) trước khi quyết định bất cứ
điều gì, đúng yêu cầu "không coi điểm 5/5 cũ là bất biến".

**Xác nhận founder đúng — 4 vấn đề thị giác thật, cụ thể:**

1. **Không có ảnh thật ở bất kỳ đâu.** Mọi ảnh đại diện Dish/How-To/Evidence đều là hình
   tròn gradient màu phẳng (do `content-seed-log.md` — ảnh Evidence là sinh bằng script,
   không phải ảnh món ăn). Đây là khoảng trống chiến lược đã biết (`visual-audit-v5.md` §2),
   nhưng **cách hiển thị placeholder hiện tại (hình tròn lặp lại giống hệt nhau) là một vấn
   đề thiết kế độc lập** — placeholder trung thực vẫn có thể được thiết kế có chủ đích, thay
   vì trông như chưa hoàn thiện.
2. **Card không có chiều sâu.** `globals.css` (2175 dòng, đã kiểm tra) không có bất kỳ token
   `shadow`/elevation nào — mọi card chỉ phân biệt bằng viền 1px (`--color-line`). Kết quả:
   mọi khối nội dung "phẳng" như nhau, không có phân cấp thị giác qua độ nổi.
3. **"Cách làm khác" ở trang Dish/Trang chủ là một hàng danh sách kiểu bảng dữ liệu** —
   thumbnail nhỏ + text + số liệu trên một dòng ngang viền dưới mỏng — đọc đúng như một
   dòng bảng CSDL, không phải nội dung biên tập.
4. **Trang phụ trống trải.** Trang Dish (1 How-To), trang Đăng nhập ở ≥1024px: phần lớn
   màn hình là nền trắng/giấy trống quanh một khối nội dung nhỏ — không có gì lấp đầy phần
   còn lại một cách có chủ đích.

**Không xác nhận / khác với brief:** Nav hiện tại (thanh ngang, không sidebar) không "trông
như dashboard" — nó tối giản đúng mức. Trang How-To detail (flagship) thực sự có cấu trúc
tốt: tách Evidence/How-To rõ bằng 2 cột + nền kraft riêng + mono cho dữ liệu — đây là điểm
mạnh thật, không phải ảo tưởng của audit cũ, và sẽ được **giữ làm khuôn mẫu chất lượng** cho
các trang khác thay vì thiết kế lại.

**Kết luận:** vấn đề không phải kiến trúc thông tin (Evidence/How-To/Dish tách bạch đã đúng
hướng) — vấn đề là **độ hoàn thiện thị giác** (elevation, ảnh, mật độ trang phụ, điều hướng
chưa đủ cho IA sắp mở rộng). Rebuild sẽ tập trung đúng vào đây, không phá kiến trúc đang tốt.

## 2. Định hướng thị giác

**[QUYẾT ĐỊNH]**

- **Giữ nguyên hệ màu near-white/ember** (`--color-paper`, `--color-ember` …) — đã kiểm
  chứng contrast, đã qua 3 vòng thiết kế, không có phản hồi cụ thể nào về SAI Ở ĐÂU trong
  chính hệ màu (khác với vấn đề elevation/ảnh/mật độ). Đổi màu lần thứ 4 mà không có tín
  hiệu cụ thể là đoán mò, không phải thiết kế — giữ nguyên nguyên tắc đã ghi ở
  `design-gap-analysis-v4.md` §4.
- **Thêm thang elevation thật:** 3 mức shadow token (`--shadow-sm/md/lg`) dùng nền
  paper/ember đã có (không dùng đen thuần — giữ tinh thần "giấy" ấm), áp dụng cho card nổi
  (Được thử nhiều nhất, Dish card, auth card) để tạo phân cấp thị giác thay vì viền phẳng.
- **Thiết kế lại hệ placeholder-art** — **không** thay bằng ảnh trông thật hơn (vi phạm
  nguyên tắc Evidence, đã bị `visual-audit-v5.md` §8 từ chối rõ ràng). Thay hình tròn
  gradient lặp lại bằng một hệ mẫu hình học/màu có chủ đích hơn (ví dụ: dải màu theo nhóm
  nguyên liệu + icon nét đơn tối giản đại diện danh mục món, không mô phỏng ảnh chụp) —
  trung thực về bản chất (không giả làm ảnh thật) nhưng có craft rõ ràng thay vì trông ngẫu
  nhiên.
- **Thêm 1 cỡ display type** cho hero/heading cấp 1 (tương phản cỡ chữ mạnh hơn với body) để
  tạo giọng "editorial" — không đổi font family (Be Vietnam Pro hiện tại đã ổn, không phải
  điểm founder phàn nàn).
- **Thiết kế 1 brandmark nhỏ gọn** (đã được flag ở `design-gap-analysis-v4.md` P2, nay nâng
  ưu tiên) — icon/ký hiệu trừu tượng đơn giản đi kèm wordmark, không phải chỉ chữ.
- Chuyển "Cách làm khác" và các danh sách tương tự từ hàng-bảng sang card nhất quán với
  phần còn lại của trang (ảnh placeholder-art + tiêu đề + mô tả + chỉ báo, có elevation).

## 3. Điều hướng & kiến trúc thông tin

**[QUYẾT ĐỊNH]**

- **Desktop (≥1024px):** thêm nav rail trái, có thể thu gọn (icon-only + tooltip khi thu
  gọn), thay cho thanh ngang hiện chỉ có wordmark + nút auth. Đây là quyết định IA lớn
  nhưng đã được founder **cho phép tường minh** trong brief ("may use a collapsible left
  navigation rail... DO NOT blindly copy Cookpad"), nên xử lý như đã duyệt, không phải điểm
  cần hỏi lại.
- **Mobile:** giữ mô hình điều hướng riêng hiện có (bottom nav / thanh riêng) — đã được
  `design-gap-analysis-v4.md` xác nhận là "không sao chép mù quáng", không có lý do đổi.
- **Đa chủ đề (topic-first):** thêm bộ chọn chủ đề ở trang chủ (Ẩm thực, Thủ công, Sửa
  chữa, …) theo đúng yêu cầu kiến trúc mở rộng của brief. **Chỉ "Ẩm thực" thực sự hoạt
  động** — các chủ đề khác hiển thị ở trạng thái "Sắp có" rõ ràng, không bấm được để trả về
  kết quả giả — giữ đúng nguyên tắc "không có control chết" (`design-gap-analysis-v4.md`
  §30 tinh thần tương tự) mà chính dự án này đã áp dụng nhất quán.

## 4. Quyết định kỹ thuật — không đổi công nghệ CSS

**[QUYẾT ĐỊNH]** Không đưa Tailwind/shadcn vào dự án. Vấn đề đã xác nhận ở mục 1 (ảnh,
elevation, mật độ trang phụ, nav) không phải do công nghệ CSS gây ra — hệ token
`globals.css` hiện tại (màu, spacing, radius) đã có cấu trúc hợp lý. Thêm một framework mới
là rủi ro/công sức lớn không giải quyết đúng nguyên nhân, và tạo diff khổng lồ không cần
thiết trên một codebase nhỏ (2175 dòng CSS, không có thư viện UI). Tiếp tục mở rộng đúng hệ
token hiện có (thêm elevation, cỡ chữ display, token cho nav rail).

## 5. Nguyên tắc dữ liệu — không đổi

**[QUYẾT ĐỊNH]** Tái khẳng định, không mở lại:

- Evidence ≠ Truth, không xác nhận hệ thống, không điểm số/trung bình/sao.
- 2 migration additive đã chuẩn bị (`is_seed_content`, `duration_minutes`/`servings`) —
  **áp dụng khi bắt đầu Phase B** vì đã được founder cho phép ("may be applied when
  appropriate") và không có rủi ro (additive, có default/nullable).
- 2 dish mồ côi QA + 1 Attempt Report mơ hồ (`data-integrity-note-2026-08-31.md`) — **không
  đụng tới**, chờ founder tự xóa/xác nhận.
- UI phải dùng cột `is_seed_content` để gắn nhãn minh bạch nội dung minh họa (ví dụ: dòng
  nhỏ "Nội dung minh họa" trên Evidence/How-To được đánh dấu) — đây là việc thực thi quyết
  định founder đã ngụ ý khi duyệt migration này, không phải quyết định mới.

## 6. Lộ trình triển khai

Ánh xạ đúng Phase A–H founder đưa ra, điều chỉnh theo codebase thật (Next.js App Router,
không có `components/` riêng — sẽ tạo trong quá trình làm):

| Phase | Nội dung | Ghi chú |
|---|---|---|
| A | Tài liệu này + audit thật | Xong |
| B | Design system: token elevation, placeholder-art system, display type, brandmark; áp dụng 2 migration | Nền tảng cho mọi phase sau |
| C | Shell: nav rail desktop + giữ mobile nav, footer thật | |
| D | Trang chủ/Khám phá: topic switcher (Ẩm thực active, còn lại "Sắp có"), nâng cấp card/elevation | |
| E | Search, Dish, How-To: áp elevation + placeholder-art mới, giữ nguyên cấu trúc How-To (đã đạt) | |
| F | Attempt Report, Create/Edit: áp thị giác mới, không đổi luồng đã hoạt động tốt | |
| G | Auth, Profile, Saved: lấp đầy trang phụ trống trải bằng bố cục có chủ đích | |
| H | Responsive (375/390/768/1024/1280/1440) + a11y (axe) + regression + visual QA thật | Gate cuối trước production |

Sau mỗi phase: build/tsc/lint, kiểm tra bằng Playwright thật, sửa lỗi phát sinh, rồi tiếp
tục — không dừng lại chờ duyệt từng phase trừ khi phát sinh quyết định thuộc ranh giới ở
đầu tài liệu.

## 7. Việc KHÔNG làm trong vòng này

- Không đổi lại palette/font family lần thứ 4 (mục 2).
- Không tạo ảnh "trông thật hơn" để thay placeholder (mục 2, mục 5).
- Không xóa/sửa 2 dish mồ côi hay Attempt Report mơ hồ (mục 5).
- Không thêm Tailwind/shadcn hay bất kỳ dependency UI lớn nào (mục 4).
- Không xây filter/sort nâng cao hay tính năng ngoài phạm vi này chỉ để trông "đầy đủ hơn".
