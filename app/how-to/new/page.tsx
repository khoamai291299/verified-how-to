import type { Metadata } from "next";
import { CreateHowToForm } from "./create-how-to-form";

export const metadata: Metadata = {
  title: "Tạo cách làm mới – VHKP",
};

export default function NewHowToPage() {
  return (
    <main>
      <h1>Tạo cách làm mới</h1>
      <CreateHowToForm />
    </main>
  );
}
