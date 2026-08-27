"use client";

import { useActionState } from "react";
import { deleteAttemptReport, type DeleteState } from "./actions";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";

const initialState: DeleteState = {};

export function DeleteAttemptReportButton({
  reportId,
  howToId,
  reportLabel,
  isOwner,
}: {
  reportId: string;
  howToId: string;
  reportLabel: string;
  isOwner: boolean;
}) {
  const action = deleteAttemptReport.bind(null, reportId, howToId);
  const [state, formAction, pending] = useActionState(action, initialState);

  if (!isOwner) {
    return null;
  }

  return (
    <ConfirmDeleteDialog
      triggerLabel="×"
      triggerAriaLabel={`Xóa lần thử ${reportLabel}`}
      triggerClassName="field-note-delete"
      title="Xóa lần thử này?"
      message="Lần thử này và ảnh đính kèm (nếu có) sẽ bị xóa vĩnh viễn. Không thể hoàn tác."
      confirmLabel="Xóa vĩnh viễn"
      pending={pending}
      error={state.error}
      formAction={formAction}
    />
  );
}
