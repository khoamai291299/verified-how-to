import type { Metadata } from "next";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Quên mật khẩu – VHKP",
};

export default function ForgotPasswordPage() {
  return (
    <main className="auth-main">
      <div className="auth-card">
        <span className="eyebrow">Verified How-To</span>
        <h1>Quên mật khẩu</h1>
        <p className="supporting-text">Nhập email đã đăng ký — chúng tôi sẽ gửi một liên kết để bạn đặt lại mật khẩu.</p>
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
