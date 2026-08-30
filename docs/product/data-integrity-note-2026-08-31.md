# Ghi chú toàn vẹn dữ liệu — 2026-08-31

**Trạng thái:** [SỰ THẬT] + [QUYẾT ĐỊNH] founder cho các phát hiện dưới đây. Ghi lại trong
lúc chuẩn bị migration `is_seed_content` (kế tiếp `visual-audit-v5.md`).

## 1. 2 dish mồ côi do QA để sót — CHỜ founder xóa (bị chặn bởi sandbox)

Truy vấn trực tiếp Supabase (service role, 2026-08-31) phát hiện 2 dòng `dish` không được
`how_to` nào tham chiếu:

| id | name | created_at |
|---|---|---|
| `f8c82101-925d-4cca-b9c1-ee4b8c68c552` | "Chả cá QA" | 2026-08-28T09:20:39Z |
| `bbd7db20-c922-432b-90ab-48b2680015b0` | "QA prod-verify" | 2026-08-28T09:45:56Z |

Cả hai đều có tên rõ ràng là dữ liệu test còn sót lại từ phiên audit V5 (2026-08-28), 0
`how_to` tham chiếu tới (đã xác minh bằng đếm ngược FK). **[QUYẾT ĐỊNH]** đây là test
residue an toàn để xóa. Việc xóa bị sandbox của phiên làm việc này chặn (auto-mode classifier từ chối lệnh xóa DB) — cần founder tự chạy hoặc cấp quyền. Câu lệnh xóa (chạy trong Supabase SQL Editor, hoặc qua `psql`):

```sql
delete from dish where id in (
  'f8c82101-925d-4cca-b9c1-ee4b8c68c552', -- "Chả cá QA"
  'bbd7db20-c922-432b-90ab-48b2680015b0'  -- "QA prod-verify"
);
```

Đã xác minh 0 `how_to` nào tham chiếu tới 2 dòng này (đếm FK ngược), nên xóa an toàn, không cần xóa dữ liệu liên quan nào khác.

## 2. 1 Attempt Report mơ hồ trên "Luộc rau muống xanh giòn" — GIỮ LẠI, KHÔNG ĐOÁN

`content-seed-log.md` ghi rõ How-To "Luộc rau muống xanh giòn" (`b8e21e81-...`) được seed
**cố ý để 0 lượt thử**. Nhưng truy vấn thật cho thấy có 1 Attempt Report tồn tại trên
How-To này:

- id: `fb4bf316-f7bc-4d54-8fb8-db5b0495bf89`
- kết quả: "Thành công"
- nộp lúc: `2026-08-27T09:32:49.486224+00:00` (không phải timestamp lùi ngày như các bản
  ghi seed khác — seed script dùng timestamp giả lập trải từ 08-09 tới 08-26; bản ghi này
  có timestamp "thời gian thực" gần với lần thử thật của founder cùng ngày 06:02:30).
- không có nhãn "QA"/"test" nào trong nội dung.

**[GIẢ ĐỊNH — CHƯA XÁC NHẬN]** Không đủ bằng chứng để kết luận đây là hoạt động thật của
founder hay sót lại từ một lượt test thao tác nộp Attempt Report. **Theo quyết định founder
2026-08-31: KHÔNG xóa, KHÔNG sửa, KHÔNG tự đoán.** Bản ghi này **không được đánh dấu**
`is_seed_content = true` trong migration `20260831090000_seed_content_flag.sql` — tạm thời
xử lý như hoạt động thật cho tới khi founder xác nhận khác, để tránh rủi ro lớn hơn: gắn
nhãn "minh họa" sai cho một Attempt Report thật sẽ hạ thấp uy tín dữ liệu thật của chính
founder.

**Founder cần xác nhận:** đây có phải là lần thử thật của bạn không? Nếu không, sẽ xóa kèm
ảnh đính kèm/storage object tương ứng (nếu có — hiện bản ghi này không có ảnh).

## 3. Đính chính nguồn gốc danh sách 15 ID Attempt Report seed trong migration

Comment trong `20260831090000_seed_content_flag.sql` mô tả danh sách 15 ID Attempt Report
được backfill `is_seed_content = true` là "đã đối chiếu trực tiếp với
`docs/product/content-seed-log.md`". Cách diễn đạt đó dễ gây hiểu lầm là
`content-seed-log.md` liệt kê sẵn 15 ID này — **không phải vậy**. `content-seed-log.md` chỉ
nêu tên 6 How-To seed theo tiêu đề (mục "Nội dung seed mới") và ID Attempt Report thật của
founder (`421dd8c8-...`); tài liệu đó không liệt kê UUID của 15 Attempt Report seed.

**[SỰ THẬT]** Danh sách 15 ID thực tế trong migration được dựng lại bằng một truy vấn trực
tiếp vào Supabase (service role, 2026-08-31): lấy toàn bộ Attempt Report thuộc 6 How-To seed
nêu trên, rồi loại trừ 2 bản ghi không seed (`421dd8c8-...` của founder và `fb4bf316-...` —
bản ghi mơ hồ ở mục 2 phía trên). Danh sách này khớp về mặt số học với tường thuật của
`content-seed-log.md` (17 Attempt Report tổng cộng trên production tại thời điểm đó = 1 bản
ghi thật của founder + 1 bản ghi mơ hồ + 15 bản ghi seed), nhưng nguồn trực tiếp của 15 ID là
truy vấn Supabase, không phải một danh sách ID có sẵn trong `content-seed-log.md`. Không sửa
comment trong file migration (đã áp dụng lên production, giữ nguyên làm biên bản lịch sử) —
ghi chú đính chính tại đây.
