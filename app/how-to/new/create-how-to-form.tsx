"use client";

import { useActionState, useState } from "react";
import { createHowTo, type CreateHowToState } from "./actions";

const initialState: CreateHowToState = {};

function IngredientListField({ disabled }: { disabled: boolean }) {
  const [rowKeys, setRowKeys] = useState<number[]>([0]);
  const [nextKey, setNextKey] = useState(1);

  function addRow() {
    setRowKeys((keys) => [...keys, nextKey]);
    setNextKey((key) => key + 1);
  }

  function removeRow(key: number) {
    setRowKeys((keys) => (keys.length > 1 ? keys.filter((k) => k !== key) : keys));
  }

  return (
    <div>
      <span className="eyebrow">Nguyên liệu (tùy chọn)</span>
      {rowKeys.map((key, index) => (
        <div className="ingredient-row" key={key}>
          <input name="ingredientName" aria-label={`Tên nguyên liệu ${index + 1}`} placeholder="Tên nguyên liệu" disabled={disabled} />
          <input name="ingredientQuantity" aria-label={`Số lượng nguyên liệu ${index + 1}`} placeholder="Số lượng" disabled={disabled} />
          <input name="ingredientUnit" aria-label={`Đơn vị nguyên liệu ${index + 1}`} placeholder="Đơn vị" disabled={disabled} />
          {rowKeys.length > 1 && (
            <button
              type="button"
              className="secondary"
              onClick={() => removeRow(key)}
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

function StepListField({ disabled, describedBy }: { disabled: boolean; describedBy?: string }) {
  const [stepKeys, setStepKeys] = useState<number[]>([0]);
  const [nextKey, setNextKey] = useState(1);

  function addStep() {
    setStepKeys((keys) => [...keys, nextKey]);
    setNextKey((key) => key + 1);
  }

  function removeStep(key: number) {
    setStepKeys((keys) => (keys.length > 1 ? keys.filter((k) => k !== key) : keys));
  }

  return (
    <div>
      <span className="eyebrow">Các bước</span>
      {stepKeys.map((key, index) => (
        <div className="step-row" key={key}>
          <span aria-hidden="true">{index + 1}.</span>
          <input
            name="steps"
            aria-label={`Bước ${index + 1}`}
            aria-describedby={describedBy}
            placeholder={`Mô tả bước ${index + 1}`}
            disabled={disabled}
          />
          {stepKeys.length > 1 && (
            <button
              type="button"
              className="secondary"
              onClick={() => removeStep(key)}
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

export function CreateHowToForm() {
  const [state, formAction, pending] = useActionState(createHowTo, initialState);

  return (
    <form action={formAction}>
      <div>
        <label htmlFor="dish">Đây là món gì?</label>
        <input
          id="dish"
          name="dish"
          type="text"
          placeholder="vd: Bánh xèo"
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
        <textarea id="description" name="description" rows={3} disabled={pending} />
      </div>

      <IngredientListField disabled={pending} />

      <StepListField disabled={pending} describedBy={state.fieldErrors?.steps ? "steps-error" : undefined} />
      {state.fieldErrors?.steps && (
        <p role="alert" id="steps-error">
          {state.fieldErrors.steps}
        </p>
      )}

      <div>
        <label htmlFor="expectedOutcome">Kết quả mong đợi (tùy chọn)</label>
        <textarea id="expectedOutcome" name="expectedOutcome" rows={2} disabled={pending} />
      </div>

      {state.error && <p role="alert">{state.error}</p>}

      <button type="submit" className="button-primary" disabled={pending}>
        {pending ? "Đang đăng…" : "Đăng cách làm"}
      </button>
    </form>
  );
}
