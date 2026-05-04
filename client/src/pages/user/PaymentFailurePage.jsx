import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  HiOutlineXCircle,
  HiOutlineArrowPath,
  HiOutlineHome,
} from "react-icons/hi2";
import StepIndicator from "../../components/common/StepIndicator.jsx";
import {
  selectSelectedSeats,
  releaseSeats,
  clearSelection,
} from "../../app/features/seatSlice.js";
import {
  selectSelectedTrain,
  selectSelectedClass,
} from "../../app/features/trainSlice.js";

const STEPS = [
  { key: "seats", label: "Seats" },
  { key: "passengers", label: "Passengers" },
  { key: "review", label: "Review" },
  { key: "payment", label: "Payment" },
];

export default function PaymentFailurePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const seats = useSelector(selectSelectedSeats);
  const train = useSelector(selectSelectedTrain);
  const cls = useSelector(selectSelectedClass);

  // Release any held seats so other users can grab them
  useEffect(() => {
    if (seats.length > 0 && train?.schedule?._id && cls?.classId) {
      dispatch(
        releaseSeats({
          scheduleId: train.schedule._id,
          trainClassId: cls.classId,
          seatIds: seats.map((s) => s._id),
        }),
      );
    } else {
      dispatch(clearSelection());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <StepIndicator steps={STEPS} current="payment" />
      </div>

      <div className="glass p-8 sm:p-10 text-center relative overflow-hidden">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-rose-500/25 blur-3xl" />
        <div className="relative">
          <div className="grid place-items-center h-16 w-16 mx-auto rounded-full bg-rose-500/20 text-rose-300 mb-3">
            <HiOutlineXCircle className="h-10 w-10" />
          </div>
          <h1 className="font-display font-bold text-3xl">
            Payment didn't go through
          </h1>
          <p className="mt-3 text-text-secondary max-w-md mx-auto">
            No worries — your card hasn't been charged and the seats have been
            released. You can try again anytime.
          </p>

          <div className="mt-3 inline-flex items-center gap-2 chip">
            Common reasons: card declined · 3-D Secure failed · session timed
            out
          </div>

          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            <button onClick={() => navigate("/search")} className="btn-primary">
              <HiOutlineArrowPath className="h-4 w-4" />
              Try another booking
            </button>
            <Link to="/" className="btn-ghost">
              <HiOutlineHome className="h-4 w-4" />
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
