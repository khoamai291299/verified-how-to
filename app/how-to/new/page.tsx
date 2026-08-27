import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/session";
import { getAllCategories } from "@/lib/supabase/categories";
import { CreateHowToForm } from "./create-how-to-form";

export const metadata: Metadata = {
  title: "Chia sẻ một cách làm – VHKP",
};

export default async function NewHowToPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in?redirectTo=/how-to/new");
  }

  const categories = await getAllCategories();

  return (
    <main>
      <h1>Chia sẻ một cách làm</h1>
      <p className="supporting-text">
        Mô tả cách bạn thực hiện để những người khác có thể thử và chia sẻ kết quả.
      </p>
      <CreateHowToForm categories={categories} />
    </main>
  );
}
