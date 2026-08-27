"use client";

import { useActionState, useState } from "react";
import type { Category, CategoryDimension } from "@/lib/supabase/types";
import { CATEGORY_DIMENSION_LABELS } from "@/lib/supabase/types";
import type { HowToFormInitialValues, HowToFormState } from "./how-to-form-types";

type IngredientRow = { key: number; name: string; quantity: string; unit: string };

function IngredientListField({ disabled, initial }: { disabled: boolean; initial: IngredientRow[] }) {
  const [rows, setRows] = useState<IngredientRow[]>(initial);
  const [nextKey, setNextKey] = useState(initial.length);

  function addRow() {
    setRows((r) => [...r, { key: nextKey, name: "", quantity: "", unit: "" }]);
    setNextKey((k) => k + 1);
  }

  function removeRow(key: number) {
    setRows((r) => (r.length > 1 ? r.filter((row) => row.key !== key) : r));
  }

  return (
    <div>
      <span className="eyebrow">Nguyên liệu (tùy chọn)</span>
      {rows.map((row, index) => (
        <div className="ingredient-row" key={row.key}>
          <input
            name="ingredientName"
            aria-label={`Tên nguyên liệu ${index + 1}`}
            placeholder="Tên nguyên liệu"
            defaultValue={row.name}
            disabled={disabled}
          />
          <input
            name="ingredientQuantity"
            aria-label={`Số lượng nguyên liệu ${index + 1}`}
            placeholder="Số lượng"
            defaultValue={row.quantity}
            disabled={disabled}
          />
          <input
            name="ingredientUnit"
            aria-label={`Đơn vị nguyên liệu ${index + 1}`}
            placeholder="Đơn vị"
            defaultValue={row.unit}
            disabled={disabled}
          />
          {rows.length > 1 && (
            <button
              type="button"
              className="secondary"
              onClick={() => removeRow(row.key)}
              disabled={disabled}
              aria-label={`Xóa nguyên liệu ${index + 1}`}
            >
              Xóa
            </button>
          )}
        </div>
      ))}
      <button type="button" className="secondary" onClick={addRow} disabled={disabled}>
        + Thêm nguyên liệu
      </button>
    </div>
  );
}

function StepListField({
  disabled,
  describedBy,
  initial,
}: {
  disabled: boolean;
  describedBy?: string;
  initial: { key: number; text: string }[];
}) {
  const [steps, setSteps] = useState(initial);
  const [nextKey, setNextKey] = useState(initial.length);

  function addStep() {
    setSteps((s) => [...s, { key: nextKey, text: "" }]);
    setNextKey((k) => k + 1);
  }

  function removeStep(key: number) {
    setSteps((s) => (s.length > 1 ? s.filter((step) => step.key !== key) : s));
  }

  return (
    <div>
      <span className="eyebrow">Các bước</span>
      {steps.map((step, index) => (
        <div className="step-row" key={step.key}>
          <span aria-hidden="true">{index + 1}.</span>
          <input
            name="steps"
            aria-label={`Bước ${index + 1}`}
            aria-describedby={describedBy}
            placeholder={`Mô tả bước ${index + 1}`}
            defaultValue={step.text}
            disabled={disabled}
          />
          {steps.length > 1 && (
            <button
              type="button"
              className="secondary"
              onClick={() => removeStep(step.key)}
              disabled={disabled}
              aria-label={`Xóa bước ${index + 1}`}
            >
              Xóa
            </button>
          )}
        </div>
      ))}
      <button type="button" className="secondary" onClick={addStep} disabled={disabled}>
        + Thêm bước
      </button>
    </div>
  );
}

function CategoryFieldset({
  categories,
  dimension,
  initialSelectedIds,
  disabled,
}: {
  categories: Category[];
  dimension: CategoryDimension;
  initialSelectedIds: string[];
  disabled: boolean;
}) {
  const inDimension = categories.filter((c) => c.dimension === dimension);
  if (inDimension.length === 0) return null;

  return (
    <fieldset className="category-fieldset">
      <legend>{CATEGORY_DIMENSION_LABELS[dimension]} (tùy chọn)</legend>
      <div className="category-checkbox-group">
        {inDimension.map((c) => (
          <label key={c.id} className="category-checkbox">
            <input
              type="checkbox"
              name="categoryIds"
              value={c.id}
              defaultChecked={initialSelectedIds.includes(c.id)}
              disabled={disabled}
            />
            {c.name}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const emptyInitial: HowToFormInitialValues = {
  dish: "",
  title: "",
  description: "",
  expectedOutcome: "",
  ingredients: [{ name: "", quantity: "", unit: "" }],
  steps: [""],
  categoryIds: [],
};

export function HowToForm({
  action,
  categories,
  initial = emptyInitial,
  submitLabel,
  pendingLabel,
}: {
  action: (prevState: HowToFormState, formData: FormData) => Promise<HowToFormState>;
  categories: Category[];
  initial?: HowToFormInitialValues;
  submitLabel: string;
  pendingLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  const ingredientRows: IngredientRow[] =
    initial.ingredients.length > 0
      ? initial.ingredients.map((ing, i) => ({ key: i, ...ing }))
      : [{ key: 0, name: "", quantity: "", unit: "" }];
  const stepRows =
    initial.steps.length > 0 ? initial.steps.map((text, i) => ({ key: i, text })) : [{ key: 0, text: "" }];

  return (
    <form action={formAction}>
      <div>
        <label htmlFor="dish">Đây là món gì?</label>
        <input
          id="dish"
          name="dish"
          type="text"
          placeholder="vd: Bánh xèo"
          defaultValue={initial.dish}
          disabled={pending}
          aria-describedby={state.fieldErrors?.dish ? "dish-error" : undefined}
        />
        {state.fieldErrors?.dish && (
          <p role="alert" id="dish-error">
            {state.fieldErrors.dish}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="title">Tên cách làm</label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="vd: Bánh xèo giòn rụm kiểu miền Tây"
          defaultValue={initial.title}
          disabled={pending}
          aria-describedby={state.fieldErrors?.title ? "title-error" : undefined}
        />
        {state.fieldErrors?.title && (
          <p role="alert" id="title-error">
            {state.fieldErrors.title}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="description">Mô tả (tùy chọn)</label>
        <textarea id="description" name="description" rows={3} defaultValue={initial.description} disabled={pending} />
      </div>

      <CategoryFieldset
        categories={categories}
        dimension="loai_mon"
        initialSelectedIds={initial.categoryIds}
        disabled={pending}
      />
      <CategoryFieldset
        categories={categories}
        dimension="phuong_phap"
        initialSelectedIds={initial.categoryIds}
        disabled={pending}
      />

      <IngredientListField disabled={pending} initial={ingredientRows} />

      <StepListField disabled={pending} describedBy={state.fieldErrors?.steps ? "steps-error" : undefined} initial={stepRows} />
      {state.fieldErrors?.steps && (
        <p role="alert" id="steps-error">
          {state.fieldErrors.steps}
        </p>
      )}

      <div>
        <label htmlFor="expectedOutcome">Kết quả mong đợi (tùy chọn)</label>
        <textarea
          id="expectedOutcome"
          name="expectedOutcome"
          rows={2}
          defaultValue={initial.expectedOutcome}
          disabled={pending}
        />
      </div>

      {state.error && <p role="alert">{state.error}</p>}

      <button type="submit" className="button-primary" disabled={pending}>
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
