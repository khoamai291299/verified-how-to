"use server";

import { revalidatePath } from "next/cache";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  IMAGE_EXTENSION_BY_MIME,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGES_PER_ATTEMPT_REPORT,
  RESULT_VALUES,
  type AllowedImageMimeType,
} from "@/lib/supabase/types";

const STORAGE_BUCKET = "attempt-report-images";

export type SubmitAttemptReportState = {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    result?: string;
    images?: string;
  };
};

function isAllowedImageMimeType(mimeType: string): mimeType is AllowedImageMimeType {
  return (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType);
}

async function cleanupFailedSubmission(
  supabase: ReturnType<typeof getServerSupabaseClient>,
  attemptReportId: string,
  uploadedStoragePaths: string[],
) {
  if (uploadedStoragePaths.length > 0) {
    await supabase.storage.from(STORAGE_BUCKET).remove(uploadedStoragePaths);
  }
  // CASCADE dọn attempt_report_image nếu đã có hàng nào được ghi trước khi lỗi xảy ra.
  await supabase.from("attempt_report").delete().eq("id", attemptReportId);
}

export async function submitAttemptReport(
  howToId: string,
  _prevState: SubmitAttemptReportState,
  formData: FormData,
): Promise<SubmitAttemptReportState> {
  const result = String(formData.get("result") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  const fieldErrors: SubmitAttemptReportState["fieldErrors"] = {};

  if (!RESULT_VALUES.includes(result as (typeof RESULT_VALUES)[number])) {
    fieldErrors.result = "Vui lòng chọn một kết quả.";
  }

  const candidateFiles = [1, 2, 3]
    .map((slot) => formData.get(`image${slot}`))
    .filter((entry): entry is File => entry instanceof File && entry.size > 0)
    .slice(0, MAX_IMAGES_PER_ATTEMPT_REPORT);

  for (const file of candidateFiles) {
    if (!isAllowedImageMimeType(file.type)) {
      fieldErrors.images = "Chỉ chấp nhận ảnh định dạng JPEG, PNG hoặc WebP.";
      break;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      fieldErrors.images = "Mỗi ảnh tối đa 5MB.";
      break;
    }
  }

  if (fieldErrors.result || fieldErrors.images) {
    return { fieldErrors };
  }

  const supabase = getServerSupabaseClient();

  const { data: howTo, error: howToError } = await supabase
    .from("how_to")
    .select("id")
    .eq("id", howToId)
    .maybeSingle();

  if (howToError) {
    if (howToError.code === "22P02") {
      return { error: "Cách làm không tồn tại." };
    }
    console.error("Lỗi kiểm tra Cách làm:", howToError);
    return { error: "Không thể gửi báo cáo. Vui lòng thử lại." };
  }
  if (!howTo) {
    return { error: "Cách làm không tồn tại." };
  }

  const { data: report, error: reportError } = await supabase
    .from("attempt_report")
    .insert({
      how_to_id: howToId,
      result,
      note: note || null,
    })
    .select("id")
    .single();

  if (reportError || !report) {
    console.error("Lỗi tạo attempt_report:", reportError);
    return { error: "Không thể lưu báo cáo. Vui lòng thử lại." };
  }

  const uploadedStoragePaths: string[] = [];

  for (let index = 0; index < candidateFiles.length; index++) {
    const file = candidateFiles[index];
    const position = index + 1;
    const extension = IMAGE_EXTENSION_BY_MIME[file.type as AllowedImageMimeType];
    const storagePath = `${report.id}/${position}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error("Lỗi tải ảnh lên Storage:", uploadError);
      await cleanupFailedSubmission(supabase, report.id, uploadedStoragePaths);
      return { error: "Không thể tải ảnh lên. Vui lòng thử lại." };
    }

    uploadedStoragePaths.push(storagePath);

    const { error: imageRowError } = await supabase.from("attempt_report_image").insert({
      attempt_report_id: report.id,
      storage_path: storagePath,
      mime_type: file.type,
      size_bytes: file.size,
      position,
    });

    if (imageRowError) {
      console.error("Lỗi lưu attempt_report_image:", imageRowError);
      await cleanupFailedSubmission(supabase, report.id, uploadedStoragePaths);
      return { error: "Không thể lưu ảnh. Vui lòng thử lại." };
    }
  }

  revalidatePath(`/how-to/${howToId}`);
  return { success: true };
}
