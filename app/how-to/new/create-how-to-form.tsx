"use client";

import { useActionState, useState } from "react";
import { createHowTo, type CreateHowToState } from "./actions";

const initialState: CreateHowToState = {};

function StepListField({ disabled }: { disabled: boolean }) {
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
      <label>Các bước</label>
      {stepKeys.map((key, index) => (
        <div className="step-row" key={key}>
          <span aria-hidden="true">{index + 1}.</span>
          <input
            name="steps"
            aria-label={`Bước ${index + 1}`}
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
        <label htmlFor="title">Tiêu đề</label>
        <input id="title" name="title" type="text" disabled={pending} />
        {state.fieldErrors?.title && <p role="alert">{state.fieldErrors.title}</p>}
      </div>

      <div>
        <label htmlFor="description">Mô tả (tùy chọn)</label>
        <textarea id="description" name="description" rows={3} disabled={pending} />
      </div>

      <StepListField disabled={pending} />
      {state.fieldErrors?.steps && <p role="alert">{state.fieldErrors.steps}</p>}

      <div>
        <label htmlFor="expectedOutcome">Kết quả mong đợi (tùy chọn)</label>
        <textarea id="expectedOutcome" name="expectedOutcome" rows={2} disabled={pending} />
      </div>

      {state.error && <p role="alert">{state.error}</p>}

      <button type="submit" disabled={pending}>
        {pending ? "Đang tạo…" : "Tạo cách làm"}
      </button>
    </form>
  );
}
