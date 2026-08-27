"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp, type SignUpState } from "./actions";

const initialState: SignUpState = {};

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  if (state.confirmationRequired) {
    return (
      <p role="status">
        Đã gửi email xác nhận. Vui lòng kiểm tra hộp thư và bấm vào liên kết xác nhận trước khi đăng nhập.
      </p>
    );
  }

  return (
    <form action={formAction}>
      <div>
        <label htmlFor="displayName">Tên hiển thị</label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          autoComplete="name"
          disabled={pending}
          aria-describedby={state.fieldErrors?.displayName ? "displayName-error" : undefined}
        />
        {state.fieldErrors?.displayName && (
          <p role="alert" id="displayName-error">
            {state.fieldErrors.displayName}
          </p>
        )}
      </div>

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

      {state.error && <p role="alert">{state.error}</p>}

      <button type="submit" disabled={pending}>
        {pending ? "Đang đăng ký…" : "Đăng ký"}
      </button>

      <p className="supporting-text">
        Đã có tài khoản? <Link href="/sign-in">Đăng nhập</Link>
      </p>
    </form>
  );
}
