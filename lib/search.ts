import { getServerSupabaseClient } from "@/lib/supabase/server";
import { getAllCategories } from "@/lib/supabase/categories";
import { stripDiacritics } from "@/lib/text-normalize";
import type { AttemptReportResult, Category } from "@/lib/supabase/types";

const STORAGE_BUCKET = "attempt-report-images";
const SIGNED_URL_TTL_SECONDS = 3600;

export type SearchMatch = {
  score: number;
  /** Tên nguyên liệu thật đã khớp — để giải thích TẠI SAO kết quả này xuất
   * hiện khi việc khớp không hiển nhiên từ tiêu đề (mission §23). */
  matchedIngredients: string[];
};

export type SearchResultCard = {
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
  isSaved: boolean;
};

/**
 * Search V1 (docs/product/product-evolution-v1.md) — khớp tất định trên
 * title/description/dish/ingredient, xếp hạng bằng điểm cộng dồn đơn giản
 * theo trường khớp. Không dùng full-text search/semantic — cố ý (§4 tài
 * liệu quyết định V6): bắt đầu từ retrieval tất định, mở rộng sau.
 *
 * Khớp không phân biệt dấu tiếng Việt (rebuild-v6-current-state-gap.md §A —
 * "banh xeo" trước đây trả về 0 kết quả cho "Bánh xèo").
 *
 * Tách ra khỏi app/page.tsx trong rebuild-v6.2 vì giờ có 2 nơi cần tìm kiếm
 * thật: trang chủ (rút gọn về khám phá thuần) chỉ CHUYỂN HƯỚNG vào đây, và
 * `/search` (trang workspace tìm kiếm chuyên dụng) mới thật sự chạy truy vấn.
 */
export async function searchHowToIds(
  supabase: ReturnType<typeof getServerSupabaseClient>,
  query: string,
): Promise<Map<string, SearchMatch>> {
  const strippedQuery = stripDiacritics(query);
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
    supabase.from("how_to").select("id, title, description"),
    supabase.from("dish").select("id, name"),
    supabase.from("how_to_ingredient").select("how_to_id, name"),
  ]);

  for (const row of titleMatches.data ?? []) {
    const strippedTitle = stripDiacritics(row.title);
    const strippedDescription = row.description ? stripDiacritics(row.description) : "";
    const titleMatches5 = strippedTitle === strippedQuery;
    const titleMatches3 = !titleMatches5 && strippedTitle.includes(strippedQuery);
    const descriptionMatches = !titleMatches5 && !titleMatches3 && strippedDescription.includes(strippedQuery);
    if (titleMatches5) getEntry(row.id).score += 5;
    else if (titleMatches3) getEntry(row.id).score += 3;
    else if (descriptionMatches) getEntry(row.id).score += 1;
  }

  const dishIds = (dishMatches.data ?? [])
    .filter((d) => stripDiacritics(d.name).includes(strippedQuery))
    .map((d) => d.id);
  if (dishIds.length > 0) {
    const { data: howTosByDish } = await supabase.from("how_to").select("id").in("dish_id", dishIds);
    for (const row of howTosByDish ?? []) getEntry(row.id).score += 3;
  }

  for (const row of ingredientMatches.data ?? []) {
    if (!stripDiacritics(row.name).includes(strippedQuery)) continue;
    const entry = getEntry(row.how_to_id);
    entry.score += 2;
    if (!entry.matchedIngredients.includes(row.name)) entry.matchedIngredients.push(row.name);
  }

  return matchByHowToId;
}

export type SearchResults = {
  cards: SearchResultCard[];
  categories: Category[];
  categoriesWithContent: Category[];
  categoryCounts: Map<string, number>;
  activeCategory: Category | null;
};

/**
 * Truy vấn đầy đủ cho trang `/search` — query text + lọc category, tính
 * điểm/khớp, tải Evidence tóm tắt (số lần thử, ảnh mẫu vật) cho mỗi kết quả
 * trong tối thiểu số round-trip (tránh N+1), giống hệt cách trang chủ cũ đã
 * làm trước rebuild-v6.2.
 */
export async function loadSearchResults({
  query,
  categorySlug,
  currentUserId,
}: {
  query: string;
  categorySlug: string | null;
  currentUserId: string | null;
}): Promise<SearchResults> {
  const supabase = getServerSupabaseClient();

  const categories = await getAllCategories();
  const activeCategory = categorySlug ? (categories.find((c) => c.slug === categorySlug) ?? null) : null;

  const { data: allCategoryLinks } = await supabase.from("how_to_category").select("category_id");
  const categoryCounts = new Map<string, number>();
  for (const link of allCategoryLinks ?? []) {
    categoryCounts.set(link.category_id, (categoryCounts.get(link.category_id) ?? 0) + 1);
  }
  const categoriesWithContent = categories.filter((c) => (categoryCounts.get(c.id) ?? 0) > 0);

  let searchMatches: Map<string, SearchMatch> | null = null;
  if (query.length > 0) {
    searchMatches = await searchHowToIds(supabase, query);
  }

  let categoryHowToIds: string[] | null = null;
  if (activeCategory) {
    const { data: links } = await supabase.from("how_to_category").select("how_to_id").eq("category_id", activeCategory.id);
    categoryHowToIds = (links ?? []).map((l) => l.how_to_id);
  }

  let howToQuery = supabase
    .from("how_to")
    .select("id, title, description, dish:dish_id(id, name)")
    .order("created_at", { ascending: false });

  if (searchMatches) {
    const matchedIds = [...searchMatches.keys()];
    howToQuery = howToQuery.in("id", matchedIds.length > 0 ? matchedIds : ["00000000-0000-0000-0000-000000000000"]);
  }
  if (categoryHowToIds) {
    howToQuery = howToQuery.in("id", categoryHowToIds.length > 0 ? categoryHowToIds : ["00000000-0000-0000-0000-000000000000"]);
  }

  const { data: howTosRaw, error } = await howToQuery;
  if (error) {
    console.error("Lỗi tải danh sách Cách làm:", error);
    return { cards: [], categories, categoriesWithContent, categoryCounts, activeCategory };
  }

  const howTos = searchMatches
    ? [...howTosRaw].sort((a, b) => (searchMatches!.get(b.id)?.score ?? 0) - (searchMatches!.get(a.id)?.score ?? 0))
    : howTosRaw;

  const howToIds = howTos.map((h) => h.id);

  const { data: reports } = howToIds.length
    ? await supabase
        .from("attempt_report")
        .select("id, how_to_id, result")
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

  const savedHowToIds = new Set<string>();
  if (currentUserId && howToIds.length > 0) {
    const { data: savedRows } = await supabase
      .from("saved_how_to")
      .select("how_to_id")
      .eq("user_id", currentUserId)
      .in("how_to_id", howToIds);
    for (const row of savedRows ?? []) savedHowToIds.add(row.how_to_id);
  }

  const cards: SearchResultCard[] = howTos.map((h) => {
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
      isSaved: savedHowToIds.has(h.id),
    };
  });

  return { cards, categories, categoriesWithContent, categoryCounts, activeCategory };
}
