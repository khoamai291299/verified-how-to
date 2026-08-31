import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";
import { RESULT_LABELS, type AttemptReportResult } from "@/lib/supabase/types";
import { SaveIconButton, SaveIconSignInLink } from "@/app/saved/save-icon-button";
import { getTopicBySlug } from "@/lib/topics";

export const dynamic = "force-dynamic";

const STORAGE_BUCKET = "attempt-report-images";
const SIGNED_URL_TTL_SECONDS = 3600;

type TopicPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  return { title: topic ? `${topic.name} – Verified How-To` : "Chủ đề – Verified How-To" };
}

type TopicCard = {
  id: string;
  title: string;
  description: string | null;
  dishId: string | null;
  dishName: string | null;
  attempts: number;
  successCount: number;
  evidence: number;
  specimenUrl: string | null;
  isSaved: boolean;
};

function TopicCardTile({ card, currentUserId }: { card: TopicCard; currentUserId: string | null }) {
  return (
    <div className="featured-card">
      <Link href={`/how-to/${card.id}`} className="featured-card-stretched-link" aria-label={card.title} />
      <div className="featured-card-image" aria-hidden="true">
        {card.specimenUrl ? <img src={card.specimenUrl} alt="" /> : <span className="specimen-empty" />}
      </div>
      {currentUserId ? (
        <SaveIconButton howToId={card.id} initiallySaved={card.isSaved} title={card.title} />
      ) : (
        <SaveIconSignInLink redirectTo="/topics/am-thuc" title={card.title} />
      )}
      <div className="featured-card-body">
        {card.dishName && <span className="dish-label">{card.dishName}</span>}
        <h3>{card.title}</h3>
        {card.description && <p className="supporting-text">{card.description}</p>}
        <p className="featured-card-stat">
          {card.attempts === 0 ? "Chưa có lượt thử" : `${card.attempts} lần thử${card.evidence > 0 ? ` · ${card.evidence} ảnh kết quả` : ""}`}
        </p>
      </div>
    </div>
  );
}

export default async function TopicLandingPage({ params }: TopicPageProps) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) notFound();

  if (!topic.active) {
    return (
      <main className="main-list">
        <section className="topic-hero" data-topic={topic.slug}>
          <span className="topic-hero-art" aria-hidden="true" />
          <div className="topic-hero-text">
            <span className="eyebrow">{topic.name.toUpperCase()}</span>
            <h1>{topic.name}</h1>
            <p className="supporting-text">{topic.description}</p>
          </div>
        </section>
        <div className="topic-coming-soon">
          <h2>Sắp mở rộng</h2>
          <p className="supporting-text">Chúng tôi đang chuẩn bị những cách làm đầu tiên cho chủ đề này.</p>
          <p>
            <Link href="/topics/am-thuc">Khám phá Ẩm thực ngay →</Link>
          </p>
        </div>
      </main>
    );
  }

  const supabase = getServerSupabaseClient();
  const currentUser = await getCurrentUser();

  const { data: howTosRaw, error } = await supabase
    .from("how_to")
    .select("id, title, description, dish:dish_id(id, name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Lỗi tải danh sách Cách làm cho chủ đề:", error);
    return (
      <main className="main-list">
        <h1>{topic.name}</h1>
        <p role="alert">Không thể tải nội dung. Vui lòng thử lại sau.</p>
      </main>
    );
  }

  const howTos = howTosRaw ?? [];
  const howToIds = howTos.map((h) => h.id);

  const { data: reports } = howToIds.length
    ? await supabase
        .from("attempt_report")
        .select("id, how_to_id, result, submitted_at, note")
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
    if (!firstImagePathByReportId.has(img.attempt_report_id)) firstImagePathByReportId.set(img.attempt_report_id, img.storage_path);
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
    const { data: signedUrlsData } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrls(specimenPaths, SIGNED_URL_TTL_SECONDS);
    for (const entry of signedUrlsData ?? []) specimenUrlByPath.set(entry.path ?? "", entry.signedUrl ?? null);
  }

  const savedHowToIds = new Set<string>();
  if (currentUser && howToIds.length > 0) {
    const { data: savedRows } = await supabase.from("saved_how_to").select("how_to_id").eq("user_id", currentUser.id).in("how_to_id", howToIds);
    for (const row of savedRows ?? []) savedHowToIds.add(row.how_to_id);
  }

  const cards: TopicCard[] = howTos.map((h) => {
    const results = resultsByHowTo.get(h.id) ?? [];
    const specimenPath = specimenPathByHowTo.get(h.id);
    const dishRaw = (h as { dish?: { id: string; name: string } | { id: string; name: string }[] | null }).dish;
    const dish = Array.isArray(dishRaw) ? (dishRaw[0] ?? null) : (dishRaw ?? null);
    return {
      id: h.id,
      title: h.title,
      description: h.description,
      dishId: dish?.id ?? null,
      dishName: dish?.name ?? null,
      attempts: results.length,
      successCount: results.filter((r) => r === "success").length,
      evidence: evidenceCountByHowTo.get(h.id) ?? 0,
      specimenUrl: specimenPath ? (specimenUrlByPath.get(specimenPath) ?? null) : null,
      isSaved: savedHowToIds.has(h.id),
    };
  });

  // "Đang được quan tâm" — nhiều lượt thử thật nhất.
  const trending = [...cards].filter((c) => c.attempts > 0).sort((a, b) => b.attempts - a.attempts).slice(0, 4);
  // "Phản hồi tích cực" — ít nhất 1 lần thử thành công thật, sắp theo số lần thành công.
  const trendingIds = new Set(trending.map((c) => c.id));
  const positive = [...cards]
    .filter((c) => c.successCount > 0 && !trendingIds.has(c.id))
    .sort((a, b) => b.successCount - a.successCount)
    .slice(0, 4);

  // "Người thật đã thử" — ghi chú thật kèm ảnh khi có, mới nhất trước.
  const cardById = new Map(cards.map((c) => [c.id, c]));
  const stories = (reports ?? [])
    .filter((r) => (r.note ?? "").trim().length > 0)
    .map((r) => {
      const card = cardById.get(r.how_to_id);
      if (!card) return null;
      const imagePath = firstImagePathByReportId.get(r.id);
      return {
        reportId: r.id,
        howToId: r.how_to_id,
        howToTitle: card.title,
        dishName: card.dishName,
        result: r.result as AttemptReportResult,
        note: r.note as string,
        imageUrl: imagePath ? (specimenUrlByPath.get(imagePath) ?? null) : null,
      };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null)
    .sort((a, b) => (b.imageUrl ? 1 : 0) - (a.imageUrl ? 1 : 0))
    .slice(0, 4);

  return (
    <main className="main-list">
      <section className="topic-hero" data-topic={topic.slug}>
        <span className="topic-hero-art" aria-hidden="true" />
        <div className="topic-hero-text">
          <span className="eyebrow">{topic.name.toUpperCase()}</span>
          <h1>{topic.name}</h1>
          <p className="supporting-text">{topic.description}</p>
          <Link href={`/search?topic=${topic.slug}`} className="button-secondary">
            Tìm kiếm trong {topic.name} →
          </Link>
        </div>
      </section>

      {trending.length > 0 && (
        <section aria-label="Đang được quan tâm">
          <span className="eyebrow">Đang được quan tâm</span>
          <div className="featured-grid">
            {trending.map((card) => (
              <TopicCardTile key={card.id} card={card} currentUserId={currentUser?.id ?? null} />
            ))}
          </div>
        </section>
      )}

      {positive.length > 0 && (
        <section aria-label="Phản hồi tích cực">
          <span className="eyebrow">Phản hồi tích cực</span>
          <div className="featured-grid">
            {positive.map((card) => (
              <TopicCardTile key={card.id} card={card} currentUserId={currentUser?.id ?? null} />
            ))}
          </div>
        </section>
      )}

      {stories.length > 0 && (
        <section aria-label="Người thật đã thử" className="evidence-explainer">
          <span className="eyebrow">Người thật đã thử</span>
          <div className="story-grid">
            {stories.map((s) => (
              <Link key={s.reportId} href={`/how-to/${s.howToId}`} className="story-card">
                {s.imageUrl && <img src={s.imageUrl} alt="" className="story-image" />}
                <div className="story-body">
                  <p className="story-result" data-result={s.result}>
                    {RESULT_LABELS[s.result]}
                  </p>
                  <p className="story-note">“{s.note}”</p>
                  <p className="story-source">
                    {s.dishName && !s.howToTitle.toLowerCase().includes(s.dishName.toLowerCase()) ? `${s.dishName} · ` : ""}
                    {s.howToTitle}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {cards.length === 0 && (
        <div>
          <p>Chưa có cách làm nào trong {topic.name}.</p>
          <Link href="/how-to/new" className="button-primary">
            Tạo cách làm
          </Link>
        </div>
      )}

      <p className="supporting-text">
        <Link href={`/search?topic=${topic.slug}`}>Xem tất cả {cards.length} cách làm trong {topic.name} →</Link>
      </p>
    </main>
  );
}
