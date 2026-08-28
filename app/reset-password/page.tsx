import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/session";
import { AuthShell } from "../auth-shell";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu – VHKP",
};

export default async function ResetPasswordPage() {
  const user = await getCurrentUser();

  return (
    <AuthShell>
      <span className="eyebrow">Verified How-To</span>
      <h1>Đặt lại mật khẩu</h1>
      {user ? (
        <>
          <p className="supporting-text">Chọn một mật khẩu mới cho tài khoản {user.email}.</p>
          <ResetPasswordForm />
        </>
      ) : (
        <p className="supporting-text">
          Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.{" "}
          <Link href="/forgot-password">Yêu cầu một liên kết mới →</Link>
        </p>
      )}
    </AuthShell>
  );
}
