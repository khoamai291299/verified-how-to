import Link from "next/link";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";
import { CATEGORY_DIMENSION_LABELS, type Category } from "@/lib/supabase/types";
import { loadSearchResults, type SearchResultCard } from "@/lib/search";
import { SaveIconButton, SaveIconSignInLink } from "@/app/saved/save-icon-button";
import { TOPICS, getTopicBySlug, DEFAULT_TOPIC } from "@/lib/topics";

// Kết quả phụ thuộc dữ liệu thật, thay đổi liên tục theo query — không prerender.
export const dynamic = "force-dynamic";

const HEIGHT_PATTERN = ["tall", "short", "medium", "short", "tall", "short", "medium", "tall"] as const;

type SearchPageProps = {
  searchParams: Promise<{ q?: string; category?: string; topic?: string }>;
};

function GridCard({
  card,
  query,
  currentUserId,
  redirectTo,
  heightVariant,
}: {
  card: SearchResultCard;
  query: string;
  currentUserId: string | null;
  redirectTo: string;
  heightVariant: (typeof HEIGHT_PATTERN)[number];
}) {
  const showMatchReason =
    query.length > 0 && card.matchedIngredients.length > 0 && !card.title.toLowerCase().includes(query.toLowerCase());

  return (
    <article className="grid-card" data-height={heightVariant}>
      <Link href={`/how-to/${card.id}`} className="grid-card-stretched-link" aria-label={card.title} />
      <div className="grid-card-image" aria-hidden="true">
        {card.specimenUrl ? <img src={card.specimenUrl} alt="" /> : <span className="specimen-empty" />}
      </div>
      {currentUserId ? (
        <SaveIconButton howToId={card.id} initiallySaved={card.isSaved} title={card.title} />
      ) : (
        <SaveIconSignInLink redirectTo={redirectTo} title={card.title} />
      )}
      <div className="grid-card-body">
        {card.dishName && <span className="dish-label">{card.dishName}</span>}
        <h3>{card.title}</h3>
        {card.description && <p className="supporting-text grid-card-desc">{card.description}</p>}
        {showMatchReason && (
          <p className="match-reason">
            Có nguyên liệu: {card.matchedIngredients.slice(0, 2).join(", ")}
            {card.matchedIngredients.length > 2 ? "…" : ""}
          </p>
        )}
        <p className="grid-card-stat">
          {card.attempts === 0
            ? "Chưa có lượt thử"
            : `${card.attempts} lần thử${card.evidence > 0 ? ` · ${card.evidence} ảnh kết quả` : ""}`}
        </p>
      </div>
    </article>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, category: categorySlug, topic: topicSlug } = await searchParams;
  const query = (q ?? "").trim();
  const activeTopic = (topicSlug ? getTopicBySlug(topicSlug) : null) ?? DEFAULT_TOPIC;
  const currentUser = await getCurrentUser();

  const currentSearchParams = new URLSearchParams();
  if (q) currentSearchParams.set("q", q);
  if (categorySlug) currentSearchParams.set("category", categorySlug);
  if (topicSlug) currentSearchParams.set("topic", topicSlug);
  const redirectTo = currentSearchParams.size > 0 ? `/search?${currentSearchParams.toString()}` : "/search";

  // Chủ đề chưa có nội dung thật — không giả vờ chạy tìm kiếm trên dữ liệu
  // không tồn tại (mission §16: "Sắp mở rộng", không bịa nội dung).
  if (!activeTopic.active) {
    return (
      <main className="main-list search-page">
        <h1>Tìm kiếm</h1>
        <TopicChips activeSlug={activeTopic.slug} query={query} categorySlug={categorySlug ?? null} />
        <div className="topic-coming-soon">
          <p className="supporting-text">
            <strong>{activeTopic.name}</strong> chưa có nội dung thật để tìm kiếm.
          </p>
          <p className="supporting-text">Chúng tôi đang chuẩn bị những cách làm đầu tiên cho chủ đề này.</p>
          <p>
            <Link href={`/search?topic=${DEFAULT_TOPIC.slug}`}>Tìm trong {DEFAULT_TOPIC.name} →</Link>
          </p>
        </div>
      </main>
    );
  }

  const { cards, categoriesWithContent, categoryCounts, activeCategory } = await loadSearchResults({
    query,
    categorySlug: categorySlug ?? null,
    currentUserId: currentUser?.id ?? null,
  });

  const categoriesByDimension = categoriesWithContent.reduce<Record<string, Category[]>>((acc, c) => {
    (acc[c.dimension] ??= []).push(c);
    return acc;
  }, {});

  const noResultSuggestions: { id: string; name: string }[] = [];
  if (cards.length === 0) {
    const supabase = getServerSupabaseClient();
    const { data: recentHowTos } = await supabase
      .from("how_to")
      .select("dish:dish_id(id, name)")
      .order("created_at", { ascending: false })
      .limit(8);
    const seen = new Set<string>();
    for (const row of recentHowTos ?? []) {
      const dishRaw = (row as { dish?: { id: string; name: string } | { id: string; name: string }[] | null }).dish;
      const dish = Array.isArray(dishRaw) ? (dishRaw[0] ?? null) : (dishRaw ?? null);
      if (dish && !seen.has(dish.id)) {
        seen.add(dish.id);
        noResultSuggestions.push({ id: dish.id, name: dish.name });
      }
      if (noResultSuggestions.length >= 4) break;
    }
  }

  return (
    <main className="main-list search-page">
      <h1>{query ? `Kết quả cho “${query}”` : activeCategory ? activeCategory.name : "Tìm kiếm"}</h1>

      <form role="search" action="/search" method="GET" className="search-form">
        <label htmlFor="q" className="sr-only">
          {activeTopic.searchPlaceholder}
        </label>
        <input id="q" type="search" name="q" defaultValue={query} placeholder={activeTopic.searchPlaceholder} />
        {topicSlug && <input type="hidden" name="topic" value={topicSlug} />}
        {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
        <button type="submit">Tìm</button>
      </form>

      <TopicChips activeSlug={activeTopic.slug} query={query} categorySlug={categorySlug ?? null} />

      {categoriesWithContent.length > 0 && (
        <nav className="category-chip-nav" aria-label="Lọc theo phân loại">
          {Object.entries(categoriesByDimension).map(([dimension, cats]) => (
            <div className="category-chip-row" key={dimension}>
              <span className="category-chip-dimension">{CATEGORY_DIMENSION_LABELS[dimension as Category["dimension"]]}</span>
              <div className="category-chips">
                {cats.map((c) => (
                  <Link
                    key={c.id}
                    href={`/search?category=${c.slug}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                    className={`category-chip${activeCategory?.id === c.id ? " category-chip-active" : ""}`}
                  >
                    {c.name} <span className="category-chip-count">{categoryCounts.get(c.id) ?? 0}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      )}

      <p className="supporting-text search-result-summary">
        {cards.length === 0
          ? "Không tìm thấy kết quả phù hợp."
          : `${cards.length} cách làm phù hợp${activeCategory ? ` trong "${activeCategory.name}"` : ""}${query ? ` với "${query}"` : ""}.`}
      </p>

      {cards.length === 0 ? (
        <div className="no-results">
          {noResultSuggestions.length > 0 && (
            <>
              <p className="supporting-text">Có thể bạn muốn xem:</p>
              <div className="category-chips">
                {noResultSuggestions.map((d) => (
                  <Link key={d.id} href={`/dish/${d.id}`} className="category-chip">
                    {d.name}
                  </Link>
                ))}
              </div>
            </>
          )}
          <p>
            <Link href="/search">Xóa bộ lọc, xem tất cả cách làm →</Link>
          </p>
          <p>
            <Link href="/">← Quay lại Khám phá</Link>
          </p>
        </div>
      ) : (
        <div className="balanced-grid">
          {cards.map((card, i) => (
            <GridCard
              key={card.id}
              card={card}
              query={query}
              currentUserId={currentUser?.id ?? null}
              redirectTo={redirectTo}
              heightVariant={HEIGHT_PATTERN[i % HEIGHT_PATTERN.length]}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function TopicChips({
  activeSlug,
  query,
  categorySlug,
}: {
  activeSlug: string;
  query: string;
  categorySlug: string | null;
}) {
  return (
    <nav className="topic-chip-nav" aria-label="Chọn chủ đề tìm kiếm">
      {TOPICS.map((topic) => {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (topic.active && categorySlug) params.set("category", categorySlug);
        if (!topic.active) params.delete("category");
        params.set("topic", topic.slug);
        return (
          <Link
            key={topic.slug}
            href={`/search?${params.toString()}`}
            className={`topic-chip${topic.slug === activeSlug ? " topic-chip-active" : ""}${!topic.active ? " topic-chip-soon" : ""}`}
          >
            {topic.name}
            {!topic.active && <span className="topic-card-badge">Sắp có</span>}
          </Link>
        );
      })}
    </nav>
  );
}
