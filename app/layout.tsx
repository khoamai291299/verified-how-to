import type { Metadata } from "next";
import { Be_Vietnam_Pro, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

// Be Vietnam Pro + IBM Plex Mono: đã chốt ở design-direction.md §4 — hỗ trợ đầy đủ
// dấu tiếng Việt, và font mono là cơ chế chính để phân biệt lớp Evidence khỏi How-To (§6).
const bodySans = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600"],
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${bodySans.variable} ${evidenceMono.variable}`}>
      <body>
        <header>
          <Link href="/">VHKP</Link>
          <Link href="/how-to/new">+ Tạo cách làm mới</Link>
        </header>
        {children}
      </body>
    </html>
  );
}
