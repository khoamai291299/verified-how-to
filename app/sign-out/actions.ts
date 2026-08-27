"use server";

import { redirect } from "next/navigation";
import { getSessionSupabaseClient } from "@/lib/supabase/session";

export async function signOut() {
  const supabase = await getSessionSupabaseClient();
  await supabase.auth.signOut();
  redirect("/");
}
