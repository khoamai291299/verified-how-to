import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Làm mới cookie phiên đăng nhập Supabase trên mỗi request — mẫu chuẩn của
 * @supabase/ssr. Next.js 16 đổi tên middleware.ts -> proxy.ts, đổi tên export
 * middleware -> proxy (hành vi giữ nguyên, chỉ đổi tên file/export).
 *
 * Đây KHÔNG phải nơi thực thi kiểm tra quyền — theo đúng khuyến nghị chính
 * thức của Next.js 16 ("Always verify authentication and authorization
 * inside each Server Function rather than relying on Proxy alone"), mọi
 * Server Action vẫn tự kiểm tra người dùng qua getCurrentUser().
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Gọi getUser() (không phải getSession()) để buộc xác thực lại token với
  // Supabase Auth server thay vì chỉ đọc cookie chưa xác minh.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
