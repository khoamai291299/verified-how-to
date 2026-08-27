import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { RESULT_LABELS, type AttemptReportResult } from "@/lib/supabase/types";
import { SubmitAttemptReportForm } from "./submit-attempt-report-form";
import { DeleteHowToButton } from "./delete-how-to-button";
import { DeleteAttemptReportButton } from "./delete-attempt-report-button";

// Nội dung phụ thuộc dữ liệu thật (How-To + Evidence) — không prerender tĩnh lúc build.
export const dynamic = "force-dynamic";

const STORAGE_BUCKET = "attempt-report-images";
const SIGNED_URL_TTL_SECONDS = 3600;

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
  images: AttemptReportImageView[];
};

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

  const { data: howTo, error: howToError } = await supabase
    .from("how_to")
    .select("id, title, description, expected_outcome")
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

  const { data: steps, error: stepsError } = await supabase
    .from("how_to_step")
    .select("id, instruction")
    .eq("how_to_id", id)
    .order("position", { ascending: true });

  if (stepsError) {
    console.error("Lỗi tải các bước:", stepsError);
    throw new Error("Không thể tải các bước. Vui lòng thử lại sau.");
  }

  const { data: reports, error: reportsError } = await supabase
    .from("attempt_report")
    .select("id, result, note, submitted_at")
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

  const imagesByReportId = new Map<string, AttemptReportImageView[]>();
  for (const image of images ?? []) {
    const { data: signedUrlData } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(image.storage_path, SIGNED_URL_TTL_SECONDS);
    const list = imagesByReportId.get(image.attempt_report_id) ?? [];
    list.push({ id: image.id, position: image.position, signedUrl: signedUrlData?.signedUrl ?? null });
    imagesByReportId.set(image.attempt_report_id, list);
  }

  const reportViews: AttemptReportView[] = (reports ?? []).map((report) => ({
    id: report.id,
    result: report.result as AttemptReportResult,
    note: report.note,
    submitted_at: report.submitted_at,
    images: imagesByReportId.get(report.id) ?? [],
  }));

  const attemptCount = reportViews.length;
  const successCount = reportViews.filter((r) => r.result === "success").length;
  const partialCount = reportViews.filter((r) => r.result === "partial").length;
  const failedCount = reportViews.filter((r) => r.result === "failed").length;
  const evidenceCount = reportViews.reduce((sum, r) => sum + r.images.length, 0);

  return (
    <main className="main-detail">
      <Link href="/" className="back-link">
        ← Khám phá
      </Link>

      <div className="howto-layout">
        <div className="howto-main">
          <span className="eyebrow">Cách làm</span>
          <h1>{howTo.title}</h1>
          {howTo.description && <p className="supporting-text">{howTo.description}</p>}

          <hr className="section-divider" />

          <span className="eyebrow">Các bước</span>
          <ol>
            {(steps ?? []).map((step) => (
              <li key={step.id}>{step.instruction}</li>
            ))}
          </ol>

          {howTo.expected_outcome && (
            <>
              <hr className="section-divider" />
              <span className="eyebrow">Kết quả mong đợi</span>
              <p>{howTo.expected_outcome}</p>
            </>
          )}

          <div className="detail-actions">
            <DeleteHowToButton howToId={id} attemptReportCount={reportViews.length} />
          </div>
        </div>

        <aside className="evidence-rail" aria-label="Bằng chứng và báo cáo đã thử">
          <span className="eyebrow">Bằng chứng</span>
          <section className="outcome-stats">
            {attemptCount === 0 ? (
              <p className="stat-line">Chưa có lượt thử</p>
            ) : (
              <>
                <p className="stat-line">{attemptCount} lần thử</p>
                <p className="stat-line">
                  {successCount} thành công · {partialCount} một phần · {failedCount} thất bại
                </p>
                {evidenceCount > 0 && <p className="stat-line">{evidenceCount} bằng chứng</p>}
              </>
            )}
          </section>

          <div className="attempt-cta-container">
            <SubmitAttemptReportForm howToId={id} />
          </div>

          <hr className="evidence-rail-divider" />

          {reportViews.length === 0 ? (
            <p className="evidence-empty">Chưa có bằng chứng thực tế</p>
          ) : (
            <ul className="evidence-list">
              {reportViews.map((report) => {
                const formattedTimestamp = new Date(report.submitted_at).toLocaleString("vi-VN");
                return (
                  <li key={report.id}>
                    <article className="evidence-ticket">
                      <div className="evidence-ticket-head">
                        <p className="evidence-timestamp">{formattedTimestamp}</p>
                        <p className="evidence-result" data-result={report.result}>
                          {RESULT_LABELS[report.result]}
                        </p>
                      </div>
                      {report.note && <p className="evidence-note">{report.note}</p>}
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
                      <div className="evidence-ticket-foot">
                        <DeleteAttemptReportButton
                          reportId={report.id}
                          howToId={id}
                          reportLabel={`${RESULT_LABELS[report.result]} lúc ${formattedTimestamp}`}
                        />
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </div>
    </main>
  );
}
