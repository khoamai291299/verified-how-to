"use server";

import { revalidatePath } from "next/cache";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";

export type ToggleSavedState = {
  saved: boolean;
  error?: string;
};

export async function toggleSaved(
  howToId: string,
  prevState: ToggleSavedState,
  _formData: FormData,
): Promise<ToggleSavedState> {
  const user = await getCurrentUser();
  if (!user) {
    return { saved: prevState.saved, error: "Vui lòng đăng nhập để lưu." };
  }

  const supabase = getServerSupabaseClient();

  const { data: existing, error: existingError } = await supabase
    .from("saved_how_to")
    .select("id")
    .eq("user_id", user.id)
    .eq("how_to_id", howToId)
    .maybeSingle();

  if (existingError) {
    console.error("Lỗi kiểm tra mục đã lưu:", existingError);
    return { saved: prevState.saved, error: "Không thể cập nhật. Vui lòng thử lại." };
  }

  if (existing) {
    const { error: deleteError } = await supabase.from("saved_how_to").delete().eq("id", existing.id);
    if (deleteError) {
      console.error("Lỗi bỏ lưu:", deleteError);
      return { saved: prevState.saved, error: "Không thể cập nhật. Vui lòng thử lại." };
    }
    revalidatePath(`/how-to/${howToId}`);
    revalidatePath("/saved");
    revalidatePath("/");
    return { saved: false };
  }

  const { error: insertError } = await supabase.from("saved_how_to").insert({ user_id: user.id, how_to_id: howToId });
  if (insertError) {
    console.error("Lỗi lưu:", insertError);
    return { saved: prevState.saved, error: "Không thể cập nhật. Vui lòng thử lại." };
  }
  revalidatePath(`/how-to/${howToId}`);
  revalidatePath("/saved");
  revalidatePath("/");
  return { saved: true };
}
