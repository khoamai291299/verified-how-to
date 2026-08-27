"use server";

import { redirect } from "next/navigation";
import { getSessionSupabaseClient } from "@/lib/supabase/session";

export type SignInState = {
  error?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
  };
  /** Sai riêng cho trường hợp email chưa xác nhận — cho phép hiển thị nút
   * "Gửi lại email xác nhận" thay vì gộp chung vào lỗi "sai mật khẩu". */
  unconfirmedEmail?: string;
};

export async function signIn(_prevState: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/");

  const fieldErrors: SignInState["fieldErrors"] = {};
  if (!email) fieldErrors.email = "Vui lòng nhập email.";
  if (!password) fieldErrors.password = "Vui lòng nhập mật khẩu.";
  if (fieldErrors.email || fieldErrors.password) {
    return { fieldErrors };
  }

  const supabase = await getSessionSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.code === "email_not_confirmed") {
      return { unconfirmedEmail: email };
    }
    return { error: "Email hoặc mật khẩu không đúng." };
  }

  redirect(redirectTo.startsWith("/") ? redirectTo : "/");
}

export type ResendConfirmationState = {
  sent?: boolean;
  error?: string;
};

export async function resendConfirmationEmail(
  email: string,
  _prevState: ResendConfirmationState,
  _formData: FormData,
): Promise<ResendConfirmationState> {
  const supabase = await getSessionSupabaseClient();
  const { error } = await supabase.auth.resend({ type: "signup", email });
  if (error) {
    console.error("Lỗi gửi lại email xác nhận:", error);
    return { error: "Không thể gửi lại email. Vui lòng thử lại sau." };
  }
  return { sent: true };
}
