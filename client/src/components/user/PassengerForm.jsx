import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEffect } from "react";
import { HiOutlineUser, HiOutlineHashtag } from "react-icons/hi2";
import { updatePassenger } from "../../app/features/passengerSlice.js";

const schema = yup.object({
  name: yup.string().trim().required("Name required").min(2, "Too short"),
  age: yup
    .number()
    .typeError("Age required")
    .integer("Whole number")
    .min(1, "Must be ≥ 1")
    .max(120, "Must be ≤ 120")
    .required(),
  gender: yup
    .string()
    .oneOf(["male", "female", "other"], "Pick a gender")
    .required(),
});

/**
 * Form for a single passenger tied to a specific seat.
 * Live-syncs every valid change into the Redux passengerSlice.
 *
 * Props:
 *  passenger: { seatNumber, name, age, gender }
 *  coachNumber: string (display only)
 *  index: 0-based position in the list
 */
export default function PassengerForm({ passenger, coachNumber, index }) {
  const dispatch = useDispatch();
  const {
    register,
    watch,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: {
      name: passenger.name || "",
      age: passenger.age || "",
      gender: passenger.gender || "",
    },
  });

  // Re-seed form when passenger object changes (e.g. seats reselected)
  useEffect(() => {
    setValue("name", passenger.name || "");
    setValue("age", passenger.age || "");
    setValue("gender", passenger.gender || "");
  }, [passenger.seatNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  // Push every change up to redux
  const watched = watch();
  useEffect(() => {
    if (watched.name !== passenger.name) {
      dispatch(
        updatePassenger({
          seatNumber: passenger.seatNumber,
          field: "name",
          value: watched.name,
        }),
      );
    }
    if (String(watched.age) !== String(passenger.age)) {
      dispatch(
        updatePassenger({
          seatNumber: passenger.seatNumber,
          field: "age",
          value: watched.age,
        }),
      );
    }
    if (watched.gender !== passenger.gender) {
      dispatch(
        updatePassenger({
          seatNumber: passenger.seatNumber,
          field: "gender",
          value: watched.gender,
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watched.name, watched.age, watched.gender]);

  return (
    <div className="glass p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center h-9 w-9 rounded-full bg-linear-to-br from-brand-500 to-accent-500 text-[#02110b] font-bold text-sm">
            {index + 1}
          </span>
          <div>
            <div className="font-display font-semibold leading-tight">
              Passenger {index + 1}
            </div>
            <div className="text-xs text-text-muted flex items-center gap-1.5">
              <HiOutlineHashtag className="h-3 w-3" />
              Coach {coachNumber} · Seat {passenger.seatNumber}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px_160px] gap-3">
        <div>
          <label className="field-label">
            <HiOutlineUser className="inline h-4 w-4 mr-1 -mt-0.5" /> Full name
          </label>
          <input
            {...register("name")}
            placeholder="As on photo ID"
            className="field-input"
          />
          {errors.name && <p className="field-error">{errors.name.message}</p>}
        </div>

        <div>
          <label className="field-label">Age</label>
          <input
            {...register("age")}
            type="number"
            min={1}
            max={120}
            placeholder="—"
            className="field-input"
          />
          {errors.age && <p className="field-error">{errors.age.message}</p>}
        </div>

        <div>
          <label className="field-label">Gender</label>
          <select {...register("gender")} className="field-input">
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && (
            <p className="field-error">{errors.gender.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
