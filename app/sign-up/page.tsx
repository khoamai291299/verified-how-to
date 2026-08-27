import type { Metadata } from "next";
import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = {
  title: "Đăng ký – VHKP",
};

export default function SignUpPage() {
  return (
    <main className="auth-main">
      <div className="auth-card">
        <span className="eyebrow">Verified How-To</span>
        <h1>Đăng ký</h1>
        <p className="supporting-text">
          Tạo tài khoản để chia sẻ cách làm, gửi kết quả thật khi bạn thử, và lưu lại nội dung bạn quan tâm. Việc xem
          Cách làm và Phản hồi thực tế luôn miễn phí, không cần tài khoản.
        </p>
        <SignUpForm />
      </div>
    </main>
  );
}
