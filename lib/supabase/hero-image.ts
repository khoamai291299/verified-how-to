import { getServerSupabaseClient } from "@/lib/supabase/server";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  IMAGE_EXTENSION_BY_MIME,
  MAX_IMAGE_SIZE_BYTES,
  type AllowedImageMimeType,
} from "@/lib/supabase/types";

export const HERO_IMAGE_BUCKET = "how-to-hero-images";

function isAllowedImageMimeType(mimeType: string): mimeType is AllowedImageMimeType {
  return (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType);
}

/** Ảnh minh họa (tùy chọn) do tác giả gửi kèm form — trả về File hợp lệ hoặc lỗi. */
export function readHeroImageFile(formData: FormData): { file: File | null; error?: string } {
  const entry = formData.get("heroImage");
  if (!(entry instanceof File) || entry.size === 0) return { file: null };
  if (!isAllowedImageMimeType(entry.type)) {
    return { file: null, error: "Chỉ chấp nhận ảnh định dạng JPEG, PNG hoặc WebP." };
  }
  if (entry.size > MAX_IMAGE_SIZE_BYTES) {
    return { file: null, error: "Ảnh minh họa tối đa 5MB." };
  }
  return { file: entry };
}

/**
 * Tải ảnh minh họa mới lên trước, chỉ xóa ảnh cũ SAU KHI tải thành công —
 * tránh mất ảnh cũ nếu lần tải mới thất bại giữa chừng.
 */
export async function replaceHeroImage(
  supabase: ReturnType<typeof getServerSupabaseClient>,
  howToId: string,
  file: File,
  previousPath: string | null,
): Promise<{ path: string | null; error?: string }> {
  const extension = IMAGE_EXTENSION_BY_MIME[file.type as AllowedImageMimeType];
  const path = `${howToId}/hero-${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from(HERO_IMAGE_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (error) {
    console.error("Lỗi tải ảnh minh họa:", error);
    return { path: null, error: "Không thể tải ảnh minh họa. Vui lòng thử lại." };
  }
  if (previousPath) {
    await supabase.storage.from(HERO_IMAGE_BUCKET).remove([previousPath]);
  }
  return { path };
}
