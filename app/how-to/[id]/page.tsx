import { notFound } from "next/navigation";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { RESULT_LABELS, type AttemptReportResult } from "@/lib/supabase/types";
import { SubmitAttemptReportForm } from "./submit-attempt-report-form";

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

  return (
    <main>
      <h1>{howTo.title}</h1>
      {howTo.description && <p>{howTo.description}</p>}

      <ol>
        {(steps ?? []).map((step) => (
          <li key={step.id}>{step.instruction}</li>
        ))}
      </ol>

      {howTo.expected_outcome && (
        <section>
          <h2>Kết quả mong đợi</h2>
          <p>{howTo.expected_outcome}</p>
        </section>
      )}

      <section className="evidence-section">
        <h2>Bằng chứng</h2>
        {reportViews.length === 0 ? (
          <p>Chưa có bằng chứng thực tế</p>
        ) : (
          <ul>
            {reportViews.map((report) => (
              <li key={report.id} className="evidence-item">
                <p className="evidence-timestamp">
                  {new Date(report.submitted_at).toLocaleString("vi-VN")}
                </p>
                <p className={`evidence-result evidence-result--${report.result}`}>
                  {RESULT_LABELS[report.result]}
                </p>
                {report.note && <p>{report.note}</p>}
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
              </li>
            ))}
          </ul>
        )}
      </section>

      <SubmitAttemptReportForm howToId={id} />
    </main>
  );
}
