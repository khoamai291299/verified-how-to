"use client";

import { signOut } from "./actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button type="submit" className="subtle">
        Đăng xuất
      </button>
    </form>
  );
}
