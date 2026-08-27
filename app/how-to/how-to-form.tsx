"use client";

import { useActionState, useRef, useState, type ChangeEvent } from "react";
import type { Category, CategoryDimension } from "@/lib/supabase/types";
import { CATEGORY_DIMENSION_LABELS } from "@/lib/supabase/types";
import { parseIngredientText } from "@/lib/ingredient-parser";
import type { HowToFormInitialValues, HowToFormState } from "./how-to-form-types";

type IngredientRow = { key: number; name: string; quantity: string; unit: string };
type StepRow = { key: number; text: string };

/**
 * Nhập nguyên liệu bằng văn bản tự nhiên trước, tách thành các dòng có cấu
 * trúc để người dùng xem lại/sửa — không có dòng nào được lưu cho tới khi
 * người dùng bấm nút đăng ở cuối form (mission §11: "AI suggests, user
 * confirms"; ở đây là parser tất định, không phải AI, nhưng nguyên tắc xác
 * nhận thủ công trước khi lưu giữ nguyên).
 */
function IngredientListField({
  disabled,
  rows,
  onChange,
}: {
  disabled: boolean;
  rows: IngredientRow[];
  onChange: (rows: IngredientRow[]) => void;
}) {
  const nextKeyRef = useRef(rows.length);
  const [rawText, setRawText] = useState("");
  const [parseNotice, setParseNotice] = useState<string | null>(null);

  function addRow() {
    onChange([...rows, { key: nextKeyRef.current++, name: "", quantity: "", unit: "" }]);
  }

  function removeRow(key: number) {
    onChange(rows.length > 1 ? rows.filter((row) => row.key !== key) : rows);
  }

  function updateRow(key: number, patch: Partial<IngredientRow>) {
    onChange(rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function handleParse() {
    const parsed = parseIngredientText(rawText);
    if (parsed.length === 0) {
      setParseNotice("Không nhận ra nguyên liệu nào — hãy thử viết mỗi nguyên liệu cách nhau bằng dấu phẩy.");
      return;
    }
    const hasManualContent = rows.some((r) => r.name.trim().length > 0);
    const parsedRows = parsed.map((p) => ({ key: nextKeyRef.current++, ...p }));
    onChange(hasManualContent ? [...rows, ...parsedRows] : parsedRows);
    setParseNotice(
      `Đã tách ${parsed.length} nguyên liệu — kiểm tra lại bên dưới, sửa nếu cần trước khi đăng.`,
    );
    setRawText("");
  }

  return (
    <div>
      <span className="eyebrow">Nguyên liệu (tùy chọn)</span>

      <div className="ingredient-parser">
        <label htmlFor="ingredientText">Viết tự nhiên, hệ thống sẽ tách giúp bạn</label>
        <textarea
          id="ingredientText"
          rows={2}
          placeholder="vd: 500g thịt ba chỉ, 3 quả trứng gà, 5 củ hành tím, nước mắm, đường, tiêu và một ít dầu ăn"
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          disabled={disabled}
        />
        <button type="button" className="secondary" onClick={handleParse} disabled={disabled || rawText.trim().length === 0}>
          Tách nguyên liệu
        </button>
        {parseNotice && (
          <p className="parse-notice" role="status">
            {parseNotice}
          </p>
        )}
      </div>

      {rows.map((row, index) => (
        <div className="ingredient-row" key={row.key}>
          <input
            name="ingredientName"
            aria-label={`Tên nguyên liệu ${index + 1}`}
            placeholder="Tên nguyên liệu"
            value={row.name}
            onChange={(e) => updateRow(row.key, { name: e.target.value })}
            disabled={disabled}
          />
          <input
            name="ingredientQuantity"
            aria-label={`Số lượng nguyên liệu ${index + 1}`}
            placeholder="Số lượng"
            value={row.quantity}
            onChange={(e) => updateRow(row.key, { quantity: e.target.value })}
            disabled={disabled}
          />
          <input
            name="ingredientUnit"
            aria-label={`Đơn vị nguyên liệu ${index + 1}`}
            placeholder="Đơn vị"
            value={row.unit}
            onChange={(e) => updateRow(row.key, { unit: e.target.value })}
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
  rows,
  onChange,
}: {
  disabled: boolean;
  describedBy?: string;
  rows: StepRow[];
  onChange: (rows: StepRow[]) => void;
}) {
  const nextKeyRef = useRef(rows.length);

  function addStep() {
    onChange([...rows, { key: nextKeyRef.current++, text: "" }]);
  }

  function removeStep(key: number) {
    onChange(rows.length > 1 ? rows.filter((step) => step.key !== key) : rows);
  }

  function updateStep(key: number, text: string) {
    onChange(rows.map((step) => (step.key === key ? { ...step, text } : step)));
  }

  return (
    <div>
      <span className="eyebrow">Các bước</span>
      {rows.map((step, index) => (
        <div className="step-row" key={step.key}>
          <span aria-hidden="true">{index + 1}.</span>
          <input
            name="steps"
            aria-label={`Bước ${index + 1}`}
            aria-describedby={describedBy}
            placeholder={`Mô tả bước ${index + 1}`}
            value={step.text}
            onChange={(e) => updateStep(step.key, e.target.value)}
            disabled={disabled}
          />
          {rows.length > 1 && (
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
  selectedIds,
  onToggle,
  disabled,
}: {
  categories: Category[];
  dimension: CategoryDimension;
  selectedIds: string[];
  onToggle: (id: string) => void;
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
              checked={selectedIds.includes(c.id)}
              onChange={() => onToggle(c.id)}
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

/**
 * Xem trước — dùng lại đúng ngôn ngữ thị giác của trang chi tiết How-To thật
 * (eyebrow, số bước tròn viền ember, khối kết quả mong đợi) để người dùng
 * thấy chính xác cái họ sắp đăng, không phải một bản tóm tắt trừu tượng.
 */
function HowToPreview({
  dish,
  title,
  description,
  expectedOutcome,
  heroImagePreviewUrl,
  ingredientRows,
  stepRows,
  selectedCategoryNames,
}: {
  dish: string;
  title: string;
  description: string;
  expectedOutcome: string;
  heroImagePreviewUrl: string | null;
  ingredientRows: IngredientRow[];
  stepRows: StepRow[];
  selectedCategoryNames: string[];
}) {
  const namedIngredients = ingredientRows.filter((r) => r.name.trim().length > 0);
  const namedSteps = stepRows.filter((s) => s.text.trim().length > 0);

  return (
    <div className="howto-main howto-preview">
      {heroImagePreviewUrl && (
        <figure className="hero-image">
          <img src={heroImagePreviewUrl} alt="" />
          <figcaption>Ảnh minh họa do tác giả cung cấp — không phải ảnh kết quả thật.</figcaption>
        </figure>
      )}

      <span className="eyebrow">Cách làm{dish && ` · ${dish}`}</span>
      <h1>{title || "(chưa có tên cách làm)"}</h1>

      {description && <p className="supporting-text">{description}</p>}

      {selectedCategoryNames.length > 0 && (
        <ul className="category-tags">
          {selectedCategoryNames.map((name) => (
            <li key={name}>
              <span className="category-tag">{name}</span>
            </li>
          ))}
        </ul>
      )}

      {namedIngredients.length > 0 && (
        <>
          <hr className="section-divider" />
          <span className="eyebrow">Nguyên liệu</span>
          <ul className="ingredient-list">
            {namedIngredients.map((ing) => (
              <li key={ing.key} className="ingredient-item">
                <span className="ingredient-name">{ing.name}</span>
                {(ing.quantity || ing.unit) && (
                  <span className="ingredient-amount">{[ing.quantity, ing.unit].filter(Boolean).join(" ")}</span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      <hr className="section-divider" />
      <span className="eyebrow">Các bước</span>
      {namedSteps.length > 0 ? (
        <ol>
          {namedSteps.map((step) => (
            <li key={step.key}>{step.text}</li>
          ))}
        </ol>
      ) : (
        <p className="supporting-text">(chưa có bước nào)</p>
      )}

      {expectedOutcome && (
        <div className="expected-outcome">
          <span className="eyebrow">Kết quả mong đợi</span>
          <p>{expectedOutcome}</p>
        </div>
      )}
    </div>
  );
}

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

  const [dish, setDish] = useState(initial.dish);
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [expectedOutcome, setExpectedOutcome] = useState(initial.expectedOutcome);
  const [categoryIds, setCategoryIds] = useState<string[]>(initial.categoryIds);
  const [heroImagePreviewUrl, setHeroImagePreviewUrl] = useState<string | null>(initial.heroImageUrl ?? null);
  const [showPreview, setShowPreview] = useState(false);

  const [ingredientRows, setIngredientRows] = useState<IngredientRow[]>(
    initial.ingredients.length > 0
      ? initial.ingredients.map((ing, i) => ({ key: i, ...ing }))
      : [{ key: 0, name: "", quantity: "", unit: "" }],
  );
  const [stepRows, setStepRows] = useState<StepRow[]>(
    initial.steps.length > 0 ? initial.steps.map((text, i) => ({ key: i, text })) : [{ key: 0, text: "" }],
  );

  function toggleCategory(id: string) {
    setCategoryIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  function handleHeroImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setHeroImagePreviewUrl(file ? URL.createObjectURL(file) : (initial.heroImageUrl ?? null));
  }

  const selectedCategoryNames = categories.filter((c) => categoryIds.includes(c.id)).map((c) => c.name);

  return (
    <form action={formAction}>
      {showPreview && (
        <div className="preview-panel">
          <div className="preview-panel-banner">
            <span>Đây là bản xem trước — chưa đăng.</span>
            <button type="button" className="secondary" onClick={() => setShowPreview(false)}>
              Chỉnh sửa tiếp
            </button>
          </div>
          <HowToPreview
            dish={dish}
            title={title}
            description={description}
            expectedOutcome={expectedOutcome}
            heroImagePreviewUrl={heroImagePreviewUrl}
            ingredientRows={ingredientRows}
            stepRows={stepRows}
            selectedCategoryNames={selectedCategoryNames}
          />
        </div>
      )}

      <div className="form-fields" hidden={showPreview}>
        <div>
          <label htmlFor="dish">Đây là món gì?</label>
          <input
            id="dish"
            name="dish"
            type="text"
            placeholder="vd: Bánh xèo"
            value={dish}
            onChange={(e) => setDish(e.target.value)}
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
          <textarea
            id="description"
            name="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={pending}
          />
        </div>

        <div>
          <label htmlFor="heroImage">Ảnh minh họa (tùy chọn)</label>
          {initial.heroImageUrl && heroImagePreviewUrl === initial.heroImageUrl && (
            <div className="hero-image-preview">
              <img src={initial.heroImageUrl} alt="Ảnh minh họa hiện tại" />
              <span className="supporting-text">Chọn ảnh mới bên dưới để thay thế.</span>
            </div>
          )}
          <input
            id="heroImage"
            name="heroImage"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleHeroImageChange}
            disabled={pending}
          />
        </div>

        <CategoryFieldset
          categories={categories}
          dimension="loai_mon"
          selectedIds={categoryIds}
          onToggle={toggleCategory}
          disabled={pending}
        />
        <CategoryFieldset
          categories={categories}
          dimension="phuong_phap"
          selectedIds={categoryIds}
          onToggle={toggleCategory}
          disabled={pending}
        />

        <IngredientListField disabled={pending} rows={ingredientRows} onChange={setIngredientRows} />

        <StepListField
          disabled={pending}
          describedBy={state.fieldErrors?.steps ? "steps-error" : undefined}
          rows={stepRows}
          onChange={setStepRows}
        />
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
            value={expectedOutcome}
            onChange={(e) => setExpectedOutcome(e.target.value)}
            disabled={pending}
          />
        </div>
      </div>

      {state.error && <p role="alert">{state.error}</p>}

      <div className="form-actions">
        {!showPreview && (
          <button
            type="button"
            className="secondary"
            onClick={() => setShowPreview(true)}
            disabled={pending || title.trim().length === 0}
          >
            Xem trước
          </button>
        )}
        <button type="submit" className="button-primary" disabled={pending}>
          {pending ? pendingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
