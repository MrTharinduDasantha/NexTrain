import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const schema = yup.object({
  number: yup.string().trim().required("Train number is required"),
  name: yup.string().trim().required("Train name is required").min(3),
  daysOfOperation: yup
    .array()
    .of(yup.string().oneOf(DAYS))
    .min(1, "Select at least one operating day"),
  isActive: yup.boolean(),
});

/**
 * Add/edit a train.
 *
 * Props:
 *   initial:  optional Train object
 *   onSubmit: async (values) => void
 *   onCancel: () => void
 *   submitting: boolean
 */
export default function TrainForm({ initial, onSubmit, onCancel, submitting }) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      number: initial?.number || "",
      name: initial?.name || "",
      daysOfOperation: initial?.daysOfOperation || DAYS,
      isActive: initial?.isActive !== false,
    },
  });

  useEffect(() => {
    reset({
      number: initial?.number || "",
      name: initial?.name || "",
      daysOfOperation: initial?.daysOfOperation || DAYS,
      isActive: initial?.isActive !== false,
    });
  }, [initial, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid grid-cols-[160px_1fr] gap-3">
        <div>
          <label className="field-label">Train number</label>
          <input
            {...register("number")}
            placeholder="8084"
            className="field-input font-mono"
          />
          {errors.number && (
            <p className="field-error">{errors.number.message}</p>
          )}
        </div>
        <div>
          <label className="field-label">Train name</label>
          <input
            {...register("name")}
            placeholder="Udarata Menike"
            className="field-input"
          />
          {errors.name && <p className="field-error">{errors.name.message}</p>}
        </div>
      </div>

      <div>
        <label className="field-label">Days of operation</label>
        <Controller
          control={control}
          name="daysOfOperation"
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => {
                const active = field.value?.includes(d);
                return (
                  <button
                    type="button"
                    key={d}
                    onClick={() =>
                      field.onChange(
                        active
                          ? field.value.filter((x) => x !== d)
                          : [...(field.value || []), d],
                      )
                    }
                    className={[
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                      active
                        ? "bg-brand-500/20 text-brand-300 border-(--color-brand-400)"
                        : "bg-bg-elevated text-text-secondary border-border-subtle hover:text-text-primary",
                    ].join(" ")}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          )}
        />
        {errors.daysOfOperation && (
          <p className="field-error">{errors.daysOfOperation.message}</p>
        )}
      </div>

      <label className="inline-flex items-center gap-2 cursor-pointer text-sm">
        <input
          type="checkbox"
          {...register("isActive")}
          className="peer sr-only"
        />
        <span className="relative h-5 w-9 rounded-full bg-bg-elevated border border-border-subtle peer-checked:bg-brand-500/40 peer-checked:border-(--color-brand-400)">
          <span className="absolute top-px left-px h-4 w-4 rounded-full bg-text-secondary peer-checked:translate-x-4 peer-checked:bg-brand-300 transition-all" />
        </span>
        Active (visible in search results)
      </label>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-ghost">
            Cancel
          </button>
        )}
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting
            ? "Saving…"
            : initial?._id
              ? "Update train"
              : "Create train"}
        </button>
      </div>
    </form>
  );
}
