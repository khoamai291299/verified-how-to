import Link from "next/link";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { RESULT_LABELS } from "@/lib/supabase/types";

// Danh sách How-To thay đổi liên tục — không thể prerender tĩnh lúc build.
export const dynamic = "force-dynamic";

type HowToCardData = {
  id: string;
  title: string;
  description: string | null;
  attempts: number;
  success: number;
  partial: number;
  failed: number;
  evidence: number;
};

export default async function DiscoverPage() {
  const supabase = getServerSupabaseClient();
  const { data: howTos, error } = await supabase
    .from("how_to")
    .select("id, title, description")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Lỗi tải danh sách Cách làm:", error);
    return (
      <main className="main-list">
        <h1>Khám phá</h1>
        <p role="alert">Không thể tải danh sách Cách làm. Vui lòng thử lại sau.</p>
      </main>
    );
  }

  const howToIds = howTos.map((h) => h.id);

  const { data: reports } = howToIds.length
    ? await supabase.from("attempt_report").select("id, how_to_id, result").in("how_to_id", howToIds)
    : { data: [] };

  const reportIds = (reports ?? []).map((r) => r.id);

  const { data: images } = reportIds.length
    ? await supabase.from("attempt_report_image").select("id, attempt_report_id").in("attempt_report_id", reportIds)
    : { data: [] };

  const reportIdToHowToId = new Map((reports ?? []).map((r) => [r.id, r.how_to_id]));
  const statsByHowTo = new Map<string, { attempts: number; success: number; partial: number; failed: number; evidence: number }>();
  for (const r of reports ?? []) {
    const s = statsByHowTo.get(r.how_to_id) ?? { attempts: 0, success: 0, partial: 0, failed: 0, evidence: 0 };
    s.attempts += 1;
    if (r.result === "success") s.success += 1;
    else if (r.result === "partial") s.partial += 1;
    else if (r.result === "failed") s.failed += 1;
    statsByHowTo.set(r.how_to_id, s);
  }
  for (const img of images ?? []) {
    const howToId = reportIdToHowToId.get(img.attempt_report_id);
    if (howToId) {
      const s = statsByHowTo.get(howToId);
      if (s) s.evidence += 1;
    }
  }

  const cards: HowToCardData[] = howTos.map((h) => {
    const s = statsByHowTo.get(h.id) ?? { attempts: 0, success: 0, partial: 0, failed: 0, evidence: 0 };
    return { id: h.id, title: h.title, description: h.description, ...s };
  });

  const totalAttempts = cards.reduce((sum, c) => sum + c.attempts, 0);
  const totalEvidence = cards.reduce((sum, c) => sum + c.evidence, 0);

  return (
    <main className="main-list">
      <section className="hero">
        <h1>Những cách làm đã được người thật thử</h1>
        <p className="supporting-text">
          Mỗi cách làm ở đây đi kèm báo cáo thật từ người đã thử — không chỉ là hướng dẫn lý thuyết.
        </p>
        {totalAttempts > 0 && (
          <p className="hero-stat">
            {totalAttempts} lần thử thật{totalEvidence > 0 ? ` · ${totalEvidence} bằng chứng` : ""} trên {cards.length}{" "}
            cách làm
          </p>
        )}
      </section>

      {cards.length === 0 ? (
        <div>
          <p>Chưa có cách làm nào.</p>
          <p className="supporting-text">Hãy chia sẻ cách làm đầu tiên.</p>
          <Link href="/how-to/new" className="button-primary">
            Tạo cách làm
          </Link>
        </div>
      ) : (
        <ul className="howto-list">
          {cards.map((card) => (
            <li key={card.id}>
              <div className="howto-entry">
                <div className="howto-entry-main">
                  <h2>
                    <Link href={`/how-to/${card.id}`}>{card.title}</Link>
                  </h2>
                  {card.description && <p className="supporting-text">{card.description}</p>}
                </div>

                <div className="howto-entry-stats">
                  {card.attempts === 0 ? (
                    <p className="stat-line">Chưa có lượt thử</p>
                  ) : (
                    <>
                      <p className="stat-line">{card.attempts} người đã thử</p>
                      <p className="stat-line">
                        {card.success} thành công · {card.partial} một phần · {card.failed}{" "}
                        {RESULT_LABELS.failed.toLowerCase()}
                      </p>
                    </>
                  )}
                  {card.evidence > 0 && <p className="stat-line">{card.evidence} bằng chứng</p>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
