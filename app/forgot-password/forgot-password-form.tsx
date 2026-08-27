"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, type ForgotPasswordState } from "./actions";

const initialState: ForgotPasswordState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);

  if (state.sent) {
    return (
      <div className="auth-success" role="status">
        <p className="auth-success-title">Kiểm tra hộp thư của bạn</p>
        <p className="supporting-text">
          Nếu email đó đã đăng ký, chúng tôi đã gửi một liên kết để đặt lại mật khẩu. Bấm vào liên kết trong email để
          tiếp tục.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          disabled={pending}
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
        />
        {state.fieldErrors?.email && (
          <p role="alert" id="email-error">
            {state.fieldErrors.email}
          </p>
        )}
      </div>

      {state.error && <p role="alert">{state.error}</p>}

      <button type="submit" disabled={pending}>
        {pending ? "Đang gửi…" : "Gửi liên kết đặt lại mật khẩu"}
      </button>

      <p className="supporting-text">
        Nhớ ra mật khẩu rồi? <Link href="/sign-in">Đăng nhập</Link>
      </p>
    </form>
  );
}
