import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Đã lưu – VHKP",
};

export default async function SavedPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in?redirectTo=/saved");
  }

  const supabase = getServerSupabaseClient();

  const { data: saved, error } = await supabase
    .from("saved_how_to")
    .select("id, created_at, how_to:how_to_id(id, title, description, dish:dish_id(name))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Lỗi tải mục đã lưu:", error);
    throw new Error("Không thể tải danh sách đã lưu. Vui lòng thử lại sau.");
  }

  type SavedRow = {
    id: string;
    howTo: { id: string; title: string; description: string | null };
    dishName: string | null;
  };

  const rows: SavedRow[] = [];
  for (const row of saved ?? []) {
    const howTo = Array.isArray(row.how_to) ? (row.how_to[0] ?? null) : (row.how_to ?? null);
    if (!howTo) continue;
    const dish = Array.isArray(howTo.dish) ? (howTo.dish[0] ?? null) : (howTo.dish ?? null);
    rows.push({
      id: row.id,
      howTo: { id: howTo.id, title: howTo.title, description: howTo.description },
      dishName: dish?.name ?? null,
    });
  }

  return (
    <main className="main-list">
      <span className="eyebrow">Đã lưu</span>
      <h1>Cách làm bạn đã lưu</h1>

      {rows.length === 0 ? (
        <p className="supporting-text">
          Chưa có Cách làm nào được lưu. Bấm &quot;Lưu lại&quot; trên trang một Cách làm để xem lại sau.
        </p>
      ) : (
        <ul className="howto-list">
          {rows.map((row) => (
            <li key={row.id}>
              <div className="howto-entry">
                <div className="specimen" aria-hidden="true">
                  <span className="specimen-empty" />
                </div>
                <div className="howto-entry-main">
                  <h2>
                    <Link href={`/how-to/${row.howTo.id}`}>{row.howTo.title}</Link>
                  </h2>
                  {row.dishName && <p className="supporting-text">{row.dishName}</p>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
