# Design Direction — VHKP (Verified How-To Knowledge Platform)

**Trạng thái:** Nguồn sự thật hiện tại (current source of truth) cho định hướng thị giác và UX của MVP.
**Dựa trên:** [`docs/product/discovery.md`](./discovery.md), [`docs/product/mvp-definition.md`](./mvp-definition.md) — đã được chấp nhận.
**Ngày:** 2026-08-26
**Phạm vi:** Định hướng thiết kế cho 4 trang + 1 dialog của MVP. Không bao gồm: lựa chọn framework, database schema, hay code triển khai.

Cùng quy ước nhãn với các tài liệu trước: **[SỰ THẬT]**, **[GIẢ ĐỊNH]**, **[GIẢ THUYẾT]**, **[QUYẾT ĐỊNH]**.

---

## 1. Nguyên tắc thiết kế (Design Principles)

**[QUYẾT ĐỊNH]**

1. **Bằng chứng thật, không phải xác nhận hệ thống.** Mọi quyết định thị giác phải giữ Evidence tách biệt rõ ràng khỏi Truth, Verification, Trust Score, và bất kỳ hình thức phán quyết nào của hệ thống. Đây là ràng buộc cao nhất, vượt trên mọi lựa chọn thẩm mỹ.
2. **Ngôn ngữ thị giác, không phải mô phỏng vật lý.** Motif "sổ tay / phiếu giấy" là một ngôn ngữ hình ảnh có chủ đích (visual language) để phân biệt hai lớp thông tin — không phải nỗ lực tái tạo giấy thật (full skeuomorphism). Khi ngôn ngữ thị giác và khả năng đọc/sử dụng xung đột, **khả năng đọc, accessibility và usability luôn thắng**.
3. **Hai lớp thông tin, luôn phân biệt được.** Nội dung How-To (tường thuật, do người viết tạo ra) và Evidence (sự kiện tự báo cáo, do người thử ghi lại) phải luôn phân biệt được bằng mắt, ở mọi kích thước màn hình.
4. **Tiếng Việt là ngôn ngữ chính của toàn bộ giao diện người dùng.** Thuật ngữ tiếng Anh (How-To, Attempt Report, Evidence...) là ngôn ngữ làm việc trong tài liệu sản phẩm/kỹ thuật để nối với `discovery.md` và `mvp-definition.md` — **không** phải copy hiển thị cho người dùng. Xem mục 7 và 8 để biết bản dịch UI cụ thể.
5. **Không thêm tính năng ngoài phạm vi MVP đã khóa.** Thiết kế chỉ phục vụ 4 trang + 1 dialog đã được chốt ở `mvp-definition.md` §13.

## 2. Nhận diện thị giác (Visual Identity)

**[QUYẾT ĐỊNH]** Ý tưởng cốt lõi: **"Sổ tay bằng chứng"** — VHKP trông như một cuốn sổ tay công thức được nhiều người góp vào, với các "phiếu" ghi nhận từng lần thử được xếp lại theo thời gian. Không phải food blog (ảnh bóng bẩy), không phải mạng xã hội (feed cuộn vô hạn), không phải SaaS dashboard (sidebar, widget).

**Lưu ý văn hóa quan trọng:** Chủ động **tránh hoàn toàn** motif con dấu đỏ / dấu mộc, huy hiệu checkmark, hay bất kỳ icon nào gợi ý "chứng nhận chính thức" — trong văn hóa Việt Nam, con dấu đỏ gắn với xác nhận chính thống, mâu thuẫn trực tiếp với nguyên tắc Evidence ≠ Truth.

## 3. Hệ màu (Color System)

**[QUYẾT ĐỊNH]**

| Tên | Hex | Vai trò |
|---|---|---|
| **Giấy** | `#E8E5DB` | Nền chính — giấy tái chế hơi xám, không phải tông kem/cream điển hình |
| **Mực** | `#26251F` | Màu chữ chính |
| **Mực xanh** | `#2A4A78` | Accent chính: link, trạng thái được chọn, focus ring |
| **Bìa kraft** | `#C9A97B` | Bề mặt riêng cho khu vực Evidence — đánh dấu "lớp thông tin khác" |
| **Đỏ gạch** | `#A8412F` | CHỈ dùng cho hành động xóa/cảnh báo và nhãn "Thất bại" — không dùng cho badge xác nhận |
| **Rêu** | `#5B7A5A` | Nhãn "Thành công" — mô tả một sự kiện tự báo cáo, không phải điểm số |
| Hổ phách (phụ) | `#B4863A` | Nhãn "Một phần" |

**Ràng buộc:** không dùng bất kỳ tổ hợp màu nào tạo cảm giác "seal of approval" (ví dụ khung viền vàng kim, huy hiệu xanh lá + viền tròn kiểu verified-checkmark).

## 4. Typography

**[QUYẾT ĐỊNH]**

- **Be Vietnam Pro** — dùng cho tiêu đề và nội dung chính. Hỗ trợ đầy đủ dấu tiếng Việt, tránh serif tương phản cao (cliché phổ biến của thiết kế AI-generated).
- **IBM Plex Mono** — dùng riêng cho dữ liệu trên Evidence: timestamp, số lần thử. Tạo ra một "giọng đọc" khác biệt rõ ràng khỏi văn bản tường thuật của How-To — đây là cơ chế chính để phân biệt hai lớp thông tin (mục 6), không chỉ là trang trí.
- Thang chữ giữ đơn giản: 1 cỡ display, 1 cỡ heading phụ, 1 cỡ body, 1 cỡ caption/mono. Không cần thêm vai trò typography nào khác cho MVP.

## 5. Bố cục (Layout)

**[QUYẾT ĐỊNH]**

- **Trang chi tiết How-To (desktop):** hai vùng — nội dung How-To (khoảng 65% chiều rộng) và khu Evidence (khoảng 35%), Evidence có thể sticky khi cuộn.
- **Trang chi tiết How-To (mobile):** một cột — How-To trước, Evidence sau. Cách trình bày Evidence trên mobile là quyết định UX còn mở (xem mục 15).
- **Danh sách Khám phá:** danh sách dọc kiểu "mục lục sổ tay" (tiêu đề, mô tả ngắn, chỉ báo số lần thử) — **không** dùng lưới ảnh kiểu Pinterest/Instagram.
- **Form Tạo How-To / Gửi báo cáo thử:** bố cục dọc, một cột, tối giản chrome.

## 6. Cấu trúc thông tin (Information Hierarchy)

**[QUYẾT ĐỊNH]** Hai lớp thông tin phải phân biệt được bằng ít nhất hai tín hiệu thị giác đồng thời (không chỉ một):

| Tín hiệu | Lớp How-To | Lớp Evidence |
|---|---|---|
| Chất liệu nền | Giấy | Bìa kraft |
| Typeface | Be Vietnam Pro | IBM Plex Mono (cho dữ liệu) + Be Vietnam Pro (cho ghi chú) |
| Giọng nội dung | Tường thuật, hướng dẫn | Sự kiện rời rạc, có dấu thời gian |
| Sắp xếp | Tuyến tính theo các bước | Theo thời gian, không sắp theo "độ tin cậy" |

Không được gộp hai lớp này vào cùng một khối thị giác (ví dụ không nhúng Evidence trực tiếp vào giữa các bước How-To).

## 7. Trình bày How-To

**[QUYẾT ĐỊNH]** Đọc như một trang sổ tay: tiêu đề → mô tả ngắn → danh sách bước có thứ tự → kết quả kỳ vọng (nếu có). Nhãn UI tiếng Việt (thay cho thuật ngữ tài liệu "How-To"):

| Thuật ngữ tài liệu | Nhãn UI tiếng Việt đề xuất |
|---|---|
| How-To | **Cách làm** |
| Create How-To | **Tạo cách làm mới** |
| Discover | **Khám phá** |
| Expected outcome | **Kết quả mong đợi** |

**[GIẢ ĐỊNH — cần một vòng review copy riêng]** Đây là bản dịch đề xuất, chưa phải bản copy cuối cùng.

## 8. Trình bày Evidence / Attempt Report

**[QUYẾT ĐỊNH]** Element chữ ký (signature) của sản phẩm: **Phiếu Báo Cáo Thử** — một khối nhỏ trên nền kraft, có thể nghiêng nhẹ (≤1.5°, có thể tắt hoàn toàn ở view danh sách dày đặc nếu ảnh hưởng khả năng scan), viền trên gợi ý đường xé/lỗ đục **bằng CSS đơn giản** (dashed/dotted border), không dùng texture ảnh raster mô phỏng giấy thật. Nội dung: timestamp (mono), kết quả bằng **chữ thường** ("Thành công" / "Một phần" / "Thất bại" — không icon huy hiệu), ảnh (nếu có), ghi chú.

Nhãn UI tiếng Việt:

| Thuật ngữ tài liệu | Nhãn UI tiếng Việt đề xuất |
|---|---|
| Attempt Report / Evidence Submission | **Báo cáo đã thử** (hành động) / **Bằng chứng** (danh sách hiển thị) |
| Submit Attempt Report (CTA) | **Gửi báo cáo đã thử** |
| Empty evidence state | **"Chưa có bằng chứng thực tế"** *(đã chốt nguyên văn ở `mvp-definition.md` §8, không đổi)* |

**Ràng buộc bắt buộc:** không hiển thị điểm trung bình, phần trăm, số sao, hay bất kỳ hình thức tổng hợp nào cạnh danh sách Evidence.

## 9. UX cho form

**[QUYẾT ĐỊNH]**

- **Tạo Cách làm:** các trường xếp dọc; danh sách bước có nút thêm/bớt dòng; không lưu được nếu thiếu tiêu đề hoặc không có bước nào (theo `mvp-definition.md` §7).
- **Gửi báo cáo đã thử:** 3 lựa chọn kết quả dạng nút lớn, dễ chạm (không dropdown); khu tải ảnh tối đa 3 ô; ghi chú là textarea đơn giản. Toàn bộ đều tùy chọn trừ kết quả — mục tiêu là giảm friction tối đa vì đây là giả thuyết đang được kiểm chứng (`discovery.md` §9).
- **Xác nhận xóa:** modal đơn giản, rõ ràng, **không** áp dụng motif phiếu/sổ tay — hành động phá hủy cần dứt khoát, không mơ hồ hóa bằng trang trí. Nêu rõ số lượng Attempt Report sẽ mất theo nếu xóa How-To (`mvp-definition.md` §4).

## 10. Điều hướng (Navigation)

**[QUYẾT ĐỊNH]** Tối giản có chủ đích: thanh trên cùng chỉ gồm wordmark + nút "Tạo cách làm mới". Không sidebar, không menu nhiều cấp, không dashboard — phù hợp MVP single-user, không auth.

## 11. Hành vi responsive

**[QUYẾT ĐỊNH]**

- Mobile-first, một cột cho toàn bộ nội dung chính.
- Touch target tối thiểu 44px, đặc biệt cho 3 nút chọn kết quả và nút xóa.
- Cách trình bày Evidence trên mobile (rail cuộn ngang hay danh sách dọc) **không được hard-code trong định hướng này** — xem mục 15.

## 12. Khả năng tiếp cận (Accessibility)

**[QUYẾT ĐỊNH]**

- Be Vietnam Pro và IBM Plex Mono đều hỗ trợ đầy đủ dấu tiếng Việt.
- Tương phản nền Giấy (`#E8E5DB`) / chữ Mực (`#26251F`) và các cặp màu khác phải đạt tối thiểu WCAG AA.
- Trạng thái focus hiển thị rõ ràng bằng viền Mực xanh (`#2A4A78`), không dựa vào màu sắc đơn thuần (kèm thay đổi độ đậm/viền).
- Tôn trọng `prefers-reduced-motion` — mọi animation (ví dụ phiếu mới trượt vào) phải có phương án tĩnh thay thế.
- Không truyền đạt thông tin (đặc biệt là kết quả Thành công/Một phần/Thất bại) chỉ bằng màu sắc — luôn kèm nhãn chữ.

## 13. Nguyên tắc tương tác (Interaction Principles)

**[QUYẾT ĐỊNH]**

- 3 nút kết quả trong form báo cáo có thể tô màu (Rêu/Hổ phách/Đỏ gạch) nhưng luôn đi kèm nhãn chữ — đây là mô tả một sự kiện tự báo cáo, không phải điểm chấm của hệ thống.
- Phiếu Evidence mới gửi có thể có hiệu ứng chuyển động nhẹ, một lần (không lặp lại, không ambient animation liên tục).
- Không có thao tác nào (hover, tap, animation) được phép ngụ ý "đã xác minh" hay tạo cảm giác trang trọng/chính thống hơn mức một ghi chú cá nhân.

## 14. Anti-pattern tường minh (Explicit Anti-patterns)

**[QUYẾT ĐỊNH]** Những điều **không được làm** trong thiết kế MVP:

- Không hiển thị điểm số, phần trăm tổng hợp, hay đánh giá sao trung bình cho một Cách làm.
- Không dùng badge/icon "đã xác minh", checkmark xanh kiểu verified, hay con dấu/dấu mộc dưới bất kỳ hình thức nào.
- Không mô phỏng giấy vật lý quá mức (texture ảnh nhám, bóng đổ dày, hiệu ứng 3D) làm giảm độ tương phản hoặc khả năng đọc — motif phiếu/sổ tay chỉ là ngôn ngữ thị giác nhẹ (mục 1.2).
- Không dùng lưới ảnh kiểu Pinterest/Instagram cho danh sách Cách làm.
- Không thêm sidebar, nav nhiều cấp, hay widget kiểu SaaS admin dashboard.
- Không thêm tính năng ngoài phạm vi MVP đã khóa: không tìm kiếm/lọc/tag, không bình luận/voting, không thông báo, không AI, không đa vertical.
- Không trộn tiếng Anh vào copy hiển thị cho người dùng, trừ khi không có cách diễn đạt tiếng Việt tự nhiên (hiếm khi xảy ra ở UI, xem mục 7–8).

## 15. Quyết định UX còn mở, cần kiểm chứng khi triển khai (Open UX Decisions)

**[GIẢ THUYẾT — chưa chốt, để lại cho giai đoạn triển khai]**

- **Evidence trên mobile:** rail cuộn ngang hay danh sách dọc xếp chồng? Không hard-code — cần thử cả hai với nội dung thật và chọn dựa trên khả năng scan thực tế.
- **Độ nghiêng của phiếu Evidence:** giữ hiệu ứng nghiêng nhẹ hay bỏ hẳn nếu gây rối mắt ở danh sách dài? Cần đánh giá khi có ≥5 phiếu thật trên một Cách làm.
- **Vị trí nút "Tạo cách làm mới" trên mobile:** trong thanh header cố định hay nút nổi (FAB)?
- **Chỉ báo số lần thử trên card danh sách Khám phá:** icon nhỏ + số, hay chỉ text thuần? Cần thử nghiệm trực quan.
- **Bản dịch UI tiếng Việt ở mục 7–8:** là đề xuất ban đầu, cần một vòng review copy riêng trước khi khóa làm chuẩn cuối cùng.

---

*Tài liệu này không bao gồm lựa chọn công nghệ frontend, thiết kế database, hay code triển khai — các bước đó nằm ngoài phạm vi giai đoạn UX/Product Design.*
