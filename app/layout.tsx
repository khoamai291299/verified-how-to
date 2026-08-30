import type { Metadata } from "next";
import { Be_Vietnam_Pro, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/session";
import { SignOutButton } from "@/app/sign-out/sign-out-button";
import { BottomNav } from "@/app/bottom-nav";
import "./globals.css";

// Be Vietnam Pro + IBM Plex Mono: đã chốt ở design-direction.md §4 — hỗ trợ đầy đủ
// dấu tiếng Việt, và font mono là cơ chế chính để phân biệt lớp Evidence khỏi How-To (§6).
// Dải weight mở rộng (300/500/800) phục vụ phân cấp editorial thật ở bản redesign V2.
const bodySans = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const evidenceMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Verified How-To",
  description: "Không chỉ cho bạn biết cách làm — mà cho bạn biết điều gì đã xảy ra khi người thật thử làm.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  const displayName = (user?.user_metadata as { display_name?: string } | undefined)?.display_name ?? user?.email ?? "";

  return (
    <html lang="vi" className={`${bodySans.variable} ${evidenceMono.variable}`}>
      <body>
        <header className="site-header">
          <Link href="/" className="brand">
            <span className="brand-row">
              {/* Ký hiệu spark trừu tượng — cố ý KHÔNG dùng hình checkmark: design-direction.md
                  §14 cấm rõ "checkmark xanh kiểu verified" vì gợi ý xác nhận hệ thống, mâu
                  thuẫn với nguyên tắc Evidence ≠ Truth. */}
              <svg className="brand-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 4 12 20 M5.5 7.5 18.5 16.5 M18.5 7.5 5.5 16.5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="brand-word">
                Verified <span>How-To</span>
              </span>
            </span>
            <span className="brand-kicker">sổ tay thực hành thật</span>
          </Link>
          <nav className="site-nav">
            {user ? (
              <>
                <Link href="/saved" className="nav-text-link">
                  Đã lưu
                </Link>
                <Link href="/profile" className="nav-text-link">
                  {displayName || "Hồ sơ"}
                </Link>
                <Link href="/how-to/new" className="button-primary">
                  + Tạo cách làm
                </Link>
                <span className="nav-text-link">
                  <SignOutButton />
                </span>
              </>
            ) : (
              <>
                <Link href="/sign-in" className="nav-text-link">
                  Đăng nhập
                </Link>
                <Link href="/sign-up" className="button-primary">
                  Đăng ký
                </Link>
              </>
            )}
          </nav>
        </header>

        {children}

        <footer className="site-footer">
          <p>Verified How-To — phản hồi thật từ người đã thử, không phải xác nhận của hệ thống.</p>
        </footer>

        <div className="bottom-nav-spacer" aria-hidden="true" />
        <BottomNav authed={user !== null} />
      </body>
    </html>
  );
}
