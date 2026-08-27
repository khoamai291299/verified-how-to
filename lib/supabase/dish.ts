import { getServerSupabaseClient } from "@/lib/supabase/server";

/** Tìm Dish theo tên (không phân biệt hoa/thường, đã trim); tạo mới nếu chưa có. */
export async function findOrCreateDish(
  supabase: ReturnType<typeof getServerSupabaseClient>,
  name: string,
): Promise<{ id: string } | null> {
  const { data: existing } = await supabase.from("dish").select("id").ilike("name", name).maybeSingle();
  if (existing) return existing;

  const { data: created, error } = await supabase.from("dish").insert({ name }).select("id").single();
  if (error) {
    console.error("Lỗi tạo dish:", error);
    return null;
  }
  return created;
}
