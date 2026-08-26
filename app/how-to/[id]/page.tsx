import { notFound } from "next/navigation";
import { getServerSupabaseClient } from "@/lib/supabase/server";

// Nội dung phụ thuộc dữ liệu thật (How-To + Evidence sau này) — không prerender tĩnh lúc build.
export const dynamic = "force-dynamic";

type HowToDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function HowToDetailPage({ params }: HowToDetailPageProps) {
  const { id } = await params;
  const supabase = getServerSupabaseClient();

  const { data: howTo, error: howToError } = await supabase
    .from("how_to")
    .select("id, title, description, expected_outcome")
    .eq("id", id)
    .maybeSingle();

  if (howToError) {
    if (howToError.code === "22P02") {
      // Sai định dạng UUID trong URL — với người dùng, tương đương "không tìm thấy".
      notFound();
    }
    console.error("Lỗi tải Cách làm:", howToError);
    throw new Error("Không thể tải Cách làm. Vui lòng thử lại sau.");
  }

  if (!howTo) {
    notFound();
  }

  const { data: steps, error: stepsError } = await supabase
    .from("how_to_step")
    .select("id, instruction")
    .eq("how_to_id", id)
    .order("position", { ascending: true });

  if (stepsError) {
    console.error("Lỗi tải các bước:", stepsError);
    throw new Error("Không thể tải các bước. Vui lòng thử lại sau.");
  }

  return (
    <main>
      <h1>{howTo.title}</h1>
      {howTo.description && <p>{howTo.description}</p>}

      <ol>
        {(steps ?? []).map((step) => (
          <li key={step.id}>{step.instruction}</li>
        ))}
      </ol>

      {howTo.expected_outcome && (
        <section>
          <h2>Kết quả mong đợi</h2>
          <p>{howTo.expected_outcome}</p>
        </section>
      )}
    </main>
  );
}
