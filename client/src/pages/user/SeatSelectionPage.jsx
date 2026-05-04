import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  HiOutlineArrowRight,
  HiOutlineXMark,
  HiOutlineArrowLeft,
} from "react-icons/hi2";
import StepIndicator from "../../components/common/StepIndicator.jsx";
import SeatMap from "../../components/user/SeatMap.jsx";
import SeatLegend from "../../components/user/SeatLegend.jsx";
import {
  selectSelectedTrain,
  selectSelectedClass,
  selectSearchCriteria,
} from "../../app/features/trainSlice.js";
import {
  toggleSeat,
  selectSelectedSeats,
  holdSeats,
} from "../../app/features/seatSlice.js";
import { initFromSeats } from "../../app/features/passengerSlice.js";

const STEPS = [
  { key: "seats", label: "Seats" },
  { key: "passengers", label: "Passengers" },
  { key: "review", label: "Review" },
  { key: "payment", label: "Payment" },
];

export default function SeatSelectionPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const train = useSelector(selectSelectedTrain);
  const cls = useSelector(selectSelectedClass);
  const criteria = useSelector(selectSearchCriteria);
  const selected = useSelector(selectSelectedSeats);

  // If no train/class chosen, bounce to search
  useEffect(() => {
    if (!train || !cls) {
      toast.info("Please pick a train and class first");
      navigate("/search", { replace: true });
    }
  }, [train, cls, navigate]);

  if (!train || !cls) return null;

  const continueToPassengers = async () => {
    if (selected.length === 0) {
      toast.warn("Please select at least one seat");
      return;
    }
    try {
      await dispatch(
        holdSeats({
          scheduleId: train.schedule._id,
          trainClassId: cls.classId,
          seatIds: selected.map((s) => s._id),
          fromStation: criteria.from,
          toStation: criteria.to,
        }),
      ).unwrap();
      dispatch(initFromSeats(selected));
      toast.success("Seats held for 10 minutes");
      navigate("/booking/passengers");
    } catch (err) {
      toast.error(err || "Could not hold seats");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <StepIndicator steps={STEPS} current="seats" />
      </div>

      <header className="mb-6 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="section-title">Pick your seats</h1>
          <p className="text-sm text-(--color-brand-400) mt-1">
            <span className="font-mono">{train.train.number}</span> ·{" "}
            {train.train.name} · {cls.name}
          </p>
        </div>
        <button onClick={() => navigate("/trains")} className="btn-ghost">
          <HiOutlineArrowLeft className="h-4 w-4" />
          Back to results
        </button>
      </header>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4">
          <SeatLegend />
          <SeatMap scheduleId={train.schedule._id} trainClassId={cls.classId} />
        </div>

        <aside>
          <div className="glass p-5 sticky top-20 animate-slide-up">
            <h3 className="font-display font-semibold mb-1">Your selection</h3>
            <p className="text-xs text-text-muted mb-4">
              {selected.length} of 6 seats picked
            </p>

            {selected.length === 0 ? (
              <div className="text-sm text-(--color-brand-400) py-6 text-center border border-dashed border-border-subtle rounded-lg">
                Tap a green seat to start.
              </div>
            ) : (
              <ul className="space-y-2">
                {selected.map((s) => (
                  <li
                    key={s._id}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-bg-elevated"
                  >
                    <div className="flex items-center gap-2">
                      <span className="grid place-items-center h-7 w-7 rounded-md bg-amber-400 text-[#1a1300] text-xs font-bold font-mono">
                        {s.seatNumber}
                      </span>
                      <div className="text-xs text-(--color-brand-400)">
                        Coach {s.coachNumber}
                      </div>
                    </div>
                    <button
                      onClick={() => dispatch(toggleSeat(s))}
                      className="p-1 rounded-md text-text-muted hover:text-rose-300 hover:bg-rose-500/10"
                      aria-label={`Remove seat ${s.seatNumber}`}
                    >
                      <HiOutlineXMark className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-5 pt-4 border-t border-border-subtle space-y-1.5">
              <Row
                label="Per seat"
                value={`LKR ${(cls.fare ?? 0).toFixed(0)}`}
              />
              <Row
                label={`Subtotal (${selected.length})`}
                value={`LKR ${(selected.length * (cls.fare ?? 0)).toFixed(0)}`}
                bold
              />
              <p className="text-[11px] text-text-muted mt-1">
                Reservation charge & GST added at the next step.
              </p>
            </div>

            <button
              onClick={continueToPassengers}
              disabled={selected.length === 0}
              className="btn-primary w-full mt-4"
            >
              Continue
              <HiOutlineArrowRight className="h-4 w-4" />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-(--color-brand-400)">{label}</span>
      <span className={bold ? "font-display font-bold" : ""}>{value}</span>
    </div>
  );
}
