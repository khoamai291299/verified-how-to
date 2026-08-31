import Link from "next/link";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";
import { RESULT_LABELS, type AttemptReportResult } from "@/lib/supabase/types";
import { SaveIconButton, SaveIconSignInLink } from "@/app/saved/save-icon-button";
import { TOPICS } from "@/lib/topics";

// Danh sách How-To thay đổi liên tục — không thể prerender tĩnh lúc build.
export const dynamic = "force-dynamic";

const STORAGE_BUCKET = "attempt-report-images";
const SIGNED_URL_TTL_SECONDS = 3600;

type HowToCardData = {
  id: string;
  title: string;
  description: string | null;
  dishId: string | null;
  dishName: string | null;
  attempts: number;
  evidence: number;
  specimenUrl: string | null;
  isSaved: boolean;
};

/** Thẻ ảnh lớn cho các kệ khám phá — ảnh là điểm neo thị giác chính. Toàn thẻ
 * vẫn bấm được qua "stretched link" thay vì bọc cả thẻ trong <a>, để nút lưu
 * (một <button>/<a> khác) không bị lồng bên trong link (không hợp lệ về ngữ
 * nghĩa HTML, sẽ kích hoạt điều hướng kép). */
function FeaturedCard({
  card,
  currentUserId,
}: {
  card: HowToCardData;
  currentUserId: string | null;
}) {
  return (
    <div className="featured-card">
      <Link href={`/how-to/${card.id}`} className="featured-card-stretched-link" aria-label={card.title} />
      <div className="featured-card-image" aria-hidden="true">
        {card.specimenUrl ? <img src={card.specimenUrl} alt="" /> : <span className="specimen-empty" />}
      </div>
      {currentUserId ? (
        <SaveIconButton howToId={card.id} initiallySaved={card.isSaved} title={card.title} />
      ) : (
        <SaveIconSignInLink redirectTo="/" title={card.title} />
      )}
      <div className="featured-card-body">
        {card.dishName && <span className="dish-label">{card.dishName}</span>}
        <h3>{card.title}</h3>
        {card.description && <p className="supporting-text">{card.description}</p>}
        <p className="featured-card-stat">
          {card.attempts === 0
            ? "Chưa có lượt thử"
            : `${card.attempts} lần thử${card.evidence > 0 ? ` · ${card.evidence} ảnh kết quả` : ""}`}
        </p>
      </div>
    </div>
  );
}

/**
 * Khám phá (rebuild-v6.2) — trang chủ giờ CHỈ khám phá thuần: chọn chủ đề,
 * tìm kiếm rộng (chuyển hướng tới `/search`), nội dung biên tập/kệ thật.
 * Không còn tự lọc bằng `q`/`category` — đó là việc của `/search`, tách bạch
 * đúng 3 khái niệm khám phá của mission (Khám phá ≠ Tìm kiếm ≠ Chủ đề).
 */
export default async function DiscoverPage() {
  const supabase = getServerSupabaseClient();
  const currentUser = await getCurrentUser();

  const { data: howTosRaw, error } = await supabase
    .from("how_to")
    .select("id, title, description, dish:dish_id(id, name)")
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
    if (!firstImagePathByReportId.has(img.attempt_report_id)) {
      firstImagePathByReportId.set(img.attempt_report_id, img.storage_path);
    }
  }
  const evidenceCountByHowTo = new Map<string, number>();
  for (const img of images ?? []) {
    const howToId = reportIdToHowToId.get(img.attempt_report_id);
    if (howToId) evidenceCountByHowTo.set(howToId, (evidenceCountByHowTo.get(howToId) ?? 0) + 1);
  }

  // reports đã sắp theo submitted_at desc — báo cáo mới nhất có ảnh của mỗi
  // Cách làm trở thành ảnh "mẫu vật" đại diện trên Khám phá.
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

  const savedHowToIds = new Set<string>();
  if (currentUser && howToIds.length > 0) {
    const { data: savedRows } = await supabase
      .from("saved_how_to")
      .select("how_to_id")
      .eq("user_id", currentUser.id)
      .in("how_to_id", howToIds);
    for (const row of savedRows ?? []) savedHowToIds.add(row.how_to_id);
  }

  const cards: HowToCardData[] = howTos.map((h) => {
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
      evidence: evidenceCountByHowTo.get(h.id) ?? 0,
      specimenUrl: specimenPath ? (specimenUrlByPath.get(specimenPath) ?? null) : null,
      isSaved: savedHowToIds.has(h.id),
    };
  });

  // "Chòm sao bằng chứng" — mỗi chấm là một lần thử thật, không phải điểm tổng hợp.
  const allResults = cards.reduce<AttemptReportResult[]>((acc, c) => {
    const list = resultsByHowTo.get(c.id);
    if (list) acc.push(...list);
    return acc;
  }, []);
  const totalAttempts = allResults.length;
  const totalEvidence = cards.reduce((sum, c) => sum + c.evidence, 0);

  // Kệ biên tập "Được thử nhiều nhất" — chỉ xếp theo số lần thử THẬT đã ghi
  // nhận, không phải mức độ phổ biến bịa đặt.
  const featured = [...cards]
    .filter((c) => c.attempts > 0)
    .sort((a, b) => b.attempts - a.attempts)
    .slice(0, 3);

  // "Khám phá theo nguyên liệu" — lối vào khám phá không cần gõ chữ, dùng
  // tần suất nguyên liệu THẬT trên toàn bộ Cách làm.
  const STAPLE_INGREDIENTS = new Set(["dầu ăn", "muối", "nước", "nước lọc", "đá viên", "nước sôi", "đường", "tiêu"]);
  let ingredientDiscovery: { name: string; howToId: string; specimenUrl: string | null }[] = [];
  if (howToIds.length > 0) {
    const { data: allIngredients } = await supabase
      .from("how_to_ingredient")
      .select("how_to_id, name")
      .in("how_to_id", howToIds);

    const howToIdsByName = new Map<string, Set<string>>();
    for (const row of allIngredients ?? []) {
      const key = row.name.trim().toLowerCase();
      if (STAPLE_INGREDIENTS.has(key)) continue;
      const set = howToIdsByName.get(key) ?? new Set<string>();
      set.add(row.how_to_id);
      howToIdsByName.set(key, set);
    }

    ingredientDiscovery = [...howToIdsByName.entries()]
      .sort((a, b) => b[1].size - a[1].size || a[0].localeCompare(b[0], "vi"))
      .slice(0, 6)
      .map(([name, ids]) => {
        const candidateCards = cards.filter((c) => ids.has(c.id));
        const withPhoto = candidateCards.find((c) => c.specimenUrl);
        const chosen = withPhoto ?? candidateCards[0];
        return { name, howToId: chosen.id, specimenUrl: chosen.specimenUrl };
      });
  }

  // "Chuyện xảy ra khi thử" — tín hiệu sản phẩm mạnh nhất: ghi chú thật của
  // người đã thử, ưu tiên có ảnh, mới nhất trước.
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
    .slice(0, 2);

  const featuredIds = new Set(featured.map((c) => c.id));
  const rest = featured.length > 0 ? cards.filter((c) => !featuredIds.has(c.id)) : cards;

  return (
    <main className="main-list">
      <section className="topic-discovery" aria-label="Chọn chủ đề">
        <h2 className="topic-discovery-heading">Bạn đang quan tâm điều gì?</h2>
        <p className="supporting-text">Ẩm thực đang có nội dung thật — các chủ đề khác sắp mở rộng.</p>
        <div className="topic-cards">
          {TOPICS.map((topic) =>
            topic.active ? (
              <Link key={topic.slug} href={`/topics/${topic.slug}`} className="topic-card topic-card-active">
                <span className="topic-card-art" data-topic={topic.slug} aria-hidden="true" />
                <span className="topic-card-body">
                  <span className="topic-card-name">{topic.name}</span>
                  <span className="topic-card-desc">{topic.description}</span>
                </span>
              </Link>
            ) : (
              <Link key={topic.slug} href={`/topics/${topic.slug}`} className="topic-card topic-card-soon">
                <span className="topic-card-art" data-topic={topic.slug} aria-hidden="true" />
                <span className="topic-card-body">
                  <span className="topic-card-name">{topic.name}</span>
                  <span className="topic-card-badge">Sắp có</span>
                </span>
              </Link>
            ),
          )}
        </div>
      </section>

      <form role="search" action="/search" method="GET" className="search-form">
        <label htmlFor="q" className="sr-only">
          Bạn muốn tìm gì hôm nay?
        </label>
        <input id="q" type="search" name="q" placeholder="Tìm món ăn, nguyên liệu, cách làm…" />
        <button type="submit">Tìm</button>
      </form>

      <section className="hero">
        <div className="hero-text">
          <h1 className="home-hero-heading">Không chỉ cho bạn biết cách làm</h1>
          <p className="product-thesis">mà cho bạn biết điều gì đã xảy ra khi người thật thử làm.</p>
          <p className="supporting-text">
            Mỗi cách làm ở đây đi kèm báo cáo thật từ người đã thử: thành công, một phần, hay thất bại — kể cả khi kết
            quả không như mong đợi.
          </p>
        </div>
        {totalAttempts > 0 && (
          <div className="hero-evidence" role="img" aria-label={`${totalAttempts} lần thử thật đã ghi nhận trên toàn bộ cách làm`}>
            <div className="hero-evidence-dots" aria-hidden="true">
              {allResults.map((result, i) => (
                <span key={i} className="evidence-dot" data-result={result} />
              ))}
            </div>
            <p className="hero-stat">
              {totalAttempts} lần thử thật{totalEvidence > 0 ? ` · ${totalEvidence} ảnh kết quả` : ""} trên{" "}
              {cards.length} cách làm
            </p>
          </div>
        )}
      </section>

      {ingredientDiscovery.length > 0 && (
        <section aria-label="Khám phá theo nguyên liệu" className="ingredient-discovery-section">
          <span className="eyebrow">Khám phá theo nguyên liệu</span>
          <div className="ingredient-discovery">
            {ingredientDiscovery.map((item) => (
              <Link key={item.name} href={`/search?q=${encodeURIComponent(item.name)}`} className="ingredient-tile">
                {item.specimenUrl ? <img src={item.specimenUrl} alt="" /> : <span className="specimen-empty" />}
                <span className="ingredient-tile-label">{item.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section aria-label="Được thử nhiều nhất">
          <span className="eyebrow">Được thử nhiều nhất</span>
          <div className="featured-grid">
            {featured.map((card) => (
              <FeaturedCard key={card.id} card={card} currentUserId={currentUser?.id ?? null} />
            ))}
          </div>
        </section>
      )}

      <section className="evidence-explainer" aria-label="Evidence hoạt động thế nào">
        <div className="evidence-explainer-steps">
          <div className="evidence-step">
            <span className="evidence-step-index">1</span>
            <h3>Cách làm</h3>
            <p>Hướng dẫn từng bước cho một món hoặc một kỹ thuật.</p>
          </div>
          <div className="evidence-step">
            <span className="evidence-step-index">2</span>
            <h3>Báo cáo đã thử</h3>
            <p>Một người thật làm theo, rồi ghi lại điều gì đã thật sự xảy ra.</p>
          </div>
          <div className="evidence-step">
            <span className="evidence-step-index">3</span>
            <h3>Bằng chứng</h3>
            <p>Các báo cáo tích lũy lại theo thời gian — thành công, một phần, hay thất bại.</p>
          </div>
        </div>
        <p className="evidence-explainer-caveat">
          Bằng chứng không có nghĩa là hệ thống xác nhận điều này đúng — đó là những gì người đã thử ghi nhận lại.
        </p>
        {stories.length > 0 && (
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
        rest.length > 0 && (
          <>
            {featured.length > 0 && <span className="eyebrow">Khám phá thêm</span>}
            <div className="featured-grid">
              {rest.map((card) => (
                <FeaturedCard key={card.id} card={card} currentUserId={currentUser?.id ?? null} />
              ))}
            </div>
            <p className="supporting-text">
              <Link href="/topics/am-thuc">Xem toàn bộ Ẩm thực →</Link>
            </p>
          </>
        )
      )}
    </main>
  );
}
