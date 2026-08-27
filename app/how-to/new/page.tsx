import type { Metadata } from "next";
import { CreateHowToForm } from "./create-how-to-form";

export const metadata: Metadata = {
  title: "Chia sẻ một cách làm – VHKP",
};

export default function NewHowToPage() {
  return (
    <main>
      <h1>Chia sẻ một cách làm</h1>
      <p className="supporting-text">
        Mô tả cách bạn thực hiện để những người khác có thể thử và chia sẻ kết quả.
      </p>
      <CreateHowToForm />
    </main>
  );
}
