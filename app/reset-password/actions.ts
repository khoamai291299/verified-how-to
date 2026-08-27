"use server";

import { redirect } from "next/navigation";
import { getSessionSupabaseClient } from "@/lib/supabase/session";

export type ResetPasswordState = {
  error?: string;
  fieldErrors?: { password?: string; confirmPassword?: string };
};

export async function updatePassword(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const fieldErrors: ResetPasswordState["fieldErrors"] = {};
  if (password.length < 6) {
    fieldErrors.password = "Mật khẩu cần ít nhất 6 ký tự.";
  }
  if (confirmPassword !== password) {
    fieldErrors.confirmPassword = "Hai mật khẩu không khớp.";
  }
  if (fieldErrors.password || fieldErrors.confirmPassword) {
    return { fieldErrors };
  }

  const supabase = await getSessionSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Liên kết đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu liên kết mới." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.error("Lỗi cập nhật mật khẩu:", error);
    return { error: "Không thể cập nhật mật khẩu. Vui lòng thử lại." };
  }

  redirect("/profile");
}
