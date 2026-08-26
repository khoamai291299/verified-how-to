# Database Schema Proposal v1

**Trạng thái:** Đề xuất database schema, chờ founder duyệt — chưa phải quyết định cuối cùng, chưa implementation. **Cập nhật 2026-08-26:** 2 trong số các điểm còn mở đã được founder chốt (xem mục 14) — `how_to.description` là nullable, và RLS sẽ được bật trên cả 4 bảng. Đây **không** phải chấp nhận toàn bộ tài liệu — mọi nội dung khác vẫn mang nhãn [ĐỀ XUẤT], chờ duyệt riêng.
**Ngày:** 2026-08-26
**Dựa trên:** [`docs/product/discovery.md`](../product/discovery.md), [`docs/product/mvp-definition.md`](../product/mvp-definition.md), [`docs/product/design-direction.md`](../product/design-direction.md), [`docs/architecture/technical-architecture-proposal-v1.md`](./technical-architecture-proposal-v1.md) (4 quyết định kỹ thuật cốt lõi đã chấp nhận: Next.js App Router + TypeScript, Vercel, Supabase Postgres + Supabase Storage cùng project, password-gate không bật ban đầu).
**Phạm vi:** Schema cho đúng MVP hiện tại (4 màn hình + 1 dialog, single-user ẩn danh, không auth). Không phải schema cuối cùng — chờ founder duyệt trước khi tạo migration.

Kế thừa quy ước nhãn từ các tài liệu trước: **[SỰ THẬT]**, **[GIẢ ĐỊNH]**, **[GIẢ THUYẾT]**, **[QUYẾT ĐỊNH]** (chỉ dùng cho quyết định sản phẩm/kỹ thuật đã được chấp nhận ở tài liệu nguồn), **[ĐỀ XUẤT]** (khuyến nghị của riêng tài liệu này — **chưa được duyệt**). Phần lớn nội dung tài liệu này mang nhãn [ĐỀ XUẤT] vì đây đúng nghĩa là một đề xuất mới.

---

## 1. Schema Objective

**[ĐỀ XUẤT]** Đề xuất một mô hình dữ liệu quan hệ tối thiểu trên Postgres (Supabase), đủ và chỉ đủ để hỗ trợ đúng 4 entity khái niệm đã xác lập ở các tài liệu nguồn (How-To, How-To Step, Attempt Report, Attempt Report Image), phục vụ đúng 6 luồng thao tác của MVP (tạo/khám phá/xem/gửi report/xóa report/xóa How-To). Không thêm bảng nào "vì có thể hữu ích sau này".

## 2. Schema Principles

**[ĐỀ XUẤT]**

1. **Bám sát mô hình quan hệ đã có** ở `technical-architecture-proposal-v1.md` §6 — không diễn giải lại, chỉ cụ thể hóa thành bảng/cột.
2. **Evidence ≠ Truth ở tầng dữ liệu, không chỉ tầng UI.** Không cột nào trong schema được phép là điểm số, trạng thái xác minh, hay bất kỳ giá trị tổng hợp nào — xem mục 9.
3. **Không bảng `users`, không cột `user_id`.** MVP ẩn danh, không auth — đã chốt ở `mvp-definition.md`.
4. **Trung thực về ranh giới enforcement.** Nếu Postgres không thể enforce một ràng buộc bằng constraint đơn giản, tài liệu này nói rõ điều đó thay vì giả vờ — xem mục 6.
5. **Quan hệ, không blob.** Steps và Images là bảng con riêng, không JSONB/mảng — xem mục 11.
6. **Tối thiểu index.** Chỉ thêm index khi có truy vấn MVP thật sự cần — xem mục 7.

## 3. Proposed Entity Model

```
How-To
  │
  ├── 1:N ── How-To Step
  │
  └── 1:N ── Attempt Report
                  │
                  └── 1:N ── Attempt Report Image
```

Không có quan hệ nào khác ngoài 3 quan hệ 1:N ở trên. Không bảng `users`. Không bảng lookup cho "result" (xem mục 11).

## 4. Proposed Tables

Quy ước đặt tên: `snake_case`, số ít (`how_to` không phải `how_tos`) — **[ĐỀ XUẤT]**, lựa chọn phong cách nhỏ, không ảnh hưởng logic.

### 4.1 How-To

| Column | Type | Required? | Default | Purpose | Constraints |
|---|---|---|---|---|---|
| `id` | UUID | NOT NULL | `gen_random_uuid()` | Khóa chính | PRIMARY KEY |
| `title` | TEXT | NOT NULL | — | Tiêu đề How-To | `CHECK (length(trim(title)) > 0)` |
| `description` | TEXT | NULL *(founder accepted 2026-08-26 — xem mục 14)* | — | Mô tả ngắn | — |
| `expected_outcome` | TEXT | NULL | — | Kết quả kỳ vọng (tùy chọn, đã chốt ở `mvp-definition.md` §9) | — |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()` | Thời điểm tạo — dùng để sắp "mới nhất trước" ở Khám phá | — |

**Không có `updated_at`.** Edit bị hoãn lại hoàn toàn ở MVP (`mvp-definition.md` §4) — một cột chỉ để "cập nhật" mà không có thao tác nào từng cập nhật nó là boilerplate vô nghĩa. Nếu Edit được thêm sau, `updated_at` nên được thêm lúc đó, không phải bây giờ.

### 4.2 How-To Step

| Column | Type | Required? | Default | Purpose | Constraints |
|---|---|---|---|---|---|
| `id` | UUID | NOT NULL | `gen_random_uuid()` | Khóa chính | PRIMARY KEY |
| `how_to_id` | UUID | NOT NULL | — | Thuộc về How-To nào | FOREIGN KEY → `how_to(id)` ON DELETE CASCADE |
| `position` | INTEGER | NOT NULL | — | Thứ tự bước (1-indexed) | `CHECK (position > 0)` |
| `instruction` | TEXT | NOT NULL | — | Nội dung bước | `CHECK (length(trim(instruction)) > 0)` |

**Constraint bổ sung ở mức bảng:** `UNIQUE (how_to_id, position)` — đảm bảo không hai bước nào của cùng một How-To trùng vị trí, và chính constraint này tạo ra index phục vụ truy vấn "lấy các bước theo thứ tự" (xem mục 7).

**Không có `created_at`.** Không luồng sản phẩm nào truy vấn step theo thời gian — thứ tự hiển thị hoàn toàn dựa vào `position`. Thêm `created_at` ở đây là boilerplate không có mục đích sử dụng.

### 4.3 Attempt Report

| Column | Type | Required? | Default | Purpose | Constraints |
|---|---|---|---|---|---|
| `id` | UUID | NOT NULL | `gen_random_uuid()` | Khóa chính | PRIMARY KEY |
| `how_to_id` | UUID | NOT NULL | — | Thuộc về How-To nào | FOREIGN KEY → `how_to(id)` ON DELETE CASCADE |
| `result` | TEXT | NOT NULL | — | Kết quả tự báo cáo (xem mục 9, "Evidence ≠ Truth") | `CHECK (result IN ('success', 'partial', 'failed'))` |
| `note` | TEXT | NULL | — | Ghi chú (tùy chọn, đã chốt) | — |
| `submitted_at` | TIMESTAMPTZ | NOT NULL | `now()` | Thời điểm gửi — dùng để hiển thị Evidence theo thời gian (`mvp-definition.md` §8) | — |

**Không có `updated_at`.** Cùng lý do với How-To — Attempt Report Edit cũng bị hoãn lại.

**Về giá trị `result`:** lưu bằng mã ASCII tiếng Anh (`success`/`partial`/`failed`), không lưu trực tiếp chuỗi tiếng Việt "Thành công"/"Một phần"/"Thất bại". Đây là ứng dụng trực tiếp quy ước ngôn ngữ đã có của dự án — DB/định danh kỹ thuật dùng tiếng Anh, UI hiển thị tiếng Việt (ánh xạ ở tầng ứng dụng). Ứng dụng chịu trách nhiệm hiển thị đúng nhãn tiếng Việt đã chốt ở `mvp-definition.md`/`design-direction.md` — schema không bao giờ hiển thị mã thô cho người dùng.

### 4.4 Attempt Report Image

| Column | Type | Required? | Default | Purpose | Constraints |
|---|---|---|---|---|---|
| `id` | UUID | NOT NULL | `gen_random_uuid()` | Khóa chính | PRIMARY KEY |
| `attempt_report_id` | UUID | NOT NULL | — | Thuộc về Attempt Report nào | FOREIGN KEY → `attempt_report(id)` ON DELETE CASCADE |
| `storage_path` | TEXT | NOT NULL | — | Đường dẫn object trong bucket Supabase Storage dành riêng cho ứng dụng (không phải URL đầy đủ) | `CHECK (length(trim(storage_path)) > 0)` |
| `mime_type` | TEXT | NOT NULL | — | Loại file, khớp allow-list đã chốt ở kiến trúc | `CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp'))` |
| `size_bytes` | INTEGER | NOT NULL | — | Kích thước file — phục vụ audit/validate, không phải xử lý ảnh | `CHECK (size_bytes > 0)` |
| `position` | INTEGER | NOT NULL | — | Thứ tự hiển thị ảnh (1-indexed) | `CHECK (position BETWEEN 1 AND 3)` |

**Constraint bổ sung ở mức bảng:** `UNIQUE (attempt_report_id, position)`.

**Xác minh ngữ nghĩa PostgreSQL — `CHECK (position BETWEEN 1 AND 3)` + `UNIQUE (attempt_report_id, position)` có thật sự đảm bảo tối đa 3 ảnh/Attempt Report không?** Có — đã kiểm chứng, không chỉ giả định:

1. `CHECK (position BETWEEN 1 AND 3)` giới hạn miền giá trị của `position` xuống đúng 3 giá trị khả dĩ: `{1, 2, 3}`. Đây là ràng buộc per-row, Postgres kiểm tra độc lập trên từng hàng khi INSERT/UPDATE.
2. `UNIQUE (attempt_report_id, position)` đảm bảo Postgres từ chối bất kỳ hàng nào có cặp `(attempt_report_id, position)` trùng với một hàng đã tồn tại — tức với một `attempt_report_id` cố định, mỗi giá trị `position` chỉ có thể xuất hiện **tối đa một lần**.
3. Kết hợp (1) và (2): với một `attempt_report_id` cho trước, chỉ có đúng 3 giá trị `position` hợp lệ (1, 2, 3), và mỗi giá trị chỉ dùng được một lần → **không thể tồn tại hàng thứ 4** cho cùng `attempt_report_id`, vì bất kỳ hàng thứ 4 nào cũng buộc phải trùng `position` với một trong ba hàng đã có (theo nguyên lý pigeonhole — 4 hàng nhét vào 3 giá trị khả dĩ chắc chắn có ít nhất một cặp trùng), và Postgres sẽ từ chối nó do vi phạm `UNIQUE`.

Do đó, tổ hợp hai constraint này **thật sự đảm bảo tối đa 3 ảnh/Attempt Report ở tầng database** — không phải phỏng đoán, mà là hệ quả trực tiếp của ngữ nghĩa CHECK + UNIQUE trong PostgreSQL. **Application/server validation vẫn bắt buộc duy trì như một lớp phòng thủ bổ sung (defense-in-depth)** — cụ thể: để trả lỗi thân thiện, đúng ngôn ngữ UI (tiếng Việt) trước khi request chạm tới database, và để chặn sớm các trường hợp khác (sai định dạng file, quá kích thước) mà constraint DB ở trên không xử lý. Constraint DB là lưới an toàn cuối cùng, không thay thế validate ở server (đúng nguyên tắc đã chốt ở `technical-architecture-proposal-v1.md` §9).

**Cột bị loại có chủ đích:** `original_filename` (không luồng sản phẩm nào hiển thị/dùng tên file gốc), `width`/`height`/`thumbnail_path` (metadata xử lý ảnh — MVP không xử lý/resize ảnh, `technical-architecture-proposal-v1.md` §17 đã loại "pipeline xử lý ảnh tùy chỉnh"), `created_at` riêng (không có luồng truy vấn ảnh theo thời gian — thứ tự dựa vào `position`, thời điểm chung đã có ở `attempt_report.submitted_at`).

## 5. Referential Integrity

**[ĐỀ XUẤT]**

- `how_to_step.how_to_id → how_to.id`: `ON DELETE CASCADE`. An toàn vì Step không có file nào ở Storage — xóa cascade ở DB là đủ, không có rủi ro mồ côi file.
- `attempt_report.how_to_id → how_to.id`: `ON DELETE CASCADE`.
- `attempt_report_image.attempt_report_id → attempt_report.id`: `ON DELETE CASCADE`.

**Phân biệt bắt buộc — DATABASE REFERENTIAL ACTIONS khác STORAGE OBJECT CLEANUP:**

`ON DELETE CASCADE` chỉ dọn dẹp **hàng trong Postgres**. Nó **không và không thể** xóa file thật trong Supabase Storage — đây là hai hệ thống độc lập hoàn toàn (đã nêu ở `technical-architecture-proposal-v1.md` §8, §15). Việc thêm CASCADE ở đây là để đảm bảo tính toàn vẹn tham chiếu của chính Postgres (không còn `attempt_report` mồ côi trỏ tới `how_to` đã xóa), **không phải** giải pháp cho việc dọn Storage.

**Thứ tự thao tác bắt buộc ở tầng ứng dụng (quan trọng, dễ làm sai):** vì CASCADE sẽ xóa luôn các hàng `attempt_report_image` (chứa `storage_path`) ngay khi `how_to`/`attempt_report` cha bị xóa, ứng dụng **phải truy vấn và lưu lại toàn bộ `storage_path` liên quan TRƯỚC KHI** thực hiện lệnh xóa ở Postgres — nếu xóa DB trước rồi mới định dọn Storage sau, các `storage_path` cần thiết đã biến mất cùng hàng dữ liệu, khiến việc dọn dẹp file trở nên bất khả thi. Trình tự đúng: (1) đọc toàn bộ `storage_path` liên quan → (2) xóa các object đó khỏi Supabase Storage → (3) xóa hàng ở Postgres (CASCADE lo phần còn lại). Đây đúng với thứ tự đã mô tả ở `technical-architecture-proposal-v1.md` §7.5–7.6.

## 6. Constraint Strategy

**[ĐỀ XUẤT]** Phân loại tường minh — không giả vờ database enforce điều nó không enforce được:

| Ràng buộc | Database-enforced | Server/App-enforced | UI-only |
|---|---|---|---|
| Tiêu đề How-To bắt buộc | ✅ `NOT NULL` + `CHECK` | ✅ (phản hồi nhanh) | ✅ |
| How-To phải có ≥1 Step | ❌ *(không thể enforce bằng constraint đơn giản — một How-To có 0 hàng Step không vi phạm FK/CHECK nào, xem mục 4.2 và mục 8)* | ✅ **Duy nhất nguồn xác thực** | ✅ |
| Result hợp lệ (1 trong 3 giá trị) | ✅ `CHECK` | ✅ (phản hồi nhanh) | ✅ |
| Attempt Report phải trỏ tới How-To tồn tại | ✅ `FOREIGN KEY` | — (DB đã đảm bảo) | — |
| Image phải trỏ tới Attempt Report tồn tại | ✅ `FOREIGN KEY` | — (DB đã đảm bảo) | — |
| Thứ tự Step xác định (không trùng vị trí) | ✅ `UNIQUE(how_to_id, position)` | ✅ (khi tạo tuần tự) | — |
| Thứ tự Image xác định | ✅ `UNIQUE(attempt_report_id, position)` | ✅ | — |
| Tối đa 3 ảnh/Attempt Report | ✅ `CHECK(position BETWEEN 1 AND 3)` + `UNIQUE` *(xem mục 4.4 — kết hợp hai constraint này giới hạn tối đa 3 hàng/Attempt Report)* | ✅ **Nguồn xác thực chính, cho UX lỗi rõ ràng trước khi chạm DB** | ✅ |
| Loại file ảnh hợp lệ (jpeg/png/webp) | ✅ `CHECK` | ✅ **Nguồn xác thực chính** (đã chốt kiến trúc §8–9) | ✅ (soft check, không phải ranh giới bảo mật) |

Theo đúng `technical-architecture-proposal-v1.md` §9: **server-side validation luôn là nguồn xác thực cuối cùng**, kể cả với các ràng buộc database đã enforce — constraint DB là lưới an toàn thứ hai, không thay thế validate ở server.

### Row Level Security (RLS)

**[QUYẾT ĐỊNH — founder accepted 2026-08-26]** Bật RLS (`ENABLE ROW LEVEL SECURITY`) trên cả 4 bảng: `how_to`, `how_to_step`, `attempt_report`, `attempt_report_image`.

**Đây là gì và không phải là gì:**

- **Là:** một lớp phòng thủ bổ sung (defense-in-depth) ở tầng database, độc lập với tầng ứng dụng.
- **Không phải:** một tính năng authorization/authentication mới. MVP vẫn hoàn toàn ẩn danh — **không** có bảng `users`, **không** có cột `user_id`, **không** có `auth.uid()`, **không** có policy phân quyền theo chủ sở hữu, **không** có role/nhóm người dùng nào được tạo ra. Không có gì trong quyết định này mở rộng phạm vi sản phẩm hay đưa multi-user authorization vào MVP.

**Vì sao bật (dù MVP không có user nào để phân quyền):** đường ghi/xóa dữ liệu hiện tại và duy nhất đi qua Server Action chạy phía server (đã chốt ở `technical-architecture-proposal-v1.md` §4.2, §9). RLS ở đây không nhằm phân biệt "user A" với "user B" (không tồn tại khái niệm đó) — nó nhằm đóng một đường truy cập phụ: nếu trong tương lai một đoạn code nào đó (kể cả do nhầm lẫn) gọi Supabase client trực tiếp từ trình duyệt bằng anon key thay vì đi qua Server Action, bảng vẫn không bị lộ ghi/đọc ngoài ý muốn.

**Chính sách đề xuất — tối giản, không tạo policy nào:**

**[ĐỀ XUẤT]** Bật RLS trên cả 4 bảng nhưng **không định nghĩa bất kỳ policy nào**. Theo ngữ nghĩa PostgreSQL: khi một bảng bật RLS mà không có policy nào áp dụng cho một role, role đó mặc định **không truy cập được hàng nào** (deny-all ngầm định — không cần viết tường minh một policy "deny all"). Đây là cấu hình tối thiểu tuyệt đối: mỗi bảng chỉ cần một câu lệnh, ví dụ minh họa (không phải migration đầy đủ):

```sql
ALTER TABLE how_to ENABLE ROW LEVEL SECURITY;
```

Không viết thêm policy nào là lựa chọn có chủ đích — đúng tinh thần "không biến RLS thành một tính năng sản phẩm mới".

**Phân biệt bắt buộc — key đặc quyền phía server BYPASS RLS, không bị RLS bảo vệ hay giới hạn:**

**[SỰ THẬT]** Theo tài liệu chính thức của Supabase, vai trò `service_role` có thuộc tính `BYPASSRLS` — mọi truy vấn thực hiện bằng `service_role` **bỏ qua hoàn toàn** RLS, bất kể bảng có bật RLS hay có policy nào hay không. `technical-architecture-proposal-v1.md` §9 đã chốt: thao tác ghi/xóa dùng "key có quyền cao (nếu cần), không bao giờ lộ ra phía trình duyệt" — nếu key đó là `service_role` (lựa chọn tự nhiên nhất cho một Server Action phía server, dù tài liệu kiến trúc chưa ghim cứng tên key cụ thể), thì **RLS không áp dụng và không bảo vệ gì cho các thao tác ghi/xóa của chính ứng dụng**. Nói rõ để không bị hiểu lầm: RLS ở đây bảo vệ đúng một kịch bản — truy cập bằng `anon` key trực tiếp từ trình duyệt, không phải là cơ chế kiểm soát cho các Server Action vốn đã chạy với quyền cao hơn theo thiết kế. Việc "server-side code luôn đáng tin cậy" tiếp tục dựa vào việc key đặc quyền không bao giờ lộ ra trình duyệt (đã chốt ở kiến trúc), **không** dựa vào RLS.

**Không có xung đột với Technical Architecture Proposal v1 đã chấp nhận:** tài liệu kiến trúc không đề cập RLS ở bất kỳ đâu và không có phát biểu nào mâu thuẫn với việc bật RLS — đây là một bổ sung ở tầng database, cộng thêm vào nguyên tắc "key quyền cao không lộ ra trình duyệt" đã có sẵn, không thay đổi bất kỳ quyết định kỹ thuật nào đã chốt.

## 7. Index Strategy

**[ĐỀ XUẤT]** — chỉ những index thật sự cần, có lý do cụ thể:

| Index đề xuất | Truy vấn được phục vụ |
|---|---|
| `attempt_report(how_to_id, submitted_at)` | Trang chi tiết How-To: lấy toàn bộ Attempt Report của một How-To, sắp theo thời gian (`mvp-definition.md` §3, "Xem Evidence thô... theo thời gian") — **index thật sự mới, cần thêm.** |

**Index KHÔNG cần thêm riêng (đã có sẵn nhờ PK/UNIQUE, theo đúng gợi ý ở đề bài "primary keys and unique constraints may already create indexes"):**

- Lấy How-To theo `id` → đã có index tự động từ `PRIMARY KEY`.
- Lấy các Step của một How-To theo thứ tự (`WHERE how_to_id = X ORDER BY position`) → **đã được phục vụ đầy đủ** bởi index ngầm của `UNIQUE(how_to_id, position)` (composite index bắt đầu bằng `how_to_id`, đã sắp theo `position`) — không cần index riêng.
- Lấy các Image của một Attempt Report theo thứ tự → tương tự, đã được phục vụ bởi index ngầm của `UNIQUE(attempt_report_id, position)`.

**Index KHÔNG đề xuất, có chủ đích:**

- Index trên `how_to.created_at` cho trang Khám phá (danh sách "mới nhất trước"): ở quy mô dữ liệu MVP thực tế (vài chục hàng), một full table scan + sort nhanh hơn hoặc tương đương một index scan — thêm index ở đây là tối ưu hóa sớm không có cơ sở. Đây là điểm đầu tiên cần xem lại nếu số lượng How-To tăng đáng kể sau MVP.

## 8. Query Patterns Supported

**[ĐỀ XUẤT]** Đối chiếu schema với đúng 6 luồng đã chốt:

- **Tạo How-To:** 1 INSERT `how_to` + N INSERT `how_to_step` trong cùng một transaction (transaction là cơ chế enforce "≥1 step" ở tầng ứng dụng, xem mục 6).
- **Khám phá:** `SELECT * FROM how_to ORDER BY created_at DESC` (không index riêng, xem mục 7) + `SELECT COUNT(*) FROM attempt_report WHERE how_to_id = X` cho mỗi How-To (đếm, không tổng hợp kết quả — đúng `mvp-definition.md` §5 "Không tìm kiếm/lọc/tag" không đòi hỏi gì hơn số đếm này).
- **Xem How-To + Evidence:** `SELECT` `how_to` theo `id` (PK) + `SELECT` `how_to_step` theo `how_to_id` sắp `position` (index ngầm) + `SELECT` `attempt_report` theo `how_to_id` sắp `submitted_at` (index mới ở mục 7) + `SELECT` `attempt_report_image` theo từng `attempt_report_id` sắp `position` (index ngầm).
- **Gửi Attempt Report:** 1 INSERT `attempt_report` + 0–3 INSERT `attempt_report_image` trong cùng một transaction (transaction ở tầng app + `CHECK`/`UNIQUE` trên `position` ở tầng DB cùng enforce "tối đa 3 ảnh", xem mục 6) — ảnh đã upload lên Storage trước, transaction này chỉ ghi reference.
- **Xóa Attempt Report:** đọc `storage_path` của các `attempt_report_image` liên quan → xóa object khỏi Storage → `DELETE FROM attempt_report WHERE id = X` (CASCADE dọn `attempt_report_image`).
- **Xóa How-To:** đọc `storage_path` của toàn bộ ảnh thuộc mọi `attempt_report` của How-To này → xóa các object khỏi Storage → `DELETE FROM how_to WHERE id = X` (CASCADE dọn `attempt_report` và `attempt_report_image`, cũng như `how_to_step`).

## 9. Evidence ≠ Truth

**[ĐỀ XUẤT — mục bắt buộc]**

Schema đề xuất **không chứa** bất kỳ cột nào thuộc các dạng sau, ở bất kỳ bảng nào: `trust_score`, `verification_score`, `verification_status`, `verified`, `confidence_score`, `success_rate`, `average_rating`, `rating`, `quality_score`, `correctness_score`, `community_score`, hay bất kỳ biến thể tên gọi tương đương nào.

Không có cột tổng hợp/tính toán nào tồn tại — kể cả những cột có vẻ vô hại về mặt vận hành, ví dụ `image_count` trên `attempt_report` (có thể suy ra bằng `COUNT(*)` khi cần, không lưu sẵn) hay bất kỳ hình thức pre-aggregation nào trên `how_to`. Đây là lựa chọn có chủ đích: giữ ràng buộc Evidence ≠ Truth ở **tầng dữ liệu**, không chỉ tầng UI — nếu một cột tổng hợp tồn tại trong schema, luôn có rủi ro một tính năng tương lai vô tình hiển thị nó như một "điểm số ngầm định".

**Ý nghĩa ngữ nghĩa của `attempt_report.result`:** đây là **một sự kiện tự báo cáo bởi một lần thử cụ thể**, không phải kết luận của hệ thống. Giá trị `success` có nghĩa: *"người thử báo cáo rằng lần thử của họ thành công"* — **không** có nghĩa: *"nền tảng đã xác minh rằng How-To này hoạt động"*. Mỗi hàng `attempt_report` là một điểm dữ liệu độc lập, ngang hàng với mọi hàng khác cùng `how_to_id` — không có trọng số, không có hàng nào "đáng tin hơn" hàng khác ở tầng schema. Việc một How-To có 3 report "success" và 2 report "failed" **không** được tính toán thành bất kỳ giá trị tổng hợp nào trong database — người xem tự đọc toàn bộ danh sách thô và tự diễn giải, đúng nguyên tắc đã chốt ở `discovery.md` §8 và `mvp-definition.md` Phụ lục.

## 10. Deletion and Orphan-Storage Risk

**[ĐỀ XUẤT]**

Postgres `ON DELETE CASCADE` (mục 5) đảm bảo **không còn hàng DB mồ côi** sau khi xóa — nhưng **không đảm bảo gì về Supabase Storage**. Đây là hai hệ thống tách biệt hoàn toàn; xóa một hàng `attempt_report_image` không tự động (và không thể tự động, trừ khi tự dựng thêm cơ chế đồng bộ) kéo theo xóa object thật trong Storage.

**Failure mode cụ thể:** nếu ứng dụng xóa hàng Postgres (dù trực tiếp hay qua CASCADE) **trước khi** đọc và xóa `storage_path` tương ứng khỏi Storage, các file ảnh đó trở thành **mồ côi vĩnh viễn** — không còn hàng DB nào trỏ tới chúng để biết cần xóa, nhưng chúng vẫn tồn tại và chiếm dung lượng trong bucket. Không có cơ chế dọn rác tự động nào được đề xuất ở MVP này (không cần thiết ở quy mô dữ liệu cực nhỏ, single-user) — nhưng thứ tự thao tác đúng (mục 5) phải được tuân thủ nghiêm ngặt ngay từ lần implement đầu tiên, vì đây không phải lỗi có thể "sửa sau" mà không cần dọn thủ công từng file.

## 11. Alternatives Considered

**[ĐỀ XUẤT]**

| Quyết định | Đã chọn | Thay thế đã xem xét | Lý do không chọn thay thế |
|---|---|---|---|
| Steps: bảng riêng vs JSONB | Bảng riêng `how_to_step` | Mảng JSONB trên `how_to` | JSONB không thể tự enforce thứ tự xác định bằng constraint đơn giản (`UNIQUE(how_to_id, position)` không áp dụng được cho phần tử trong mảng), khó truy vấn/join, đi ngược nguyên tắc "quan hệ, không blob" (mục 2, nguyên tắc 5). |
| Images: bảng riêng vs JSONB/mảng | Bảng riêng `attempt_report_image` | Mảng JSONB trên `attempt_report`, hoặc 3 cột `image_1/2/3` cố định | JSONB: cùng lý do với Steps. 3 cột cố định: "tự nhiên" giới hạn 3 ảnh nhưng phá vỡ mô hình quan hệ chuẩn, làm phức tạp việc xóa từng phần tử/audit `mime_type`/`size_bytes` riêng lẻ, và không nhất quán với cách Steps được mô hình hóa. |
| `result`: constrained TEXT vs Postgres ENUM vs lookup table | `TEXT` + `CHECK` | Native Postgres `ENUM`; hoặc lookup table (`attempt_result` riêng + FK) | Enum tự nhiên hơn về mặt tài liệu hóa và có thể sinh union type tự động khi dùng Supabase codegen, nhưng sửa/thêm giá trị sau này cần `ALTER TYPE` (có ràng buộc giao dịch riêng của Postgres) — `CHECK` đơn giản hơn để thay đổi và đủ dùng cho 3 giá trị cố định của MVP. Lookup table thừa cho đúng 3 giá trị tĩnh, không có nhu cầu thêm metadata (màu, mô tả...) cho từng giá trị ở MVP — thêm một bảng + một JOIN không cần thiết. |
| Primary key: UUID vs integer identity | UUID (`gen_random_uuid()`) | `INTEGER GENERATED ALWAYS AS IDENTITY` | UUID là lựa chọn idiomatic cho Supabase/Postgres hiện đại, không lộ thứ tự tạo/số lượng hàng (dù MVP không có yêu cầu bảo mật này, đây là thói quen tốt không tốn thêm gì), và dùng trực tiếp được làm phần của `storage_path` mà không cần thêm cơ chế sinh mã riêng. Integer identity nhỏ gọn hơn và dễ đọc khi debug thủ công, nhưng không có lợi thế nào đủ mạnh để đổi hướng. |
| Step/Image: surrogate `id` (UUID) vs composite PK `(parent_id, position)` | Surrogate `id` riêng | Composite PK `(how_to_id, position)` / `(attempt_report_id, position)` | Composite PK sẽ bớt được 1 cột và 1 UNIQUE constraint (PK tự đóng vai trò đó), nhưng ORM và tooling (kể cả Supabase dashboard) làm việc tự nhiên hơn với PK 1 cột; không có gì hiện tại tham chiếu tới Step/Image theo khóa ngoài, nên lợi ích của composite key là rất nhỏ so với chi phí kém tương thích công cụ. |

## 12. Future Evolution

**[GIẢ THUYẾT — ngắn gọn, không thiết kế chi tiết]**

- **Authentication / user ownership:** thêm bảng `users` (khả năng qua Supabase Auth) + cột `user_id` trên `how_to` và `attempt_report` — schema hiện tại không có gì cần tháo dỡ để thêm việc này.
- **Community Verification / Trust signal thật:** sẽ cần một vòng product discovery riêng trước khi động vào schema — không được suy diễn trước ở đây (đúng tinh thần mục 9).
- **Media phong phú hơn (video...):** `attempt_report_image` có thể tổng quát hóa thành `attempt_report_media` với thêm `media_type`, nhưng đây là thay đổi có chủ đích ở giai đoạn sau, không phải MVP.
- **Quy mô lớn hơn:** nếu số How-To tăng đáng kể, index trên `how_to.created_at` (đã loại ở mục 7) là điểm đầu tiên cần thêm lại.

## 13. Architectural Risks

**[ĐỀ XUẤT]**

**Rủi ro: File Storage mồ côi**
→ Vì sao quan trọng: đã phân tích chi tiết ở mục 10 — sai thứ tự xóa gây mất khả năng dọn dẹp file vĩnh viễn.
→ Giảm thiểu: tuân thủ nghiêm thứ tự "đọc storage_path → xóa Storage → xóa DB" mô tả ở mục 5.
→ Giải quyết ngay hay hoãn: **Giải quyết ngay** khi implement luồng xóa — không phải thứ hoãn được.

**Rủi ro: Cardinality constraints (≥1 step, ≤3 ảnh) phụ thuộc vào tầng ứng dụng**
→ Vì sao quan trọng: nếu Server Action có bug hoặc bị bỏ qua (ví dụ gọi trực tiếp Supabase client từ nơi khác trong tương lai), có thể tạo ra How-To 0 bước hoặc để trạng thái tạm thời không nhất quán.
→ Giảm thiểu: mọi thao tác ghi đi qua đúng một tầng Server Action duy nhất (đã chốt kiến trúc); ràng buộc "≤3 ảnh" đã có thêm lưới an toàn DB qua `CHECK(position BETWEEN 1 AND 3)` + `UNIQUE` (mục 4.4, mục 6) dù "≥1 step" thì không thể.
→ Giải quyết ngay hay hoãn: **Hoãn** — rủi ro thấp ở quy mô single-user, một tầng ghi duy nhất.

**Rủi ro: Truy cập ẩn danh nếu anon key vô tình được dùng trực tiếp từ trình duyệt**
→ Vì sao quan trọng: kiến trúc hiện tại giả định mọi ghi/xóa đi qua Server Action ở server (dùng credential phía server, không phải anon key lộ ra trình duyệt) — nếu giả định này bị phá vỡ sau này (ví dụ ai đó gọi Supabase client trực tiếp từ trình duyệt bằng anon key), bảng có thể mở cho truy cập ngoài ý muốn nếu không có lớp phòng thủ ở DB.
→ Giảm thiểu: **Đã giải quyết — founder chấp nhận bật RLS trên cả 4 bảng, 2026-08-26** (không policy, deny-all ngầm định cho `anon`/`authenticated` — xem mục 6, "Row Level Security"). Lưu ý: lớp phòng thủ này không áp dụng cho chính các Server Action nếu chúng dùng `service_role` (key đó bypass RLS theo thiết kế) — an toàn của thao tác server-side tiếp tục dựa vào việc key đặc quyền không lộ ra trình duyệt, không dựa vào RLS.
→ Giải quyết ngay hay hoãn: **Đã giải quyết** (bật RLS ngay khi tạo bảng, không phải việc hoãn được).

**Rủi ro: Dev và Production dùng chung một Supabase project**
→ Vì sao quan trọng: đã nêu ở `technical-architecture-proposal-v1.md` §10 — thao tác thử nghiệm khi phát triển có thể lẫn với dữ liệu "production" (vốn cũng chỉ do founder tạo).
→ Giảm thiểu: chấp nhận được ở quy mô founder tự kiểm thử; không phải vấn đề schema.
→ Giải quyết ngay hay hoãn: **Hoãn**, đã ghi nhận ở tài liệu kiến trúc.

**Rủi ro: Di chuyển schema khi thêm ownership trong tương lai**
→ Vì sao quan trọng: thêm `user_id` sau này cần một migration thêm cột + backfill.
→ Giảm thiểu: cột mới có thể nullable ban đầu, không phá vỡ dữ liệu hiện có — đây là thay đổi cộng thêm (additive), không phải viết lại.
→ Giải quyết ngay hay hoãn: **Hoãn**, đúng theo `mvp-definition.md` (auth là tính năng hoãn có chủ đích).

## 14. Open Schema Decisions

**Cập nhật 2026-08-26:** Cả 2 mục dưới đây đã được founder chốt. Không còn Open Schema Decision nào tại thời điểm này. Nội dung thảo luận gốc được giữ nguyên bên dưới để lưu vết (audit trail).

Chỉ liệt kê điều thực sự cần founder quyết định — không tạo quyết định giả.

**1. `how_to.description` — bắt buộc hay tùy chọn?**
- Đề xuất: `NULLABLE` (không bắt buộc).
- Thay thế: `NOT NULL` (bắt buộc, giống `title`).
- Vì sao quan trọng: `mvp-definition.md` §9 liệt kê "mô tả" là một trường của How-To nhưng **chỉ** đánh dấu tường minh "kết quả kỳ vọng" là tùy chọn; acceptance criteria ở §7 chỉ nói rõ *"Không lưu được nếu thiếu tiêu đề hoặc không có bước nào"* — không nhắc đến mô tả. Đây là một khoảng mờ thật sự trong tài liệu nguồn, không phải điều tài liệu này nên tự suy diễn.
- Hệ quả nếu trì hoãn: có thể implement với giả định tạm (nullable) và đổi sau bằng một migration nhỏ (thêm `NOT NULL` sau khi backfill) — không chặn tiến độ, nhưng nên chốt trước khi viết form validation ở tầng ứng dụng để tránh làm hai lần.
- **→ Founder accepted 2026-08-26: `description` là NULLABLE (tùy chọn).** Lý do founder nêu: MVP chỉ bắt buộc tiêu đề + ít nhất một bước; `expected_outcome` đã tường minh là tùy chọn; mô tả là nội dung giải thích bổ sung, không phải điều kiện hợp lệ tối thiểu; không nên tăng friction khi tạo How-To một cách không cần thiết. Đã cập nhật ở mục 4.1.

**2. Row Level Security (RLS) trên các bảng Postgres — bật hay không bật ở MVP?**
- Đề xuất ban đầu: Không bật (giữ RLS tắt), dựa trên giả định kiến trúc hiện tại rằng mọi ghi/xóa đi qua Server Action phía server, không expose thao tác ghi trực tiếp cho trình duyệt.
- Thay thế: Bật RLS (deny-all ngầm định, không policy) trên cả 4 bảng, như một lớp phòng thủ thêm (defense-in-depth) đề phòng trường hợp anon key vô tình bị dùng để truy cập trực tiếp từ client trong tương lai.
- Vì sao quan trọng: đây là lựa chọn về khẩu vị rủi ro bảo mật, không phải một sự thật kỹ thuật khách quan.
- **→ Founder accepted 2026-08-26: BẬT RLS trên cả 4 bảng.** Founder nêu rõ đây là defense-in-depth, không phải tính năng authorization — MVP vẫn ẩn danh, không `users`, không `user_id`, không `auth.uid()`, không policy phân quyền, không role. Đường ghi/xóa qua Next.js Server Action phía server không đổi. Chi tiết cơ chế, phạm vi bảo vệ thật sự (và giới hạn của nó với key đặc quyền server-side) đã được viết đầy đủ ở mục 6, "Row Level Security".

## 15. Recommendation Summary

**[ĐỀ XUẤT, trừ 2 điểm đã ghi rõ là đã chấp nhận]** Bốn bảng quan hệ trên Postgres (Supabase): `how_to` (1) —< `how_to_step` (N), `how_to` (1) —< `attempt_report` (N) —< `attempt_report_image` (N). Khóa chính UUID cho cả bốn bảng. Thứ tự Step/Image xác định bằng cột `position` + `UNIQUE` constraint (cũng chính là index phục vụ truy vấn thứ tự, không cần index riêng). `result` lưu dạng mã tiếng Anh có `CHECK`, ứng dụng ánh xạ sang nhãn tiếng Việt. Không bảng `users`, không cột `user_id`, không cột tổng hợp/điểm số/trạng thái xác minh ở bất kỳ đâu. Ràng buộc "≥1 step" nằm hoàn toàn ở tầng ứng dụng (không thể enforce bằng DB); "≤3 ảnh" đã được xác minh có enforcement thật ở tầng DB (`CHECK(position BETWEEN 1 AND 3)` + `UNIQUE`, xem mục 4.4), cộng thêm validate ở server làm lớp phòng thủ chính cho trải nghiệm lỗi. Chỉ một index mới thật sự cần thêm: `attempt_report(how_to_id, submitted_at)`.

**Đã chấp nhận bởi founder, 2026-08-26 (mục 14):**
1. `how_to.description` là **NULLABLE** (tùy chọn).
2. **RLS được bật** trên cả 4 bảng — defense-in-depth, không phải tính năng authorization; MVP vẫn ẩn danh, không `users`/`user_id`/`auth.uid()`/policy phân quyền; không bảo vệ thao tác của Server Action nếu dùng `service_role` (key đó bypass RLS theo thiết kế của Supabase).

**Không còn Open Schema Decision nào khác tại thời điểm này** (mục 14). Mọi nội dung còn lại của tài liệu — bao gồm lựa chọn UUID, cấu trúc bảng, chiến lược index, `ON DELETE CASCADE`, và mọi phần chưa nêu tên ở trên — **vẫn là [ĐỀ XUẤT]**, chưa được founder duyệt riêng, và **không** được coi là đã chốt chỉ vì 2 quyết định trên đã được chấp nhận.

**Chưa được founder chấp nhận — proposal only.**
