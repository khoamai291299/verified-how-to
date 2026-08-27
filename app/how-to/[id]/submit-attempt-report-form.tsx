"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { submitAttemptReport, type SubmitAttemptReportState } from "./actions";
import { RESULT_VALUES, RESULT_LABELS } from "@/lib/supabase/types";

const initialState: SubmitAttemptReportState = {};

export function SubmitAttemptReportForm({ howToId }: { howToId: string }) {
  const action = submitAttemptReport.bind(null, howToId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [expanded, setExpanded] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const formRegionId = useId();

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  if (!expanded) {
    return (
      <button
        type="button"
        className="contribute-invite"
        aria-expanded={false}
        aria-controls={formRegionId}
        onClick={() => setExpanded(true)}
      >
        + Bạn đã thử chưa? Ghi lại kết quả
      </button>
    );
  }

  return (
    <div id={formRegionId}>
      <h2>Bạn đã thử cách này?</h2>

      {state.success && <p role="status">Kết quả của bạn đã được ghi nhận. Cảm ơn bạn đã giúp kiểm chứng cách làm này.</p>}

      <form action={formAction} ref={formRef} className="attempt-form-fields">
        <fieldset aria-describedby={state.fieldErrors?.result ? "result-error" : undefined}>
          <legend>Kết quả</legend>
          <div className="result-options">
            {RESULT_VALUES.map((value) => (
              <label key={value} className="result-option">
                <input type="radio" name="result" value={value} disabled={pending} required />
                {RESULT_LABELS[value]}
              </label>
            ))}
          </div>
          {state.fieldErrors?.result && (
            <p role="alert" id="result-error">
              {state.fieldErrors.result}
            </p>
          )}
        </fieldset>

        <div>
          <label htmlFor="note">Ghi chú (tùy chọn)</label>
          <textarea id="note" name="note" rows={3} disabled={pending} />
        </div>

        <div>
          <label id="evidence-group-label">Bằng chứng (tùy chọn)</label>
          <div className="evidence-upload-group" role="group" aria-labelledby="evidence-group-label">
            <div>
              <label htmlFor="image1">Ảnh 1</label>
              <input
                id="image1"
                name="image1"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={pending}
                aria-describedby={state.fieldErrors?.images ? "images-error" : undefined}
              />
            </div>
            <div>
              <label htmlFor="image2">Ảnh 2</label>
              <input
                id="image2"
                name="image2"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={pending}
                aria-describedby={state.fieldErrors?.images ? "images-error" : undefined}
              />
            </div>
            <div>
              <label htmlFor="image3">Ảnh 3</label>
              <input
                id="image3"
                name="image3"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={pending}
                aria-describedby={state.fieldErrors?.images ? "images-error" : undefined}
              />
            </div>
          </div>
          {state.fieldErrors?.images && (
            <p role="alert" id="images-error">
              {state.fieldErrors.images}
            </p>
          )}
        </div>

        {state.error && <p role="alert">{state.error}</p>}

        <button type="submit" disabled={pending}>
          {pending ? "Đang gửi…" : "Gửi kết quả"}
        </button>
      </form>
    </div>
  );
}
