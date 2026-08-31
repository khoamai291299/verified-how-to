"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "vhkp-nav-rail-collapsed";

// Trạng thái thu gọn của nav rail sống trong localStorage — một "external
// store" theo đúng nghĩa của React. Dùng useSyncExternalStore thay vì
// useState + useEffect để đồng bộ: tránh setState đồng bộ trong effect (lỗi
// react-hooks/set-state-in-effect) và tránh nguy cơ lệch hydration, vì
// getServerSnapshot luôn trả về false (mở rộng) khớp với render trên server.
let collapsedCache: boolean | null = null;
const listeners = new Set<() => void>();

function readCollapsed(): boolean {
  if (collapsedCache === null) {
    // localStorage access THROWS (SecurityError), it doesn't just return null,
    // on browsers configured to block site data. This component renders in the
    // root layout with no error boundary above it, so an uncaught throw here
    // would break every route on the site. Fall back to false (expanded),
    // matching getServerSnapshotCollapsed's server-render default.
    try {
      collapsedCache = window.localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      collapsedCache = false;
    }
  }
  return collapsedCache;
}

function writeCollapsed(next: boolean) {
  collapsedCache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    // Persistence unavailable — the in-memory cache above and the listener
    // notification below still make the toggle work for this page session.
  }
  listeners.forEach((listener) => listener());
}

function subscribeCollapsed(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getServerSnapshotCollapsed() {
  return false;
}

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

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14.5 5 8 12l6.5 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function NavRail({ authed }: { authed: boolean }) {
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(subscribeCollapsed, readCollapsed, getServerSnapshotCollapsed);

  function toggleCollapsed() {
    writeCollapsed(!collapsed);
  }

  return (
    <nav className="nav-rail" aria-label="Điều hướng chính" data-collapsed={collapsed}>
      {/* Panel ngoài (.nav-rail) trải hết chiều cao trang để nền/viền phải
          liền mạch với nội dung dài — nếu position:sticky đặt trực tiếp lên
          nó thì chính chiều cao "trải hết" đó lại triệt tiêu hiệu ứng ghim
          (không còn khoảng thừa để trôi). Bọc nội dung điều hướng thật trong
          một wrapper con ghim riêng, độc lập với chiều cao panel ngoài. */}
      <div className="nav-rail-sticky">
        <button
          type="button"
          className="nav-rail-toggle"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Mở rộng điều hướng" : "Thu gọn điều hướng"}
          aria-pressed={collapsed}
        >
          <span className="nav-rail-chevron" data-collapsed={collapsed}>
            <ChevronIcon />
          </span>
        </button>

        <Link
          href="/"
          className="nav-rail-item"
          aria-current={current(pathname, "/")}
          title={collapsed ? "Khám phá" : undefined}
        >
          <CompassIcon />
          <span>Khám phá</span>
        </Link>

        <Link href="/#tim-kiem" className="nav-rail-item" title={collapsed ? "Tìm kiếm" : undefined}>
          <SearchIcon />
          <span>Tìm kiếm</span>
        </Link>

        <Link href="/#chu-de" className="nav-rail-item" title={collapsed ? "Chủ đề" : undefined}>
          <GridIcon />
          <span>Chủ đề</span>
        </Link>

        <Link
          href={authed ? "/saved" : "/sign-in?redirectTo=/saved"}
          className="nav-rail-item"
          aria-current={current(pathname, "/saved")}
          title={collapsed ? "Đã lưu" : undefined}
        >
          <BookmarkIcon />
          <span>Đã lưu</span>
        </Link>

        <Link
          href={authed ? "/how-to/new" : "/sign-in?redirectTo=/how-to/new"}
          className="nav-rail-item nav-rail-item-accent"
          aria-current={current(pathname, "/how-to/new")}
          title={collapsed ? "Chia sẻ kiến thức" : undefined}
        >
          <PlusIcon />
          <span>Chia sẻ kiến thức</span>
        </Link>

        <Link
          href={authed ? "/profile" : "/sign-in?redirectTo=/profile"}
          className="nav-rail-item"
          aria-current={current(pathname, "/profile")}
          title={collapsed ? (authed ? "Hồ sơ" : "Đăng nhập") : undefined}
        >
          {authed ? <UserIcon /> : <SignInIcon />}
          <span>{authed ? "Hồ sơ" : "Đăng nhập"}</span>
        </Link>
      </div>
    </nav>
  );
}
