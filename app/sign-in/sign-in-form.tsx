"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, type SignInState } from "./actions";

const initialState: SignInState = {};

export function SignInForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
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
  );
}
