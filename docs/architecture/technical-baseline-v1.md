# Technical Baseline v1 — VHKP

**Trạng thái (Status):** Technical baseline — ghi nhận các quyết định đã được founder chấp nhận vào 2026-08-26 (*"founder accepted decisions recorded 2026-08-26"*). Implementation **CHƯA** bắt đầu (*"Implementation has NOT yet begun"*).
**Ngày (Date):** 2026-08-26
**Dựa trên (Based on):**
- `docs/product/discovery.md`
- `docs/product/mvp-definition.md`
- `docs/product/design-direction.md`
- `docs/architecture/technical-architecture-proposal-v1.md`
- `docs/architecture/database-schema-proposal-v1.md`

Quy ước nhãn kế thừa từ các tài liệu trước: **[QUYẾT ĐỊNH]** (đã chấp nhận), **[ĐỀ XUẤT]** (chưa chấp nhận). Tài liệu này **không** thêm quyết định mới — nó chỉ tổng hợp và phân loại lại những gì đã tồn tại ở 5 tài liệu nguồn.

**Ghi chú về phương pháp:** Tài liệu này phân biệt hai loại nội dung. (a) **Quyết định đã bỏ phiếu tường minh** — đúng 4 mục kiến trúc kỹ thuật + 2 mục schema mà founder chấp nhận rõ ràng ngày 2026-08-26 (liệt kê đầy đủ ở mục 16), cộng với các quyết định **sản phẩm** đã chốt từ trước ở `discovery.md`/`mvp-definition.md`/`design-direction.md`. (b) **Khung kiến trúc đang được đề xuất, chưa có phương án thay thế nào cạnh tranh** — ví dụ hình dạng tổng thể "một ứng dụng Next.js duy nhất, không backend riêng" hay "2 môi trường, không staging". Nhóm (b) vẫn mang nhãn [ĐỀ XUẤT] ở tài liệu nguồn — tài liệu này trình bày nó như bức tranh làm việc hiện tại (vì không có gì mâu thuẫn hay đang được cân nhắc thay thế), nhưng **không** nâng cấp nó thành "đã chấp nhận". Sự khác biệt này được ghi rõ tại từng chỗ liên quan.

---

## 1. Purpose

Tài liệu này **đóng băng (freeze)** các quyết định kỹ thuật đã được chấp nhận, trước khi implementation bắt đầu — để trả lời câu hỏi "cái gì đã quyết và phải được tôn trọng khi build", **không** trả lời "code nên viết chính xác như thế nào".

Tường minh:

- Tài liệu này **không thay thế** 5 tài liệu nguồn — nó chỉ tổng hợp.
- Phạm vi sản phẩm tiếp tục do `mvp-definition.md` quản lý.
- Định hướng UX/thị giác tiếp tục do `design-direction.md` quản lý.
- Chi tiết kiến trúc kỹ thuật tiếp tục do `technical-architecture-proposal-v1.md` quản lý.
- Chi tiết đề xuất database schema tiếp tục do `database-schema-proposal-v1.md` quản lý.
- Tài liệu này **chỉ ghi lại** các quyết định đã được chấp nhận.
- Tài liệu này **không cấp phép** để implement bất kỳ đề xuất nào chưa được chấp nhận.

## 2. Baseline Status

### Đã chấp nhận (Accepted)

- Toàn bộ phạm vi sản phẩm MVP ở `mvp-definition.md` (vòng lặp, F1–F6, hành vi xóa cascade, tiêu chí thành công, non-goals) — đã chấp nhận từ trước.
- Toàn bộ định hướng UX/thị giác ở `design-direction.md` — đã chấp nhận từ trước.
- 4 quyết định kiến trúc kỹ thuật: Next.js App Router + TypeScript, Vercel, Supabase Postgres + Supabase Storage (cùng project), password-gate không bật ban đầu.
- 2 quyết định schema: `how_to.description` nullable, RLS bật trên cả 4 bảng.

### Đề xuất / Chưa chấp nhận (Proposed / Not Yet Accepted)

- Toàn bộ nội dung còn lại mang nhãn [ĐỀ XUẤT] trong `technical-architecture-proposal-v1.md` (ví dụ: chi tiết bảo mật, môi trường, deployment, observability, luồng upload ảnh cụ thể) — xem mục 11.
- Toàn bộ nội dung còn lại mang nhãn [ĐỀ XUẤT] trong `database-schema-proposal-v1.md` (UUID, cách biểu diễn `result`, index cụ thể, tên cột/constraint cụ thể ngoài 2 mục đã chấp nhận) — xem mục 11.
- Không có gì trong mục này được phép âm thầm chuyển từ "đề xuất" sang "quyết định".

## 3. Accepted Technical Stack

**[QUYẾT ĐỊNH — chấp nhận 2026-08-26]**

| Thành phần | Đã chọn | Vì sao (không phát minh lý do mới, lấy nguyên từ tài liệu nguồn) |
|---|---|---|
| Frontend/application framework | Next.js, App Router, TypeScript | Một ứng dụng duy nhất vừa là frontend vừa chứa logic server (Server Actions), khớp đúng 4 màn hình + 1 dialog của MVP; TypeScript giảm lỗi khi có hỗ trợ sinh code (`technical-architecture-proposal-v1.md` §4.1). |
| Hosting | Vercel | First-party cho Next.js (cùng công ty), ít rủi ro tương thích Server Actions trong 7 ngày (`technical-architecture-proposal-v1.md` §4.5). |
| Database | Supabase Postgres | Bền vững qua các lần deploy serverless, quan hệ tự nhiên cho How-To → Attempt Report (`technical-architecture-proposal-v1.md` §4.3). |
| Storage ảnh | Supabase Storage | Cùng project với database — giảm số vendor/tài khoản cần quản lý (`technical-architecture-proposal-v1.md` §4.4). |
| Số project Supabase | Một project duy nhất cho cả Postgres và Storage | Đã nêu ở trên — một vendor dữ liệu duy nhất. |
| Password-gate ở tầng hosting | **Không bật ban đầu** | Lựa chọn vận hành MVP (single-user/chỉ founder); có thể bật lại sau mà không đổi phạm vi sản phẩm (`technical-architecture-proposal-v1.md` §4.6). |

## 4. Accepted Application Architecture

```
Trình duyệt (Browser)
        │
        ▼
Ứng dụng Next.js trên Vercel
  ├── UI / App Router
  └── Server-side application logic (Server Actions)
        │
        ▼
Supabase Postgres     Supabase Storage
```

**[QUYẾT ĐỊNH]** Sơ đồ trên phản ánh trực tiếp 4 quyết định đã chấp nhận ở mục 3 — không phải nội dung mới.

**[ĐỀ XUẤT, hiện không có phương án thay thế nào được cân nhắc]** Hình dạng kiến trúc mà 4 quyết định trên vận hành trong đó — theo `technical-architecture-proposal-v1.md` §2, §3, §17 — là:

- Không có backend service tách riêng khỏi ứng dụng Next.js.
- Không có REST API service như một ứng dụng độc lập.
- Không microservices.
- Không message queue.
- Không Kubernetes.
- Không Redis/cache layer riêng.
- Không background worker.

Đây là kiến trúc **duy nhất đang được đề xuất**, không có phương án thay thế nào khác đang cạnh tranh trong tài liệu nguồn — nhưng về mặt nhãn, nó vẫn là [ĐỀ XUẤT] chứ không nằm trong 4 mục đã chính thức bỏ phiếu chấp nhận. Baseline này coi đây là giả định làm việc hiện tại cho implementation, không phải một quyết định riêng biệt cần dẫn chiếu khi báo cáo "đã chấp nhận".

## 5. Accepted Data Model Boundary

**[QUYẾT ĐỊNH]** Mô hình khái niệm (conceptual, không phải schema) đã chấp nhận:

```
How-To
  → các Step có thứ tự
  → không hoặc nhiều Attempt Report
       → 0 đến 3 ảnh mỗi Attempt Report
```

Ghi nhận:

- `how_to.description` là **tùy chọn/nullable** (chấp nhận 2026-08-26, `database-schema-proposal-v1.md` §14, mục 1).
- **RLS được bật trên cả 4 bảng** ứng dụng: `how_to`, `how_to_step`, `attempt_report`, `attempt_report_image` (chấp nhận 2026-08-26, `database-schema-proposal-v1.md` §14, mục 2). Đây là defense-in-depth, **không** phải hệ thống authorization — MVP tiếp tục không có khái niệm người dùng.
- **Không có** thực thể người dùng (`users`) ở MVP.
- **Không có** mô hình authentication ở MVP.
- **Không có** mô hình điểm tin cậy/điểm xác minh (trust score / verification score) ở bất kỳ đâu trong mô hình dữ liệu.
- Evidence luôn là bằng chứng thô — **không** được biến đổi thành một phán quyết sự thật của hệ thống, ở bất kỳ tầng nào (dữ liệu, API, hay UI).

**Không nâng cấp thêm.** Các chi tiết schema còn lại (kiểu khóa chính, cách biểu diễn `result`, index cụ thể, tên cột/constraint ngoài `description`, chiến lược storage path...) **vẫn là [ĐỀ XUẤT]** trong `database-schema-proposal-v1.md` — xem mục 11.

## 6. Accepted Product/Architecture Constraints That Engineering Must Preserve

**[QUYẾT ĐỊNH — kế thừa từ các tài liệu product đã chấp nhận]**

### Evidence ≠ Truth

Implementation không bao giờ được ngụ ý rằng một Attempt Report hay Evidence là sự thật đã được xác minh (`discovery.md` §8, `mvp-definition.md` Phụ lục).

### Không Trust Score

Không được đưa vào bất kỳ trust score, confidence score, verification score, average rating, success percentage, hay giá trị tổng hợp tương đương nào (`mvp-definition.md` §11, `database-schema-proposal-v1.md` §9).

### Evidence vẫn là Evidence

Attempt Report đại diện cho một sự kiện/lần thử tự báo cáo (self-reported) — không phải kết luận đã thẩm định (`discovery.md` §8).

### Không AI trong MVP

Không đưa bất kỳ chức năng AI nào vào MVP (`mvp-definition.md` §11, `discovery.md` §11).

### Không authentication trong MVP

Không đưa login/signup/tài khoản người dùng vào, trừ khi phạm vi sản phẩm được thay đổi chính thức sau này (`mvp-definition.md` §11).

### Không mở rộng tính năng

Không thêm: tìm kiếm, lọc, tag, bình luận, voting, thông báo, hỗ trợ đa vertical, Community Verification thật, hay bất kỳ chức năng nào ngoài phạm vi MVP đã khóa (`mvp-definition.md` §11, §12).

### Giao diện tiếng Việt

Giao diện hiển thị cho người dùng tiếp tục là tiếng Việt, theo đúng `design-direction.md` (nguyên tắc 4, mục 7–8).

### Accessibility

Giữ nguyên các ràng buộc accessibility đã chấp nhận ở `design-direction.md` §12 (hỗ trợ dấu tiếng Việt, tương phản WCAG AA, focus state rõ ràng, tôn trọng `prefers-reduced-motion`, không truyền đạt thông tin chỉ bằng màu sắc). Không phát minh yêu cầu accessibility mới.

## 7. Accepted Storage Boundary

**[QUYẾT ĐỊNH, trừ chi tiết đã nêu là chưa chốt]**

- Ảnh của Attempt Report dùng Supabase Storage (mục 3).
- Database chỉ lưu **tham chiếu** tới ảnh, không lưu nội dung file (`technical-architecture-proposal-v1.md` §8, `database-schema-proposal-v1.md` §4.4).
- **Tối đa 3 ảnh/Attempt Report, không video** là ràng buộc **sản phẩm** đã chấp nhận (`mvp-definition.md` §4, F4) — độc lập với cơ chế database cụ thể nào enforce nó.
- Xử lý ảnh không được mở rộng thành chức năng video/media ngoài phạm vi MVP.
- Xóa một Attempt Report hoặc How-To phải xử lý các object Storage liên quan, vì xóa database **không** tự động xóa object trong Supabase Storage — đây là hệ quả kỹ thuật tất yếu của việc dùng hai hệ thống tách biệt (Postgres + Storage), không phải một lựa chọn có phương án thay thế (`technical-architecture-proposal-v1.md` §8, §15; `database-schema-proposal-v1.md` §5, §10).

**Chưa chốt, không được coi là baseline:** tên bucket cụ thể, cấu trúc storage path cụ thể, danh sách MIME type cụ thể, giới hạn kích thước file cụ thể. Các chi tiết này vẫn là [ĐỀ XUẤT] — xem mục 11.

## 8. Security Baseline

**[QUYẾT ĐỊNH, trừ chi tiết đã nêu là nguyên tắc kế thừa]**

- **RLS bật trên cả 4 bảng** (chấp nhận 2026-08-26). Lưu ý: một credential đặc quyền phía server (nếu dùng `service_role` của Supabase) sẽ bypass RLS theo thiết kế — RLS bảo vệ đúng kịch bản anon key bị dùng trực tiếp từ trình duyệt, không phải cơ chế kiểm soát cho chính Server Action (`database-schema-proposal-v1.md` §6).
- Server-side validation luôn là nguồn xác thực cuối cùng — nguyên tắc đã nêu xuyên suốt cả `technical-architecture-proposal-v1.md` §9 và `database-schema-proposal-v1.md` §6.
- Secrets không được commit vào git.
- Environment secrets thuộc về cấu hình môi trường (env var ở hosting platform), không hard-code.
- **Password-gate không bật ban đầu** (mục 3 — quyết định đã chấp nhận).
- MVP **không có authentication**.
- Thao tác phá hủy (xóa) yêu cầu xác nhận ở UI (`mvp-definition.md` §7, `design-direction.md` §9).
- Không expose credential đặc quyền ra trình duyệt.

**Không thiết kế thêm.** Tài liệu này không tạo ra một hệ thống authorization nào không tồn tại ở MVP — RLS ở đây không phải và không trở thành cơ chế phân quyền người dùng.

## 9. Deployment Baseline

```
Developer → Git repository → Vercel → Production
```

- **Vercel** là nền tảng hosting đã chấp nhận (mục 3).
- **Supabase** là nền tảng database/storage được quản lý đã chấp nhận (mục 3).
- **Local development** và **Production** là hai môi trường trong bức tranh hiện tại (`technical-architecture-proposal-v1.md` §10 — [ĐỀ XUẤT], không có phương án thay thế nào khác đang được cân nhắc).
- **Không có staging environment** trong baseline hiện tại.

Không phát minh thêm hạ tầng CI/CD ngoài những gì đã có trong tài liệu nguồn (build/deploy tự động qua git push, không pipeline riêng).

## 10. Explicit Non-Goals

Những điều **không được xuất hiện** trong implementation trừ khi được duyệt riêng:

- Backend tách riêng
- Microservices
- Kubernetes
- Message queue
- Redis
- Background worker
- Authentication
- AI
- Trust scoring
- Verification scoring
- Rating aggregation
- Analytics (observability stack đầy đủ ngoài log mặc định của Vercel)
- Search/filter/tagging
- Comments/voting
- Notifications
- Mở rộng tính năng ngoài phạm vi MVP
- Trừu tượng hóa sớm (premature abstraction)
- Hạ tầng scale sớm (premature scaling infrastructure)

Danh sách này đối chiếu khớp với `mvp-definition.md` §11–12 và `technical-architecture-proposal-v1.md` §17 — không có mục nào trong danh sách mâu thuẫn với tài liệu nguồn.

## 11. Remaining Unaccepted Technical Proposals

**Quan trọng — tài liệu này không tạo quyết định mới ở đây.**

`database-schema-proposal-v1.md` vẫn còn chứa các đề xuất kỹ thuật **chưa được chấp nhận**, ví dụ:

- Chiến lược khóa chính (UUID vs integer identity)
- Cách biểu diễn `result` (constrained TEXT vs ENUM vs lookup table)
- Index cụ thể
- Chi tiết constraint cụ thể ngoài những gì đã nêu là chấp nhận
- Định nghĩa cột cụ thể (ngoài `description`)
- Chiến lược storage path cụ thể
- Các chi tiết schema ở mức implementation khác chưa liệt kê

`technical-architecture-proposal-v1.md` cũng có thể chứa các đề xuất ở mức implementation chưa được duyệt riêng, ví dụ (không giới hạn): chiến lược connection database cụ thể, lựa chọn Supabase client/library cụ thể, cách viết Server Action cụ thể, cấu trúc route cụ thể, cấu trúc component cụ thể, cấu trúc thư mục cụ thể, cấu hình Vercel cụ thể, tên biến môi trường cụ thể, chiến lược caching, chiến lược rendering ngoài phạm vi đã chấp nhận, testing framework, CI/CD cụ thể, monitoring cụ thể.

Tất cả những mục trên **vẫn là [ĐỀ XUẤT]** — cần được giải quyết ở giai đoạn implementation hoặc được duyệt riêng, không phải bị âm thầm coi là đã chốt vì xuất hiện trong tài liệu nguồn.

## 12. Implementation Guardrails

Trong quá trình implementation:

1. Không thêm tính năng nếu chưa được duyệt sản phẩm tường minh.
2. Không thay thế quyết định kiến trúc đã chấp nhận nếu chưa được founder duyệt tường minh.
3. Không âm thầm biến đề xuất thành quyết định.
4. Ưu tiên implementation đơn giản nhất còn nhất quán với baseline.
5. Tránh future-proofing tạo ra độ phức tạp không cần thiết.
6. Giữ nguyên tắc Evidence ≠ Truth ở cả tầng dữ liệu, API, và UI.
7. Nếu implementation phát hiện một xung đột kiến trúc thật sự, dừng lại và báo cáo — không âm thầm thay đổi baseline.

## 13. Source-of-Truth Hierarchy

1. **Quyết định sản phẩm đã chấp nhận:** `docs/product/discovery.md`, `docs/product/mvp-definition.md`.
2. **Định hướng thị giác/UX đã chấp nhận:** `docs/product/design-direction.md`.
3. **Kiến trúc kỹ thuật đã chấp nhận:** `docs/architecture/technical-architecture-proposal-v1.md` — cụ thể chỉ 4 quyết định đã chấp nhận tường minh ngày 2026-08-26.
4. **Quyết định schema đã chấp nhận:** `docs/architecture/database-schema-proposal-v1.md` — cụ thể chỉ 2 quyết định đã chấp nhận tường minh ngày 2026-08-26.
5. **Baseline này:** tổng hợp ranh giới đã chấp nhận và các guardrail implementation. **Không** ghi đè lên các tài liệu nguồn.

**Nếu có xung đột:** không âm thầm giải quyết. Báo cáo lại để founder quyết định. *(Tại thời điểm viết tài liệu này, không phát hiện xung đột nào giữa 5 tài liệu nguồn.)*

## 14. Change Control

Bất kỳ thay đổi nào đối với một quyết định baseline đã chấp nhận đều cần founder duyệt tường minh.

Đề xuất ≠ quyết định.

Sự tiện lợi khi implement ≠ quyền thay đổi kiến trúc.

Yêu cầu mới trong tương lai cần được xử lý như một đề xuất/thay đổi mới, không được âm thầm chèn vào MVP hiện tại.

## 15. Current Readiness

- Phạm vi sản phẩm: **đã chấp nhận** (accepted)
- Định hướng UX/thị giác: **đã chấp nhận** (accepted)
- Kiến trúc kỹ thuật: **đã chấp nhận cho đúng các mục đã liệt kê tường minh** (accepted for the explicitly listed decisions)
- Database schema: **đã chấp nhận một phần, ở đúng mức các mục đã liệt kê tường minh** (partially accepted at the explicitly listed decision level)
- Implementation: **CHƯA bắt đầu bởi tài liệu này** (NOT started by this document)

**Bước tiếp theo: lập kế hoạch implementation (implementation planning). Việc tạo ra baseline này KHÔNG tự động cấp phép cho bất kỳ implementation nào.**

## 16. Acceptance Record

**Ngày:** 2026-08-26

**Founder đã chấp nhận:**

*Technical Architecture:*
- Next.js App Router + TypeScript
- Vercel
- Supabase Postgres + Supabase Storage (cùng một project)
- Password-gate không bật ban đầu

*Database Schema:*
- `how_to.description` là nullable
- RLS bật trên cả 4 bảng

**Mọi đề xuất khác trong `technical-architecture-proposal-v1.md` và `database-schema-proposal-v1.md` — bao gồm nhưng không giới hạn ở những mục liệt kê ở mục 11 — vẫn CHƯA được chấp nhận, mang nhãn [ĐỀ XUẤT], và cần được giải quyết riêng trước hoặc trong quá trình implementation.**
