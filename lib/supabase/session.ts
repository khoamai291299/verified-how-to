import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client Supabase gắn với phiên đăng nhập thật của người dùng (đọc cookie
 * session qua @supabase/ssr) — dùng anon key, KHÔNG bypass RLS.
 *
 * Khác với getServerSupabaseClient() (service_role, dùng cho toàn bộ truy
 * vấn dữ liệu hiện có — bypass RLS theo thiết kế đã chấp nhận). Client này
 * chỉ dùng để biết "ai đang đăng nhập" (getUser()) — không dùng để truy vấn
 * dữ liệu sản phẩm, để giữ đúng mô hình phân quyền hiện tại: RLS là
 * defense-in-depth, ủy quyền thật nằm ở tầng Server Action.
 */
export async function getSessionSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component không được set cookie — proxy.ts lo việc làm mới
          // session trên mỗi request, nên bỏ qua lỗi này là an toàn.
        }
      },
    },
  });
}

/** Người dùng hiện tại (hoặc null) — xác thực thật qua Supabase Auth, không
 * bao giờ tin dữ liệu client tự khai (mission "never trust client-provided user IDs"). */
export async function getCurrentUser() {
  const supabase = await getSessionSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
