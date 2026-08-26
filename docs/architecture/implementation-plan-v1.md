# Implementation Plan v1 — VHKP MVP

**Trạng thái (Status):** Implementation plan — **không phải** implementation.
**Ngày (Date):** 2026-08-26
**Dựa trên:** `docs/product/discovery.md`, `docs/product/mvp-definition.md`, `docs/product/design-direction.md`, `docs/architecture/technical-architecture-proposal-v1.md`, `docs/architecture/database-schema-proposal-v1.md`, `docs/architecture/technical-baseline-v1.md`.

Quy ước nhãn kế thừa: **[QUYẾT ĐỊNH]** (đã chấp nhận), **[ĐỀ XUẤT]** (chưa chấp nhận). Tài liệu này **không** tạo quyết định sản phẩm/kiến trúc mới — nó chỉ sắp xếp các quyết định đã có thành trình tự thực thi.

---

## 1. Purpose

Tài liệu này tồn tại để trả lời: **"Implement theo thứ tự nào, với cổng kiểm chứng (verification gate) nào?"** — không phải "quyết định gì". Implementation **chưa bắt đầu**. Tài liệu này chuyển đổi baseline đã chấp nhận (`technical-baseline-v1.md`) thành một trình tự thực thi cụ thể — nó **không** thay đổi phạm vi sản phẩm hay kiến trúc đã chốt.

7 ngày là **hạn chót tối đa** đã được founder đặt ra, **không phải** thời lượng bắt buộc phải tiêu hết. Claude Code được kỳ vọng tăng tốc implementation đáng kể so với ước tính cho một developer làm tay — kế hoạch này phản ánh điều đó bằng cách chia nhỏ theo **vertical slice** thay vì "dự án waterfall 7 ngày".

## 2. Implementation Principles

**[ĐỀ XUẤT — nguyên tắc thực thi, kế thừa trực tiếp từ các nguyên tắc đã chấp nhận ở `technical-architecture-proposal-v1.md` §2 và `technical-baseline-v1.md` §12, không phát minh thêm]**

1. Build thứ nhỏ nhất thỏa mãn đúng MVP đã khóa.
2. Ưu tiên vertical slice hơn xây theo tầng (không build toàn bộ DB rồi mới toàn bộ UI).
3. Giữ ứng dụng "boring" và dễ hiểu.
4. Kiểm chứng từng slice trước khi sang slice tiếp theo.
5. Không build hạ tầng suy đoán (speculative infrastructure).
6. Không thêm tính năng ngoài MVP.
7. Không âm thầm xóa nhòa ranh giới đã chấp nhận / chưa chấp nhận.
8. Giữ Evidence ≠ Truth ở cả tầng database, application, và UI.
9. Accessibility là một phần của implementation, không phải một bước "làm đẹp" cuối cùng.
10. Deploy production nên xảy ra trước ngày cuối cùng, không chỉ dồn vào lúc kết thúc nếu tránh được.

## 3. MVP Capability Inventory

**[QUYẾT ĐỊNH — trực tiếp từ `mvp-definition.md`, không suy diễn thêm]**

| Capability | Nguồn |
|---|---|
| Tạo một How-To (tiêu đề bắt buộc, mô tả tùy chọn, ≥1 bước có thứ tự, kết quả kỳ vọng tùy chọn) | `mvp-definition.md` §4 F1, §7 |
| Khám phá/liệt kê How-To (mới nhất trước, không tìm kiếm/lọc) | §4 F2 |
| Xem chi tiết một How-To | §4 F3 |
| Xem Evidence/Attempt Report thô gắn với How-To | §4 F3, F5 |
| Gửi Attempt Report (kết quả bắt buộc: Thành công/Một phần/Thất bại) | §4 F4 |
| Tải lên tối đa 3 ảnh cho một Attempt Report (không video) | §4 F4, §7 |
| Xóa một Attempt Report | §4 F6 |
| Xóa một How-To (cascade: xóa toàn bộ Attempt Report + ảnh đính kèm) | §4 F6, §4 (hành vi xóa How-To) |
| Hộp thoại xác nhận cho thao tác phá hủy | §4 F6, §7, §8 |
| Trình bày responsive/mobile | `design-direction.md` §11 |
| Yêu cầu accessibility | `design-direction.md` §12 |

**Không có capability nào khác được thêm vào danh sách này.**

## 4. Vertical Slice Strategy

**[ĐỀ XUẤT]** Trình tự đề xuất — tuyến tính về phụ thuộc dữ liệu, nhưng cho phép song song một số phần không phụ thuộc lẫn nhau (xem mục 5):

Slice 0 → Slice 1 → Slice 2 → Slice 3 → Slice 4 → Slice 5 → Slice 6 → Slice 7 → Slice 8 → Slice 9 → Slice 10

Không có slice nào bị bỏ so với thứ tự đề bài gợi ý — thứ tự này khớp với chính vòng lặp cốt lõi đã chốt (`mvp-definition.md` §3): Tạo → Khám phá → Học → Thử → Gửi Attempt Report → Xóa → hoàn thiện UX → deploy → audit.

## 5. Dependency Graph

```
Slice 0 (Bootstrap)
   ↓
Slice 1 (Database Foundation)
   ↓
Slice 2 (Create How-To)
   ↓
Slice 3 (Discover)
   ↓
Slice 4 (View How-To + Evidence)
   ↓
Slice 5 (Submit Attempt Report)
   ↓
Slice 6 (Delete Attempt Report) → Slice 7 (Delete How-To)
   ↓
Slice 8 (UX / Responsive / Accessibility)
   ↓
Slice 9 (Production Deployment)
   ↓
Slice 10 (Final MVP Audit)
```

**Nơi có thể làm song song an toàn:**

- **Component thị giác tĩnh** (Phiếu Evidence, nút chọn kết quả, màu/typography theo `design-direction.md`) có thể phát triển song song với Slice 1 (Database Foundation), dùng dữ liệu giả (mock) — không phụ thuộc DB thật tồn tại.
- **Cấu hình Vercel project + biến môi trường** có thể chuẩn bị sớm, ngay sau Slice 0, thay vì để dồn tới Slice 9 — deploy một bản tối giản sớm (dù chưa đầy đủ tính năng) giúp phát hiện sự cố hạ tầng sớm, đúng nguyên tắc 10 ở mục 2. Khuyến nghị: deploy lần đầu ngay sau Slice 1 hoàn tất, sau đó mỗi slice tiếp theo tự động redeploy qua git push (đã chấp nhận ở `technical-baseline-v1.md` §9).
- Slice 6 và Slice 7 (hai luồng xóa) chia sẻ cùng một dialog xác nhận (`mvp-definition.md` §13) — có thể xây dựng component dialog dùng chung trước, rồi cắm vào cả hai luồng.

**Không cho phép song song:** không phát triển bất kỳ phần nào giả định một quyết định schema/kiến trúc khác với những gì đã chấp nhận (ví dụ không xây UI giả định có auth, có trust score) — tránh tạo xung đột kiến trúc cần dọn lại sau.

## 6. Day / Time Budget

**[ĐỀ XUẤT]** Không chia theo 7 ngày cố định. Ước lượng effort tương đối:

| Slice | Effort |
|---|---|
| 0 — Bootstrap | Small |
| 1 — Database Foundation | Small–Medium |
| 2 — Create How-To | Medium |
| 3 — Discover | Small |
| 4 — View How-To + Evidence | Medium |
| 5 — Submit Attempt Report | Medium–Large (phần mới nhất: luồng upload ảnh) |
| 6 — Delete Attempt Report | Small–Medium |
| 7 — Delete How-To | Small–Medium |
| 8 — UX/Responsive/Accessibility | Medium |
| 9 — Production Deployment | Small (nếu đã deploy sớm ở mục 5) |
| 10 — Final MVP Audit | Small |

**Critical path:** 0 → 1 → 2 → 3 → 4 → 5 → 6/7 → 8 → 9 → 10 (tuyến tính, vì mỗi slice UI cần dữ liệu thật từ slice DB trước đó để kiểm chứng đầy đủ).

**Điểm hoàn thành MVP thực tế sớm nhất:** với quy mô 4 bảng, 4 màn hình + 1 dialog, và Claude Code hỗ trợ, hoàn toàn khả thi hoàn thành trong khoảng thời gian ngắn hơn nhiều so với 7 ngày nếu không gặp trở ngại hạ tầng (ví dụ cấu hình Supabase/Vercel lần đầu) — không đưa ra con số giờ cụ thể giả tạo vì phụ thuộc vào tốc độ giải quyết các trở ngại đó.

**Hạn chót tối đa: 7 ngày.**

**Nếu MVP đạt mọi acceptance gate trước ngày thứ 7, implementation nên dừng lại thay vì tiêu tốn thời gian còn lại vào các cải tiến mang tính suy đoán.**

## 7. Implementation Order

### Slice 0 — Project Bootstrap
- **Objective:** Một ứng dụng Next.js tối thiểu chạy được ở local.
- **Inputs:** `technical-baseline-v1.md` §3 (Next.js App Router + TypeScript).
- **Work:** Khởi tạo project Next.js (App Router, TypeScript); thiết lập `.gitignore`, `.env.local` mẫu (không chứa giá trị thật).
- **Acceptance criteria:** `npm run dev` chạy, trang mặc định hiển thị được.
- **Verification method:** Chạy local, mở trình duyệt, xác nhận không lỗi console.
- **Definition of Done:** Ứng dụng khởi động sạch, không lỗi build.
- **Không được thêm:** bất kỳ thư viện UI/state management nào chưa cần thiết ở bước này.

### Slice 1 — Database Foundation
- **Objective:** Cấu trúc database Supabase tồn tại đúng theo mô hình khái niệm đã chấp nhận (`technical-baseline-v1.md` §5) cộng các lựa chọn implementation-level đã nêu ở mục 8 bên dưới.
- **Inputs:** 4 bảng khái niệm đã chấp nhận, `description` nullable, RLS bật trên cả 4 bảng.
- **Work:** Tạo project Supabase (nếu chưa có); tạo 4 bảng theo đúng ranh giới mục 8; bật RLS không policy trên cả 4 bảng; kết nối client từ ứng dụng Next.js.
- **Acceptance criteria:** Kết nối DB thành công từ ứng dụng; có thể tạo/đọc/xóa một hàng thử nghiệm qua code (không qua UI).
- **Verification method:** Một thao tác CRUD thử nghiệm tối thiểu (script hoặc route tạm) chạy thành công cho cả 4 bảng.
- **Definition of Done:** Kết nối DB ổn định, RLS xác nhận đang bật (kiểm tra qua Supabase dashboard).
- **Không được thêm:** bảng `users`, cột `user_id`, bất kỳ cột tổng hợp/điểm số nào (mục 12).
- **Lưu ý:** Tài liệu này **không** tạo SQL/migration — việc tạo bảng là công việc implementation tương lai, thực hiện theo đúng phân loại ở mục 8.

### Slice 2 — Create How-To
- **Objective:** Người dùng tạo được một How-To hợp lệ với các bước có thứ tự.
- **Inputs:** Slice 1 hoàn tất.
- **Work:** Form tạo How-To (tiêu đề, mô tả tùy chọn, danh sách bước thêm/bớt được, kết quả kỳ vọng tùy chọn); server-side action ghi How-To + Steps trong một transaction.
- **Acceptance criteria:** Không lưu được nếu thiếu tiêu đề hoặc 0 bước (`mvp-definition.md` §7); mô tả tùy chọn hoạt động đúng (để trống vẫn lưu được); tạo thành công dẫn tới trang chi tiết How-To vừa tạo.
- **Verification method:** Thử tạo với: đủ trường, thiếu tiêu đề, 0 bước, không có mô tả — quan sát hành vi đúng ở cả 4 trường hợp.
- **Definition of Done:** ≥1 bước được enforce ở tầng ứng dụng (không phải DB constraint — đã xác định rõ ở `database-schema-proposal-v1.md` §6, phần "How-To phải có ≥1 Step").
- **Không được thêm:** chức năng Edit (đã hoãn, `mvp-definition.md` §4), tag/category.

### Slice 3 — Discover
- **Objective:** Người dùng xem được danh sách How-To.
- **Inputs:** Slice 2 (cần có dữ liệu để hiển thị).
- **Work:** Trang danh sách, truy vấn tất cả How-To sắp mới nhất trước; hiển thị số lượng Attempt Report (đếm, không tổng hợp kết quả).
- **Acceptance criteria:** Mới nhất hiển thị trước; số lần thử hiển thị dạng đếm thuần; **không** điểm số/phần trăm/sao; **không** lưới ảnh kiểu Pinterest (`design-direction.md` §14).
- **Verification method:** Tạo ≥3 How-To, xác nhận thứ tự và không có phần tử bị cấm nào xuất hiện.
- **Definition of Done:** Danh sách đúng thứ tự, empty state đúng khi chưa có How-To nào (`mvp-definition.md` §8).
- **Không được thêm:** tìm kiếm, lọc, tag.

### Slice 4 — View How-To + Evidence
- **Objective:** Mở một How-To và thấy: tiêu đề, mô tả, các bước có thứ tự, kết quả kỳ vọng (nếu có), và Attempt Report thô.
- **Inputs:** Slice 2, Slice 3.
- **Work:** Trang chi tiết, hai lớp thông tin tách biệt theo `design-direction.md` §6 (chất liệu/typeface khác nhau cho How-To vs Evidence).
- **Acceptance criteria:** Evidence luôn phân biệt được bằng thị giác và ngữ nghĩa khỏi nội dung How-To; empty state đúng nguyên văn "Chưa có bằng chứng thực tế" khi chưa có Attempt Report nào (`mvp-definition.md` §8, đã chốt, không được đổi chữ).
- **Verification method:** Mở một How-To có Evidence và một How-To chưa có Evidence, xác nhận cả hai trạng thái đúng.
- **Definition of Done:** Hai lớp thông tin tuân theo ≥2 tín hiệu phân biệt đồng thời (`design-direction.md` §6).
- **Không được thêm:** bất kỳ điểm tổng hợp/trạng thái "đã xác minh" nào.

### Slice 5 — Submit Attempt Report
- **Objective:** Gửi được kết quả + ảnh tùy chọn + ghi chú tùy chọn.
- **Inputs:** Slice 4.
- **Work:** Form với 3 nút kết quả lớn (không dropdown, `design-direction.md` §9); khu tải tối đa 3 ảnh; ghi chú tùy chọn; luồng upload ảnh lên Supabase Storage trước, sau đó ghi Attempt Report + reference.
- **Acceptance criteria:** Kết quả bắt buộc (1 trong 3 giá trị); 0 ảnh vẫn hợp lệ; vượt quá 3 ảnh bị từ chối; file không phải ảnh (video, sai định dạng) bị từ chối **ở server**, không chỉ client (`mvp-definition.md` §7, `technical-architecture-proposal-v1.md` §8–9).
- **Verification method:** Thử: đủ 3 ảnh, 0 ảnh, 4 ảnh (phải bị từ chối), 1 file video (phải bị từ chối), không ghi chú.
- **Definition of Done:** Report gửi thành công xuất hiện ngay trong danh sách Evidence của How-To tương ứng.
- **Không được thêm:** video, quá 3 ảnh, chỉnh sửa report sau khi gửi (Edit đã hoãn).

### Slice 6 — Delete Attempt Report
- **Objective:** Xóa một Attempt Report qua xác nhận.
- **Inputs:** Slice 5.
- **Work:** Nút xóa → dialog xác nhận dùng chung → server action: đọc `storage_path` các ảnh liên quan → xóa object Storage → xóa hàng DB (đúng thứ tự đã chốt ở `technical-architecture-proposal-v1.md` §7.5, `database-schema-proposal-v1.md` §5).
- **Acceptance criteria:** Xác nhận hiển thị trước khi xóa; hàng DB biến mất; ảnh liên quan không còn trong bucket Storage (kiểm tra qua Supabase dashboard).
- **Verification method:** Xóa một report có ảnh, xác nhận cả DB lẫn Storage đều sạch — đây là bước kiểm tra **bắt buộc**, không được bỏ qua chỉ vì DB đã sạch.
- **Definition of Done:** Không còn object Storage mồ côi sau khi xóa.
- **Không được thêm:** soft-delete, thùng rác, undo (`mvp-definition.md` §4, §8).

### Slice 7 — Delete How-To
- **Objective:** Xóa một How-To kèm toàn bộ Attempt Report và ảnh đính kèm.
- **Inputs:** Slice 6 (dùng lại cơ chế dọn Storage).
- **Work:** Dialog xác nhận nêu rõ **số lượng** Attempt Report sẽ mất theo (`mvp-definition.md` §4, đã chốt nguyên văn yêu cầu); server action: đọc toàn bộ `storage_path` của mọi ảnh thuộc mọi Attempt Report của How-To này → xóa Storage → xóa DB (CASCADE dọn phần còn lại).
- **Acceptance criteria:** Số lượng report hiển thị đúng trong dialog; sau khi xóa, không còn hàng DB nào liên quan (How-To, Steps, Attempt Reports); không còn ảnh mồ côi trong Storage.
- **Verification method:** Tạo một How-To có ≥2 Attempt Report kèm ảnh, xóa, xác nhận sạch cả DB lẫn Storage.
- **Definition of Done:** Không có ảnh mồ côi — đây là rủi ro đã xác định tường minh ở `database-schema-proposal-v1.md` §10, phải kiểm tra thủ công ít nhất một lần.
- **Không được thêm:** cảnh báo mơ hồ hóa hậu quả xóa (dialog phải dứt khoát, không dùng motif phiếu/sổ tay — `design-direction.md` §9).

### Slice 8 — UX / Responsive / Accessibility
- **Objective:** Đưa toàn bộ luồng đã implement khớp với `design-direction.md`.
- **Inputs:** Slice 2–7 hoàn tất về mặt chức năng.
- **Work:** Áp hệ màu/typography/motif Phiếu Evidence; layout responsive (mobile-first, 1 cột; desktop 2 vùng ở trang chi tiết); áp dụng nhãn UI tiếng Việt.
- **Acceptance criteria (đối chiếu `design-direction.md` §11–14):** mobile-first hoạt động đúng; touch target ≥44px; focus state hiển thị rõ (viền Mực xanh); màu sắc không phải tín hiệu duy nhất truyền đạt kết quả (luôn kèm nhãn chữ); giao diện tiếng Việt; `prefers-reduced-motion` được tôn trọng; Evidence phân biệt thị giác rõ với How-To; **không** xuất hiện bất kỳ ngôn ngữ thị giác "đã xác minh"/checkmark/dấu mộc nào.
- **Verification method:** Duyệt thủ công trên viewport mobile và desktop; kiểm tra tab-order bằng bàn phím; kiểm tra tương phản màu đạt AA.
- **Definition of Done:** Toàn bộ anti-pattern ở `design-direction.md` §14 được xác nhận **không** xuất hiện.
- **Không được thêm:** hiệu ứng động lặp lại liên tục (chỉ animation một lần khi có phép).

### Slice 9 — Production Deployment
- **Objective:** Ứng dụng chạy trên Vercel với Supabase production.
- **Inputs:** Slice 0–8 (lý tưởng đã deploy sớm từ sau Slice 1 theo mục 5 — slice này chỉ còn là xác minh cuối, không phải lần deploy đầu tiên).
- **Work:** Cấu hình biến môi trường trên Vercel (connection string, storage key — không giá trị thật trong tài liệu này/trong git); xác nhận build production.
- **Acceptance criteria:** Build production thành công; toàn bộ luồng CRUD, upload ảnh, xóa hoạt động đúng trên URL production, không chỉ local.
- **Verification method:** Thực hiện đủ 1 vòng lặp đầy đủ (tạo → thử → gửi report → xem Evidence) **trên production**, không chỉ local.
- **Definition of Done:** Vòng lặp đầy đủ chạy được trên URL thật.
- **Không được thêm:** staging environment, CI/CD phức tạp ngoài git-push-deploy mặc định của Vercel (`technical-baseline-v1.md` §9).

### Slice 10 — Final MVP Audit
- **Objective:** Audit toàn diện sản phẩm/kỹ thuật trước khi coi MVP là "xong".
- **Inputs:** Slice 0–9 hoàn tất.
- **Work:** Đi qua toàn bộ checklist ở mục 15.
- **Acceptance criteria:** Mọi mục trong checklist mục 15 đạt.
- **Verification method:** Tự thực hiện ≥5 vòng lặp end-to-end trên các How-To khác nhau (đúng success criteria đã chốt ở `mvp-definition.md` §10) — đây chính là bài kiểm tra "thành công MVP", không phải một bước kỹ thuật riêng.
- **Definition of Done:** Xem mục 14.
- **Không được thêm:** bất kỳ điều gì — đây là bước xác nhận, không phải bước xây dựng thêm.

## 8. Database Implementation Boundary

**[QUYẾT ĐỊNH cho phần đã chấp nhận; ĐỀ XUẤT/phân loại cho phần còn lại — mục này đặc biệt cẩn trọng theo yêu cầu]**

`database-schema-proposal-v1.md` chứa cả nội dung đã chấp nhận và chưa chấp nhận. **Chỉ những điều sau đã được chấp nhận:**

- Đúng 4 thực thể khái niệm: `how_to`, `how_to_step`, `attempt_report`, `attempt_report_image`.
- `how_to.description` là nullable.
- RLS bật trên cả 4 bảng.

**Mọi chi tiết schema khác — phân loại A (implementation có thể tự quyết, không ảnh hưởng phạm vi sản phẩm/kiến trúc) hoặc B (cần founder duyệt vì ảnh hưởng phạm vi đã chốt):**

| Chi tiết chưa chấp nhận | Phân loại | Lý do |
|---|---|---|
| Kiểu khóa chính (UUID vs integer) | **A** | Chỉ ảnh hưởng biểu diễn nội bộ, không ai nhìn thấy ở UI, không đổi hành vi sản phẩm. |
| Cách biểu diễn `result` (constrained TEXT/ENUM/lookup table) | **A** | Ứng dụng luôn ánh xạ sang nhãn tiếng Việt bất kể cách lưu trữ — không ảnh hưởng người dùng. |
| Index cụ thể | **A** | Thuần túy hiệu năng nội bộ, không đổi hành vi hay dữ liệu hiển thị. |
| Tên cột cụ thể (ngoài các cột đã nêu) | **A** | Miễn không đặt tên/dùng theo cách ngụ ý điểm số hay xác minh (vi phạm mục 12 — đây là ràng buộc cứng, không phải lựa chọn tự do). |
| Chiến lược storage path / tên bucket | **A** | Chi tiết vận hành nội bộ, không đổi giới hạn "0–3 ảnh, không video" đã chốt ở sản phẩm. |
| Danh sách MIME type cụ thể | **A**, với ràng buộc: phải giữ đúng "chỉ ảnh, không video" đã chốt sản phẩm — cụ thể format nào (jpeg/png/webp hay thêm/bớt) không đổi phạm vi. |
| Giới hạn kích thước file cụ thể | **A** — chưa có tài liệu nào ghim con số; implementation chọn một giới hạn hợp lý (ví dụ vài MB/ảnh) và ghi lại lý do khi chọn, miễn không tạo ma sát bất hợp lý cho luồng gửi report. |
| Chiến lược connection database, Supabase client/library | **A** | Chi tiết kỹ thuật thuần túy. |

**Không có mục nào trong bảng trên rơi vào loại B** — không mục nào, nếu implementation tự chọn, làm thay đổi phạm vi sản phẩm đã khóa hay 6 quyết định đã chấp nhận. Xem thêm mục 17.

Tài liệu này **không** tạo SQL, không finalize các chi tiết schema chưa chấp nhận — bảng trên chỉ phân loại quyền quyết định, việc chọn giá trị cụ thể là công việc implementation.

## 9. File / Project Structure Strategy

**[ĐỀ XUẤT — nguyên tắc, không phải cây thư mục cố định]**

- Giữ cấu trúc project tối giản.
- Theo đúng quy ước Next.js App Router (routing theo file).
- Tránh trừu tượng hóa không cần thiết.
- Tránh tầng domain/service/repository sớm — chỉ thêm nếu implementation thực tế chứng minh cần thiết (ví dụ logic lặp lại ≥3 nơi).
- Cấu trúc thư mục chính xác **là một quyết định implementation-level**, chưa chấp nhận, sẽ tự nhiên hình thành khi build 4 màn hình + 1 dialog — không cần founder duyệt trước.

## 10. Testing Strategy

**[ĐỀ XUẤT]**

### Unit / logic-level
Chỉ khi có giá trị rõ ràng — cụ thể là logic validate (tiêu đề bắt buộc, ≥1 bước, kết quả hợp lệ, ≤3 ảnh, loại file hợp lệ). Thư viện validate cụ thể **chưa chấp nhận** — là quyết định implementation-level.

### Integration
- Thao tác DB: tạo/đọc/xóa cho cả 4 bảng, đặc biệt hành vi cascade khi xóa How-To.
- Thao tác Storage: upload, xóa, xác nhận không còn object mồ côi sau xóa.
- Validate: server-side từ chối đúng các trường hợp không hợp lệ (mục 11).

### End-to-end / thủ công
Cho đúng 11 luồng quan trọng sau — bắt buộc kiểm tra thủ công dù có/không có test tự động:

1. Tạo How-To
2. Khám phá
3. Mở How-To
4. Gửi Attempt Report — kết quả Thành công
5. Gửi Attempt Report — kết quả Một phần
6. Gửi Attempt Report — kết quả Thất bại
7. Tải lên ảnh
8. Xóa Attempt Report
9. Xóa How-To
10. Xác nhận hành vi responsive
11. Xác nhận accessibility cơ bản

**Framework testing cụ thể (nếu có) là quyết định implementation-level, chưa chấp nhận** — không bắt buộc phải chọn một framework nào; kiểm thử thủ công theo 11 luồng trên là mức tối thiểu đủ để tuyên bố MVP đúng, khớp tinh thần `technical-architecture-proposal-v1.md` §11 (đã đề xuất, không mâu thuẫn).

## 11. Security Verification

**[QUYẾT ĐỊNH — kế thừa `technical-baseline-v1.md` §8]**

- Server-side validation là nguồn xác thực cuối cùng cho mọi input.
- Loại file ảnh được validate.
- Giới hạn số lượng ảnh (≤3) được validate.
- Giới hạn kích thước file được validate (một khi giá trị cụ thể được implementation chọn — mục 8).
- Secrets không commit vào git.
- Credential đặc quyền không lộ ra trình duyệt.
- RLS tiếp tục bật trên cả 4 bảng trong suốt implementation.
- Thao tác phá hủy yêu cầu xác nhận UI.

**Không tạo hệ thống authentication mới** — MVP tiếp tục ẩn danh.

## 12. Evidence Integrity Guardrails

**[QUYẾT ĐỊNH — mục bắt buộc, kế thừa `discovery.md` §8, `mvp-definition.md` Phụ lục, `database-schema-proposal-v1.md` §9]**

Kiểm tra ở cả 3 tầng trong suốt implementation:

| Tầng | Kiểm tra bắt buộc |
|---|---|
| Database | Không cột `trust_score`, `verification_score`, `verified`, `confidence_score`, `success_rate`, `average_rating`, `rating`, `quality_score`, `correctness_score`, `community_score`, hay biến thể tương đương, ở bất kỳ bảng nào. Không cột tổng hợp/đếm được lưu sẵn dưới bất kỳ tên nào (kể cả tên trông vô hại). |
| Server/application logic | Không có logic tính điểm/xác suất/xếp hạng độ tin cậy từ các Attempt Report. Attempt Report luôn được xử lý như một sự kiện tự báo cáo độc lập. |
| UI | Không badge/icon "đã xác minh", không checkmark xanh kiểu verified, không con dấu/dấu mộc, không phần trăm/điểm trung bình/số sao hiển thị cạnh How-To hay Evidence. |

Đây là ràng buộc **cứng**, áp dụng cho toàn bộ implementation, không phải một checklist chỉ chạy một lần ở cuối.

## 13. Deployment Plan

**[QUYẾT ĐỊNH, trừ chi tiết đã nêu là chưa chốt]**

```
Local development → Git → Vercel → Supabase production resources
```

- Biến môi trường: connection string Postgres, key Storage — khai báo trong Vercel dashboard, không hard-code, không commit.
- Production build phải chạy sạch trước khi coi một slice là "deploy được".
- Xác minh deployment: thực hiện ít nhất một vòng lặp đầy đủ trên URL production (Slice 9).
- Rollback: Vercel giữ lịch sử các lần deploy trước — có thể rollback qua dashboard nếu một lần deploy lỗi; đây là tính năng có sẵn của platform, không phải hạ tầng CI/CD tự dựng thêm.

**Không** dựng CI/CD phức tạp. **Không** thêm staging. **Không** thêm hạ tầng monitoring ngoài log mặc định của Vercel (đã chốt `technical-baseline-v1.md` §9, §12 tương ứng ở `technical-architecture-proposal-v1.md`).

## 14. Definition of Done

**[QUYẾT ĐỊNH]** MVP chỉ được coi là hoàn thành khi:

- Toàn bộ luồng MVP đã khóa hoạt động đúng (mục 3).
- Toàn bộ acceptance criteria quan trọng đạt (mục 7, từng slice).
- Hành vi responsive hoạt động đúng.
- Yêu cầu accessibility được tôn trọng.
- Upload ảnh hoạt động đúng.
- Xóa xử lý đúng cả DB lẫn Storage, không mồ côi file.
- Deploy production hoạt động đúng.
- Không có tính năng bị cấm nào xuất hiện.
- Không tồn tại bất kỳ hình thức trust/verification scoring nào.
- Không có mở rộng tính năng ngoài ý muốn.

## 15. Final MVP Audit Checklist

**[QUYẾT ĐỊNH — mọi mục truy nguyên được tới tài liệu nguồn, không phát minh yêu cầu mới]**

**Product** (`mvp-definition.md`)
- [ ] Tạo/View/Delete How-To hoạt động; Edit không tồn tại (§4, §7)
- [ ] Tạo/View/Delete Attempt Report hoạt động; Edit không tồn tại (§4, §7)
- [ ] Không lưu How-To thiếu tiêu đề hoặc 0 bước (§7)
- [ ] Kết quả Attempt Report bắt buộc, đúng 3 giá trị (§7)
- [ ] 0–3 ảnh, không video (§4, §7)
- [ ] Xóa How-To nêu đúng số lượng Attempt Report sẽ mất (§4, §7)
- [ ] ≥5 vòng lặp end-to-end tự thực hiện thành công (§10)

**UX** (`design-direction.md`)
- [ ] Vietnamese UI cho toàn bộ copy hiển thị (§7, §8, nguyên tắc 4)
- [ ] Empty state "Chưa có bằng chứng thực tế" đúng nguyên văn (§8, `mvp-definition.md` §8)
- [ ] Evidence phân biệt ≥2 tín hiệu thị giác khỏi How-To (§6)
- [ ] Không lưới ảnh kiểu Pinterest cho danh sách How-To (§5, §14)
- [ ] Không sidebar/dashboard nav (§10, §14)

**Data**
- [ ] Đúng 4 thực thể, không thêm/bớt (`database-schema-proposal-v1.md` §3)
- [ ] Không bảng `users`, không cột `user_id` (`technical-baseline-v1.md` §5)
- [ ] `how_to.description` nullable (đã chấp nhận)
- [ ] Steps có thứ tự xác định; Images có thứ tự xác định (`database-schema-proposal-v1.md` §12, §16)

**Security**
- [ ] RLS bật trên cả 4 bảng (đã chấp nhận)
- [ ] Server-side validate là nguồn xác thực cuối cùng (`technical-architecture-proposal-v1.md` §9)
- [ ] Secrets không commit vào git
- [ ] Credential đặc quyền không lộ ra trình duyệt

**Storage**
- [ ] Ảnh lưu ở Supabase Storage, DB chỉ lưu reference (`technical-architecture-proposal-v1.md` §8)
- [ ] Xóa Attempt Report/How-To không để lại object mồ côi (`database-schema-proposal-v1.md` §10)

**Responsive**
- [ ] Mobile-first, 1 cột (`design-direction.md` §11)
- [ ] Touch target ≥44px (§11)

**Accessibility**
- [ ] Tương phản đạt WCAG AA (§12)
- [ ] Focus state hiển thị rõ (§12)
- [ ] `prefers-reduced-motion` được tôn trọng (§12)
- [ ] Kết quả không chỉ truyền đạt bằng màu sắc (§12)

**Deployment**
- [ ] Build production thành công
- [ ] Vòng lặp đầy đủ chạy được trên URL production (mục 7, Slice 9)

**Anti-patterns** (`design-direction.md` §14, `database-schema-proposal-v1.md` §9)
- [ ] Không điểm số/phần trăm/sao trung bình
- [ ] Không badge/checkmark/dấu mộc "đã xác minh"
- [ ] Không mô phỏng giấy vật lý quá mức làm giảm khả năng đọc
- [ ] Không tính năng ngoài MVP (tìm kiếm, tag, comment, voting, thông báo, AI, đa vertical)

## 16. Risks and Stop Conditions

**[ĐỀ XUẤT]**

| Rủi ro | Triệu chứng | Tác động | Phản ứng |
|---|---|---|---|
| Sự cố cấu hình Supabase (project, key, RLS) | Kết nối thất bại, lỗi quyền truy cập | Chặn toàn bộ Slice 1 trở đi | Kiểm tra key/role đúng bảng ánh xạ (RLS + service_role bypass) trước khi nghi ngờ code sai |
| Độ phức tạp xóa Storage | Ảnh mồ côi còn sót lại sau xóa | Vi phạm rủi ro đã xác định ở `database-schema-proposal-v1.md` §10 | Kiểm tra thủ công bucket sau mỗi lần test xóa ở Slice 6/7, không chỉ tin DB sạch |
| RLS cấu hình sai (ví dụ vô tình tạo policy cho phép anon) | Server Action vẫn chạy được nhưng anon key cũng truy cập trực tiếp được | Phá vỡ mục đích defense-in-depth đã chấp nhận | Xác nhận không có policy nào được tạo thêm ngoài "bật RLS, không policy" đã chấp nhận |
| Sự cố upload ảnh | Upload treo, lỗi định dạng không rõ ràng, ảnh không hiển thị | Chặn Slice 5 — phần được xác định là rủi ro/mới nhất trong toàn bộ kiến trúc | Làm sớm trong tuần (đã cảnh báo ở `technical-architecture-proposal-v1.md` §15), không để tới cuối |
| Không tương thích khi deploy (Vercel + Next.js App Router + Server Actions) | Build local ổn nhưng lỗi trên Vercel | Chặn Slice 9 | Deploy sớm (mục 5) để phát hiện sớm, không đợi tới cuối |
| Quyết định schema chưa rõ ràng | Không chắc chọn giá trị nào cho một chi tiết implementation-level | Có thể gây chậm trễ nhỏ | Tự chọn theo phân loại A ở mục 8, ghi lại lý do; nếu phát hiện một chi tiết thực ra ảnh hưởng phạm vi đã chốt (loại B chưa được nhận ra), dừng và báo cáo |

**Quan trọng:** Nếu một vấn đề implementation đòi hỏi thay đổi một quyết định sản phẩm/kiến trúc đã chấp nhận, **dừng lại và báo cáo (escalate)** thay vì âm thầm thay đổi baseline.

## 17. Founder Decision Gates

**[ĐỀ XUẤT — kết luận từ việc rà soát mục 8]**

Đã rà soát toàn bộ đề xuất còn chưa chấp nhận trong `database-schema-proposal-v1.md` và `technical-architecture-proposal-v1.md` (bảng đầy đủ ở mục 8). **Kết luận: không có mục nào trong số đó thực sự chặn việc bắt đầu implementation** — toàn bộ đều được phân loại A (implementation có thể tự quyết mà không ảnh hưởng phạm vi sản phẩm/kiến trúc đã chốt).

**Không có Founder Decision Gate nào được tạo ra ở tài liệu này.** Đây không phải vì bỏ qua sự thận trọng, mà là kết quả rà soát tường minh — nếu founder không đồng ý với phân loại A cho bất kỳ mục nào ở bảng mục 8, mục đó cần được nêu ra để chuyển sang loại B trước khi implementation chạm tới nó.

## 18. Recommended Execution Sequence

**[ĐỀ XUẤT]**

**Phase 1 — Bootstrap:** Slice 0.
**Phase 2 — Data foundation:** Slice 1 (+ deploy sớm theo mục 5).
**Phase 3 — Core How-To flow:** Slice 2, Slice 3, Slice 4.
**Phase 4 — Evidence flow:** Slice 5.
**Phase 5 — Deletion + integrity:** Slice 6, Slice 7.
**Phase 6 — UX/accessibility:** Slice 8.
**Phase 7 — Production + audit:** Slice 9, Slice 10.

Thứ tự này khớp với đề xuất gốc và không có lý do từ tài liệu nguồn để thay đổi — vòng lặp sản phẩm (`mvp-definition.md` §3) vốn đã tuyến tính theo đúng thứ tự này.

## 19. Current Readiness

- **Product:** READY
- **UX:** READY
- **Technical architecture:** READY cho các quyết định đã chấp nhận
- **Database:** READY TO IMPLEMENT trong đúng ranh giới đã chấp nhận; các chi tiết schema còn lại **không** được coi là đã được founder duyệt chỉ vì xuất hiện trong tài liệu đề xuất

**Implementation: NOT STARTED.**

**Việc tạo ra tài liệu này không cấp phép cho việc bắt đầu implementation.**

## 20. Change Control

- Thay đổi phạm vi sản phẩm cần được duyệt ở tầng sản phẩm.
- Thay đổi kiến trúc đã chấp nhận cần founder duyệt tường minh.
- Đề xuất chưa chấp nhận vẫn là đề xuất cho tới khi được chấp nhận tường minh.
- Sự tiện lợi khi implement không ghi đè lên baseline.
- Bất kỳ xung đột nào phát hiện được phải được báo cáo trước khi thay đổi baseline.
