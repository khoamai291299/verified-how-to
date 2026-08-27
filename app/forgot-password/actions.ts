"use server";

import { headers } from "next/headers";
import { getSessionSupabaseClient } from "@/lib/supabase/session";

export type ForgotPasswordState = {
  error?: string;
  fieldErrors?: { email?: string };
  sent?: boolean;
};

export async function requestPasswordReset(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { fieldErrors: { email: "Vui lòng nhập email." } };
  }

  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host");
  const protocol = hdrs.get("x-forwarded-proto") ?? "https";
  if (!host) {
    return { error: "Không thể xác định địa chỉ trang web. Vui lòng thử lại." };
  }
  const origin = `${protocol}://${host}`;

  const supabase = await getSessionSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/reset-password`,
  });

  // Luôn báo "đã gửi" dù email có tồn tại hay không — không để lộ email nào
  // đã đăng ký qua thông báo lỗi khác nhau.
  if (error) {
    console.error("Lỗi gửi email đặt lại mật khẩu:", error);
  }
  return { sent: true };
}
