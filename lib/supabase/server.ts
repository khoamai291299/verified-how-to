import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase dùng service_role — chỉ được gọi từ server-side code
 * (Server Actions, Server Components). Import "server-only" khiến build
 * thất bại nếu file này vô tình bị import vào một component "use client".
 *
 * service_role bypass RLS theo thiết kế của Supabase — đây là hành vi
 * được chấp nhận (docs/architecture/database-schema-proposal-v1.md §6),
 * không phải lỗ hổng. Không import module này ở phía client.
 */
export function getServerSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Thiếu biến môi trường Supabase (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY). " +
        "Sao chép .env.local.example thành .env.local và điền giá trị thật.",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
