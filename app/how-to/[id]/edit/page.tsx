import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";
import { getAllCategories } from "@/lib/supabase/categories";
import { HERO_IMAGE_BUCKET } from "@/lib/supabase/hero-image";
import { EditHowToForm } from "./edit-how-to-form";

export const dynamic = "force-dynamic";
const SIGNED_URL_TTL_SECONDS = 3600;

type EditPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Sửa cách làm – VHKP",
};

export default async function EditHowToPage({ params }: EditPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/sign-in?redirectTo=/how-to/${id}/edit`);
  }

  const supabase = getServerSupabaseClient();

  const { data: howTo, error: howToError } = await supabase
    .from("how_to")
    .select("id, title, description, expected_outcome, user_id, hero_image_path, dish:dish_id(name)")
    .eq("id", id)
    .maybeSingle();

  if (howToError) {
    if (howToError.code === "22P02") notFound();
    console.error("Lỗi tải Cách làm để sửa:", howToError);
    throw new Error("Không thể tải Cách làm. Vui lòng thử lại sau.");
  }
  if (!howTo) notFound();

  // Không chủ (user_id NULL, dữ liệu founder trước khi có tài khoản) hoặc
  // thuộc người khác — không cho vào trang sửa, kể cả khi biết URL trực tiếp.
  if (howTo.user_id !== user.id) {
    redirect(`/how-to/${id}`);
  }

  const dish = Array.isArray(howTo.dish) ? (howTo.dish[0] ?? null) : (howTo.dish ?? null);

  const [{ data: steps }, { data: ingredients }, { data: categoryLinks }, categories] = await Promise.all([
    supabase.from("how_to_step").select("instruction").eq("how_to_id", id).order("position", { ascending: true }),
    supabase
      .from("how_to_ingredient")
      .select("name, quantity, unit")
      .eq("how_to_id", id)
      .order("position", { ascending: true }),
    supabase.from("how_to_category").select("category_id").eq("how_to_id", id),
    getAllCategories(),
  ]);

  let heroImageUrl: string | null = null;
  if (howTo.hero_image_path) {
    const { data: signed } = await supabase.storage
      .from(HERO_IMAGE_BUCKET)
      .createSignedUrl(howTo.hero_image_path, SIGNED_URL_TTL_SECONDS);
    heroImageUrl = signed?.signedUrl ?? null;
  }

  return (
    <main>
      <h1>Sửa cách làm</h1>
      <p className="supporting-text">Cập nhật nội dung — thay đổi sẽ hiển thị ngay sau khi lưu.</p>
      <EditHowToForm
        howToId={id}
        categories={categories}
        initial={{
          dish: dish?.name ?? "",
          title: howTo.title,
          description: howTo.description ?? "",
          expectedOutcome: howTo.expected_outcome ?? "",
          ingredients: (ingredients ?? []).map((ing) => ({
            name: ing.name,
            quantity: ing.quantity ?? "",
            unit: ing.unit ?? "",
          })),
          steps: (steps ?? []).map((s) => s.instruction),
          categoryIds: (categoryLinks ?? []).map((c) => c.category_id),
          heroImageUrl,
        }}
      />
    </main>
  );
}
