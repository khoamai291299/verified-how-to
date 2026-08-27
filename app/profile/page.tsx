import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hồ sơ – VHKP",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in?redirectTo=/profile");
  }

  const displayName = (user.user_metadata as { display_name?: string } | undefined)?.display_name ?? user.email ?? "";

  const supabase = getServerSupabaseClient();

  const [{ count: howToCount }, { count: attemptCount }] = await Promise.all([
    supabase.from("how_to").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("attempt_report").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  return (
    <main>
      <span className="eyebrow">Hồ sơ</span>
      <h1>{displayName}</h1>
      <p className="supporting-text">{user.email}</p>

      <hr className="section-divider" />

      <dl className="profile-stats">
        <div>
          <dt>Cách làm đã tạo</dt>
          <dd>{howToCount ?? 0}</dd>
        </div>
        <div>
          <dt>Lần thử đã chia sẻ</dt>
          <dd>{attemptCount ?? 0}</dd>
        </div>
      </dl>

      <p>
        <Link href="/saved">Xem Cách làm đã lưu →</Link>
      </p>
    </main>
  );
}
