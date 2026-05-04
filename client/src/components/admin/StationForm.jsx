import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object({
  name: yup.string().trim().required("Station name is required").min(2),
  code: yup
    .string()
    .trim()
    .uppercase()
    .matches(/^[A-Z]{2,5}$/i, "2–5 uppercase letters (e.g. FOT)")
    .required(),
  city: yup.string().trim().required("City is required"),
});

/**
 * Compact form for adding or editing a station.
 *
 * Props:
 *   initial:  optional Station object
 *   onSubmit: async (values) => void
 *   onCancel: () => void
 *   submitting: boolean
 */
export default function StationForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: initial?.name || "",
      code: initial?.code || "",
      city: initial?.city || "",
    },
  });

  useEffect(() => {
    reset({
      name: initial?.name || "",
      code: initial?.code || "",
      city: initial?.city || "",
    });
  }, [initial, reset]);

  const submit = handleSubmit((data) =>
    onSubmit({ ...data, code: data.code.toUpperCase() }),
  );

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div>
        <label className="field-label">Station name</label>
        <input
          {...register("name")}
          placeholder="Colombo Fort"
          className="field-input"
        />
        {errors.name && <p className="field-error">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-[140px_1fr] gap-3">
        <div>
          <label className="field-label">Code</label>
          <input
            {...register("code")}
            placeholder="FOT"
            className="field-input font-mono uppercase tracking-widest"
            maxLength={5}
          />
          {errors.code && <p className="field-error">{errors.code.message}</p>}
        </div>
        <div>
          <label className="field-label">City</label>
          <input
            {...register("city")}
            placeholder="Colombo"
            className="field-input"
          />
          {errors.city && <p className="field-error">{errors.city.message}</p>}
        </div>
      </div>

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
              ? "Update station"
              : "Create station"}
        </button>
      </div>
    </form>
  );
}
