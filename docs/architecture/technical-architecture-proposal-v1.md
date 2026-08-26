# Technical Architecture Proposal v1

**Trạng thái:** ĐỀ XUẤT (proposed) ban đầu → **4 quyết định kỹ thuật cốt lõi đã được founder CHẤP NHẬN vào 2026-08-26** (xem "Trạng thái chấp nhận" ngay dưới đây). Các khuyến nghị khác trong tài liệu (còn mang nhãn [ĐỀ XUẤT]) **chưa** được duyệt — việc chấp nhận 4 quyết định cốt lõi không tự động chốt toàn bộ tài liệu. Vẫn **chưa** phải implementation.
**Dựa trên:** [`docs/product/discovery.md`](../product/discovery.md), [`docs/product/mvp-definition.md`](../product/mvp-definition.md), [`docs/product/design-direction.md`](../product/design-direction.md) — cả ba đã được chấp nhận, không thay đổi bởi tài liệu này.
**Ngày tạo:** 2026-08-26 · **Ngày chấp nhận 4 quyết định cốt lõi:** 2026-08-26

## Trạng thái chấp nhận (Acceptance Status)

**[QUYẾT ĐỊNH KỸ THUẬT — chấp nhận bởi founder, 2026-08-26]** Bốn quyết định sau đã được founder chính thức chấp nhận, chuyển từ [ĐỀ XUẤT] sang [QUYẾT ĐỊNH] tại đúng các câu/mục liệt kê:

| # | Quyết định đã chấp nhận | Mục trong tài liệu |
|---|---|---|
| 1 | Next.js (App Router) + TypeScript | §4.1 |
| 2 | Vercel (hosting) | §4.5 |
| 3 | Supabase Postgres + Supabase Storage, cùng một project Supabase | §4.3, §4.4 |
| 4 | Password-gate ở tầng hosting: **không bật ở giai đoạn ban đầu** — lựa chọn vận hành MVP (single-user/chỉ founder), không phải thay đổi phạm vi sản phẩm; có thể bật lại sau mà không cần một quyết định sản phẩm mới | §4.6 |

Mọi nội dung khác trong tài liệu này còn giữ nhãn [ĐỀ XUẤT] **chưa** được founder duyệt và **không** được coi là đã chốt chỉ vì 4 quyết định trên đã được chấp nhận. Đây không phải phê duyệt toàn văn kiến trúc.

**Ghi chú về cơ chế ghi nhận:** Repo này (tại thời điểm cập nhật) chưa có hệ thống ADR/decision-log riêng (không có thư mục `docs/adr`, không có `DECISIONS.md`, chưa có README mô tả quy ước) và **chưa có commit git nào** (repo vẫn ở trạng thái "No commits yet" trên `main`). Cơ chế ghi nhận chấp nhận hiện tại là chính quy ước nhãn `[ĐỀ XUẤT]` → `[QUYẾT ĐỊNH]` cộng với block "Trạng thái chấp nhận" này — đây là quy ước đã tồn tại sẵn trong tài liệu (bảng nhãn bên dưới), không phải hệ thống mới được phát minh cho lần cập nhật này.

## Quy ước nhãn

Kế thừa nhãn từ các tài liệu product, cộng thêm một nhãn mới cho tài liệu kỹ thuật:

| Nhãn | Ý nghĩa |
|---|---|
| **[SỰ THẬT]** | Sự kiện kỹ thuật khách quan, kiểm chứng được. |
| **[GIẢ ĐỊNH]** | Điều được cho là đúng nhưng chưa kiểm chứng trực tiếp — bao gồm mọi con số về pricing/free-tier, luôn kèm ghi chú *"verify current pricing before implementation"*. |
| **[GIẢ THUYẾT]** | Điều đặt cược, cần bước sau kiểm chứng. |
| **[QUYẾT ĐỊNH]** | Quyết định đã được founder chốt — hoặc **quyết định sản phẩm** kế thừa từ 3 tài liệu product, hoặc **quyết định kỹ thuật** đã được chấp nhận tường minh (xem "Trạng thái chấp nhận" ở trên). Hai loại luôn được ghi rõ nguồn gốc tại chỗ xuất hiện. |
| **[ĐỀ XUẤT]** | Khuyến nghị **kỹ thuật** của tài liệu này — **chưa được founder duyệt**. Phần lớn lựa chọn công nghệ trong tài liệu này vẫn dùng nhãn này, trừ 4 mục đã được nâng lên [QUYẾT ĐỊNH]. |

---

## 1. Architecture Objective

**[ĐỀ XUẤT]** Xây dựng kiến trúc kỹ thuật nhỏ nhất, "boring" nhất có thể, đủ để hỗ trợ đúng vòng lặp MVP đã khóa (Tạo How-To → Khám phá → Học → Thử → Gửi Attempt Report → Xem Evidence thô), triển khai được bởi một developer, thực tế có thể xong **sớm hơn** 7 ngày — 7 ngày là **giới hạn tối đa**, không phải mục tiêu. Không kiến trúc nào trong tài liệu này được phép phức tạp hơn mức cần thiết chỉ vì "còn dư thời gian trong ngân sách 7 ngày".

## 2. Architecture Principles

**[ĐỀ XUẤT]**

1. **Boring by default.** Một ứng dụng full-stack duy nhất + database quản lý + object storage quản lý — không microservices, không message queue, không Kubernetes, không cache layer, không background worker.
2. **Phép thử loại bỏ.** Với mỗi thành phần hạ tầng: *"Nếu bỏ thành phần này, MVP có còn chạy đúng không?"* — nếu có, bỏ.
3. **Không khóa engine sản phẩm vào hạ tầng.** Toàn bộ ràng buộc sản phẩm (Evidence ≠ Truth, không Trust Score, không tính năng ngoài MVP) phải được tôn trọng ở tầng kiến trúc — không mô hình dữ liệu hay API nào được vô tình tính toán/expose điểm số hay trạng thái "đã xác minh".
4. **Tối ưu tốc độ solo-dev trong 7 ngày**, không tối ưu khả năng mở rộng lý thuyết. Không thêm thành phần "để sau này khỏi phải đổi" nếu chi phí thêm ngay bây giờ lớn hơn lợi ích.
5. **Không silent thay đổi quyết định sản phẩm đã chốt.** Tài liệu này không thêm, không bớt tính năng nào so với `mvp-definition.md`.

## 3. Recommended Architecture

**[ĐỀ XUẤT]** Một ứng dụng full-stack duy nhất (frontend + application logic trong cùng một dự án, cùng một lần deploy), kết nối tới một database quan hệ được quản lý (managed) và một dịch vụ object storage được quản lý cho ảnh. Không có backend service tách riêng. Không có tầng API độc lập với UI.

So sánh ngắn với 2 phương án khác đã bị loại:
- **Tách frontend (SPA) + backend riêng (Express/Fastify)** — hai service, hai lần deploy, cần xử lý CORS — thừa ceremony cho 4 màn hình, 1 dev.
- **Chỉ frontend, lưu hoàn toàn trên trình duyệt (không backend nào)** — không có nơi lưu bền vững qua nhiều thiết bị/phiên làm việc, không có đường tiến hóa tự nhiên sang multi-user thật (mục 16) — bị loại vì vi phạm chính nguyên tắc "không khóa cứng vào một hướng đi cụt".

## 4. Technology Choices

### 4.1 Frontend

**[QUYẾT ĐỊNH KỸ THUẬT — chấp nhận 2026-08-26]** **Next.js (App Router, TypeScript)**.

- Routing theo file khớp gần đúng với 4 màn hình + 1 dialog đã chốt ở `mvp-definition.md` §13.
- Server Actions cho phép viết hàm xử lý (tạo How-To, gửi Attempt Report, xóa...) chạy trên server, gọi thẳng từ form — loại bỏ hẳn nhu cầu viết một tầng API REST riêng.
- **[SỰ THẬT]** Next.js được duy trì bởi Vercel — kéo theo lựa chọn hosting ở mục 4.5 (first-party support, ít ma sát nhất).
- So sánh: SvelteKit gọn hơn nhưng hệ sinh thái/tài liệu nhỏ hơn — rủi ro tốc độ nếu vướng mắc kỹ thuật lạ trong tuần có hạn. Remix tương tự Next nhưng công cụ hosting/upload ảnh phổ biến kém hơn. TypeScript thay vì JavaScript: chi phí thêm gần như bằng 0 với tooling hiện tại, đổi lại giảm lỗi khi Claude Code hỗ trợ sinh code.

### 4.2 Application / Backend

**[ĐỀ XUẤT]** Không có backend service riêng. "Backend" = một tập hợp nhỏ Server Actions/route handlers **trong cùng dự án Next.js**: tạo/xóa How-To, tạo/xóa Attempt Report, upload ảnh. Không có framework backend riêng (không Express/Nest/Django...).

### 4.3 Database

**[QUYẾT ĐỊNH KỸ THUẬT — chấp nhận 2026-08-26]** **Supabase Postgres** (managed, free tier).

So sánh:
- **SQLite file cục bộ** — zero setup nhưng hầu hết host serverless (kể cả phương án hosting đề xuất ở 4.5) có filesystem tạm thời — dữ liệu **mất khi redeploy**. Loại.
- **Supabase Postgres (đề xuất)** — bền vững qua các lần deploy, quan hệ tự nhiên How-To → nhiều Attempt Report, cùng vendor với storage (mục 4.4) → giảm số tài khoản/dashboard cần quản lý.
- **Neon (serverless Postgres)** — cũng rất phù hợp, nổi bật ở tính năng branch database nhanh; tuy nhiên không có storage/auth đi kèm, sẽ cần thêm một vendor riêng cho ảnh — nhiều thành phần hơn Supabase cho cùng một kết quả.
- **Railway Postgres / Render Postgres** — khả thi, nhưng **[GIẢ ĐỊNH — verify current pricing]** free tier của các dịch vụ này gần đây có xu hướng chuyển sang dạng dùng-thử-có-hạn hơn là free tier vĩnh viễn — rủi ro chi phí bất ngờ cao hơn Supabase/Neon tại thời điểm viết tài liệu này.
- **Firebase Firestore** — NoSQL, không khớp tự nhiên với quan hệ 1-nhiều How-To → Attempt Report; loại vì lệch model dữ liệu không cần thiết.

### 4.4 Image Storage

**[QUYẾT ĐỊNH KỸ THUẬT — chấp nhận 2026-08-26]** **Supabase Storage** (cùng vendor với database, cùng một project Supabase).

- **Lưu ảnh dạng blob/base64 trong DB** — không cần vendor riêng nhưng làm phình bảng, phục vụ ảnh kém hiệu quả, không phải pattern chuẩn cho ảnh dù nhỏ. Loại.
- **Object storage riêng (đề xuất)** — chỉ lưu reference/URL dạng text trong DB; free tier dư dùng cho tối đa 3 ảnh/report ở quy mô 1 người dùng.
- **Cloudinary** — dịch vụ ảnh chuyên dụng (transform, tối ưu tự động) nhưng MVP không cần xử lý ảnh gì ngoài lưu/hiển thị nguyên bản — thêm một vendor thứ ba không cần thiết. Loại cho MVP, có thể cân nhắc lại khi cần tối ưu ảnh thật sự.
- **Vercel Blob** — khả thi nếu host trên Vercel, nhưng khi đó tổng số vendor dữ liệu vẫn là 2 (Vercel Blob + Supabase DB) thay vì 1 (Supabase DB + Storage cùng chỗ). Supabase Storage đơn giản hơn về tổng thể vận hành.

### 4.5 Hosting / Deployment

**[QUYẾT ĐỊNH KỸ THUẬT — chấp nhận 2026-08-26]** **Vercel**.

Đánh giá theo các tiêu chí yêu cầu:

| Tiêu chí | Vercel | Netlify |
|---|---|---|
| Free-tier phù hợp MVP | **[GIẢ ĐỊNH — verify current pricing]** Có, đủ cho 1 người dùng | **[GIẢ ĐỊNH — verify current pricing]** Có, đủ cho 1 người dùng |
| Độ phức tạp setup | Rất thấp — git push là deploy | Thấp — tương tự, thêm bước cấu hình adapter cho Next.js App Router |
| Tốc độ deploy | Nhanh, vài phút | Nhanh, tương đương |
| Developer experience | **[SỰ THẬT]** First-party cho Next.js (cùng công ty) — Server Actions, App Router hỗ trợ đầy đủ ngay khi phát hành | Tốt cho hầu hết framework, nhưng hỗ trợ Next.js qua adapter riêng — lịch sử có độ trễ/giới hạn với tính năng Next.js mới nhất |
| Hỗ trợ upload ảnh | Không lưu file bền vững gốc (serverless) — cần storage ngoài (đã chọn Supabase) | Tương tự — cần storage ngoài |
| Tích hợp database | Không có DB gốc, kết nối ngoài qua env var — tốt | Tương tự — kết nối ngoài qua env var |
| Quản lý environment variables | UI tốt, tách biệt theo Production/Preview/Development | UI tốt, tách biệt theo context tương tự |
| Local development | `next dev` chuẩn, không cần CLI đặc thù | `netlify dev` bọc thêm một lớp, không bắt buộc |
| Độ tin cậy cho MVP nhỏ | Cao | Cao |
| Rủi ro chi phí bất ngờ | **[GIẢ ĐỊNH — verify current pricing]** Thấp ở quy mô 1 người dùng | **[GIẢ ĐỊNH — verify current pricing]** Thấp ở quy mô 1 người dùng |
| Khó khăn di chuyển sau này | Trung bình — vài tính năng đặc thù Vercel (Edge runtime, ISR chi tiết) cần điều chỉnh nếu chuyển host | Trung bình — tương tự, ít khóa hơn nếu không dùng Next.js |
| Tương thích dev solo + Claude Code | **[SỰ THẬT]** Next.js là framework phổ biến nhất trong tài liệu/ví dụ hỗ trợ code AI hiện nay — giảm ma sát khi cần hỗ trợ sinh code | Tốt nhưng thấp hơn một chút cho riêng Next.js App Router |

**Kết luận:** Vercel được chọn **không phải vì phổ biến**, mà vì đây là vendor cùng công ty với framework đã chọn (Next.js) — giảm rủi ro tương thích cụ thể với Server Actions trong 7 ngày. Netlify là phương án thay thế hợp lệ, rủi ro thấp, nên cân nhắc lại nếu muốn giảm phụ thuộc vào hệ sinh thái Vercel.

Các lựa chọn khác đã xem xét và loại: **Cloudflare Pages/Workers** — cần adapter riêng cho Next.js, một số tính năng App Router chưa hỗ trợ đầy đủ, thêm rủi ro không cần thiết. **Railway/Render** — phù hợp hơn cho ứng dụng cần server chạy liên tục (long-running process), không cần thiết cho một app serverless CRUD nhỏ. **Firebase Hosting** — kéo theo hệ sinh thái Firebase (Firestore) lệch khỏi lựa chọn Postgres quan hệ ở mục 4.3.

### 4.6 Optional Supporting Services

Không có dịch vụ hỗ trợ bắt buộc nào khác.

**[QUYẾT ĐỊNH KỸ THUẬT — chấp nhận 2026-08-26]** Password-gate (deployment protection) ở tầng hosting: **không bật ở giai đoạn ban đầu**. Đây là lựa chọn vận hành cho MVP — phù hợp vì MVP là single-user/chỉ founder sử dụng — không phải thay đổi phạm vi sản phẩm, và không mâu thuẫn với non-goal "không auth" đã chốt ở `mvp-definition.md` (đây là cấu hình hạ tầng, không phải tính năng auth trong sản phẩm). Có thể bật lại bất cứ lúc nào sau này mà không cần một quyết định sản phẩm mới — xem mục 9.

## 5. Architecture Diagram

```
Trình duyệt (Desktop / Mobile)
        │
        ▼
Ứng dụng Next.js (Vercel)
  ├─ Trang (App Router: danh sách, tạo, chi tiết, dialog xóa)
  └─ Server Actions (tạo/xóa How-To, tạo/xóa Attempt Report, upload ảnh)
        │                                   │
        ▼                                   ▼
Supabase Postgres                  Supabase Storage
(How-To, Attempt Report,           (ảnh của Attempt Report,
 tham chiếu ảnh)                    tối đa 3 ảnh/report)
```

Không có thành phần nào khác giữa trình duyệt và ứng dụng (không CDN riêng cấu hình thủ công, không API gateway, không load balancer riêng — các thứ này do Vercel/Supabase quản lý ngầm nếu có, không phải thứ ta tự dựng).

## 6. Core Data Relationships

*Chỉ ở mức khái niệm — KHÔNG phải database schema, không bảng, không kiểu dữ liệu, không khóa.*

- **How-To** → chứa một danh sách các bước có thứ tự (ordered steps) → có **không hoặc nhiều** Attempt Report.
- **Attempt Report** → thuộc về đúng một How-To → có một kết quả (Thành công / Một phần / Thất bại) → có thể tham chiếu **0 đến 3 ảnh** → có ghi chú tùy chọn → có thời điểm gửi.
- **Ảnh (image reference)** → thuộc về đúng một Attempt Report → được lưu ở object storage, chỉ có **tham chiếu** (không phải nội dung file) nằm cùng dữ liệu Attempt Report.
- Xóa một How-To → kéo theo xóa toàn bộ Attempt Report thuộc về nó (đã chốt ở `mvp-definition.md` §4, không phải quyết định kỹ thuật mới) → kéo theo xóa toàn bộ ảnh tham chiếu bởi các Attempt Report đó (xem mục 8).

## 7. Request / Data Flows

### 7.1 Create How-To
Trình duyệt gửi form (tiêu đề, mô tả, danh sách bước, kết quả kỳ vọng tùy chọn) → Server Action validate dữ liệu (server-side, xác thực cuối cùng) → nếu hợp lệ, ghi một bản ghi How-To mới vào Postgres → trả về, điều hướng tới trang chi tiết How-To vừa tạo.

### 7.2 Discover How-Tos
Trình duyệt tải trang danh sách → trang (Server Component) truy vấn Postgres lấy toàn bộ How-To, sắp mới nhất trước → render danh sách, kèm số lượng Attempt Report cho mỗi How-To (đếm, không tổng hợp kết quả).

### 7.3 View How-To + Evidence
Trình duyệt tải trang chi tiết theo id → truy vấn Postgres lấy How-To + toàn bộ Attempt Report liên quan (kèm tham chiếu ảnh) → render nội dung How-To và danh sách Evidence thô theo thời gian, không tính toán gì thêm.

### 7.4 Submit Attempt Report
Trình duyệt chọn kết quả + tối đa 3 ảnh + ghi chú tùy chọn → ảnh được tải lên Supabase Storage trước (hoặc trong cùng một Server Action) → Server Action validate (kết quả bắt buộc, số ảnh ≤3, loại file hợp lệ) → ghi bản ghi Attempt Report vào Postgres kèm tham chiếu ảnh đã upload → trang chi tiết cập nhật danh sách Evidence.

### 7.5 Delete Attempt Report
Trình duyệt xác nhận qua dialog xóa dùng chung → Server Action xóa các ảnh tham chiếu khỏi Supabase Storage **trước hoặc cùng lúc** → xóa bản ghi Attempt Report khỏi Postgres → cập nhật lại danh sách Evidence hiển thị.

### 7.6 Delete How-To + Attached Evidence
Trình duyệt xác nhận qua dialog xóa (nêu rõ số lượng Attempt Report sẽ mất theo, đã chốt ở `mvp-definition.md`) → Server Action lấy toàn bộ Attempt Report thuộc How-To này → xóa toàn bộ ảnh liên quan khỏi Storage → xóa toàn bộ bản ghi Attempt Report → xóa bản ghi How-To → điều hướng về danh sách. Đây là thao tác nhiều bước cần thực hiện tuần tự đáng tin cậy ở tầng ứng dụng (xem rủi ro "ảnh mồ côi" ở mục 15) vì Postgres và Storage là hai hệ thống tách biệt — xóa một dòng DB không tự động xóa file trong storage.

## 8. Image Upload Architecture

**[ĐỀ XUẤT]**

- **Luồng upload:** người dùng chọn ảnh trong form Attempt Report → kiểm tra nhanh phía client (số lượng ≤3, định dạng) chỉ để phản hồi tức thời, **không phải ranh giới bảo mật** → ảnh được gửi lên Supabase Storage → storage trả về reference/URL → reference này được lưu cùng bản ghi Attempt Report khi tạo.
- **Storage ownership:** một bucket dành riêng cho ứng dụng này, chỉ chứa ảnh Attempt Report — không dùng chung với dữ liệu khác, không cho phép liệt kê thư mục công khai.
- **URL/reference strategy (mức kiến trúc):** DB chỉ lưu tham chiếu (đường dẫn/URL) tới ảnh trong storage, không lưu nội dung file. Việc đặt tên/tổ chức đường dẫn cụ thể là chi tiết implementation, chưa quyết ở đây.
- **Deletion behavior:** xóa Attempt Report hoặc How-To phải chủ động xóa ảnh liên quan khỏi storage — đây **không** xảy ra tự động chỉ vì xóa dòng DB (hai hệ thống độc lập). Đây là trách nhiệm tường minh của Server Action xóa (mục 7.5, 7.6).
- **Validation boundary:** ranh giới xác thực **thật sự** nằm ở server — loại file (chỉ nhận ảnh: jpeg/png/webp), giới hạn kích thước file, giới hạn 3 ảnh/report, từ chối video — validate lại phía server bất kể client đã kiểm tra gì, vì client có thể bị bỏ qua/giả mạo.

## 9. Security and Validation

**[ĐỀ XUẤT]** — mức bảo mật tối thiểu phù hợp, **không** over-engineer cho MVP 1 người dùng:

- **Anonymous access:** toàn bộ ứng dụng không yêu cầu đăng nhập (đã chốt ở product docs) — nghĩa là bất kỳ ai có link đều tạo/xóa được dữ liệu. Đây là rủi ro sản phẩm đã được founder chấp nhận, không phải lỗ hổng cần vá bằng code — giảm thiểu ở tầng vận hành: không công khai/không index link, và **tùy chọn** bật password-gate ở tầng hosting (không phải tính năng auth trong sản phẩm).
- **Thao tác phá hủy (xóa):** yêu cầu xác nhận rõ ràng ở UI (đã chốt `design-direction.md` §9) — không cần thêm cơ chế phía server ngoài việc thực thi đúng logic xóa tuần tự ở mục 7.5–7.6.
- **Image upload validation:** allow-list loại file + giới hạn kích thước + giới hạn số lượng, thực thi **phía server**, độc lập với kiểm tra phía client.
- **Basic abuse protection:** dựa vào bảo vệ mặc định của hosting platform (rate-limit/DDoS cơ bản) — **không** xây hệ thống chống lạm dụng riêng cho MVP.
- **Server-side validation:** mọi input (How-To, Attempt Report, file) validate ở server bất kể client đã kiểm tra — nguồn xác thực duy nhất nằm ở server.
- **Environment secrets:** connection string DB, key storage lưu dưới dạng biến môi trường trong hosting platform, không commit vào git; `.env.local` nằm trong `.gitignore` khi phát triển cục bộ.
- **Database / storage credentials:** dùng key có quyền hạn thấp nhất đủ dùng cho thao tác từ trình duyệt (nếu có); mọi thao tác ghi/xóa thực hiện qua Server Action ở server, key có quyền cao (nếu cần) **không bao giờ** lộ ra phía trình duyệt.
- **Xóa ảnh an toàn:** xem mục 8 — trách nhiệm tường minh của tầng ứng dụng, không mặc định.
- **Tránh lộ file không liên quan:** bucket storage chỉ chứa ảnh của ứng dụng này, không dùng chung bucket đa mục đích, không bật liệt kê thư mục công khai.

## 10. Environment Strategy

**[ĐỀ XUẤT]** Hai môi trường: **Local development** và **Production**. Không thêm staging — quy mô 1 người dùng, rủi ro thấp, không có lý do đủ mạnh để biện minh chi phí duy trì một môi trường thứ ba.

Biến môi trường cần thiết (mức khái niệm, không giá trị thật):
- Connection string tới Postgres (Supabase).
- Key/URL kết nối tới Storage (Supabase).
- Cả local dev lẫn production dùng **cùng một** project Supabase (không tách dev/prod database) — chấp nhận được ở quy mô founder tự kiểm thử; đây là điểm cần xem lại đầu tiên nếu quy mô tăng.

## 11. Deployment Strategy

**[ĐỀ XUẤT]**

```
Developer → Git repository → Vercel (build + deploy tự động) → Production URL
```

- **Build:** Vercel tự chạy build Next.js khi có push lên nhánh chính — không cần cấu hình CI riêng.
- **Deploy:** tự động theo git push, không cần lệnh deploy thủ công.
- **Environment configuration:** biến môi trường khai báo trong dashboard Vercel (mục 10), không hard-code trong code.
- **Kết nối database/storage:** ứng dụng đọc connection string/key từ biến môi trường tại runtime, kết nối tới project Supabase đã tạo sẵn (không tự dựng DB trong quá trình deploy).

## 12. Observability

**[ĐỀ XUẤT]** Tối thiểu, không dựng observability stack đầy đủ:

- **Application errors:** dựa vào log mặc định của Vercel (build log + runtime log của Server Actions) — đủ để founder tự debug khi tự kiểm thử.
- **Deployment failures:** Vercel báo trực tiếp trong dashboard/qua email khi build/deploy thất bại — không cần thêm công cụ.
- **Basic logs:** log lỗi server-side qua console log tiêu chuẩn, xem trong Vercel dashboard.
- **Không** tích hợp Sentry hay bất kỳ dịch vụ theo dõi lỗi chuyên dụng nào — không cần thiết ở quy mô 1 người dùng tự kiểm thử trong 7 ngày.

## 13. Free-Tier / Cost Considerations

- **[GIẢ ĐỊNH — verify current pricing before implementation]** Vercel Hobby tier: đủ cho 1 ứng dụng, 1 người dùng — cần kiểm tra giới hạn bandwidth/execution hiện hành trước khi triển khai.
- **[GIẢ ĐỊNH — verify current pricing before implementation]** Supabase free tier: đủ cho lượng dữ liệu và ảnh cực nhỏ của MVP (vài chục How-To, vài chục Attempt Report, tối đa 3 ảnh/report) — cần kiểm tra giới hạn dung lượng DB/storage và chính sách "dự án tạm ngưng khi không hoạt động" hiện hành.
- **[SỰ THẬT]** Ở quy mô 1 người dùng solo-seeded (không traffic bên ngoài), khả năng vượt free tier trong 7 ngày là rất thấp bất kể con số chính xác hiện tại.
- Không có chi phí nào phát sinh từ các thành phần đã loại bỏ (không server riêng, không message queue, không dịch vụ giám sát trả phí).

## 14. Alternatives Considered

| Thành phần | Đề xuất | Thay thế đã xem xét | Lý do không chọn thay thế |
|---|---|---|---|
| Hosting | **Vercel** | **Netlify** | Next.js là sản phẩm cùng công ty với Vercel — hỗ trợ Server Actions/App Router first-party, ít rủi ro tương thích hơn trong 7 ngày. Netlify vẫn là lựa chọn hợp lệ, rủi ro thấp. |
| Hosting (khác) | — | Cloudflare Pages/Workers | Cần adapter riêng cho Next.js App Router, một số tính năng chưa hỗ trợ đầy đủ. |
| Hosting (khác) | — | Railway / Render | Phù hợp hơn cho server chạy liên tục — không cần thiết cho app serverless CRUD nhỏ. |
| Database | **Supabase Postgres** | Neon | Neon là Postgres serverless rất tốt, nhưng không có storage/auth đi kèm — thêm một vendor riêng cho ảnh. |
| Database (khác) | — | Firebase Firestore | NoSQL, lệch khỏi mô hình quan hệ tự nhiên How-To → Attempt Report. |
| Storage | **Supabase Storage** | Vercel Blob | Khả thi, nhưng tách storage khỏi DB làm tăng tổng số vendor thay vì gộp lại. |
| Storage (khác) | — | Cloudinary | Dịch vụ ảnh chuyên dụng — MVP không cần xử lý/transform ảnh, thêm vendor không cần thiết. |

## 15. Architectural Risks

**Rủi ro: Vendor lock-in (Vercel + Supabase)**
→ Vì sao quan trọng: Server Actions và một số quy ước Next.js gắn khá chặt với Vercel; Supabase là lớp trừu tượng trên Postgres nhưng vẫn có API riêng cho Storage.
→ Giảm thiểu cho MVP: dữ liệu cốt lõi vẫn là Postgres chuẩn (di chuyển được sang bất kỳ Postgres host nào); Next.js tự nó chạy được trên nhiều host khác.
→ Giải quyết ngay hay hoãn: **Hoãn** — không đáng để trả giá bằng phức tạp hơn chỉ để tránh lock-in ở quy mô MVP.

**Rủi ro: Giới hạn free-tier (Vercel/Supabase)**
→ Vì sao quan trọng: nếu founder mời thêm vài người bạn dùng thử, traffic/dung lượng có thể chạm giới hạn free tier nhanh hơn dự tính.
→ Giảm thiểu: quy mô solo-seeded khiến khả năng này rất thấp trong 7 ngày; theo dõi dashboard usage nếu mời thêm người.
→ Giải quyết ngay hay hoãn: **Hoãn**, theo dõi khi cần.

**Rủi ro: Chi phí lưu trữ ảnh**
→ Vì sao quan trọng: ảnh là loại dữ liệu duy nhất có thể phình dung lượng nhanh hơn text.
→ Giảm thiểu: giới hạn cứng 3 ảnh/report (đã chốt sản phẩm) tự nhiên giới hạn tổng dung lượng; không cần thêm nén/resize ở MVP.
→ Giải quyết ngay hay hoãn: **Hoãn** — giới hạn 3 ảnh đã đủ kiểm soát.

**Rủi ro: Giới hạn database**
→ Vì sao quan trọng: free tier Postgres thường giới hạn dung lượng và số kết nối đồng thời.
→ Giảm thiểu: quy mô dữ liệu MVP (vài chục bản ghi) nằm rất xa mọi giới hạn free tier hợp lý.
→ Giải quyết ngay hay hoãn: **Hoãn**.

**Rủi ro: Độ phức tạp triển khai**
→ Vì sao quan trọng: mỗi vendor thêm vào là một điểm có thể gây trễ trong 7 ngày.
→ Giảm thiểu: kiến trúc đã tối giản còn 2 vendor dữ liệu (Supabase) + 1 vendor hosting (Vercel) — không thể giảm thêm mà vẫn có DB/storage bền vững.
→ Giải quyết ngay hay hoãn: đã giải quyết bằng chính lựa chọn kiến trúc này.

**Rủi ro: Truy cập ẩn danh có thể thực hiện thao tác phá hủy**
→ Vì sao quan trọng: bất kỳ ai có link đều xóa được How-To/Attempt Report vĩnh viễn, không soft-delete.
→ Giảm thiểu: link không công khai; xác nhận xóa bắt buộc ở UI; tùy chọn password-gate ở tầng hosting nếu founder muốn thêm lớp an toàn.
→ Giải quyết ngay hay hoãn: **Giải quyết ngay ở mức tối thiểu** (không công khai link + xác nhận UI) — đã nằm trong phạm vi thiết kế hiện tại, không cần thêm gì.

**Rủi ro: Ảnh "mồ côi" khi xóa dữ liệu**
→ Vì sao quan trọng: Postgres và Storage là hai hệ thống tách biệt — nếu Server Action xóa DB row mà quên xóa file storage, ảnh cũ tồn đọng vô thời hạn, âm thầm tốn dung lượng.
→ Giảm thiểu: mục 7.5–7.6 đã quy định rõ thứ tự xóa storage trước/cùng DB — đây là điểm cần đặc biệt chú ý khi implement.
→ Giải quyết ngay hay hoãn: **Giải quyết ngay** — phải đúng ngay từ lần implement đầu tiên của luồng xóa, không phải thứ hoãn được vì ảnh hưởng trực tiếp tới tính đúng đắn của tính năng xóa đã chốt.

**Rủi ro: Di chuyển sang multi-user thật trong tương lai**
→ Vì sao quan trọng: MVP hiện không có khái niệm "chủ sở hữu" dữ liệu.
→ Giảm thiểu: mô hình quan hệ How-To/Attempt Report hiện tại có thể thêm `user_id` mà không cần thiết kế lại — Postgres quan hệ vốn phù hợp cho việc này.
→ Giải quyết ngay hay hoãn: **Hoãn**, đúng theo `mvp-definition.md` (auth thật là tính năng hoãn lại có chủ đích).

**Rủi ro: Community Verification trong tương lai**
→ Vì sao quan trọng: nếu triển khai sai, dễ vô tình tính toán một "điểm tin cậy" — vi phạm nguyên tắc Evidence ≠ Truth.
→ Giảm thiểu: kiến trúc hiện tại không có bất kỳ trường/logic tổng hợp nào — không có gì để "gỡ bỏ nhầm" khi mở rộng, vì nó chưa từng tồn tại.
→ Giải quyết ngay hay hoãn: **Hoãn**, cần một vòng discovery/design riêng khi tới lúc.

**Rủi ro: Tích hợp AI trong tương lai**
→ Vì sao quan trọng: AI hỗ trợ có thể vô tình trở thành "bên phán quyết sự thật" nếu thiết kế không cẩn thận (vi phạm nguyên tắc cốt lõi của sản phẩm).
→ Giảm thiểu: kiến trúc MVP hoàn toàn không có AI — không có gì cần tháo gỡ; khi thêm, cần tuân thủ lại nguyên tắc "AI assist, not authority" đã nêu ở `discovery.md`.
→ Giải quyết ngay hay hoãn: **Hoãn**, ngoài phạm vi MVP.

## 16. Future Evolution

**[GIẢ THUYẾT — phác thảo hướng đi, không thiết kế chi tiết]**

- **Nhiều người dùng + Authentication:** thêm Supabase Auth (cùng vendor đã dùng) + bảng người dùng; thêm `user_id` vào How-To/Attempt Report.
- **Community Verification / Trust signal:** cần một vòng product discovery riêng để định nghĩa lại cẩn thận, tránh vô tình tạo ra Trust Score — kiến trúc hiện tại không cản trở việc này vì chưa có logic tổng hợp nào tồn tại để phải gỡ.
- **AI assistance:** có thể thêm như một lớp hỗ trợ riêng (ví dụ hỗ trợ soạn How-To) mà không chạm vào mô hình dữ liệu cốt lõi hiện tại — miễn giữ nguyên tắc AI không phán quyết.
- **Thêm vertical ngoài nấu ăn:** mô hình How-To/Attempt Report hiện tại không có giả định gắn cứng với nấu ăn ở mức kiến trúc — có thể mở rộng bằng cách thêm phân loại, không cần đổi kiến trúc nền.
- **Media phong phú hơn (video...):** object storage đã chọn hỗ trợ mọi loại file — giới hạn "chỉ ảnh, tối đa 3" là ràng buộc sản phẩm, không phải giới hạn kỹ thuật của storage.
- **Quy mô lớn hơn:** Postgres + object storage quản lý đều còn dư sức chứa rất xa so với nhu cầu bước kế tiếp hợp lý (hàng trăm–hàng nghìn người dùng nhỏ) trước khi cần cân nhắc kiến trúc khác.

Kiến trúc MVP này **không khóa cứng** bất kỳ hướng đi nào ở trên — không có thành phần nào cần tháo dỡ để mở rộng, chỉ có thành phần cần thêm vào.

## 17. Explicitly Out of Architecture Scope

**[ĐỀ XUẤT]** Không xây dựng trong kiến trúc MVP này:

- Không backend/API service tách riêng khỏi ứng dụng Next.js.
- Không hệ thống authentication/authorization.
- Không microservices, message queue, event bus.
- Không Kubernetes hay container orchestration.
- Không Redis hay cache layer riêng.
- Không background worker/job queue.
- Không observability stack đầy đủ (APM, error tracking chuyên dụng).
- Không staging environment.
- Không CDN cấu hình thủ công riêng (dùng mặc định của hosting platform).
- Không hệ thống chống lạm dụng tùy chỉnh.
- Không pipeline xử lý/resize ảnh tùy chỉnh.
- Không bất kỳ trường/API/cấu trúc dữ liệu nào tính toán trust score, verification status, confidence score, tỷ lệ thành công tổng hợp, hay rating trung bình.

## 18. Recommendation Summary

**[QUYẾT ĐỊNH KỸ THUẬT — 4 mục cốt lõi, chấp nhận 2026-08-26]** Next.js (App Router, TypeScript) — một ứng dụng full-stack duy nhất, không backend riêng — triển khai trên **Vercel**, dữ liệu và ảnh lưu ở **Supabase** (Postgres + Storage, cùng một project/vendor), password-gate hosting không bật ban đầu. Bốn lựa chọn này đã được founder chấp nhận chính thức.

**[ĐỀ XUẤT — phần còn lại, chưa duyệt]** Hai môi trường: local dev (dùng chung project Supabase) và production. Không observability stack, không staging, không auth, không AI, không tổng hợp trust score ở bất kỳ đâu trong kiến trúc — đúng và chỉ đúng những gì `mvp-definition.md` yêu cầu. Các điểm này chưa được founder duyệt riêng, dù không mâu thuẫn với 4 quyết định đã chấp nhận hay với các tài liệu product.

---

## Open Technical Decisions

**Cập nhật 2026-08-26:** Cả 4 mục dưới đây đã được founder chấp nhận (xem "Trạng thái chấp nhận" ở đầu tài liệu). Không còn mục nào "open" trong danh sách ban đầu này. Nội dung gốc được giữ nguyên bên dưới để lưu vết (audit trail); mỗi mục có thêm dòng kết quả chấp nhận.

Chỉ liệt kê quyết định thực sự cần founder duyệt trước khi implement — không tạo quyết định giả.

**1. Frontend framework**
- Đề xuất: Next.js (App Router, TypeScript)
- Thay thế: SvelteKit
- Vì sao quan trọng: quyết định này ảnh hưởng tới toàn bộ cách viết Server Actions, routing, và tương thích hosting (mục 4.5).
- Hệ quả nếu trì hoãn: không thể bắt đầu khởi tạo dự án hay viết bất kỳ code nào.
- **→ Đã chấp nhận bởi founder, 2026-08-26: Next.js (App Router) + TypeScript.**

**2. Hosting platform**
- Đề xuất: Vercel
- Thay thế: Netlify
- Vì sao quan trọng: ảnh hưởng tốc độ deploy và mức độ ma sát với Server Actions của Next.js trong 7 ngày.
- Hệ quả nếu trì hoãn: không thể cấu hình deploy pipeline, không có URL production để tự kiểm thử vòng lặp.
- **→ Đã chấp nhận bởi founder, 2026-08-26: Vercel.**

**3. Database + Storage vendor**
- Đề xuất: Supabase (Postgres + Storage cùng một project)
- Thay thế: Neon (Postgres) + một object storage riêng (Vercel Blob/Cloudinary)
- Vì sao quan trọng: ảnh hưởng số lượng tài khoản/dashboard cần quản lý và độ phức tạp kết nối.
- Hệ quả nếu trì hoãn: không thể thiết kế database schema (bước kế tiếp) hay lưu trữ bất kỳ dữ liệu nào.
- **→ Đã chấp nhận bởi founder, 2026-08-26: Supabase Postgres + Supabase Storage, cùng một project Supabase.**

**4. Password-gate tùy chọn ở tầng hosting**
- Đề xuất: không bật ở giai đoạn đầu (dựa vào việc không công khai link)
- Thay thế: bật deployment protection ngay từ đầu nếu founder muốn thêm lớp an toàn cho thao tác xóa ẩn danh
- Vì sao quan trọng: đây là lựa chọn về khẩu vị rủi ro của founder, không phải quyết định kỹ thuật thuần túy — không nên tự quyết thay.
- Hệ quả nếu trì hoãn: có thể bật/tắt bất cứ lúc nào sau khi deploy, không chặn tiến độ implementation — mức ưu tiên thấp nhất trong 4 quyết định này.
- **→ Đã chấp nhận bởi founder, 2026-08-26: không bật ban đầu (lựa chọn vận hành MVP, có thể bật lại sau mà không đổi phạm vi sản phẩm).**
