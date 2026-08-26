"use server";

import { redirect } from "next/navigation";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export type CreateHowToState = {
  error?: string;
  fieldErrors?: {
    title?: string;
    steps?: string;
  };
};

export async function createHowTo(
  _prevState: CreateHowToState,
  formData: FormData,
): Promise<CreateHowToState> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const expectedOutcome = String(formData.get("expectedOutcome") ?? "").trim();
  const steps = formData
    .getAll("steps")
    .map((step) => String(step).trim())
    .filter((step) => step.length > 0);

  const fieldErrors: CreateHowToState["fieldErrors"] = {};
  if (!title) {
    fieldErrors.title = "Vui lòng nhập tiêu đề.";
  }
  if (steps.length === 0) {
    fieldErrors.steps = "Cần ít nhất một bước.";
  }
  if (fieldErrors.title || fieldErrors.steps) {
    return { fieldErrors };
  }

  const supabase = getServerSupabaseClient();

  const { data: howTo, error: howToError } = await supabase
    .from("how_to")
    .insert({
      title,
      description: description || null,
      expected_outcome: expectedOutcome || null,
    })
    .select("id")
    .single();

  if (howToError || !howTo) {
    console.error("Lỗi tạo how_to:", howToError);
    return { error: "Không thể tạo Cách làm. Vui lòng thử lại." };
  }

  const stepRows = steps.map((instruction, index) => ({
    how_to_id: howTo.id as string,
    position: index + 1,
    instruction,
  }));

  const { error: stepsError } = await supabase.from("how_to_step").insert(stepRows);

  if (stepsError) {
    console.error("Lỗi tạo how_to_step:", stepsError);
    // Bù trừ: xóa how_to vừa tạo để không để lại How-To 0 bước (tránh trạng thái nửa vời).
    await supabase.from("how_to").delete().eq("id", howTo.id);
    return { error: "Không thể lưu các bước. Vui lòng thử lại." };
  }

  redirect(`/how-to/${howTo.id}`);
}
