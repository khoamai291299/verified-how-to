import Link from "next/link";
import { getServerSupabaseClient } from "@/lib/supabase/server";

// Danh sách How-To thay đổi liên tục — không thể prerender tĩnh lúc build.
export const dynamic = "force-dynamic";

export default async function DiscoverPage() {
  const supabase = getServerSupabaseClient();
  const { data: howTos, error } = await supabase
    .from("how_to")
    .select("id, title, description")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Lỗi tải danh sách Cách làm:", error);
    return (
      <main>
        <h1>Khám phá</h1>
        <p role="alert">Không thể tải danh sách Cách làm. Vui lòng thử lại sau.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Khám phá</h1>
      {howTos.length === 0 ? (
        <div>
          <p>Chưa có Cách làm nào.</p>
          <Link href="/how-to/new">Tạo Cách làm đầu tiên</Link>
        </div>
      ) : (
        <ul>
          {howTos.map((howTo) => (
            <li key={howTo.id}>
              <Link href={`/how-to/${howTo.id}`}>
                <h2>{howTo.title}</h2>
                {howTo.description && <p>{howTo.description}</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
