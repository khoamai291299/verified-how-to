"use client";

import type { Category } from "@/lib/supabase/types";
import { HowToForm } from "../how-to-form";
import { createHowTo } from "./actions";

export function CreateHowToForm({ categories }: { categories: Category[] }) {
  return (
    <HowToForm
      action={createHowTo}
      categories={categories}
      submitLabel="Đăng cách làm"
      pendingLabel="Đang đăng…"
    />
  );
}
