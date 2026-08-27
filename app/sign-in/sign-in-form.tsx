"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, resendConfirmationEmail, type SignInState, type ResendConfirmationState } from "./actions";

const initialState: SignInState = {};
const initialResendState: ResendConfirmationState = {};

function ResendConfirmation({ email }: { email: string }) {
  const action = resendConfirmationEmail.bind(null, email);
  const [state, formAction, pending] = useActionState(action, initialResendState);

  if (state.sent) {
    return <p className="auth-success-title">Đã gửi lại email xác nhận tới {email}.</p>;
  }

  return (
    <form action={formAction}>
      <button type="submit" className="secondary" disabled={pending}>
        {pending ? "Đang gửi…" : "Gửi lại email xác nhận"}
      </button>
      {state.error && <p role="alert">{state.error}</p>}
    </form>
  );
}

export function SignInForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <>
    <form action={formAction}>
      <input type="hidden" name="redirectTo" value={redirectTo ?? "/"} />

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

      <div>
        <label htmlFor="password">Mật khẩu</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          disabled={pending}
          aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
        />
        {state.fieldErrors?.password && (
          <p role="alert" id="password-error">
            {state.fieldErrors.password}
          </p>
        )}
        <p className="field-hint">
          <Link href="/forgot-password">Quên mật khẩu?</Link>
        </p>
      </div>

      {state.error && <p role="alert">{state.error}</p>}

      <button type="submit" disabled={pending}>
        {pending ? "Đang đăng nhập…" : "Đăng nhập"}
      </button>

      <p className="supporting-text">
        Chưa có tài khoản? <Link href="/sign-up">Đăng ký</Link>
      </p>
    </form>

    {/* Ngoài <form> đăng nhập — form gửi lại xác nhận là một <form> riêng,
        không thể lồng bên trong (HTML không hợp lệ, gây lỗi hydration). */}
    {state.unconfirmedEmail && (
      <div className="auth-success" role="status">
        <p className="supporting-text">
          Email {state.unconfirmedEmail} chưa được xác nhận. Kiểm tra hộp thư, hoặc gửi lại liên kết xác nhận.
        </p>
        <ResendConfirmation email={state.unconfirmedEmail} />
      </div>
    )}
    </>
  );
}
