"use client";

import { useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { toggleSaved } from "./actions";

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill={filled ? "currentColor" : "none"} stroke="currentColor">
      <path d="M6 4h12v16l-6-4-6 4V4Z" strokeLinejoin="round" strokeWidth="1.7" />
    </svg>
  );
}

/**
 * Nút lưu gọn dùng trên thẻ kết quả (Khám phá/Tìm kiếm) — khác với nút
 * "☆ Lưu lại" đầy đủ chữ trên trang chi tiết: chỉ icon, đặt đè lên góc ảnh
 * mẫu vật, không được lấn át chính kết quả.
 *
 * Cập nhật lạc quan (useOptimistic) thay vì chờ action + revalidatePath("/")
 * trả về: trang Khám phá có nhiều truy vấn (ingredient discovery, ảnh mẫu
 * vật...), revalidate toàn trang mất ~1.2–1.5s — quá chậm để cảm thấy như
 * một cú bấm lưu. Nếu action lỗi, `saved` (giá trị đã xác nhận) không đổi
 * nên optimistic value tự rollback về đúng trạng thái cũ khi transition kết
 * thúc — không cần rollback thủ công.
 */
export function SaveIconButton({
  howToId,
  initiallySaved,
  title,
}: {
  howToId: string;
  initiallySaved: boolean;
  title: string;
}) {
  const [saved, setSaved] = useState(initiallySaved);
  const [optimisticSaved, setOptimisticSaved] = useOptimistic(saved);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    const next = !saved;
    startTransition(async () => {
      setOptimisticSaved(next);
      const result = await toggleSaved(howToId, { saved }, new FormData());
      if (result.error) {
        setError(result.error);
        return;
      }
      setSaved(result.saved);
    });
  }

  return (
    <>
      <button
        type="button"
        className="save-icon-button"
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
        disabled={isPending}
        aria-pressed={optimisticSaved}
        aria-label={optimisticSaved ? `Bỏ lưu "${title}"` : `Lưu "${title}"`}
        title={optimisticSaved ? "Bỏ lưu" : "Lưu lại"}
      >
        <BookmarkIcon filled={optimisticSaved} />
      </button>
      {error && (
        <span className="sr-only" role="alert">
          {error}
        </span>
      )}
    </>
  );
}

/** Người chưa đăng nhập bấm lưu → đưa thẳng tới đăng nhập, không phải nút chết. */
export function SaveIconSignInLink({ redirectTo, title }: { redirectTo: string; title: string }) {
  return (
    <Link
      href={`/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`}
      className="save-icon-button"
      aria-label={`Đăng nhập để lưu "${title}"`}
      title="Đăng nhập để lưu"
      onClick={(e) => e.stopPropagation()}
    >
      <BookmarkIcon filled={false} />
    </Link>
  );
}
