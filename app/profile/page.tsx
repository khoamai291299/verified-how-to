import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";
import { RESULT_LABELS, type AttemptReportResult } from "@/lib/supabase/types";
import { SignOutButton } from "@/app/sign-out/sign-out-button";

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

  const [{ data: myHowTos }, { data: myAttempts }, { count: savedCount }] = await Promise.all([
    supabase
      .from("how_to")
      .select("id, title, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("attempt_report")
      .select("id, result, submitted_at, how_to:how_to_id(id, title)")
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false }),
    supabase.from("saved_how_to").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  const attemptRows = (myAttempts ?? []).map((a) => {
    const howTo = Array.isArray(a.how_to) ? (a.how_to[0] ?? null) : (a.how_to ?? null);
    return { id: a.id, result: a.result as AttemptReportResult, submitted_at: a.submitted_at, howTo };
  });

  return (
    <main>
      <span className="eyebrow">Sổ tay của bạn</span>
      <h1>{displayName}</h1>
      <p className="supporting-text">{user.email}</p>

      <p>
        <Link href="/saved">Xem {savedCount ?? 0} Cách làm đã lưu →</Link>
      </p>

      <hr className="section-divider" />

      <span className="eyebrow">Cách làm đã tạo ({(myHowTos ?? []).length})</span>
      {(myHowTos ?? []).length === 0 ? (
        <p className="supporting-text">
          Bạn chưa tạo Cách làm nào. <Link href="/how-to/new">Chia sẻ cách làm đầu tiên →</Link>
        </p>
      ) : (
        <ul className="profile-list">
          {(myHowTos ?? []).map((h) => (
            <li key={h.id}>
              <Link href={`/how-to/${h.id}`}>{h.title}</Link>
            </li>
          ))}
        </ul>
      )}

      <hr className="section-divider" />

      <span className="eyebrow">Lần thử đã chia sẻ ({attemptRows.length})</span>
      {attemptRows.length === 0 ? (
        <p className="supporting-text">Bạn chưa chia sẻ kết quả lần thử nào.</p>
      ) : (
        <ul className="profile-list">
          {attemptRows.map((a) => (
            <li key={a.id}>
              {a.howTo ? <Link href={`/how-to/${a.howTo.id}`}>{a.howTo.title}</Link> : <span>Cách làm đã bị xóa</span>}
              <span className="profile-list-meta">
                {" — "}
                {RESULT_LABELS[a.result]} · {new Date(a.submitted_at).toLocaleDateString("vi-VN")}
              </span>
            </li>
          ))}
        </ul>
      )}

      <hr className="section-divider" />
      <div className="profile-actions">
        <SignOutButton />
      </div>
    </main>
  );
}
