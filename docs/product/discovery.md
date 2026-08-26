# Product Discovery — VHKP (Verified How-To Knowledge Platform)

**Trạng thái:** Nguồn sự thật hiện tại (current source of truth) cho giai đoạn Product Discovery.
**Ngày:** 2026-08-26 (Day 1)
**Phạm vi:** MVP 7 ngày, do một developer duy nhất (solo) xây dựng.
**Vertical khởi đầu:** Nấu ăn (cooking).

## Cách đọc tài liệu này

Mỗi nhận định trong tài liệu được gắn nhãn để phân biệt mức độ chắc chắn:

| Nhãn | Ý nghĩa |
|---|---|
| **[SỰ THẬT]** (Fact) | Điều đã được xác nhận, không cần kiểm chứng thêm. |
| **[GIẢ ĐỊNH]** (Assumption) | Điều được cho là đúng nhưng chưa được kiểm chứng trực tiếp; nếu sai, có thể ảnh hưởng đến thiết kế. |
| **[GIẢ THUYẾT]** (Hypothesis) | Điều mà sản phẩm đặt cược vào và MVP (hoặc các bước sau) cần kiểm chứng. |
| **[QUYẾT ĐỊNH]** (Decision) | Lựa chọn đã được founder chốt cho phạm vi hiện tại; có thể thay đổi ở giai đoạn sau nhưng không mở lại trong tuần MVP này nếu không có lý do rõ ràng. |

---

## 1. Vấn đề (Problem)

**[QUYẾT ĐỊNH]** Phát biểu vấn đề:

> Người dùng có sẵn rất nhiều nội dung How-To (hướng dẫn cách làm) trên internet, nhưng gặp khó khăn trong việc đánh giá liệu một phương pháp có thực sự hiệu quả trong thực tế hay không, trước khi họ bỏ thời gian và công sức để thử.

Đây là vấn đề rộng hơn "nội dung không được xác minh" (unverified claims) — nội dung không được xác minh là **khoảng trống chính** (key gap) gây ra vấn đề này, chứ không phải toàn bộ vấn đề. Xem mục 5.

## 2. Đối tượng người dùng (Target Users)

**[QUYẾT ĐỊNH]** Trong tuần MVP: chỉ có founder, đóng vai trò cả người viết How-To (author), người thử (tryer), và người xem bằng chứng (verifier/viewer) — mô hình *solo-seeded*. Có thể mời thêm vài người quen trực tiếp nhưng không bắt buộc.

**[QUYẾT ĐỊNH]** Đối tượng người dùng mục tiêu lâu dài (chưa phải người dùng MVP tuần này, chỉ là khung tham chiếu để định hình JTBD và giá trị sản phẩm): người nấu ăn tại nhà, thường xuyên thử công thức mới (*recipe-curious home cooks*), từng gặp trường hợp công thức không hoạt động như mô tả.

## 3. Jobs To Be Done (JTBD)

**[GIẢ THUYẾT]** — các JTBD sau được suy ra từ vấn đề, chưa được xác nhận trực tiếp bởi người dùng thật:

- Khi tôi sắp thử một công thức chưa từng làm, tôi muốn biết nó đã được ai đó thực sự làm thành công, để không lãng phí nguyên liệu và thời gian vào thứ có thể thất bại.
- Khi tôi vừa thử xong một công thức, tôi muốn có cách nhanh chóng để ghi lại kết quả, để trải nghiệm của tôi giúp ích cho người tiếp theo (và trở thành ghi chép cho chính tôi sau này).
- Khi tôi đang tìm kiếm, tôi muốn nhanh chóng đánh giá được nguồn nào đáng tin, mà không phải đọc hàng loạt bình luận không liên quan.

## 4. Các giải pháp thay thế hiện có (Existing Alternatives)

**[SỰ THẬT]**

- Blog công thức nấu ăn / content farm (tối ưu SEO)
- Video hướng dẫn trên YouTube, với phần bình luận không có cấu trúc
- Cộng đồng Reddit (r/cooking, r/recipes...), tin cậy hình thành qua upvote
- Ứng dụng công thức có đánh giá sao (AllRecipes, Serious Eats, NYT Cooking) — cơ chế gần nhất với "xác minh" hiện có
- Sách nấu ăn (cookbook) — tin cậy dựa trên uy tín tác giả/đầu bếp, không có phản hồi từ cộng đồng

## 5. Khoảng trống chưa được đáp ứng (Unmet Needs / Gaps)

**[GIẢ THUYẾT]** Khoảng trống không phải là "không có cơ chế phản hồi" — AllRecipes đã có đánh giá/review. Vấn đề là phản hồi hiện tại **không có cấu trúc và không thể kiểm chứng**: một đánh giá 5 sao có thể được viết bởi người chưa từng thực sự làm món đó. Không có gì phân biệt "tôi đã làm và đây là bằng chứng" với "nghe có vẻ ổn."

## 6. Giá trị cốt lõi (Value Proposition)

**[QUYẾT ĐỊNH]** Với người nấu ăn ham thử công thức mới, VHKP cung cấp bằng chứng có cấu trúc (kết quả thực tế + hình ảnh) từ những người đã thực sự thử — thay vì chỉ đánh giá sao hay bình luận — để người dùng có thể đánh giá độ tin cậy trước khi bỏ công sức thử.

## 7. Giả thuyết sản phẩm (Core Product Hypothesis vs. MVP Validation Hypothesis)

**[GIẢ THUYẾT] Giả thuyết sản phẩm cốt lõi (dài hạn, rộng hơn phạm vi tuần này):**

> Bằng chứng có cấu trúc ("tôi đã thử, đây là kết quả") tạo ra tín hiệu tin cậy khó giả mạo hơn và hữu ích hơn đánh giá sao — và một chuỗi bằng chứng (evidence trail) hiển thị công khai sẽ khuyến khích nhiều người hơn thử và đóng góp.

**[GIẢ THUYẾT] Giả thuyết kiểm chứng MVP (phạm vi tuần này — hẹp hơn nhiều):**

> Nếu xây dựng một luồng tối giản để tạo một How-To, thử nó, và gửi một Attempt Report có cấu trúc trong một lần thao tác, thì founder sẽ tự nguyện hoàn thành vòng lặp này ≥5 lần trên các How-To khác nhau trong 7 ngày, mà không bị friction (độ ma sát/khó chịu khi thao tác) khiến bỏ qua bước gửi bằng chứng hoặc bỏ cuộc.

Giả thuyết MVP **không** kiểm chứng giả thuyết sản phẩm cốt lõi ở trên — nó chỉ kiểm chứng một mảnh nhỏ: cơ chế có khả thi về mặt thao tác hay không. Xem mục 10.

## 8. Hành vi người dùng cốt lõi trong vòng lặp (Core User Behaviors / Loop)

**[QUYẾT ĐỊNH]** Vòng lặp MVP gồm các bước:

1. Tạo (author) một How-To — có cấu trúc: các bước thực hiện + kết quả kỳ vọng
2. Khám phá/duyệt (discover/browse) các How-To
3. Thử (try) How-To đó trong thực tế
4. Gửi **Attempt Report** — bao gồm kết quả có cấu trúc (thành công / một phần / thất bại) + ảnh (tùy chọn) + ghi chú
5. Xem danh sách Attempt Report thô (raw) gắn với một How-To — **không** có điểm tổng hợp (aggregate score), **không** có voting, **không** có thảo luận

### Bảng thuật ngữ — phân biệt bắt buộc cho MVP

**[QUYẾT ĐỊNH]** Đây là các phân biệt thuật ngữ **bắt buộc** phải giữ nguyên trong toàn bộ sản phẩm, tài liệu, và giao diện của MVP — không được dùng lẫn lộn:

| Thuật ngữ MVP (English term giữ nguyên) | Vietnamese | KHÔNG phải là |
|---|---|---|
| **Evidence** (Bằng chứng) | Một điểm dữ liệu quan sát được, chưa qua thẩm định | ≠ **Truth** (Sự thật tuyệt đối) |
| **Attempt Report** (Báo cáo lần thử) | Ghi nhận một lần thử cụ thể, chưa được xác minh | ≠ **Verification** (Xác minh) |
| **Self-report** (Tự báo cáo) | Một nguồn duy nhất, chưa được kiểm chứng chéo | ≠ **Community Verification** (Xác minh cộng đồng) |
| **Trust signal** (Tín hiệu tin cậy) | Dữ liệu thô để người xem tự diễn giải | ≠ **Trust score** (Điểm tin cậy tính toán sẵn) |

Lý do các phân biệt này quan trọng: nguyên tắc sản phẩm của VHKP là AI (và ở tuần MVP này, ngay cả chính hệ thống) **không phải là bên phán quyết sự thật cuối cùng**. "Community Verification" (Xác minh cộng đồng) trong vòng lặp sản phẩm dài hạn là một khái niệm ở giai đoạn sau, đòi hỏi nhiều người tham gia thẩm định chéo — điều mà MVP solo-seeded tuần này **không thể** và **không nên** giả vờ đã làm được.

## 9. Rủi ro và giả định (Risks and Assumptions)

- **[GIẢ ĐỊNH]** (chưa kiểm chứng tuần này, rủi ro dài hạn lớn nhất): bài toán cold-start của một marketplace ba phía (author/tryer/verifier) — được né tránh tạm thời bằng cách MVP chạy solo-seeded.
- **[GIẢ THUYẾT đang được kiểm chứng]**: việc gửi Attempt Report đủ ít friction để một người thử thật sự chịu làm.
- **[RỦI RO]** Tự kiểm chứng bởi chính founder mang thiên kiến — "tôi có muốn làm lại không" là tín hiệu yếu hơn nhiều so với động lực của người lạ. Kết quả tuần này chỉ xác nhận về mặt cơ chế/UX, **không** xác nhận sức hút thị trường (market pull).
- **[RỦI RO]** Không có phản ứng từ người khác hay tổng hợp dữ liệu, "tin cậy" hoàn toàn dựa vào việc người xem tự đọc và đánh giá bằng mắt — có thể cảm thấy thô/chưa hoàn chỉnh, nhưng đây là chủ đích của việc hoãn phần reputation.
- **[GIẢ ĐỊNH]** Nấu ăn là vertical khởi đầu phù hợp vì kết quả có thể xác minh bằng hình ảnh (một tấm ảnh cho thấy món ăn có thành công hay không) — giả định này là nền tảng cho việc dùng ảnh làm bằng chứng.

## 10. Tiêu chí thành công (Success Metrics)

**[QUYẾT ĐỊNH]**

- **Chỉ số chính:** ≥5 vòng lặp end-to-end hoàn chỉnh (tạo/chọn How-To → thử → gửi Attempt Report) do founder thực hiện, trên các How-To khác nhau, trước ngày thứ 7.
- **Chỉ số phụ (định tính):** sau mỗi vòng lặp — có muốn làm lại mà không cần ai nhắc không? Friction/điểm muốn bỏ cuộc xuất hiện ở đâu?

> **Quan trọng:** Chỉ số này chỉ xác nhận **tính khả thi của vòng lặp** (loop feasibility) — vòng lặp có thể vận hành trơn tru về mặt thao tác hay không. Nó **không** xác nhận product-market fit, không xác nhận nhu cầu thị trường, không xác nhận khả năng thu hút hay giữ chân người dùng thật (adoption/retention). Đây là hai câu hỏi khác nhau và không được nhầm lẫn khi đọc kết quả MVP.

**[QUYẾT ĐỊNH]** Không theo dõi: DAU, retention, số lượng người dùng bên ngoài, tăng trưởng — không có ý nghĩa ở quy mô solo-seeded.

## 11. Ngoài phạm vi cho MVP 7 ngày (Non-Goals)

**[QUYẾT ĐỊNH]**

- Không ra mắt công khai / đa người dùng thật
- Không có voting, phản ứng, hay thảo luận trên Attempt Report của người khác
- Không có điểm tin cậy tính toán sẵn (trust score) hay hệ thống reputation
- Không có bất kỳ tính năng AI nào (extraction, organization, comparison, moderation...) — hoãn hoàn toàn sang giai đoạn sau
- Không hỗ trợ vertical nào khác ngoài nấu ăn
- Không có hệ thống kiểm duyệt (moderation)
- Không có monetization
- Chưa chọn technology stack, chưa thiết kế database — nằm ngoài phạm vi của tài liệu Product Discovery này, sẽ được quyết định ở bước kế tiếp
