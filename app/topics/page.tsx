import Link from "next/link";
import { TOPICS } from "@/lib/topics";

export const metadata = {
  title: "Chủ đề – Verified How-To",
};

/**
 * Chủ đề (rebuild-v6.2) — điểm đến khám phá riêng, tách khỏi Khám phá (trang
 * chủ) và Tìm kiếm, đúng yêu cầu "3 khái niệm khám phá không được gộp lại"
 * của mission. Trang chủ vẫn có một lối tắt chọn chủ đề (mission §11) — đây
 * là nơi duyệt đầy đủ, có chủ đích, khi người dùng bấm "Chủ đề" trên nav.
 */
export default function TopicsIndexPage() {
  return (
    <main className="main-list">
      <h1>Chủ đề</h1>
      <p className="supporting-text">Chọn một lĩnh vực để khám phá cách làm và bằng chứng thật liên quan.</p>

      <div className="topic-cards topic-cards-grid">
        {TOPICS.map((topic) => (
          <Link
            key={topic.slug}
            href={`/topics/${topic.slug}`}
            className={`topic-card topic-card-large${topic.active ? " topic-card-active" : " topic-card-soon"}`}
          >
            <span className="topic-card-art topic-card-art-large" data-topic={topic.slug} aria-hidden="true" />
            <span className="topic-card-body">
              <span className="topic-card-name">{topic.name}</span>
              <span className="topic-card-desc">{topic.description}</span>
              {!topic.active && <span className="topic-card-badge">Sắp có</span>}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
