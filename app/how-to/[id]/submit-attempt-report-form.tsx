"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitAttemptReport, type SubmitAttemptReportState } from "./actions";
import { RESULT_VALUES, RESULT_LABELS } from "@/lib/supabase/types";

const initialState: SubmitAttemptReportState = {};

export function SubmitAttemptReportForm({ howToId }: { howToId: string }) {
  const action = submitAttemptReport.bind(null, howToId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form action={formAction} ref={formRef}>
      <h2>Gửi báo cáo đã thử</h2>

      {state.success && <p role="status">Đã gửi báo cáo thành công.</p>}

      <div role="group" aria-labelledby="result-group-label">
        <label id="result-group-label">Kết quả</label>
        <div className="result-options">
          {RESULT_VALUES.map((value) => (
            <label key={value} className={`result-option result-option--${value}`}>
              <input type="radio" name="result" value={value} disabled={pending} required />
              {RESULT_LABELS[value]}
            </label>
          ))}
        </div>
        {state.fieldErrors?.result && <p role="alert">{state.fieldErrors.result}</p>}
      </div>

      <div>
        <label htmlFor="image1">Ảnh 1 (tùy chọn)</label>
        <input id="image1" name="image1" type="file" accept="image/jpeg,image/png,image/webp" disabled={pending} />
      </div>
      <div>
        <label htmlFor="image2">Ảnh 2 (tùy chọn)</label>
        <input id="image2" name="image2" type="file" accept="image/jpeg,image/png,image/webp" disabled={pending} />
      </div>
      <div>
        <label htmlFor="image3">Ảnh 3 (tùy chọn)</label>
        <input id="image3" name="image3" type="file" accept="image/jpeg,image/png,image/webp" disabled={pending} />
      </div>
      {state.fieldErrors?.images && <p role="alert">{state.fieldErrors.images}</p>}

      <div>
        <label htmlFor="note">Ghi chú (tùy chọn)</label>
        <textarea id="note" name="note" rows={3} disabled={pending} />
      </div>

      {state.error && <p role="alert">{state.error}</p>}

      <button type="submit" disabled={pending}>
        {pending ? "Đang gửi…" : "Gửi báo cáo đã thử"}
      </button>
    </form>
  );
}
