import { NextResponse } from "next/server";
import { getSessionSupabaseClient } from "@/lib/supabase/session";

/**
 * Route Handler xử lý callback của Supabase Auth cho các luồng dùng mã PKCE
 * (đặt lại mật khẩu, xác nhận email khi Site URL trỏ về đây) — đổi `code`
 * lấy session thật rồi mới redirect tới `next`. Phải là Route Handler (không
 * phải Server Component): chỉ Route Handler mới ghi được cookie session vào
 * response (xem chú thích trong lib/supabase/session.ts).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";
  const safeNext = next.startsWith("/") ? next : "/";

  if (code) {
    const supabase = await getSessionSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(safeNext, url.origin));
    }
  }

  return NextResponse.redirect(new URL("/sign-in?error=link-invalid", url.origin));
}
