# Brutal Visual/Product Audit — V5 (Phase 1 gate)

**Trạng thái:** [PHÂN TÍCH] + [QUYẾT ĐỊNH] cho các fix đã áp dụng. Đây là vòng audit thị
giác/sản phẩm cuối trước khi coi Phase 1 hoàn tất, kế thừa `design-gap-analysis-v4.md`.
**Ngày:** 2026-08-28.
**Phương pháp:** Playwright thật (không suy diễn từ code) — duyệt ẩn danh + đã đăng nhập
qua toàn bộ luồng lõi, chụp màn hình ở 390/768/1024/1280/1440px, kiểm tra DB/Storage thật
qua Supabase service role, deploy lên production và kiểm tra lại trên production.

---

## 0. Tóm tắt kết quả

- **2 bug thật đã tìm thấy và sửa** (không phải góp ý thẩm mỹ chủ quan — cả hai đều tái
  hiện được nhất quán và đã verify lại sau khi sửa, kể cả trên production).
- **1 khoảng trống chiến lược lớn** không được sửa vì nằm ngoài thẩm quyền thiết kế/code
  — cần founder quyết định (mục 4).
- **1 vấn đề hiệu năng** ghi nhận nhưng không sửa trong vòng này (mục 5).
- Data integrity: sạch — không có tài khoản test, How-To test, Attempt test, hay storage
  object mồ côi nào còn sót lại sau audit (đã verify bằng đếm số dòng trước/sau).

## 1. Bug đã sửa

### 1.1 Hộp thoại xác nhận xóa dạt về góc trên-trái thay vì giữa màn hình

**Mức độ:** Cao — ảnh hưởng MỌI hành động xóa (How-To, Attempt Report) ở MỌI kích thước
màn hình.

Reset CSS toàn cục (`* { margin: 0 }`) vô hiệu hóa `margin: auto` mặc định của trình
duyệt cho `<dialog>` khi `showModal()`. Hộp thoại xác nhận xóa vì vậy luôn hiển thị dạt
về góc trên-trái của viewport thay vì giữa màn hình — với một hành động phá hủy không
thể hoàn tác, đây là lỗi UX nghiêm trọng hơn mức "thẩm mỹ": người dùng có thể không nhận
ra ngay đây là một hộp thoại xác nhận đang che khuất phần trên bên trái trang.

**Đã sửa:** `dialog.confirm-dialog` giờ tự căn giữa tường minh bằng
`position: fixed; top/left: 50%; transform: translate(-50%, -50%)`, không phụ thuộc vào
UA stylesheet nữa. Verify lại bằng Playwright cả ở dev và **trên production** — hộp
thoại hiện giữa màn hình đúng như thiết kế §9 của `design-direction.md`.

### 1.2 4 trang xác thực (đăng nhập/đăng ký/quên/đặt lại mật khẩu) trông như Supabase Auth mặc định

**Mức độ:** Trung bình-cao — đây là câu hỏi founder đặt ra tường minh ("does this feel
like a modern consumer app or raw Supabase Auth?"), và câu trả lời trước khi sửa là
**không, giống form mặc định**.

Ở màn hình rộng (≥1024px), cả 4 trang chỉ là một thẻ trắng nhỏ (~380px) nổi giữa một nền
trống hoàn toàn — không logo lớn, không thông điệp sản phẩm, không liên hệ gì tới phần
còn lại của sản phẩm. Trang `/reset-password` ở trạng thái link hỏng còn trơ trọi hơn:
1-2 dòng chữ giữa một khoảng trống mênh mông.

**Đã sửa:** Thêm `AuthShell` dùng chung — ở màn hình ≥900px, mở thành 2 cột: cột trái là
panel thương hiệu nhắc lại đúng thesis của trang chủ ("Không chỉ cho bạn biết cách làm —
mà cho bạn biết điều gì đã xảy ra khi người thật thử làm"), cột phải là form. Ở mobile,
giữ nguyên bố cục thẻ đơn hiện tại (không đổi, đã ổn). Không thêm số liệu bịa — dùng lại
nguyên văn copy đã có ở trang chủ.

### 1.3 Copy nhỏ

`"Xóa Cách làm"` → `"Xóa cách làm"` (không nhất quán viết hoa so với "Sửa cách làm" liền
kề).

## 2. Khoảng trống chiến lược — CHƯA sửa, cần founder quyết định

### Toàn bộ hình ảnh trong sản phẩm là ảnh tổng hợp bằng script, không phải ảnh thật

Đây là phát hiện quan trọng nhất của audit này, và nó không phải bug — nó là hệ quả của
một quyết định đã ghi nhận minh bạch ở `content-seed-log.md` (2026-08-27): 6/7 How-To,
16/17 Attempt Report, và cả 10 ảnh "bằng chứng" đính kèm đều là nội dung AI-generated cho
mục đích demo, **không phải hoạt động thật của founder**. Ảnh "bằng chứng" thực chất là
hình tròn gradient màu tạo bằng Python, không phải ảnh món ăn.

Vì trang chủ/kết quả tìm kiếm/trang Món đều lấy ảnh đại diện từ ảnh Evidence đầu tiên của
mỗi How-To (kiến trúc này đúng đắn — ưu tiên ảnh thật từ người đã thử hơn ảnh tác giả tự
đăng), toàn bộ trải nghiệm duyệt sản phẩm hiện kế thừa vấn đề này: **không có ảnh món ăn
thật nào trong toàn sản phẩm**.

Tác động trực tiếp tới các câu hỏi founder đặt ra:

- *"Does the page make me want to explore food?"* → Không, hiện tại là các hình tròn màu
  phẳng, không gợi cảm giác món ăn.
- *"Does this screenshot communicate 'real people tried this'?"* (Product Identity Test
  #4) → Với 16/17 Attempt Report và 10/10 ảnh, câu trả lời trung thực là **không** —
  đây là nội dung demo, dù giao diện không có nhãn nào báo hiệu điều đó cho người xem.

**Vì sao không tự sửa:** Nguyên tắc thiết kế cao nhất của sản phẩm (`design-direction.md`
§1.1: "Bằng chứng thật, không phải xác nhận hệ thống") cấm mọi thứ tạo cảm giác xác nhận
giả. Tôi có hai lựa chọn, cả hai đều là quyết định sản phẩm/nội dung vượt quyền của một
vòng polish thị giác:

1. Thêm nhãn "nội dung minh họa" vào UI cho các How-To/Attempt seed — thay đổi ngữ nghĩa
   hiển thị của Evidence, ảnh hưởng trực tiếp tới nguyên tắc Evidence ở §1.1.
2. Tạo "ảnh trông thật hơn" để thay placeholder hiện tại — về bản chất là ngụy tạo bằng
   chứng, vi phạm chính nguyên tắc sản phẩm đang cố gắng bảo vệ.

Cả hai cần founder xác nhận, không phải tôi tự quyết. Khuyến nghị: chụp ảnh thật cho ít
nhất Bánh xèo (How-To thật duy nhất) trước khi coi trải nghiệm duyệt là đại diện cho sản
phẩm thật.

## 3. Hiệu năng — ghi nhận, chưa sửa

Đăng nhập trên production mất **9–15 giây** (đo qua Playwright, có lặp lại) từ lúc bấm
"Đăng nhập" tới khi điều hướng xong về trang chủ — nút hiển thị "Đang đăng nhập…" suốt
thời gian đó. Server Action trả về đúng (`x-action-redirect` header có mặt, không có
lỗi), nhưng độ trễ này đủ dài để một người dùng thật nghi ngờ nút đã "chết". Không nằm
trong phạm vi audit thị giác — cần điều tra riêng (cold start Fluid Compute, hay số lượt
gọi Supabase khi revalidate trang chủ sau đăng nhập).

## 4. Điểm số các màn hình chính

Thang 1-10. Không chấm cao giả tạo — xem cột "Điểm yếu nhất" cho lý do cụ thể.

| Màn hình | Phân cấp thị giác | Typography | Spacing | Hình ảnh | Rõ ràng tương tác | IA | Mobile | Riêng biệt | Tổng thể |
|---|---|---|---|---|---|---|---|---|---|
| Trang chủ | 8 | 8 | 8 | 4 | 8 | 8 | 8 | 7 | 7 |
| Kết quả tìm kiếm | 8 | 8 | 8 | 4 | 8 | 8 | 8 | 6 | 7 |
| How-To (flagship) | 9 | 8 | 8 | 4 | 9 | 9 | 8 | 8 | 8 |
| Món (Dish) | 7 | 7 | 6 | 4 | 7 | 7 | 7 | 6 | 6 |
| Tạo/Sửa cách làm | 8 | 8 | 7 | 6 | 8 | 8 | 8 | 6 | 7 |
| Gửi Attempt Report | 8 | 8 | 8 | 6 | 9 | 8 | 8 | 8 | 8 |
| Đăng nhập/Đăng ký (sau fix) | 7 | 7 | 7 | 6 | 8 | 7 | 7 | 7 | 7 |
| Quên/Đặt lại mật khẩu (sau fix) | 6 | 7 | 6 | 5 | 7 | 7 | 7 | 6 | 6 |
| Hồ sơ (Profile) | 7 | 8 | 7 | 5 | 7 | 7 | 7 | 7 | 7 |
| Đã lưu (Saved) | 6 | 7 | 6 | 4 | 7 | 7 | 7 | 5 | 6 |

**3 điểm yếu lớn nhất của toàn sản phẩm** (không phải theo từng trang riêng lẻ, vì đây
là vấn đề hệ thống):

1. **Hình ảnh (mục 2 ở trên)** — điểm "Hình ảnh" thấp ở mọi trang vì cùng một nguyên
   nhân gốc: không có ảnh thật.
2. **"Product distinctiveness" ở các trang phụ** (Dish, Saved, Quên mật khẩu) — các
   trang này vẫn đọc như trang tiện ích generic hơn là một phần của "Verified How-To",
   dù đã cải thiện đáng kể ở nhóm trang auth sau fix lần này.
3. **Độ trễ đăng nhập trên production** (mục 3) — không phải vấn đề thị giác nhưng phá
   hỏng trải nghiệm "hiệu quả" (effortless) mà founder muốn kiểm chứng ở Attempt Report
   và luồng auth.

## 5. Product Identity Test

| Câu hỏi | Trước fix | Sau fix |
|---|---|---|
| 1. Có thể là ảnh chụp Cookpad? | Không | Không |
| 2. Có thể là trang recipe khác? | Một phần (do ảnh placeholder) | Một phần — vẫn do mục 2 |
| 3. Có thể là AI-generated website chung chung? | Có, ở 4 trang auth | Không |
| 4. Truyền tải "real people tried this"? | Không (do seed content, mục 2) | Không — chưa đổi, cần founder quyết |
| 5. Truyền tải giá trị riêng của VHKP? | Có, ở trang How-To/Attempt | Có |

Trang **How-To detail** là trang duy nhất đạt cả 5/5 tiêu chí mong muốn ngay cả trước
fix — đây thực sự là flagship page như founder kỳ vọng: cấu trúc Evidence tách biệt rõ
với nội dung How-To, "Phản hồi thực tế" đủ nổi bật, câu hỏi "điều gì đã xảy ra khi thử"
trả lời được trực tiếp bằng dữ liệu thật (kể cả khi ảnh minh họa còn yếu).

## 6. So sánh Cookpad — VHKP làm tốt hơn ở đâu

Từ nghiên cứu Cookpad đã có ở `design-gap-analysis-v4.md`:

- **Evidence/Attempt Report là khoảng trống thị trường thật** — Cookpad không có khái
  niệm nào tương đương "báo cáo lần thử thật". Trang How-To của VHKP hiện thực hóa đúng
  điều này: rail "Phản hồi thực tế" sticky, tách bạch bằng chất liệu nền + font mono cho
  dữ liệu, không gộp thành điểm số.
- **Ingredients có cấu trúc** — Cookpad chỉ có công thức dạng văn xuôi; VHKP hiển thị
  nguyên liệu dạng bảng scannable, nhóm theo phần (vỏ bánh/nhân...).
- **Dish vs How-To tách biệt** — cho phép so sánh nhiều cách làm cho cùng một món, Cookpad
  không có khái niệm này.

**Cái Cookpad vẫn làm tốt hơn:** mật độ hình ảnh thật ở mọi nơi (dù chỉ là ảnh món ăn từ
người dùng, không "verified" gì cả) — đây chính là khoảng cách ở mục 2.

## 7. Production

- Build: `next build` thành công, không lỗi TypeScript, chỉ còn warning `<img>` có sẵn
  từ trước (không thuộc phạm vi audit này).
- Deploy: `01f40d5` đã lên production (`https://verified-how-to.vercel.app`), xác nhận
  qua `vercel inspect` — status Ready.
- Verify trên production bằng Playwright thật: 5 trang chính trả 200, không console/page
  error; tạo + xóa 1 How-To test qua đúng luồng UI để xác nhận cả 2 fix (dialog center +
  auth branding) hoạt động đúng trên production, không chỉ ở dev.
- Toàn bộ dữ liệu test (2 tài khoản QA, 3 How-To test, 3 Attempt Report test, ảnh đính
  kèm, 1 saved_how_to) đã bị xóa sạch sau khi verify — đã đối chiếu số dòng
  `attempt_report`/`attempt_report_image`/`saved_how_to`/`auth.users` khớp chính xác với
  baseline trước audit (17 / 10 / 0 / 1).

## 8. Việc KHÔNG làm, và vì sao

- Không tạo/thay ảnh "trông thật hơn" cho Evidence hay hero — xem mục 2, đây là ngụy tạo
  bằng chứng, vi phạm nguyên tắc cao nhất của sản phẩm.
- Không sửa độ trễ đăng nhập trên production — cần điều tra riêng (không phải vấn đề thị
  giác), rủi ro đụng vào hạ tầng/DB config ngoài phạm vi "gate thị giác".
- Không đổi lại palette/layout của trang How-To — đã đạt 5/5 Product Identity Test, không
  có tín hiệu cụ thể nào cho thấy cần đổi (giữ đúng tinh thần §4 của `design-gap-analysis-v4.md`:
  không lặp lại thiết kế lại mà không có phản hồi cụ thể).

## 9. Câu hỏi cần founder xác nhận

1. Có muốn chụp ảnh thật cho ít nhất How-To Bánh xèo (và có thể vài Attempt Report thật)
   trước khi coi trải nghiệm duyệt sản phẩm là đại diện, hay chấp nhận placeholder cho
   tới khi có đủ nội dung thật?
2. Có cần gắn nhãn minh bạch nào đó cho nội dung seed/demo trong UI (không phải chỉ trong
   tài liệu nội bộ), hay giữ nguyên như hiện tại cho tới khi thay bằng nội dung thật?
