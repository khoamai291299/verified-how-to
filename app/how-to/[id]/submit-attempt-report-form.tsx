"use client";

import { useActionState, useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { submitAttemptReport, type SubmitAttemptReportState } from "./actions";
import { RESULT_VALUES, RESULT_LABELS } from "@/lib/supabase/types";

const initialState: SubmitAttemptReportState = {};

/** Ảnh là bằng chứng thật — cho xem trước ngay khi chọn thay vì để input
 * file trần "Choose File / No file chosen" không nói lên điều gì. Input gốc
 * vẫn hiển thị bình thường (giữ nguyên hành vi bàn phím/trình đọc màn hình
 * mặc định của trình duyệt) — chỉ thêm ảnh xem trước bên trên. */
function ImageUploadSlot({
  id,
  name,
  label,
  disabled,
  describedBy,
}: {
  id: string;
  name: string;
  label: string;
  disabled: boolean;
  describedBy?: string;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  // Input file là uncontrolled — không thể "bỏ chọn" bằng cách đổi state,
  // phải tự tay xóa value của input thật (mission §15: mỗi ảnh cần có nút
  // xóa trước khi gửi, không chỉ xem trước).
  function handleRemove() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (inputRef.current) inputRef.current.value = "";
    setPreviewUrl(null);
  }

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      {previewUrl && (
        <div className="attempt-image-preview-wrap">
          <img src={previewUrl} alt="" className="attempt-image-preview" />
          <button
            type="button"
            className="attempt-image-remove"
            onClick={handleRemove}
            disabled={disabled}
            aria-label={`Xóa ${label.toLowerCase()}`}
          >
            Xóa
          </button>
        </div>
      )}
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={disabled}
        onChange={handleChange}
        aria-describedby={describedBy}
      />
    </div>
  );
}

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

      {state.success && <p role="status">Kết quả của bạn đã được ghi nhận. Cảm ơn bạn đã chia sẻ trải nghiệm thật.</p>}

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
          <label id="evidence-group-label">Ảnh kết quả (tùy chọn)</label>
          <div className="evidence-upload-group" role="group" aria-labelledby="evidence-group-label">
            <ImageUploadSlot
              id="image1"
              name="image1"
              label="Ảnh 1"
              disabled={pending}
              describedBy={state.fieldErrors?.images ? "images-error" : undefined}
            />
            <ImageUploadSlot
              id="image2"
              name="image2"
              label="Ảnh 2"
              disabled={pending}
              describedBy={state.fieldErrors?.images ? "images-error" : undefined}
            />
            <ImageUploadSlot
              id="image3"
              name="image3"
              label="Ảnh 3"
              disabled={pending}
              describedBy={state.fieldErrors?.images ? "images-error" : undefined}
            />
          </div>
          {state.fieldErrors?.images && (
            <p role="alert" id="images-error">
              {state.fieldErrors.images}
            </p>
          )}
        </div>

        {state.error && <p role="alert">{state.error}</p>}

        <button type="submit" disabled={pending}>
          {pending ? "Đang chia sẻ…" : "Chia sẻ kết quả"}
        </button>
      </form>
    </div>
  );
}
