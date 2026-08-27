import { getServerSupabaseClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/supabase/types";

export async function getAllCategories(): Promise<Category[]> {
  const supabase = getServerSupabaseClient();
  const { data, error } = await supabase
    .from("category")
    .select("id, dimension, name, slug, position")
    .order("dimension", { ascending: true })
    .order("position", { ascending: true });

  if (error) {
    console.error("Lỗi tải category:", error);
    return [];
  }
  return (data ?? []) as Category[];
}
