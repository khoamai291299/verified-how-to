/**
 * Kiểu dữ liệu tối thiểu, viết tay theo đúng migration ở supabase/migrations/.
 *
 * Đây KHÔNG phải type sinh tự động từ schema thật (`supabase gen types typescript`) —
 * việc đó cần kết nối tới một Supabase project thật, chưa có ở Slice 1. Khi project
 * thật tồn tại, nên thay thế/đối chiếu file này bằng type sinh tự động.
 */

export type AttemptReportResult = "success" | "partial" | "failed";

/** Nhãn tiếng Việt cho mỗi giá trị result — chỉ chữ, không icon/badge (mvp-definition.md Phụ lục). */
export const RESULT_LABELS: Record<AttemptReportResult, string> = {
  success: "Thành công",
  partial: "Một phần",
  failed: "Thất bại",
};

export const RESULT_VALUES: AttemptReportResult[] = ["success", "partial", "failed"];

/** Khớp đúng allowed_mime_types của bucket attempt-report-images (slice-1-implementation-notes.md). */
export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

/** Khớp đúng file_size_limit của bucket attempt-report-images: 5 MB. */
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

/** Khớp đúng CHECK(position BETWEEN 1 AND 3) trên attempt_report_image. */
export const MAX_IMAGES_PER_ATTEMPT_REPORT = 3;

export const IMAGE_EXTENSION_BY_MIME: Record<AllowedImageMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
