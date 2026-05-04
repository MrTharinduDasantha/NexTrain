import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { HiOutlineWrenchScrewdriver } from "react-icons/hi2";

const COL_LETTERS = ["A", "B", "C", "D", "E", "F"];

const schema = yup.object({
  train: yup.string().required("Pick a train"),
  trainClass: yup.string().required("Pick a class"),
  coachNumber: yup
    .string()
    .trim()
    .required("Coach number is required")
    .matches(/^[A-Z0-9]{1,5}$/i, "Use 1–5 letters/digits (e.g. A1)"),
  rows: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value,
    )
    .integer()
    .min(1)
    .max(40)
    .required("Rows are required"),
  columns: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value,
    )
    .integer()
    .min(1)
    .max(6)
    .required("Columns are required"),
  aisleAfterColumn: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value,
    )
    .integer()
    .min(0)
    .max(5)
    .required("Aisle position is required"),
  seatNumberingPattern: yup
    .string()
    .oneOf(["ROW_LETTER_COL", "SEQ"])
    .required(),
});

/**
 * Coach layout editor with live seat-grid preview.
 *
 * Props:
 *   trains:    [{ _id, number, name }]
 *   classes:   [{ _id, code, name, isReserved }]
 *   onSubmit:  async (values) => void
 *   submitting: boolean
 */
export default function CoachLayoutEditor({
  trains = [],
  classes = [],
  onSubmit,
  submitting,
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      train: "",
      trainClass: "",
      coachNumber: "",
      rows: 10,
      columns: 4,
      aisleAfterColumn: 1,
      seatNumberingPattern: "ROW_LETTER_COL",
    },
  });

  const reservedClasses = useMemo(
    () => classes.filter((c) => c.isReserved !== false),
    [classes],
  );

  const values = watch();

  return (
    <div className="grid lg:grid-cols-[1fr_auto] gap-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="glass p-5 sm:p-6 space-y-4"
      >
        <h3 className="font-display font-semibold text-lg flex items-center gap-2">
          <HiOutlineWrenchScrewdriver className="h-5 w-5 text-(--color-brand-400)" />
          New coach
        </h3>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="field-label">Train</label>
            <select {...register("train")} className="field-input">
              <option value="">Select train…</option>
              {trains.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.number} · {t.name}
                </option>
              ))}
            </select>
            {errors.train && (
              <p className="field-error">{errors.train.message}</p>
            )}
          </div>

          <div>
            <label className="field-label">Class</label>
            <select {...register("trainClass")} className="field-input">
              <option value="">Select class…</option>
              {reservedClasses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.code} · {c.name}
                </option>
              ))}
            </select>
            {errors.trainClass && (
              <p className="field-error">{errors.trainClass.message}</p>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="field-label">Coach number</label>
            <input
              {...register("coachNumber")}
              placeholder="A1"
              className="field-input font-mono uppercase"
              maxLength={5}
            />
            {errors.coachNumber && (
              <p className="field-error">{errors.coachNumber.message}</p>
            )}
          </div>
          <div>
            <label className="field-label">Rows</label>
            <input
              {...register("rows")}
              type="number"
              min={1}
              max={40}
              className="field-input font-mono"
            />
            {errors.rows && (
              <p className="field-error">{errors.rows.message}</p>
            )}
          </div>
          <div>
            <label className="field-label">Columns</label>
            <input
              {...register("columns")}
              type="number"
              min={1}
              max={6}
              className="field-input font-mono"
            />
            {errors.columns && (
              <p className="field-error">{errors.columns.message}</p>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="field-label">
              Aisle after column (0 = no aisle)
            </label>
            <input
              {...register("aisleAfterColumn")}
              type="number"
              min={0}
              max={5}
              className="field-input font-mono"
            />
          </div>
          <div>
            <label className="field-label">Numbering pattern</label>
            <select
              {...register("seatNumberingPattern")}
              className="field-input"
            >
              <option value="ROW_LETTER_COL">Row + Letter (1A, 1B, 2A…)</option>
              <option value="SEQ">Sequential (1, 2, 3…)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button type="button" onClick={() => reset()} className="btn-ghost">
            Reset
          </button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Creating…" : "Create coach"}
          </button>
        </div>
      </form>

      <SeatPreview
        rows={Number(values.rows) || 0}
        columns={Number(values.columns) || 0}
        aisleAfterColumn={Number(values.aisleAfterColumn) || 0}
        pattern={values.seatNumberingPattern}
        coachNumber={values.coachNumber || "—"}
      />
    </div>
  );
}

function SeatPreview({
  rows,
  columns,
  aisleAfterColumn,
  pattern,
  coachNumber,
}) {
  const rowsArr = Array.from({ length: Math.min(rows, 12) }, (_, r) => r + 1);
  const colsArr = Array.from({ length: Math.min(columns, 6) }, (_, c) => c + 1);

  return (
    <div className="glass p-5 sm:p-6 lg:w-85">
      <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1">
        Live preview
      </div>
      <div className="font-display font-semibold mb-4">Coach {coachNumber}</div>

      {!rows || !columns ? (
        <div className="text-sm text-text-muted">
          Set rows & columns to preview the layout.
        </div>
      ) : (
        <div className="space-y-1.5">
          {rowsArr.map((r) => (
            <div key={r} className="flex items-center gap-1.5">
              <span className="w-5 text-[10px] text-text-muted text-right">
                {r}
              </span>
              {colsArr.map((c) => {
                const seatNumber =
                  pattern === "SEQ"
                    ? `${(r - 1) * columns + c}`
                    : `${r}${COL_LETTERS[c - 1] || c}`;
                const showAisle =
                  aisleAfterColumn > 0 && c === aisleAfterColumn;
                return (
                  <div key={c} className="flex items-center gap-1.5">
                    <div className="h-7 w-7 rounded-md bg-emerald-500/20 border border-emerald-500/40 grid place-items-center text-[9px] font-mono text-emerald-300">
                      {seatNumber}
                    </div>
                    {showAisle && c < columns && (
                      <span className="inline-block w-3 h-px bg-border-subtle" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          {rows > 12 && (
            <div className="text-[10px] text-text-muted text-center pt-2">
              … {rows - 12} more rows
            </div>
          )}
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-border-subtle text-xs text-text-secondary">
        Total seats:{" "}
        <span className="font-mono font-semibold text-text-primary">
          {rows * columns}
        </span>
      </div>
    </div>
  );
}
