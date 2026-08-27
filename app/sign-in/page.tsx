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
    <main>
      <h1>Đăng nhập</h1>
      <SignInForm redirectTo={redirectTo} />
    </main>
  );
}
