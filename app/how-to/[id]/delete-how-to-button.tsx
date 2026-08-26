"use client";

import { useActionState } from "react";
import { deleteHowTo, type DeleteState } from "./actions";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";

const initialState: DeleteState = {};

export function DeleteHowToButton({ howToId, attemptReportCount }: { howToId: string; attemptReportCount: number }) {
  const action = deleteHowTo.bind(null, howToId);
  const [state, formAction, pending] = useActionState(action, initialState);

  const message =
    attemptReportCount > 0
      ? `Cách làm này và ${attemptReportCount} báo cáo đã thử đính kèm sẽ bị xóa vĩnh viễn. Không thể hoàn tác.`
      : "Cách làm này sẽ bị xóa vĩnh viễn. Không thể hoàn tác.";

  return (
    <ConfirmDeleteDialog
      triggerLabel="Xóa Cách làm"
      title="Xóa Cách làm?"
      message={message}
      confirmLabel="Xóa vĩnh viễn"
      pending={pending}
      error={state.error}
      formAction={formAction}
    />
  );
}
