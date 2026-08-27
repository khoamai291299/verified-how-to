import type { Metadata } from "next";
import { Be_Vietnam_Pro, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/session";
import { SignOutButton } from "@/app/sign-out/sign-out-button";
import "./globals.css";

// Be Vietnam Pro + IBM Plex Mono: đã chốt ở design-direction.md §4 — hỗ trợ đầy đủ
// dấu tiếng Việt, và font mono là cơ chế chính để phân biệt lớp Evidence khỏi How-To (§6).
const bodySans = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700"],
});

const evidenceMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin", "vietnamese"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "VHKP",
  description: "Verified How-To Knowledge Platform",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  const displayName = (user?.user_metadata as { display_name?: string } | undefined)?.display_name ?? user?.email ?? "";

  return (
    <html lang="vi" className={`${bodySans.variable} ${evidenceMono.variable}`}>
      <body>
        <header>
          <Link href="/" className="brand">
            Verified How-To
          </Link>
          <nav className="site-nav">
            <Link href="/">Khám phá</Link>
            {user ? (
              <>
                <Link href="/saved">Đã lưu</Link>
                <Link href="/profile">{displayName || "Hồ sơ"}</Link>
                <Link href="/how-to/new" className="button-primary">
                  + Tạo cách làm
                </Link>
                <SignOutButton />
              </>
            ) : (
              <>
                <Link href="/sign-in">Đăng nhập</Link>
                <Link href="/sign-up" className="button-primary">
                  Đăng ký
                </Link>
              </>
            )}
          </nav>
        </header>
        {children}
        <footer className="site-footer">
          <p>Verified How-To — bằng chứng thật từ người đã thử, không phải xác nhận của hệ thống.</p>
        </footer>
      </body>
    </html>
  );
}
