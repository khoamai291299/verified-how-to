"use server";

import { redirect } from "next/navigation";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export type CreateHowToState = {
  error?: string;
  fieldErrors?: {
    title?: string;
    dish?: string;
    steps?: string;
  };
};

/** Tìm Dish theo tên (không phân biệt hoa/thường, đã trim); tạo mới nếu chưa có. */
async function findOrCreateDish(
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

export async function createHowTo(
  _prevState: CreateHowToState,
  formData: FormData,
): Promise<CreateHowToState> {
  const title = String(formData.get("title") ?? "").trim();
  const dishName = String(formData.get("dish") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const expectedOutcome = String(formData.get("expectedOutcome") ?? "").trim();
  const steps = formData
    .getAll("steps")
    .map((step) => String(step).trim())
    .filter((step) => step.length > 0);

  const ingredientNames = formData.getAll("ingredientName").map((v) => String(v).trim());
  const ingredientQuantities = formData.getAll("ingredientQuantity").map((v) => String(v).trim());
  const ingredientUnits = formData.getAll("ingredientUnit").map((v) => String(v).trim());
  const ingredients = ingredientNames
    .map((name, i) => ({
      name,
      quantity: ingredientQuantities[i] || null,
      unit: ingredientUnits[i] || null,
    }))
    .filter((ing) => ing.name.length > 0);

  const fieldErrors: CreateHowToState["fieldErrors"] = {};
  if (!title) {
    fieldErrors.title = "Vui lòng nhập tiêu đề.";
  }
  if (!dishName) {
    fieldErrors.dish = "Vui lòng cho biết đây là món gì.";
  }
  if (steps.length === 0) {
    fieldErrors.steps = "Cần ít nhất một bước.";
  }
  if (fieldErrors.title || fieldErrors.dish || fieldErrors.steps) {
    return { fieldErrors };
  }

  const supabase = getServerSupabaseClient();

  const dish = await findOrCreateDish(supabase, dishName);
  if (!dish) {
    return { error: "Không thể lưu món. Vui lòng thử lại." };
  }

  const { data: howTo, error: howToError } = await supabase
    .from("how_to")
    .insert({
      title,
      dish_id: dish.id,
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

  if (ingredients.length > 0) {
    const ingredientRows = ingredients.map((ing, index) => ({
      how_to_id: howTo.id as string,
      position: index + 1,
      name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit,
    }));
    const { error: ingredientsError } = await supabase.from("how_to_ingredient").insert(ingredientRows);
    if (ingredientsError) {
      // Nguyên liệu là tùy chọn ở form tạo — không hủy toàn bộ How-To nếu lưu
      // nguyên liệu thất bại, chỉ ghi log để không chặn luồng chính.
      console.error("Lỗi tạo how_to_ingredient:", ingredientsError);
    }
  }

  redirect(`/how-to/${howTo.id}`);
}
