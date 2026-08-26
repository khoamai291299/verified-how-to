import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <h1>Không tìm thấy</h1>
      <p>Cách làm này không tồn tại hoặc đã bị xóa.</p>
      <Link href="/">Quay lại Khám phá</Link>
    </main>
  );
}
