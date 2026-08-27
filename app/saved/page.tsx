import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";
import type { AttemptReportResult } from "@/lib/supabase/types";
import { SaveIconButton } from "@/app/saved/save-icon-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Đã lưu – VHKP",
};

const STORAGE_BUCKET = "attempt-report-images";
const SIGNED_URL_TTL_SECONDS = 3600;
const MAX_TALLY_MARKS = 10;

type SavedRow = {
  id: string;
  howTo: { id: string; title: string; description: string | null };
  dishName: string | null;
  attempts: number;
  results: AttemptReportResult[];
  evidence: number;
  specimenUrl: string | null;
};

export default async function SavedPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in?redirectTo=/saved");
  }

  const supabase = getServerSupabaseClient();

  const { data: saved, error } = await supabase
    .from("saved_how_to")
    .select("id, created_at, how_to:how_to_id(id, title, description, dish:dish_id(name))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Lỗi tải mục đã lưu:", error);
    throw new Error("Không thể tải danh sách đã lưu. Vui lòng thử lại sau.");
  }

  type BaseRow = { id: string; howTo: { id: string; title: string; description: string | null }; dishName: string | null };
  const baseRows: BaseRow[] = [];
  for (const row of saved ?? []) {
    const howTo = Array.isArray(row.how_to) ? (row.how_to[0] ?? null) : (row.how_to ?? null);
    if (!howTo) continue;
    const dish = Array.isArray(howTo.dish) ? (howTo.dish[0] ?? null) : (howTo.dish ?? null);
    baseRows.push({
      id: row.id,
      howTo: { id: howTo.id, title: howTo.title, description: howTo.description },
      dishName: dish?.name ?? null,
    });
  }

  // Cùng tín hiệu thật (lần thử, kết quả, mẫu vật) như Khám phá/Món — Đã lưu
  // không nên trông nghèo thông tin hơn phần còn lại của sản phẩm.
  const howToIds = baseRows.map((r) => r.howTo.id);
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

  const rows: SavedRow[] = baseRows.map((r) => {
    const results = resultsByHowTo.get(r.howTo.id) ?? [];
    const specimenPath = specimenPathByHowTo.get(r.howTo.id);
    return {
      ...r,
      attempts: results.length,
      results,
      evidence: evidenceCountByHowTo.get(r.howTo.id) ?? 0,
      specimenUrl: specimenPath ? (specimenUrlByPath.get(specimenPath) ?? null) : null,
    };
  });

  return (
    <main className="main-list">
      <span className="eyebrow">Đã lưu</span>
      <h1>Cách làm bạn đã lưu</h1>

      {rows.length === 0 ? (
        <p className="supporting-text">
          Chưa có Cách làm nào được lưu. Bấm &quot;Lưu lại&quot; trên trang một Cách làm để xem lại sau.
        </p>
      ) : (
        <ul className="howto-list">
          {rows.map((row) => (
            <li key={row.id}>
              <div className="howto-entry">
                <div className="specimen">
                  {row.specimenUrl ? (
                    <img src={row.specimenUrl} alt="" className="specimen-image" />
                  ) : (
                    <span className="specimen-empty" aria-hidden="true" />
                  )}
                  <SaveIconButton howToId={row.howTo.id} initiallySaved title={row.howTo.title} />
                </div>
                <div className="howto-entry-main">
                  {row.dishName && <span className="dish-label">{row.dishName}</span>}
                  <h2>
                    <Link href={`/how-to/${row.howTo.id}`}>{row.howTo.title}</Link>
                  </h2>
                  {row.howTo.description && <p className="supporting-text">{row.howTo.description}</p>}
                </div>
                <div className="howto-entry-tally">
                  {row.attempts === 0 ? (
                    <p className="tally-empty">Chưa có lượt thử</p>
                  ) : (
                    <>
                      <div className="tally-marks" aria-hidden="true">
                        {row.results.slice(0, MAX_TALLY_MARKS).map((result, i) => (
                          <span key={i} className="tally-mark" data-result={result} />
                        ))}
                        {row.attempts > MAX_TALLY_MARKS && (
                          <span className="tally-overflow">+{row.attempts - MAX_TALLY_MARKS}</span>
                        )}
                      </div>
                      <p className="tally-caption">
                        {row.attempts} lần thử{row.evidence > 0 ? ` · ${row.evidence} ảnh kết quả` : ""}
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
