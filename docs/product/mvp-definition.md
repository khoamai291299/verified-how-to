# MVP Definition — VHKP (Verified How-To Knowledge Platform)

**Trạng thái:** Nguồn sự thật hiện tại (current source of truth) cho phạm vi MVP 7 ngày.
**Dựa trên:** [`docs/product/discovery.md`](./discovery.md) — Product Discovery đã được chấp nhận.
**Ngày:** 2026-08-26

## Cách đọc tài liệu này

Cùng quy ước nhãn với `discovery.md`:

| Nhãn | Ý nghĩa |
|---|---|
| **[SỰ THẬT]** (Fact) | Điều đã được xác nhận, không cần kiểm chứng thêm. |
| **[GIẢ ĐỊNH]** (Assumption) | Điều được cho là đúng nhưng chưa được kiểm chứng trực tiếp. |
| **[GIẢ THUYẾT]** (Hypothesis) | Điều mà sản phẩm đặt cược vào, cần MVP kiểm chứng. |
| **[QUYẾT ĐỊNH]** (Decision) | Lựa chọn đã được founder chốt cho phạm vi MVP hiện tại. |

---

## 1. Mục tiêu MVP (MVP Objective)

**[QUYẾT ĐỊNH]** Xây dựng luồng tối giản để kiểm chứng **tính khả thi của vòng lặp cốt lõi** (loop feasibility): tạo How-To → khám phá → học → thử ngoài đời thực → gửi Attempt Report kèm bằng chứng → xem lại Evidence thô tích lũy.

> MVP này **không** kiểm chứng product-market fit, nhu cầu thị trường, hay khả năng thu hút/giữ chân người dùng thật (adoption/retention). Nó chỉ trả lời một câu hỏi hẹp: vòng lặp có vận hành trơn tru về mặt thao tác hay không.

## 2. Người dùng MVP (MVP User)

**[QUYẾT ĐỊNH]** Một người dùng ẩn danh duy nhất (founder), không đăng nhập, không tài khoản — single-user MVP. Founder đóng cả ba vai trò: người tạo How-To, người thử, người xem Evidence.

## 3. Vòng lặp cốt lõi MVP (MVP Core Loop)

**[QUYẾT ĐỊNH]**

```
Tạo How-To → Khám phá → Học → Thử ngoài đời thực → Gửi Attempt Report → Xem Evidence thô tích lũy
```

"Attempt Report" và "Evidence Submission" là **một hành động sản phẩm duy nhất**, không phải hai bước tách rời — gửi một Attempt Report tức là gửi Evidence.

## 4. Tính năng MVP (MVP Features)

**[QUYẾT ĐỊNH]**

| # | Tính năng | Mô tả |
|---|---|---|
| F1 | **How-To** — Create / View / Delete | Tiêu đề, mô tả, danh sách bước có thứ tự, kết quả kỳ vọng (tùy chọn). **Edit: hoãn lại.** |
| F2 | **Khám phá** | Danh sách tất cả How-To, mới nhất trước. Không tìm kiếm/lọc/tag. |
| F3 | **Học (chi tiết How-To)** | Xem đầy đủ nội dung How-To + danh sách Attempt Report thô đính kèm. |
| F4 | **Attempt Report** — Create / View / Delete | Kết quả có cấu trúc (**Thành công / Một phần / Thất bại**), 0–3 ảnh (không video), ghi chú tùy chọn. **Edit: hoãn lại.** |
| F5 | **Xem Evidence thô** | Danh sách Attempt Report theo thời gian. **Không** Trust Score, **không** Trust Signal tổng hợp dưới bất kỳ hình thức nào — chỉ Evidence thô, người xem tự diễn giải. |
| F6 | **Xóa (How-To & Attempt Report)** | Thao tác xóa đơn giản kèm hộp thoại xác nhận. Không undo, không thùng rác, không soft-delete. |

**[QUYẾT ĐỊNH]** Hành vi xóa How-To (đã chốt, thay thế giả định trước đó):

Khi một How-To bị xóa, **toàn bộ Attempt Report/Evidence đính kèm với nó cũng bị xóa vĩnh viễn**. Đây là chủ đích cho MVP. Trước khi xóa, UI **bắt buộc** hiển thị hộp thoại xác nhận nêu rõ: How-To sẽ bị xóa và **số lượng** Attempt Report/Evidence đính kèm sẽ bị xóa vĩnh viễn theo. Không có hệ thống soft-delete, thùng rác, undo, hay khôi phục (restore).

## 5. User Stories

- Là founder, tôi muốn tạo một How-To có cấu trúc, để có thứ để thử và chia sẻ.
- Là founder, tôi muốn xem danh sách How-To đã có, để chọn cái tiếp theo cần thử.
- Là founder, tôi muốn đọc đầy đủ một How-To trước khi thử.
- Là founder, tôi muốn ghi lại kết quả thử thực tế (kèm tối đa 3 ảnh) ngay sau khi thử.
- Là founder, tôi muốn xem toàn bộ Evidence thô của một How-To để tự đánh giá — không bị hệ thống áp đặt kết luận "đã xác minh" hay điểm số.
- Là founder, tôi muốn xóa một How-To hoặc Attempt Report tạo nhầm, với một bước xác nhận đơn giản và được cảnh báo rõ hậu quả trước khi xóa.

## 6. User Flows

**Flow A — Vòng lặp đầy đủ:**
Danh sách How-To → "Tạo How-To mới" → điền form → lưu → trang chi tiết → (thử ngoài đời) → quay lại chi tiết → "Gửi Attempt Report" → chọn kết quả + 0–3 ảnh + ghi chú → lưu → thấy report mới trong danh sách Evidence.

**Flow B — Thử How-To có sẵn:**
Danh sách How-To → chọn How-To → đọc chi tiết + Evidence hiện có → (thử) → gửi Attempt Report mới.

**Flow C — Xóa:**
Trang chi tiết How-To / danh sách Attempt Report → nút "Xóa" → hộp thoại xác nhận (nêu rõ How-To + số lượng Attempt Report sẽ bị xóa vĩnh viễn nếu có) → xác nhận → xóa, cập nhật lại danh sách/chi tiết.

## 7. Acceptance Criteria

- **F1:** Không lưu được How-To nếu thiếu tiêu đề hoặc không có bước nào. Không có chức năng "Sửa" ở MVP.
- **F3:** Trang chi tiết How-To luôn hiển thị được kể cả khi chưa có Attempt Report nào.
- **F4:** Gửi được Attempt Report hợp lệ với 0 ảnh và không ghi chú (cả hai đều tùy chọn); bắt buộc chọn 1 trong 3 giá trị kết quả; không nhận quá 3 ảnh; không nhận file video.
- **F5:** Không nơi nào trong UI hiển thị điểm số, phần trăm tổng hợp, hay chữ "đã xác minh"/"verified"/badge ngụ ý xác minh cộng đồng.
- **F6:** Xóa How-To hoặc Attempt Report bắt buộc phải qua hộp thoại xác nhận; xóa How-To phải nêu rõ số lượng Attempt Report sẽ mất kèm theo; không có edit cho cả hai entity.

## 8. Trạng thái & Edge Case bắt buộc xử lý (Required States and Edge Cases)

- Danh sách How-To rỗng (chưa tạo cái nào) → empty state, CTA "Tạo How-To đầu tiên".
- How-To chưa có Attempt Report nào → empty state nguyên văn **"Chưa có bằng chứng thực tế"**, kèm CTA rõ ràng để gửi Attempt Report đầu tiên.
- Kết quả trái ngược nhau giữa các report (một số thành công, một số thất bại) → hiển thị nguyên trạng tất cả, không gộp thành kết luận hay tính trung bình.
- Attempt Report không ảnh, không ghi chú → vẫn hợp lệ, hiển thị bình thường.
- Ảnh tải lên sai định dạng / quá lớn / vượt quá 3 ảnh / là file video → từ chối ở mức sản phẩm, thông báo lỗi rõ ràng.
- Xóa How-To đang có Attempt Report đính kèm → hộp thoại xác nhận phải nêu rõ số lượng report sẽ bị xóa vĩnh viễn theo (xem mục 4).
- Xóa xong → không có cách khôi phục; đây là hành vi được chủ đích chấp nhận cho MVP, không phải thiếu sót.

## 9. Thông tin cần cho mỗi entity cốt lõi (mức sản phẩm — KHÔNG phải database schema)

- **How-To:** tiêu đề, mô tả, danh sách bước có thứ tự, kết quả kỳ vọng (tùy chọn), thời điểm tạo.
- **Attempt Report:** liên kết tới How-To, kết quả (Thành công / Một phần / Thất bại), 0–3 ảnh, ghi chú (tùy chọn), thời điểm gửi.

Đây là thông tin ở mức khái niệm sản phẩm — thiết kế bảng, kiểu dữ liệu, khóa ngoại, v.v. thuộc về bước database design, **chưa** thực hiện trong tài liệu này.

## 10. Tiêu chí thành công MVP (MVP Success Criteria)

**[QUYẾT ĐỊNH]**

- **Chỉ số chính:** ≥5 vòng lặp end-to-end hoàn chỉnh (tạo/chọn How-To → thử → gửi Attempt Report) do founder thực hiện, trên các How-To khác nhau, trong 7 ngày.
- **Chỉ số phụ (định tính):** sau mỗi vòng lặp — có muốn làm lại mà không cần ai nhắc không? Friction xuất hiện ở đâu?

> **Quan trọng:** Các chỉ số này **chỉ** xác nhận tính khả thi của vòng lặp (loop feasibility) về mặt thao tác. Chúng **không** xác nhận product-market fit, không xác nhận nhu cầu thị trường, không xác nhận khả năng thu hút hay giữ chân người dùng thật. Không được diễn giải kết quả MVP thành kết luận về hai điều sau.

## 11. Non-goals tường minh (Explicit Non-goals)

**[QUYẾT ĐỊNH]**

- Không auth/tài khoản
- Không tìm kiếm/lọc/tag
- Không sửa (edit) How-To hay Attempt Report
- Không voting/phản ứng/thảo luận của người khác trên Attempt Report
- Không Trust Score
- Không Trust Signal tổng hợp dưới bất kỳ hình thức nào
- Không video trong Attempt Report (tối đa 3 ảnh)
- Không tính năng AI (extraction, organization, comparison, moderation...)
- Không Community Verification thật (cần nhiều người thẩm định chéo)
- Không rating/comment
- Không đa vertical (chỉ nấu ăn)
- Không app di động riêng
- Không soft-delete/thùng rác/undo
- Chưa chọn technology stack, chưa thiết kế database — nằm ngoài phạm vi tài liệu này

## 12. Tính năng hoãn lại có chủ đích (Intentionally Deferred Features)

Auth thật, tìm kiếm/lọc/danh mục, edit How-To và Attempt Report, upload video, phản ứng/voting của người khác, Community Verification thật, Trust Score/Trust Signal tổng hợp, AI assist, thông báo (notifications), đa vertical, soft-delete/thùng rác/undo cho việc xóa.

## 13. Số màn hình / trang tối thiểu (Minimum Screens/Pages)

1. Danh sách How-To (Discover / trang chủ)
2. Tạo How-To mới
3. Chi tiết How-To (Học + danh sách Evidence thô + CTA gửi Attempt Report)
4. Form gửi Attempt Report (có thể là section/modal trong màn 3, không nhất thiết trang riêng)
5. Hộp thoại xác nhận xóa (dialog dùng chung cho How-To và Attempt Report, không phải trang riêng)

→ **4 trang thật sự + 1 dialog** — đủ nhỏ cho một developer xây dựng và triển khai trong phần thời gian còn lại của 7 ngày.

---

## Phụ lục: Phân biệt thuật ngữ bắt buộc (kế thừa từ discovery.md §8)

**[QUYẾT ĐỊNH]** Các phân biệt sau **bắt buộc** giữ nguyên trong toàn bộ MVP — sản phẩm, tài liệu, giao diện:

| Thuật ngữ MVP | Vietnamese | KHÔNG phải là |
|---|---|---|
| **Evidence** (Bằng chứng) | Một điểm dữ liệu quan sát được, chưa qua thẩm định | ≠ **Truth** (Sự thật tuyệt đối) |
| **Attempt Report** (Báo cáo lần thử) | Ghi nhận một lần thử cụ thể, chưa được xác minh | ≠ **Verification** (Xác minh) |
| **Self-report** (Tự báo cáo) | Một nguồn duy nhất, chưa được kiểm chứng chéo | ≠ **Community Verification** (Xác minh cộng đồng) |
| **Trust signal** (Tín hiệu tin cậy) | Dữ liệu thô để người xem tự diễn giải | ≠ **Trust score** (Điểm tin cậy tính toán sẵn) |

MVP không được, ở bất kỳ đâu trong UI hay copy, tuyên bố một How-To là "đã xác minh" (verified). Nó chỉ trưng ra Evidence thô từ các lần thử thực tế, để người xem tự đánh giá.
