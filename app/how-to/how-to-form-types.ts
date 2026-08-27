/** Dùng chung cho createHowTo và updateHowTo — cùng hình dạng lỗi, cùng form. */
export type HowToFormState = {
  error?: string;
  fieldErrors?: {
    title?: string;
    dish?: string;
    steps?: string;
  };
};

export type HowToFormInitialValues = {
  dish: string;
  title: string;
  description: string;
  expectedOutcome: string;
  ingredients: { name: string; quantity: string; unit: string }[];
  steps: string[];
  categoryIds: string[];
  /** URL đã ký của ảnh minh họa hiện có (chỉ dùng để xem trước ở form sửa). */
  heroImageUrl?: string | null;
};
