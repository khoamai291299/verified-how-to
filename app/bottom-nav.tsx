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

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
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

export function BottomNav({ authed }: { authed: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav" aria-label="Điều hướng chính">
      <Link href="/" className="bottom-nav-item" aria-current={current(pathname, "/")}>
        <CompassIcon />
        <span>Khám phá</span>
      </Link>

      {authed ? (
        <>
          <Link href="/saved" className="bottom-nav-item" aria-current={current(pathname, "/saved")}>
            <BookmarkIcon />
            <span>Đã lưu</span>
          </Link>
          <Link
            href="/how-to/new"
            className="bottom-nav-item bottom-nav-item-create"
            aria-current={current(pathname, "/how-to/new")}
          >
            <span className="bottom-nav-create-badge">
              <PlusIcon />
            </span>
            <span>Tạo</span>
          </Link>
          <Link href="/profile" className="bottom-nav-item" aria-current={current(pathname, "/profile")}>
            <UserIcon />
            <span>Hồ sơ</span>
          </Link>
        </>
      ) : (
        <>
          <Link href="/sign-in" className="bottom-nav-item" aria-current={current(pathname, "/sign-in")}>
            <SignInIcon />
            <span>Đăng nhập</span>
          </Link>
          <Link href="/sign-up" className="bottom-nav-item" aria-current={current(pathname, "/sign-up")}>
            <UserIcon />
            <span>Đăng ký</span>
          </Link>
        </>
      )}
    </nav>
  );
}
