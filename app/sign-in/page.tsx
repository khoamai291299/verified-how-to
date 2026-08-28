import type { Metadata } from "next";
import { AuthShell } from "../auth-shell";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Đăng nhập – VHKP",
};

type SignInPageProps = {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { redirectTo, error } = await searchParams;

  return (
    <AuthShell>
      <span className="eyebrow">Verified How-To</span>
      <h1>Đăng nhập</h1>
      <p className="supporting-text">Vào lại để tạo cách làm, chia sẻ kết quả thật, và xem nội dung bạn đã lưu.</p>
      {error === "link-invalid" && <p role="alert">Liên kết đó không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.</p>}
      <SignInForm redirectTo={redirectTo} />
    </AuthShell>
  );
}
