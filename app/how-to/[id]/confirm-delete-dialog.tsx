"use client";

import { useId, useRef, type ReactNode } from "react";

export function ConfirmDeleteDialog({
  triggerLabel,
  triggerAriaLabel,
  title,
  message,
  confirmLabel,
  pending,
  error,
  formAction,
}: {
  triggerLabel: string;
  triggerAriaLabel?: string;
  title: string;
  message: string;
  confirmLabel: string;
  pending: boolean;
  error?: string;
  formAction: (formData: FormData) => void;
}): ReactNode {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const messageId = useId();

  return (
    <>
      <button
        type="button"
        className="danger"
        aria-label={triggerAriaLabel}
        onClick={() => dialogRef.current?.showModal()}
      >
        {triggerLabel}
      </button>
      <dialog ref={dialogRef} className="confirm-dialog" aria-labelledby={titleId} aria-describedby={messageId}>
        <h2 id={titleId}>{title}</h2>
        <p id={messageId}>{message}</p>
        {error && <p role="alert">{error}</p>}
        <form action={formAction}>
          <div className="confirm-dialog-actions">
            <button type="button" className="secondary" onClick={() => dialogRef.current?.close()} disabled={pending}>
              Hủy
            </button>
            <button type="submit" className="danger" disabled={pending}>
              {pending ? "Đang xóa…" : confirmLabel}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
