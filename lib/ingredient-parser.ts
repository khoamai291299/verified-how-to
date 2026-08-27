/**
 * Tách nguyên liệu từ văn bản tự nhiên thành các dòng có cấu trúc
 * (tên/số lượng/đơn vị) — bước đầu của kiến trúc:
 *
 *   văn bản người dùng → PARSER TẤT ĐỊNH → đề xuất có cấu trúc → người dùng
 *   xem lại/sửa → xác nhận (submit form) → lưu.
 *
 * Cố ý CHỈ tất định (regex + danh sách đơn vị tiếng Việt thường gặp) — không
 * gọi AI/network. Đây là baseline theo đúng product-evolution-v1.md §4:
 * "không xây một hệ NLP dễ vỡ chỉ để trình diễn". Vì luôn tất định và không
 * bao giờ tự lưu (kết quả chỉ điền vào các ô có thể sửa, người dùng vẫn phải
 * bấm "Đăng cách làm"/"Lưu thay đổi" để xác nhận), việc thêm một bước gợi ý
 * bằng AI cho các dòng không chắc chắn có thể cắm vào sau mà không đổi kiến
 * trúc này — nhưng bước đó bị hoãn có chủ đích ở vòng này (chưa có nhu cầu
 * thật để biện minh cho một tích hợp AI mới).
 */

export type ParsedIngredient = {
  name: string;
  quantity: string;
  unit: string;
};

// Đơn vị tiếng Việt thường gặp trong công thức nấu ăn, dài nhất trước để
// khớp cụm từ trước khi khớp từ đơn (vd "muỗng canh" trước "muỗng").
const UNIT_WORDS = [
  "muỗng canh",
  "muỗng cà phê",
  "thìa canh",
  "thìa cà phê",
  "muỗng",
  "thìa",
  "kg",
  "g",
  "ml",
  "lít",
  "l",
  "quả",
  "trái",
  "cái",
  "củ",
  "cây",
  "nhánh",
  "lá",
  "tép",
  "con",
  "miếng",
  "lát",
  "chén",
  "bát",
  "bó",
  "hộp",
  "gói",
  "lon",
  "chai",
  "vắt",
  "múi",
  "tô",
  "ít",
  "chút",
];

const QUANTITY_UNIT_RE = new RegExp(`^(\\d+(?:[.,]\\d+)?)\\s*(${UNIT_WORDS.join("|")})?\\s+(.+)$`, "i");
const VAGUE_AMOUNT_RE = /^(?:một\s+)?(ít|chút)\s+(.+)$/i;

/** Tách một đoạn text tự do thành danh sách nguyên liệu có cấu trúc. */
export function parseIngredientText(text: string): ParsedIngredient[] {
  const segments = text
    .split(/[,;\n]|(?:\s+và\s+)/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const results: ParsedIngredient[] = [];

  const stripTrailingPunctuation = (s: string) => s.replace(/[.,;]+$/, "").trim();

  for (const segment of segments) {
    const cleaned = stripTrailingPunctuation(segment.replace(/^[-•\d]+[.)]\s*/, "").trim());
    if (!cleaned) continue;

    const quantityMatch = cleaned.match(QUANTITY_UNIT_RE);
    if (quantityMatch) {
      const [, quantity, unit, name] = quantityMatch;
      results.push({ name: stripTrailingPunctuation(name), quantity, unit: unit ?? "" });
      continue;
    }

    const vagueMatch = cleaned.match(VAGUE_AMOUNT_RE);
    if (vagueMatch) {
      const [, unit, name] = vagueMatch;
      results.push({ name: stripTrailingPunctuation(name), quantity: "", unit });
      continue;
    }

    results.push({ name: cleaned, quantity: "", unit: "" });
  }

  return results;
}
