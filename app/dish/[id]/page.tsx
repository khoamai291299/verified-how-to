import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import type { AttemptReportResult } from "@/lib/supabase/types";

// Số lần thử thay đổi liên tục — không prerender tĩnh lúc build.
export const dynamic = "force-dynamic";

const STORAGE_BUCKET = "attempt-report-images";
const SIGNED_URL_TTL_SECONDS = 3600;
const MAX_TALLY_MARKS = 10;

type DishPageProps = {
  params: Promise<{ id: string }>;
};

type HowToCardData = {
  id: string;
  title: string;
  description: string | null;
  attempts: number;
  results: AttemptReportResult[];
  evidence: number;
  specimenUrl: string | null;
};

export async function generateMetadata({ params }: DishPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = getServerSupabaseClient();
  const { data: dish } = await supabase.from("dish").select("name").eq("id", id).maybeSingle();
  return { title: dish ? `${dish.name} – VHKP` : "VHKP" };
}

export default async function DishPage({ params }: DishPageProps) {
  const { id } = await params;
  const supabase = getServerSupabaseClient();

  const { data: dish, error: dishError } = await supabase.from("dish").select("id, name").eq("id", id).maybeSingle();

  if (dishError) {
    if (dishError.code === "22P02") notFound();
    console.error("Lỗi tải Món:", dishError);
    throw new Error("Không thể tải Món. Vui lòng thử lại sau.");
  }
  if (!dish) notFound();

  const { data: howTos, error: howToError } = await supabase
    .from("how_to")
    .select("id, title, description")
    .eq("dish_id", id)
    .order("created_at", { ascending: false });

  if (howToError) {
    console.error("Lỗi tải các Cách làm:", howToError);
    throw new Error("Không thể tải các Cách làm. Vui lòng thử lại sau.");
  }

  const howToIds = howTos.map((h) => h.id);

  const { data: reports } = howToIds.length
    ? await supabase
        .from("attempt_report")
        .select("id, how_to_id, result, submitted_at")
        .in("how_to_id", howToIds)
        .order("submitted_at", { ascending: false })
    : { data: [] };

  const reportIds = (reports ?? []).map((r) => r.id);

  const { data: images } = reportIds.length
    ? await supabase
        .from("attempt_report_image")
        .select("id, attempt_report_id, storage_path")
        .in("attempt_report_id", reportIds)
        .order("position", { ascending: true })
    : { data: [] };

  const reportIdToHowToId = new Map((reports ?? []).map((r) => [r.id, r.how_to_id]));
  const firstImagePathByReportId = new Map<string, string>();
  for (const img of images ?? []) {
    if (!firstImagePathByReportId.has(img.attempt_report_id)) {
      firstImagePathByReportId.set(img.attempt_report_id, img.storage_path);
    }
  }
  const evidenceCountByHowTo = new Map<string, number>();
  for (const img of images ?? []) {
    const howToId = reportIdToHowToId.get(img.attempt_report_id);
    if (howToId) evidenceCountByHowTo.set(howToId, (evidenceCountByHowTo.get(howToId) ?? 0) + 1);
  }

  const specimenPathByHowTo = new Map<string, string>();
  const resultsByHowTo = new Map<string, AttemptReportResult[]>();
  for (const r of reports ?? []) {
    const list = resultsByHowTo.get(r.how_to_id) ?? [];
    list.push(r.result as AttemptReportResult);
    resultsByHowTo.set(r.how_to_id, list);
    if (!specimenPathByHowTo.has(r.how_to_id)) {
      const path = firstImagePathByReportId.get(r.id);
      if (path) specimenPathByHowTo.set(r.how_to_id, path);
    }
  }

  const specimenPaths = [...specimenPathByHowTo.values()];
  const specimenUrlByPath = new Map<string, string | null>();
  if (specimenPaths.length > 0) {
    const { data: signedUrlsData } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrls(specimenPaths, SIGNED_URL_TTL_SECONDS);
    for (const entry of signedUrlsData ?? []) {
      specimenUrlByPath.set(entry.path ?? "", entry.signedUrl ?? null);
    }
  }

  const cards: HowToCardData[] = howTos.map((h) => {
    const results = resultsByHowTo.get(h.id) ?? [];
    const specimenPath = specimenPathByHowTo.get(h.id);
    return {
      id: h.id,
      title: h.title,
      description: h.description,
      attempts: results.length,
      results,
      evidence: evidenceCountByHowTo.get(h.id) ?? 0,
      specimenUrl: specimenPath ? (specimenUrlByPath.get(specimenPath) ?? null) : null,
    };
  });

  const totalAttempts = cards.reduce((sum, c) => sum + c.attempts, 0);

  return (
    <main className="main-list">
      <Link href="/" className="back-link">
        ← Khám phá
      </Link>

      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow">Món</span>
          <h1>{dish.name}</h1>
          <p className="supporting-text">
            {cards.length} cách làm{totalAttempts > 0 ? ` · ${totalAttempts} lần thử thật` : ""}
          </p>
        </div>
      </section>

      {cards.length === 0 ? (
        <p className="supporting-text">Chưa có Cách làm nào cho món này.</p>
      ) : (
        <ul className="howto-list">
          {cards.map((card) => (
            <li key={card.id}>
              <div className="howto-entry">
                <div className="specimen" aria-hidden="true">
                  {card.specimenUrl ? (
                    <img src={card.specimenUrl} alt="" className="specimen-image" />
                  ) : (
                    <span className="specimen-empty" />
                  )}
                </div>

                <div className="howto-entry-main">
                  <h2>
                    <Link href={`/how-to/${card.id}`}>{card.title}</Link>
                  </h2>
                  {card.description && <p className="supporting-text">{card.description}</p>}
                </div>

                <div className="howto-entry-tally">
                  {card.attempts === 0 ? (
                    <p className="tally-empty">Chưa có lượt thử</p>
                  ) : (
                    <>
                      <div className="tally-marks" aria-hidden="true">
                        {card.results.slice(0, MAX_TALLY_MARKS).map((result, i) => (
                          <span key={i} className="tally-mark" data-result={result} />
                        ))}
                        {card.attempts > MAX_TALLY_MARKS && (
                          <span className="tally-overflow">+{card.attempts - MAX_TALLY_MARKS}</span>
                        )}
                      </div>
                      <p className="tally-caption">
                        {card.attempts} lần thử{card.evidence > 0 ? ` · ${card.evidence} ảnh kết quả` : ""}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
