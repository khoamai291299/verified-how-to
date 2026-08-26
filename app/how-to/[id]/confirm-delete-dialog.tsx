"use client";

import { useRef, type ReactNode } from "react";

export function ConfirmDeleteDialog({
  triggerLabel,
  title,
  message,
  confirmLabel,
  pending,
  error,
  formAction,
}: {
  triggerLabel: string;
  title: string;
  message: string;
  confirmLabel: string;
  pending: boolean;
  error?: string;
  formAction: (formData: FormData) => void;
}): ReactNode {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button type="button" className="danger" onClick={() => dialogRef.current?.showModal()}>
        {triggerLabel}
      </button>
      <dialog ref={dialogRef} className="confirm-dialog">
        <h2>{title}</h2>
        <p>{message}</p>
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
