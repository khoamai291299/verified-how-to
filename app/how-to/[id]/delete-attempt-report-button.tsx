"use client";

import { useActionState } from "react";
import { deleteAttemptReport, type DeleteState } from "./actions";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";

const initialState: DeleteState = {};

export function DeleteAttemptReportButton({ reportId, howToId }: { reportId: string; howToId: string }) {
  const action = deleteAttemptReport.bind(null, reportId, howToId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <ConfirmDeleteDialog
      triggerLabel="Xóa báo cáo"
      title="Xóa báo cáo đã thử?"
      message="Báo cáo này và ảnh đính kèm (nếu có) sẽ bị xóa vĩnh viễn. Không thể hoàn tác."
      confirmLabel="Xóa vĩnh viễn"
      pending={pending}
      error={state.error}
      formAction={formAction}
    />
  );
}
