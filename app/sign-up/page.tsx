import type { Metadata } from "next";
import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = {
  title: "Đăng ký – VHKP",
};

export default function SignUpPage() {
  return (
    <main>
      <h1>Đăng ký</h1>
      <p className="supporting-text">Tạo tài khoản để chia sẻ Cách làm, gửi kết quả thật, và lưu lại nội dung bạn quan tâm.</p>
      <SignUpForm />
    </main>
  );
}
