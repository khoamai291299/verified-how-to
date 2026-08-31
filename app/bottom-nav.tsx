"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function current(pathname: string, href: string): "page" | undefined {
  if (href === "/") return pathname === "/" ? "page" : undefined;
  return pathname.startsWith(href) ? "page" : undefined;
}

function CompassIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M14.5 9.5 10 14l1-4.5 4.5-1L14.5 9.5 10 14" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M19.5 19.5 15 15" strokeLinecap="round" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="7" height="7" rx="1.2" />
      <rect x="13" y="4" width="7" height="7" rx="1.2" />
      <rect x="4" y="13" width="7" height="7" rx="1.2" />
      <rect x="13" y="13" width="7" height="7" rx="1.2" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 4h12v16l-6-4-6 4V4Z" strokeLinejoin="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" strokeLinecap="round" />
    </svg>
  );
}

function SignInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 3h9v18H9M15 12H3m0 0 4-4m-4 4 4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * 5 mục cố định — khớp đúng IA mới của mission (§4/§6): Khám phá, Tìm kiếm,
 * Chủ đề, Đã lưu, Hồ sơ. "Chia sẻ kiến thức" (CTA chính) cố ý KHÔNG có mặt ở
 * đây trên mobile — mission liệt kê rõ 5 mục này cho bottom nav, không có
 * mục thứ 6; CTA tạo vẫn tới được qua nút trong .site-header (luôn hiển thị,
 * mọi breakpoint) thay vì chiếm 1/5 chỗ của thanh điều hướng chính.
 */
export function BottomNav({ authed }: { authed: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav" aria-label="Điều hướng chính">
      <Link href="/" className="bottom-nav-item" aria-current={current(pathname, "/")}>
        <CompassIcon />
        <span>Khám phá</span>
      </Link>

      <Link href="/search" className="bottom-nav-item" aria-current={current(pathname, "/search")}>
        <SearchIcon />
        <span>Tìm kiếm</span>
      </Link>

      <Link href="/topics" className="bottom-nav-item" aria-current={current(pathname, "/topics")}>
        <GridIcon />
        <span>Chủ đề</span>
      </Link>

      <Link
        href={authed ? "/saved" : "/sign-in?redirectTo=/saved"}
        className="bottom-nav-item"
        aria-current={current(pathname, "/saved")}
      >
        <BookmarkIcon />
        <span>Đã lưu</span>
      </Link>

      <Link
        href={authed ? "/profile" : "/sign-in"}
        className="bottom-nav-item"
        aria-current={current(pathname, authed ? "/profile" : "/sign-in")}
      >
        {authed ? <UserIcon /> : <SignInIcon />}
        <span>{authed ? "Hồ sơ" : "Đăng nhập"}</span>
      </Link>
    </nav>
  );
}
