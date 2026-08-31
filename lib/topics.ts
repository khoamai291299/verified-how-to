/**
 * Năm chủ đề cấp cao nhất của sản phẩm (rebuild-v6.2, mission §2) — một khái
 * niệm IA MỚI, tách biệt với `category.dimension` (phương pháp/loại món,
 * xem `lib/supabase/types.ts`), vốn chỉ phân loại nội dung BÊN TRONG Ẩm thực.
 * Danh sách này cố định, không lấy từ DB — không có bảng "topic" nào, và
 * không cần một bảng như vậy chỉ để chứa 5 dòng tĩnh.
 *
 * Chỉ "Ẩm thực" có dữ liệu thật (toàn bộ catalog how_to/dish hiện tại là món
 * ăn). Bốn chủ đề còn lại hiển thị trạng thái "Sắp mở rộng" trung thực, không
 * bịa nội dung — đúng nguyên tắc đã áp dụng xuyên suốt dự án.
 */
export type Topic = {
  slug: string;
  name: string;
  /** Mô tả một dòng hiển thị trên thẻ chủ đề. */
  description: string;
  /** Placeholder cho ô tìm kiếm khi chủ đề này đang được chọn làm ngữ cảnh. */
  searchPlaceholder: string;
  /** Chỉ true cho Ẩm thực — chủ đề duy nhất có nội dung thật hiện nay. */
  active: boolean;
};

export const TOPICS: Topic[] = [
  {
    slug: "am-thuc",
    name: "Ẩm thực",
    description: "Món ăn, nguyên liệu, cách nấu",
    searchPlaceholder: "Tìm món ăn, nguyên liệu, cách nấu…",
    active: true,
  },
  {
    slug: "do-thu-cong",
    name: "Đồ thủ công",
    description: "Cách làm, vật liệu, ý tưởng",
    searchPlaceholder: "Tìm cách làm, vật liệu, ý tưởng…",
    active: false,
  },
  {
    slug: "lam-dep",
    name: "Làm đẹp",
    description: "Chăm sóc, trang điểm, mẹo làm đẹp",
    searchPlaceholder: "Tìm cách chăm sóc, trang điểm, mẹo làm đẹp…",
    active: false,
  },
  {
    slug: "meo-vat-cuoc-song",
    name: "Mẹo vặt cuộc sống",
    description: "Mẹo gia đình, vệ sinh, sửa chữa",
    searchPlaceholder: "Tìm mẹo gia đình, vệ sinh, sửa chữa…",
    active: false,
  },
  {
    slug: "cong-nghe",
    name: "Công nghệ",
    description: "Cách dùng, cài đặt, khắc phục",
    searchPlaceholder: "Tìm cách dùng, cài đặt, khắc phục…",
    active: false,
  },
];

export function getTopicBySlug(slug: string): Topic | null {
  return TOPICS.find((t) => t.slug === slug) ?? null;
}

export const DEFAULT_TOPIC = TOPICS[0];
