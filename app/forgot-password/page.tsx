import type { Metadata } from "next";
import { AuthShell } from "../auth-shell";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Quên mật khẩu – VHKP",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <span className="eyebrow">Verified How-To</span>
      <h1>Quên mật khẩu</h1>
      <p className="supporting-text">Nhập email đã đăng ký — chúng tôi sẽ gửi một liên kết để bạn đặt lại mật khẩu.</p>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
