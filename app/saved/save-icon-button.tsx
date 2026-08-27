"use client";

import { useActionState, useOptimistic } from "react";
import Link from "next/link";
import { toggleSaved, type ToggleSavedState } from "./actions";

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill={filled ? "currentColor" : "none"} stroke="currentColor">
      <path d="M6 4h12v16l-6-4-6 4V4Z" strokeLinejoin="round" strokeWidth="1.7" />
    </svg>
  );
}

/**
 * Nút lưu gọn dùng trên thẻ kết quả (Khám phá/Tìm kiếm/Món/Đã lưu) — khác
 * với nút "☆ Lưu lại" đầy đủ chữ trên trang chi tiết: chỉ icon, đè lên góc
 * ảnh mẫu vật, không lấn át chính kết quả.
 *
 * QUAN TRỌNG: vẫn dùng <form action={formAction}> (useActionState) làm cơ
 * chế submit thật, KHÔNG gọi server action trực tiếp trong startTransition
 * thủ công — đã thử cách đó trước và phát hiện lỗi thật khi test: nếu người
 * dùng bấm lưu rồi điều hướng đi ngay (vd click sang trang khác) trong lúc
 * request còn đang chạy, request bị hủy giữa chừng và lượt lưu KHÔNG được
 * ghi vào DB dù UI đã lạc quan hiển thị "đã lưu". <form action> qua
 * useActionState được React/Next.js coi là một transition thật, sống sót
 * qua điều hướng — khác với một async function gọi tay trong startTransition.
 * useOptimistic phủ lên state của useActionState để vẫn có cảm giác tức thì.
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
  const action = toggleSaved.bind(null, howToId);
  const initialState: ToggleSavedState = { saved: initiallySaved };
  const [state, formAction] = useActionState(action, initialState);
  const [optimisticSaved, setOptimisticSaved] = useOptimistic(state.saved);

  return (
    <form
      action={async (formData) => {
        setOptimisticSaved(!state.saved);
        await formAction(formData);
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="submit"
        className="save-icon-button"
        aria-pressed={optimisticSaved}
        aria-label={optimisticSaved ? `Bỏ lưu "${title}"` : `Lưu "${title}"`}
        title={optimisticSaved ? "Bỏ lưu" : "Lưu lại"}
      >
        <BookmarkIcon filled={optimisticSaved} />
      </button>
      {state.error && (
        <span className="sr-only" role="alert">
          {state.error}
        </span>
      )}
    </form>
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
