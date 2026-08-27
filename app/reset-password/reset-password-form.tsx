"use client";

import { useActionState } from "react";
import { updatePassword, type ResetPasswordState } from "./actions";

const initialState: ResetPasswordState = {};

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, initialState);

  return (
    <form action={formAction}>
      <div>
        <label htmlFor="password">Mật khẩu mới</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          disabled={pending}
          aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
        />
        {state.fieldErrors?.password && (
          <p role="alert" id="password-error">
            {state.fieldErrors.password}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword">Nhập lại mật khẩu mới</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          disabled={pending}
          aria-describedby={state.fieldErrors?.confirmPassword ? "confirmPassword-error" : undefined}
        />
        {state.fieldErrors?.confirmPassword && (
          <p role="alert" id="confirmPassword-error">
            {state.fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      {state.error && <p role="alert">{state.error}</p>}

      <button type="submit" disabled={pending}>
        {pending ? "Đang cập nhật…" : "Cập nhật mật khẩu"}
      </button>
    </form>
  );
}
