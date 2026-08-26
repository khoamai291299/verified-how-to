"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main>
      <h1>Đã có lỗi xảy ra</h1>
      <p>Vui lòng thử lại. Nếu lỗi tiếp diễn, hãy thử lại sau.</p>
      <button type="button" onClick={reset}>
        Thử lại
      </button>
    </main>
  );
}
