"use client";

import { useActionState } from "react";
import { toggleSaved, type ToggleSavedState } from "./actions";

export function SaveToggleButton({ howToId, initiallySaved }: { howToId: string; initiallySaved: boolean }) {
  const action = toggleSaved.bind(null, howToId);
  const initialState: ToggleSavedState = { saved: initiallySaved };
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      <button type="submit" className="secondary" disabled={pending} aria-pressed={state.saved}>
        {state.saved ? "★ Đã lưu" : "☆ Lưu lại"}
      </button>
      {state.error && (
        <p role="alert" className="save-error">
          {state.error}
        </p>
      )}
    </form>
  );
}
