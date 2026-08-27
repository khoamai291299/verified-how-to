"use server";

import { redirect } from "next/navigation";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";
import { findOrCreateDish } from "@/lib/supabase/dish";
import { readHeroImageFile, replaceHeroImage } from "@/lib/supabase/hero-image";
import type { HowToFormState } from "../../how-to-form-types";

export async function updateHowTo(
  howToId: string,
  _prevState: HowToFormState,
  formData: FormData,
): Promise<HowToFormState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/sign-in?redirectTo=/how-to/${howToId}/edit`);
  }

  const supabase = getServerSupabaseClient();

  const { data: existing, error: existingError } = await supabase
    .from("how_to")
    .select("id, user_id, hero_image_path")
    .eq("id", howToId)
    .maybeSingle();

  if (existingError || !existing) {
    return { error: "Cách làm không tồn tại." };
  }
  // Cùng luật ủy quyền xóa: chỉ chủ sở hữu thật mới sửa được. Nội dung không
  // chủ (dữ liệu founder có trước khi có tài khoản) không thể sửa qua UI.
  if (existing.user_id !== user.id) {
    return { error: "Bạn không có quyền sửa Cách làm này." };
  }

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
  const categoryIds = formData.getAll("categoryIds").map((v) => String(v));
  const { file: heroImageFile, error: heroImageFieldError } = readHeroImageFile(formData);

  const fieldErrors: HowToFormState["fieldErrors"] = {};
  if (!title) fieldErrors.title = "Vui lòng nhập tiêu đề.";
  if (!dishName) fieldErrors.dish = "Vui lòng cho biết đây là món gì.";
  if (steps.length === 0) fieldErrors.steps = "Cần ít nhất một bước.";
  if (fieldErrors.title || fieldErrors.dish || fieldErrors.steps) {
    return { fieldErrors };
  }
  if (heroImageFieldError) {
    return { error: heroImageFieldError };
  }

  const dish = await findOrCreateDish(supabase, dishName);
  if (!dish) {
    return { error: "Không thể lưu món. Vui lòng thử lại." };
  }

  const { error: updateError } = await supabase
    .from("how_to")
    .update({
      title,
      dish_id: dish.id,
      description: description || null,
      expected_outcome: expectedOutcome || null,
    })
    .eq("id", howToId);

  if (updateError) {
    console.error("Lỗi cập nhật how_to:", updateError);
    return { error: "Không thể lưu thay đổi. Vui lòng thử lại." };
  }

  // Thay toàn bộ bước/nguyên liệu/category — nhất quán với cách form gửi
  // toàn bộ danh sách hiện tại mỗi lần lưu, không phải diff từng dòng.
  const { error: deleteStepsError } = await supabase.from("how_to_step").delete().eq("how_to_id", howToId);
  if (deleteStepsError) {
    console.error("Lỗi xóa bước cũ:", deleteStepsError);
    return { error: "Không thể lưu thay đổi. Vui lòng thử lại." };
  }
  const stepRows = steps.map((instruction, index) => ({ how_to_id: howToId, position: index + 1, instruction }));
  const { error: stepsError } = await supabase.from("how_to_step").insert(stepRows);
  if (stepsError) {
    console.error("Lỗi lưu bước mới:", stepsError);
    return { error: "Không thể lưu các bước. Vui lòng thử lại." };
  }

  const { error: deleteIngredientsError } = await supabase.from("how_to_ingredient").delete().eq("how_to_id", howToId);
  if (deleteIngredientsError) {
    console.error("Lỗi xóa nguyên liệu cũ:", deleteIngredientsError);
  } else if (ingredients.length > 0) {
    const ingredientRows = ingredients.map((ing, index) => ({
      how_to_id: howToId,
      position: index + 1,
      name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit,
    }));
    const { error: ingredientsError } = await supabase.from("how_to_ingredient").insert(ingredientRows);
    if (ingredientsError) console.error("Lỗi lưu nguyên liệu mới:", ingredientsError);
  }

  const { error: deleteCategoriesError } = await supabase.from("how_to_category").delete().eq("how_to_id", howToId);
  if (deleteCategoriesError) {
    console.error("Lỗi xóa category cũ:", deleteCategoriesError);
  } else if (categoryIds.length > 0) {
    const categoryRows = categoryIds.map((categoryId) => ({ how_to_id: howToId, category_id: categoryId }));
    const { error: categoryError } = await supabase.from("how_to_category").insert(categoryRows);
    if (categoryError) console.error("Lỗi lưu category mới:", categoryError);
  }

  if (heroImageFile) {
    const { path, error: uploadError } = await replaceHeroImage(supabase, howToId, heroImageFile, existing.hero_image_path);
    if (uploadError) {
      console.error("Lỗi thay ảnh minh họa:", uploadError);
    } else if (path) {
      await supabase.from("how_to").update({ hero_image_path: path }).eq("id", howToId);
    }
  }

  redirect(`/how-to/${howToId}`);
}
