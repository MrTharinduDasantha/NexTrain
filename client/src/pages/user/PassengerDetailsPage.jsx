import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { HiOutlineArrowRight, HiOutlineArrowLeft } from "react-icons/hi2";
import StepIndicator from "../../components/common/StepIndicator.jsx";
import PassengerForm from "../../components/user/PassengerForm.jsx";
import SeatHoldTimer from "../../components/user/SeatHoldTimer.jsx";
import {
  selectPassengers,
  selectPassengersValid,
  initFromSeats,
} from "../../app/features/passengerSlice.js";
import {
  selectSelectedSeats,
  selectHold,
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

export default function PassengerDetailsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const train = useSelector(selectSelectedTrain);
  const cls = useSelector(selectSelectedClass);
  const seats = useSelector(selectSelectedSeats);
  const hold = useSelector(selectHold);
  const passengers = useSelector(selectPassengers);
  const valid = useSelector(selectPassengersValid);

  // Guard: must have an active hold and seats
  useEffect(() => {
    if (!train || !cls || seats.length === 0 || !hold.active) {
      toast.info("Please select your seats first");
      navigate("/booking/seats", { replace: true });
    } else if (passengers.length !== seats.length) {
      // Initialise / re-sync passenger rows to seats
      dispatch(initFromSeats(seats));
    }
  }, [train, cls, seats, hold.active, passengers.length, dispatch, navigate]);

  if (!train || !cls || seats.length === 0) return null;

  const continueToReview = () => {
    if (!valid) {
      toast.warn("Please complete every passenger's details");
      return;
    }
    navigate("/booking/review");
  };

  const goBack = () => {
    // Don't release seats when going back — the hold is still useful
    navigate("/booking/seats");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <StepIndicator steps={STEPS} current="passengers" />
      </div>

      <header className="mb-4">
        <h1 className="section-title">Passenger details</h1>
        <p className="text-sm text-text-secondary mt-1">
          Add the name, age, and gender for each traveller. Names must match a
          valid photo ID.
        </p>
      </header>

      {/* Hold timer */}
      <div className="mb-6">
        <SeatHoldTimer
          onExpire={() => {
            toast.error("Your seat hold expired — please reselect.");
            dispatch(clearSelection());
            navigate("/booking/seats", { replace: true });
          }}
        />
      </div>

      {/* Passenger forms */}
      <div className="space-y-3">
        {passengers.map((p, i) => {
          const seat = seats.find((s) => s.seatNumber === p.seatNumber);
          return (
            <PassengerForm
              key={p.seatNumber}
              passenger={p}
              coachNumber={seat?.coachNumber || ""}
              index={i}
            />
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button onClick={goBack} className="btn-ghost">
          <HiOutlineArrowLeft className="h-4 w-4" />
          Back to seats
        </button>
        <button
          onClick={continueToReview}
          disabled={!valid}
          className="btn-primary"
        >
          Review fare
          <HiOutlineArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
