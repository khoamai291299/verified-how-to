"use client";

import type { Category } from "@/lib/supabase/types";
import { HowToForm } from "../../how-to-form";
import type { HowToFormInitialValues } from "../../how-to-form-types";
import { updateHowTo } from "./actions";

export function EditHowToForm({
  howToId,
  categories,
  initial,
}: {
  howToId: string;
  categories: Category[];
  initial: HowToFormInitialValues;
}) {
  const action = updateHowTo.bind(null, howToId);
  return (
    <HowToForm action={action} categories={categories} initial={initial} submitLabel="Lưu thay đổi" pendingLabel="Đang lưu…" />
  );
}
