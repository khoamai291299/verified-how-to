import Link from "next/link";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import type { AttemptReportResult } from "@/lib/supabase/types";

// Danh sách How-To thay đổi liên tục — không thể prerender tĩnh lúc build.
export const dynamic = "force-dynamic";

const STORAGE_BUCKET = "attempt-report-images";
const SIGNED_URL_TTL_SECONDS = 3600;
const MAX_TALLY_MARKS = 10;

type HowToCardData = {
  id: string;
  title: string;
  description: string | null;
  dishId: string | null;
  dishName: string | null;
  matchedIngredients: string[];
  attempts: number;
  results: AttemptReportResult[];
  evidence: number;
  specimenUrl: string | null;
};

type DiscoverPageProps = {
  searchParams: Promise<{ q?: string }>;
};

type SearchMatch = {
  score: number;
  /** Tên nguyên liệu thật đã khớp — để giải thích TẠI SAO kết quả này xuất
   * hiện khi việc khớp không hiển nhiên từ tiêu đề (mục 13 của mission). */
  matchedIngredients: string[];
};

/**
 * Search V1 (docs/product/product-evolution-v1.md) — khớp tất định trên
 * title/description/dish/ingredient, xếp hạng bằng điểm cộng dồn đơn giản
 * theo trường khớp, có thưởng thêm cho khớp chính xác toàn bộ tiêu đề (để
 * tìm đúng tên luôn đứng đầu). Không dùng full-text search/semantic — cố ý,
 * xem §4 tài liệu quyết định: bắt đầu từ retrieval tất định, mở rộng sau.
 */
async function searchHowToIds(
  supabase: ReturnType<typeof getServerSupabaseClient>,
  query: string,
): Promise<Map<string, SearchMatch>> {
  const like = `%${query}%`;
  const lowerQuery = query.toLowerCase();
  const matchByHowToId = new Map<string, SearchMatch>();
  const getEntry = (howToId: string) => {
    let entry = matchByHowToId.get(howToId);
    if (!entry) {
      entry = { score: 0, matchedIngredients: [] };
      matchByHowToId.set(howToId, entry);
    }
    return entry;
  };

  const [titleMatches, dishMatches, ingredientMatches] = await Promise.all([
    supabase.from("how_to").select("id, title, description").or(`title.ilike.${like},description.ilike.${like}`),
    supabase.from("dish").select("id, name").ilike("name", like),
    supabase.from("how_to_ingredient").select("how_to_id, name").ilike("name", like),
  ]);

  for (const row of titleMatches.data ?? []) {
    const titleLower = row.title.toLowerCase();
    const points = titleLower === lowerQuery ? 5 : titleLower.includes(lowerQuery) ? 3 : 1;
    getEntry(row.id).score += points;
  }

  const dishIds = (dishMatches.data ?? []).map((d) => d.id);
  if (dishIds.length > 0) {
    const { data: howTosByDish } = await supabase.from("how_to").select("id").in("dish_id", dishIds);
    for (const row of howTosByDish ?? []) getEntry(row.id).score += 3;
  }

  for (const row of ingredientMatches.data ?? []) {
    const entry = getEntry(row.how_to_id);
    entry.score += 2;
    if (!entry.matchedIngredients.includes(row.name)) entry.matchedIngredients.push(row.name);
  }

  return matchByHowToId;
}

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const supabase = getServerSupabaseClient();

  let searchMatches: Map<string, SearchMatch> | null = null;
  if (query.length > 0) {
    searchMatches = await searchHowToIds(supabase, query);
  }

  let howToQuery = supabase
    .from("how_to")
    .select("id, title, description, dish:dish_id(id, name)")
    .order("created_at", { ascending: false });

  if (searchMatches) {
    const matchedIds = [...searchMatches.keys()];
    howToQuery = howToQuery.in("id", matchedIds.length > 0 ? matchedIds : ["00000000-0000-0000-0000-000000000000"]);
  }

  const { data: howTosRaw, error } = await howToQuery;

  if (error) {
    console.error("Lỗi tải danh sách Cách làm:", error);
    return (
      <main className="main-list">
        <h1>Khám phá</h1>
        <p role="alert">Không thể tải danh sách Cách làm. Vui lòng thử lại sau.</p>
      </main>
    );
  }

  const howTos = searchMatches
    ? [...howTosRaw].sort(
        (a, b) => (searchMatches!.get(b.id)?.score ?? 0) - (searchMatches!.get(a.id)?.score ?? 0),
      )
    : howTosRaw;

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

  // reports đã sắp theo submitted_at desc — báo cáo mới nhất có ảnh của mỗi Cách làm
  // trở thành ảnh "mẫu vật" đại diện trên Khám phá.
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
    const dishRaw = (h as { dish?: { id: string; name: string } | { id: string; name: string }[] | null }).dish;
    const dish = Array.isArray(dishRaw) ? (dishRaw[0] ?? null) : (dishRaw ?? null);
    return {
      id: h.id,
      title: h.title,
      description: h.description,
      dishId: dish?.id ?? null,
      dishName: dish?.name ?? null,
      matchedIngredients: searchMatches?.get(h.id)?.matchedIngredients ?? [],
      attempts: results.length,
      results,
      evidence: evidenceCountByHowTo.get(h.id) ?? 0,
      specimenUrl: specimenPath ? (specimenUrlByPath.get(specimenPath) ?? null) : null,
    };
  });

  // "Chòm sao bằng chứng" — mỗi chấm là một lần thử thật, không phải điểm tổng hợp.
  const allResults = cards.flatMap((c) => c.results);
  const totalAttempts = allResults.length;
  const totalEvidence = cards.reduce((sum, c) => sum + c.evidence, 0);

  return (
    <main className="main-list">
      <form role="search" action="/" method="GET" className="search-form">
        <label htmlFor="q" className="sr-only">
          Tìm theo tên, mô tả, hoặc nguyên liệu
        </label>
        <input
          id="q"
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Tìm theo tên, mô tả, hoặc nguyên liệu…"
        />
        <button type="submit" className="secondary">
          Tìm
        </button>
      </form>

      <section className="hero">
        <div className="hero-text">
          {query ? (
            <>
              <h1>Kết quả cho “{query}”</h1>
              <p className="supporting-text">
                {cards.length === 0
                  ? "Không tìm thấy cách làm nào phù hợp."
                  : `${cards.length} cách làm phù hợp với tên, mô tả, hoặc nguyên liệu bạn tìm.`}
              </p>
            </>
          ) : (
            <>
              <h1>Những cách làm đã được người thật thử</h1>
              <p className="supporting-text">
                Mỗi cách làm ở đây đi kèm báo cáo thật từ người đã thử — không chỉ là hướng dẫn lý thuyết.
              </p>
            </>
          )}
        </div>
        {totalAttempts > 0 && (
          <div className="hero-evidence" role="img" aria-label={`${totalAttempts} lần thử thật đã ghi nhận trên toàn bộ cách làm`}>
            <div className="hero-evidence-dots" aria-hidden="true">
              {allResults.map((result, i) => (
                <span key={i} className="evidence-dot" data-result={result} />
              ))}
            </div>
            <p className="hero-stat">
              {totalAttempts} lần thử thật{totalEvidence > 0 ? ` · ${totalEvidence} ảnh kết quả` : ""} trên {cards.length}{" "}
              cách làm
            </p>
          </div>
        )}
      </section>

      {cards.length === 0 ? (
        query ? (
          <div>
            <Link href="/">Xóa tìm kiếm, xem tất cả cách làm →</Link>
          </div>
        ) : (
          <div>
            <p>Chưa có cách làm nào.</p>
            <p className="supporting-text">Hãy chia sẻ cách làm đầu tiên.</p>
            <Link href="/how-to/new" className="button-primary">
              Tạo cách làm
            </Link>
          </div>
        )
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
                  {card.dishName && card.dishId && (
                    <Link href={`/dish/${card.dishId}`} className="dish-label">
                      {card.dishName}
                    </Link>
                  )}
                  <h2>
                    <Link href={`/how-to/${card.id}`}>{card.title}</Link>
                  </h2>
                  {card.description && <p className="supporting-text">{card.description}</p>}
                  {query &&
                    card.matchedIngredients.length > 0 &&
                    !card.title.toLowerCase().includes(query.toLowerCase()) && (
                      <p className="match-reason">
                        Khớp vì có {card.matchedIngredients.slice(0, 2).join(", ")}
                        {card.matchedIngredients.length > 2 ? "…" : ""}
                      </p>
                    )}
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
                      <p className="sr-only">
                        {card.results.filter((r) => r === "success").length} thành công ·{" "}
                        {card.results.filter((r) => r === "partial").length} một phần ·{" "}
                        {card.results.filter((r) => r === "failed").length} thất bại
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
