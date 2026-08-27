import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";
import { RESULT_LABELS, type AttemptReportResult, type HowToIngredient } from "@/lib/supabase/types";
import { SubmitAttemptReportForm } from "./submit-attempt-report-form";
import { DeleteHowToButton } from "./delete-how-to-button";
import { DeleteAttemptReportButton } from "./delete-attempt-report-button";
import { SaveToggleButton } from "@/app/saved/save-toggle-button";
import { HERO_IMAGE_BUCKET } from "@/lib/supabase/hero-image";

/** Nguyên liệu có cấu trúc — nhóm theo group_name khi có, giữ nguyên thứ tự position. */
function IngredientList({ ingredients }: { ingredients: HowToIngredient[] }) {
  const groups: { name: string | null; items: HowToIngredient[] }[] = [];
  for (const ingredient of ingredients) {
    const last = groups[groups.length - 1];
    if (last && last.name === ingredient.group_name) {
      last.items.push(ingredient);
    } else {
      groups.push({ name: ingredient.group_name, items: [ingredient] });
    }
  }

  return (
    <div className="ingredient-groups">
      {groups.map((group, i) => (
        <div key={i} className="ingredient-group">
          {group.name && <p className="ingredient-group-name">{group.name}</p>}
          <ul className="ingredient-list">
            {group.items.map((ing) => (
              <li key={ing.id} className="ingredient-item">
                <span className="ingredient-name">
                  {ing.name}
                  {!ing.is_required && <span className="ingredient-optional"> (tùy chọn)</span>}
                </span>
                {(ing.quantity || ing.unit) && (
                  <span className="ingredient-amount">
                    {[ing.quantity, ing.unit].filter(Boolean).join(" ")}
                  </span>
                )}
                {ing.preparation && <span className="ingredient-prep"> — {ing.preparation}</span>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// Nội dung phụ thuộc dữ liệu thật (How-To + Evidence) — không prerender tĩnh lúc build.
export const dynamic = "force-dynamic";

const STORAGE_BUCKET = "attempt-report-images";
const SIGNED_URL_TTL_SECONDS = 3600;
// Số phiếu hiển thị mặc định trước khi thu gọn — tránh rail biến thành một
// bức tường phiếu giống hệt nhau khi một Cách làm có nhiều lượt thử.
const VISIBLE_TICKET_COUNT = 5;

type HowToDetailPageProps = {
  params: Promise<{ id: string }>;
};

type AttemptReportImageView = {
  id: string;
  position: number;
  signedUrl: string | null;
};

type AttemptReportView = {
  id: string;
  result: AttemptReportResult;
  note: string | null;
  submitted_at: string;
  user_id: string | null;
  images: AttemptReportImageView[];
};

function EvidenceTicketItem({
  report,
  howToId,
  currentUserId,
}: {
  report: AttemptReportView;
  howToId: string;
  currentUserId: string | null;
}) {
  const submittedDate = new Date(report.submitted_at);
  const formattedTimestamp = submittedDate.toLocaleString("vi-VN");
  const formattedTime = submittedDate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  const formattedDate = submittedDate.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });

  return (
    <li>
      <article className="evidence-ticket">
        <div className="field-note">
          <div className="field-note-margin">
            <p className="evidence-timestamp">
              {formattedTime}
              <br />
              {formattedDate}
            </p>
            <p className="evidence-result" data-result={report.result}>
              {RESULT_LABELS[report.result]}
            </p>
          </div>
          <div className="field-note-body">
            {report.images.length > 0 && (
              <div className="evidence-images">
                {report.images.map(
                  (image) =>
                    image.signedUrl && (
                      <img
                        key={image.id}
                        src={image.signedUrl}
                        alt={`Ảnh bằng chứng ${image.position}`}
                        className="evidence-image"
                      />
                    ),
                )}
              </div>
            )}
            {report.note && <p className="evidence-note">{report.note}</p>}
          </div>
        </div>
        <DeleteAttemptReportButton
          reportId={report.id}
          howToId={howToId}
          reportLabel={`${RESULT_LABELS[report.result]} lúc ${formattedTimestamp}`}
          isOwner={currentUserId !== null && report.user_id === currentUserId}
        />
      </article>
    </li>
  );
}

export async function generateMetadata({ params }: HowToDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = getServerSupabaseClient();
  const { data: howTo } = await supabase.from("how_to").select("title").eq("id", id).maybeSingle();

  return {
    title: howTo ? `${howTo.title} – VHKP` : "VHKP",
  };
}

export default async function HowToDetailPage({ params }: HowToDetailPageProps) {
  const { id } = await params;
  const supabase = getServerSupabaseClient();
  const currentUser = await getCurrentUser();

  const { data: howTo, error: howToError } = await supabase
    .from("how_to")
    .select("id, title, description, expected_outcome, user_id, hero_image_path, dish:dish_id(id, name)")
    .eq("id", id)
    .maybeSingle();

  if (howToError) {
    if (howToError.code === "22P02") {
      // Sai định dạng UUID trong URL — với người dùng, tương đương "không tìm thấy".
      notFound();
    }
    console.error("Lỗi tải Cách làm:", howToError);
    throw new Error("Không thể tải Cách làm. Vui lòng thử lại sau.");
  }

  if (!howTo) {
    notFound();
  }

  // PostgREST trả embed FK dạng mảng theo kiểu suy luận mặc định của client dù
  // dish_id là quan hệ nhiều-một — chuẩn hóa về một object (hoặc null) ở đây.
  const dish = Array.isArray(howTo.dish) ? (howTo.dish[0] ?? null) : (howTo.dish ?? null);

  const { data: categoryLinks } = await supabase
    .from("how_to_category")
    .select("category:category_id(id, name, slug)")
    .eq("how_to_id", id);
  const categoryTags = (categoryLinks ?? [])
    .map((row) => {
      const c = Array.isArray(row.category) ? (row.category[0] ?? null) : (row.category ?? null);
      return c;
    })
    .filter((c): c is { id: string; name: string; slug: string } => c !== null);

  const { data: steps, error: stepsError } = await supabase
    .from("how_to_step")
    .select("id, instruction")
    .eq("how_to_id", id)
    .order("position", { ascending: true });

  if (stepsError) {
    console.error("Lỗi tải các bước:", stepsError);
    throw new Error("Không thể tải các bước. Vui lòng thử lại sau.");
  }

  const { data: ingredients, error: ingredientsError } = await supabase
    .from("how_to_ingredient")
    .select("id, position, group_name, name, quantity, unit, preparation, is_required")
    .eq("how_to_id", id)
    .order("position", { ascending: true });

  if (ingredientsError) {
    console.error("Lỗi tải nguyên liệu:", ingredientsError);
    throw new Error("Không thể tải nguyên liệu. Vui lòng thử lại sau.");
  }

  const { data: reports, error: reportsError } = await supabase
    .from("attempt_report")
    .select("id, result, note, submitted_at, user_id")
    .eq("how_to_id", id)
    .order("submitted_at", { ascending: false });

  if (reportsError) {
    console.error("Lỗi tải Bằng chứng:", reportsError);
    throw new Error("Không thể tải Bằng chứng. Vui lòng thử lại sau.");
  }

  const reportIds = (reports ?? []).map((report) => report.id);

  const { data: images, error: imagesError } = reportIds.length
    ? await supabase
        .from("attempt_report_image")
        .select("id, attempt_report_id, storage_path, position")
        .in("attempt_report_id", reportIds)
        .order("position", { ascending: true })
    : { data: [], error: null };

  if (imagesError) {
    console.error("Lỗi tải ảnh Bằng chứng:", imagesError);
    throw new Error("Không thể tải Bằng chứng. Vui lòng thử lại sau.");
  }

  // Một lệnh gọi Storage cho toàn bộ ảnh của trang, thay vì 1 lệnh/ảnh (tránh N+1).
  const imageList = images ?? [];
  const signedUrlByPath = new Map<string, string | null>();
  if (imageList.length > 0) {
    const { data: signedUrlsData } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrls(
        imageList.map((image) => image.storage_path),
        SIGNED_URL_TTL_SECONDS,
      );
    for (const entry of signedUrlsData ?? []) {
      signedUrlByPath.set(entry.path ?? "", entry.signedUrl ?? null);
    }
  }

  const imagesByReportId = new Map<string, AttemptReportImageView[]>();
  for (const image of imageList) {
    const list = imagesByReportId.get(image.attempt_report_id) ?? [];
    list.push({
      id: image.id,
      position: image.position,
      signedUrl: signedUrlByPath.get(image.storage_path) ?? null,
    });
    imagesByReportId.set(image.attempt_report_id, list);
  }

  const reportViews: AttemptReportView[] = (reports ?? []).map((report) => ({
    id: report.id,
    result: report.result as AttemptReportResult,
    note: report.note,
    submitted_at: report.submitted_at,
    user_id: report.user_id,
    images: imagesByReportId.get(report.id) ?? [],
  }));

  const attemptCount = reportViews.length;
  const successCount = reportViews.filter((r) => r.result === "success").length;
  const partialCount = reportViews.filter((r) => r.result === "partial").length;
  const failedCount = reportViews.filter((r) => r.result === "failed").length;
  const evidenceCount = reportViews.reduce((sum, r) => sum + r.images.length, 0);

  const isHowToOwner = currentUser !== null && howTo.user_id === currentUser.id;

  let heroImageUrl: string | null = null;
  if (howTo.hero_image_path) {
    const { data: signedHero } = await supabase.storage
      .from(HERO_IMAGE_BUCKET)
      .createSignedUrl(howTo.hero_image_path, SIGNED_URL_TTL_SECONDS);
    heroImageUrl = signedHero?.signedUrl ?? null;
  }

  let initiallySaved = false;
  if (currentUser) {
    const { data: savedRow } = await supabase
      .from("saved_how_to")
      .select("id")
      .eq("user_id", currentUser.id)
      .eq("how_to_id", id)
      .maybeSingle();
    initiallySaved = savedRow !== null;
  }

  return (
    <main className="main-detail">
      <Link href="/" className="back-link">
        ← Khám phá
      </Link>

      <div className="howto-layout">
        <div className="howto-main">
          {heroImageUrl && (
            <figure className="hero-image">
              <img src={heroImageUrl} alt={`Minh họa: ${howTo.title}`} />
              <figcaption>Ảnh minh họa do tác giả cung cấp — không phải ảnh kết quả thật.</figcaption>
            </figure>
          )}

          <span className="eyebrow">
            Cách làm
            {dish && (
              <>
                {" · "}
                <Link href={`/dish/${dish.id}`} className="eyebrow-link">
                  {dish.name}
                </Link>
              </>
            )}
          </span>
          <h1>{howTo.title}</h1>

          {howTo.description && <p className="supporting-text">{howTo.description}</p>}

          {categoryTags.length > 0 && (
            <ul className="category-tags">
              {categoryTags.map((c) => (
                <li key={c.id}>
                  <Link href={`/?category=${c.slug}`} className="category-tag">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* Hành động chính luôn hiển thị, kể cả khi chưa đăng nhập — trước đó
              cả "Lưu lại" lẫn "Tôi đã thử" chỉ tồn tại cho người đã đăng nhập,
              nghĩa là phần lớn khách ghé lần đầu không thấy hành động chính
              nào trên trang. Với khách chưa đăng nhập, cả hai đưa thẳng tới
              đăng nhập (một tương tác thật, không phải nút chết). */}
          <div className="hero-actions">
            {currentUser ? (
              <a href="#phan-hoi-thuc-te" className="button-primary">
                Tôi đã thử cách này
              </a>
            ) : (
              <Link href={`/sign-in?redirectTo=/how-to/${id}`} className="button-primary">
                Tôi muốn thử cách này
              </Link>
            )}
            {currentUser ? (
              <SaveToggleButton howToId={id} initiallySaved={initiallySaved} />
            ) : (
              <Link href={`/sign-in?redirectTo=/how-to/${id}`} className="button-secondary">
                ☆ Lưu lại
              </Link>
            )}
          </div>

          {(ingredients ?? []).length > 0 && (
            <>
              <hr className="section-divider" />
              <span className="eyebrow">Nguyên liệu</span>
              <IngredientList ingredients={ingredients ?? []} />
            </>
          )}

          <hr className="section-divider" />

          <span className="eyebrow">Các bước</span>
          <ol>
            {(steps ?? []).map((step) => (
              <li key={step.id}>{step.instruction}</li>
            ))}
          </ol>

          {howTo.expected_outcome && (
            <div className="expected-outcome">
              <span className="eyebrow">Kết quả mong đợi</span>
              <p>{howTo.expected_outcome}</p>
            </div>
          )}

          <div className="detail-actions">
            {isHowToOwner && (
              <Link href={`/how-to/${id}/edit`} className="secondary-link">
                Sửa cách làm
              </Link>
            )}
            <DeleteHowToButton howToId={id} attemptReportCount={reportViews.length} isOwner={isHowToOwner} />
          </div>
        </div>

        <aside id="phan-hoi-thuc-te" className="evidence-rail" aria-label="Phản hồi thực tế từ người đã thử">
          <span className="eyebrow">Phản hồi thực tế</span>
          <section className="outcome-stats">
            {attemptCount === 0 ? (
              <p className="stat-line">Chưa có lượt thử</p>
            ) : (
              <>
                <p className="stat-line">{attemptCount} lần thử</p>
                <p className="stat-line">
                  {successCount} thành công · {partialCount} một phần · {failedCount} thất bại
                </p>
                {evidenceCount > 0 && <p className="stat-line">{evidenceCount} ảnh kết quả</p>}
              </>
            )}
          </section>

          <div className="attempt-cta-container">
            {currentUser ? (
              <SubmitAttemptReportForm howToId={id} />
            ) : (
              <p className="supporting-text">
                <Link href={`/sign-in?redirectTo=/how-to/${id}`}>Đăng nhập</Link> để chia sẻ kết quả bạn đã thử.
              </p>
            )}
          </div>

          <hr className="evidence-rail-divider" />

          {reportViews.length === 0 ? (
            <p className="evidence-empty">Chưa có ai chia sẻ kết quả</p>
          ) : (
            <>
              <ul className="evidence-list">
                {reportViews.slice(0, VISIBLE_TICKET_COUNT).map((report) => (
                  <EvidenceTicketItem key={report.id} report={report} howToId={id} currentUserId={currentUser?.id ?? null} />
                ))}
              </ul>

              {reportViews.length > VISIBLE_TICKET_COUNT && (
                <details className="evidence-more">
                  <summary>Xem thêm {reportViews.length - VISIBLE_TICKET_COUNT} lần thử cũ hơn</summary>
                  <ul className="evidence-list">
                    {reportViews.slice(VISIBLE_TICKET_COUNT).map((report) => (
                      <EvidenceTicketItem key={report.id} report={report} howToId={id} currentUserId={currentUser?.id ?? null} />
                    ))}
                  </ul>
                </details>
              )}
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
