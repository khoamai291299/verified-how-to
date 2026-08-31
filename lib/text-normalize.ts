/**
 * Bỏ dấu tiếng Việt để so khớp tìm kiếm không phân biệt dấu — tìm kiếm hiện
 * tại dùng ilike thuần trên chuỗi có dấu, nên "banh xeo" không khớp được
 * "Bánh xèo". Không dùng extension Postgres (unaccent) để tránh phụ thuộc
 * schema mới cho một bản sửa lỗi tìm kiếm — kho dữ liệu hiện tại đủ nhỏ để so
 * khớp phía ứng dụng.
 */
export function stripDiacritics(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}
