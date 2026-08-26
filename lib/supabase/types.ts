/**
 * Kiểu dữ liệu tối thiểu, viết tay theo đúng migration ở supabase/migrations/.
 *
 * Đây KHÔNG phải type sinh tự động từ schema thật (`supabase gen types typescript`) —
 * việc đó cần kết nối tới một Supabase project thật, chưa có ở Slice 1. Khi project
 * thật tồn tại, nên thay thế/đối chiếu file này bằng type sinh tự động.
 */

export type AttemptReportResult = "success" | "partial" | "failed";
