"use server";

import { redirect } from "next/navigation";
import { getSessionSupabaseClient } from "@/lib/supabase/session";

export type SignUpState = {
  error?: string;
  fieldErrors?: {
    displayName?: string;
    email?: string;
    password?: string;
  };
  confirmationRequired?: boolean;
};

export async function signUp(_prevState: SignUpState, formData: FormData): Promise<SignUpState> {
  const displayName = String(formData.get("displayName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const fieldErrors: SignUpState["fieldErrors"] = {};
  if (!displayName) {
    fieldErrors.displayName = "Vui lòng nhập tên hiển thị.";
  }
  if (!email) {
    fieldErrors.email = "Vui lòng nhập email.";
  }
  if (password.length < 6) {
    fieldErrors.password = "Mật khẩu cần ít nhất 6 ký tự.";
  }
  if (fieldErrors.displayName || fieldErrors.email || fieldErrors.password) {
    return { fieldErrors };
  }

  const supabase = await getSessionSupabaseClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered") || error.code === "user_already_exists") {
      return { fieldErrors: { email: "Email này đã được đăng ký. Hãy đăng nhập." } };
    }
    console.error("Lỗi đăng ký:", error);
    return { error: "Không thể đăng ký. Vui lòng thử lại." };
  }

  // Nếu dự án Supabase bật xác nhận email, signUp() trả về user nhưng không
  // có session — chưa thể đăng nhập ngay, cần người dùng xác nhận qua email trước.
  if (!data.session) {
    return { confirmationRequired: true };
  }

  redirect("/");
}
