import type { Metadata } from "next";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Đăng nhập – VHKP",
};

type SignInPageProps = {
  searchParams: Promise<{ redirectTo?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { redirectTo } = await searchParams;

  return (
    <main className="auth-main">
      <div className="auth-card">
        <span className="eyebrow">Verified How-To</span>
        <h1>Đăng nhập</h1>
        <p className="supporting-text">Vào lại để tạo cách làm, chia sẻ kết quả thật, và xem nội dung bạn đã lưu.</p>
        <SignInForm redirectTo={redirectTo} />
      </div>
    </main>
  );
}
