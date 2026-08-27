"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";
import { HERO_IMAGE_BUCKET } from "@/lib/supabase/hero-image";
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
  // Gửi Lần thử là hành động gắn với danh tính thật — yêu cầu đăng nhập, không
  // tin bất kỳ user id nào từ client, luôn lấy từ phiên đã xác thực.
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Vui lòng đăng nhập để chia sẻ kết quả." };
  }

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
      user_id: user.id,
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

export type DeleteState = {
  error?: string;
};

export async function deleteAttemptReport(
  reportId: string,
  howToId: string,
  _prevState: DeleteState,
  _formData: FormData,
): Promise<DeleteState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Vui lòng đăng nhập." };
  }

  const supabase = getServerSupabaseClient();

  const { data: report, error: reportError } = await supabase
    .from("attempt_report")
    .select("id, user_id")
    .eq("id", reportId)
    .maybeSingle();

  if (reportError) {
    if (reportError.code === "22P02") {
      return { error: "Báo cáo không tồn tại." };
    }
    console.error("Lỗi kiểm tra Báo cáo:", reportError);
    return { error: "Không thể xóa báo cáo. Vui lòng thử lại." };
  }
  if (!report) {
    return { error: "Báo cáo không tồn tại." };
  }
  // Nội dung không chủ (user_id NULL, ví dụ dữ liệu founder từ trước khi có
  // tài khoản) không thể xóa qua luồng người dùng đã đăng nhập — chỉ chủ sở
  // hữu thật mới xóa được nội dung của chính mình.
  if (report.user_id !== user.id) {
    return { error: "Bạn không có quyền xóa lần thử này." };
  }

  const { data: images, error: imagesError } = await supabase
    .from("attempt_report_image")
    .select("storage_path")
    .eq("attempt_report_id", reportId);

  if (imagesError) {
    console.error("Lỗi đọc ảnh của Báo cáo:", imagesError);
    return { error: "Không thể xóa báo cáo. Vui lòng thử lại." };
  }

  const storagePaths = (images ?? []).map((image) => image.storage_path);

  if (storagePaths.length > 0) {
    const { error: removeError } = await supabase.storage.from(STORAGE_BUCKET).remove(storagePaths);
    if (removeError) {
      console.error("Lỗi xóa ảnh khỏi Storage:", removeError);
      return { error: "Không thể xóa ảnh đính kèm. Vui lòng thử lại." };
    }
  }

  const { error: deleteError } = await supabase.from("attempt_report").delete().eq("id", reportId);

  if (deleteError) {
    console.error("Lỗi xóa attempt_report:", deleteError);
    return { error: "Đã xóa ảnh nhưng không thể xóa báo cáo. Vui lòng thử lại." };
  }

  revalidatePath(`/how-to/${howToId}`);
  return {};
}

export async function deleteHowTo(howToId: string, _prevState: DeleteState, _formData: FormData): Promise<DeleteState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Vui lòng đăng nhập." };
  }

  const supabase = getServerSupabaseClient();

  const { data: howTo, error: howToError } = await supabase
    .from("how_to")
    .select("id, user_id, hero_image_path")
    .eq("id", howToId)
    .maybeSingle();

  if (howToError) {
    if (howToError.code === "22P02") {
      return { error: "Cách làm không tồn tại." };
    }
    console.error("Lỗi kiểm tra Cách làm:", howToError);
    return { error: "Không thể xóa Cách làm. Vui lòng thử lại." };
  }
  if (!howTo) {
    return { error: "Cách làm không tồn tại." };
  }
  if (howTo.user_id !== user.id) {
    return { error: "Bạn không có quyền xóa Cách làm này." };
  }

  if (howTo.hero_image_path) {
    const { error: heroRemoveError } = await supabase.storage.from(HERO_IMAGE_BUCKET).remove([howTo.hero_image_path]);
    if (heroRemoveError) {
      console.error("Lỗi xóa ảnh minh họa khỏi Storage:", heroRemoveError);
      return { error: "Không thể xóa ảnh minh họa. Vui lòng thử lại." };
    }
  }

  const { data: reports, error: reportsError } = await supabase
    .from("attempt_report")
    .select("id")
    .eq("how_to_id", howToId);

  if (reportsError) {
    console.error("Lỗi đọc Báo cáo của Cách làm:", reportsError);
    return { error: "Không thể xóa Cách làm. Vui lòng thử lại." };
  }

  const reportIds = (reports ?? []).map((report) => report.id);

  let storagePaths: string[] = [];
  if (reportIds.length > 0) {
    const { data: images, error: imagesError } = await supabase
      .from("attempt_report_image")
      .select("storage_path")
      .in("attempt_report_id", reportIds);

    if (imagesError) {
      console.error("Lỗi đọc ảnh của Cách làm:", imagesError);
      return { error: "Không thể xóa Cách làm. Vui lòng thử lại." };
    }

    storagePaths = (images ?? []).map((image) => image.storage_path);
  }

  if (storagePaths.length > 0) {
    const { error: removeError } = await supabase.storage.from(STORAGE_BUCKET).remove(storagePaths);
    if (removeError) {
      console.error("Lỗi xóa ảnh khỏi Storage:", removeError);
      return { error: "Không thể xóa ảnh đính kèm. Vui lòng thử lại." };
    }
  }

  const { error: deleteError } = await supabase.from("how_to").delete().eq("id", howToId);

  if (deleteError) {
    console.error("Lỗi xóa how_to:", deleteError);
    return { error: "Đã xóa ảnh nhưng không thể xóa Cách làm. Vui lòng thử lại." };
  }

  redirect("/");
}
