import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase phía trình duyệt — dùng anon key (an toàn khi lộ ra, RLS
 * bảo vệ). Chỉ dùng cho tương tác Auth (đăng nhập/đăng ký/đăng xuất) ở
 * Client Component; mọi truy vấn dữ liệu vẫn đi qua Server Action như trước.
 */
export function getBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
