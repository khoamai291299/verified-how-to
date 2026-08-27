"use server";

import { redirect } from "next/navigation";
import { getSessionSupabaseClient } from "@/lib/supabase/session";

export type SignInState = {
  error?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
  };
};

export async function signIn(_prevState: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/");

  const fieldErrors: SignInState["fieldErrors"] = {};
  if (!email) fieldErrors.email = "Vui lòng nhập email.";
  if (!password) fieldErrors.password = "Vui lòng nhập mật khẩu.";
  if (fieldErrors.email || fieldErrors.password) {
    return { fieldErrors };
  }

  const supabase = await getSessionSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Email hoặc mật khẩu không đúng." };
  }

  redirect(redirectTo.startsWith("/") ? redirectTo : "/");
}
