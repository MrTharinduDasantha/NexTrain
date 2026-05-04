import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  HiOutlineArrowRight,
  HiOutlineArrowLeft,
  HiOutlineLockClosed,
} from "react-icons/hi2";
import StepIndicator from "../../components/common/StepIndicator.jsx";
import FareSummary from "../../components/user/FareSummary.jsx";
import SeatHoldTimer from "../../components/user/SeatHoldTimer.jsx";
import Loader from "../../components/common/Loader.jsx";
import {
  initiateBooking,
  startCheckout,
  selectCurrentBooking,
} from "../../app/features/bookingSlice.js";
import {
  selectSelectedSeats,
  selectHold,
  clearSelection,
} from "../../app/features/seatSlice.js";
import {
  selectSelectedTrain,
  selectSelectedClass,
  selectSearchCriteria,
} from "../../app/features/trainSlice.js";
import { selectPassengers } from "../../app/features/passengerSlice.js";
import { formatDate } from "../../utils/formatDate.js";

const STEPS = [
  { key: "seats", label: "Seats" },
  { key: "passengers", label: "Passengers" },
  { key: "review", label: "Review" },
  { key: "payment", label: "Payment" },
];

export default function FareReviewPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  const train = useSelector(selectSelectedTrain);
  const cls = useSelector(selectSelectedClass);
  const criteria = useSelector(selectSearchCriteria);
  const seats = useSelector(selectSelectedSeats);
  const hold = useSelector(selectHold);
  const passengers = useSelector(selectPassengers);
  const reduxBooking = useSelector(selectCurrentBooking);

  const booking = createdBooking || reduxBooking;

  useEffect(() => {
    if (!train || !cls || seats.length === 0 || !hold.active) {
      toast.info("Please complete the previous steps first");
      navigate("/booking/seats", { replace: true });
    } else if (passengers.length !== seats.length) {
      navigate("/booking/passengers", { replace: true });
    }
  }, [train, cls, seats, hold.active, passengers.length, navigate]);

  // Compute estimated fare for display before the booking is created
  const estimateFare = () => {
    const baseFare = (cls.fare ?? 0) * seats.length;
    const reservationCharge = 40 * seats.length; // Matches server default
    const subtotal = baseFare + reservationCharge;
    const gst = +(subtotal * 0.08).toFixed(2);
    return {
      baseFare,
      reservationCharge,
      gst,
      total: +(subtotal + gst).toFixed(2),
    };
  };

  const fareForDisplay = booking?.fare || estimateFare();

  const proceedToPayment = async () => {
    setSubmitting(true);
    try {
      // Step 1: create the booking on the server (server computes the real total)
      const created = await dispatch(
        initiateBooking({
          scheduleId: train.schedule._id,
          trainClassId: cls.classId,
          seatIds: seats.map((s) => s._id),
          fromStation: criteria.from,
          toStation: criteria.to,
          passengers: passengers.map((p) => ({
            name: p.name,
            age: Number(p.age),
            gender: p.gender,
            seatNumber: p.seatNumber,
          })),
        }),
      ).unwrap();
      setCreatedBooking(created);

      // Step 2: ask the server to create a Stripe Checkout Session
      const session = await dispatch(startCheckout(created._id)).unwrap();
      if (!session?.url) throw new Error("No checkout URL returned");

      // Step 3: redirect the browser to Stripe-hosted checkout
      window.location.href = session.url;
    } catch (err) {
      toast.error(err || "Could not start checkout");
      setSubmitting(false);
    }
  };

  if (!train || !cls || seats.length === 0) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <StepIndicator steps={STEPS} current="review" />
      </div>

      <header className="mb-4">
        <h1 className="section-title">Review your booking</h1>
        <p className="text-sm text-text-secondary mt-1">
          One last look — confirm everything is correct before you pay.
        </p>
      </header>

      <div className="mb-6">
        <SeatHoldTimer
          onExpire={() => {
            toast.error("Your hold expired — please start over.");
            dispatch(clearSelection());
            navigate("/booking/seats", { replace: true });
          }}
        />
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <section className="space-y-4">
          {/* Trip card */}
          <div className="glass p-5 sm:p-6">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="chip chip-brand font-mono">
                {train.train.number}
              </span>
              <h2 className="font-display font-semibold text-lg">
                {train.train.name}
              </h2>
              <span className="chip">{cls.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="From">
                <span className="font-display font-semibold">
                  {train.from?.code}
                </span>{" "}
                {train.from?.name}
              </Field>
              <Field label="To">
                <span className="font-display font-semibold">
                  {train.to?.code}
                </span>{" "}
                {train.to?.name}
              </Field>
              <Field label="Date">{formatDate(train.schedule.date)}</Field>
              <Field label="Departure">{train.departure || "—"}</Field>
            </div>
          </div>

          {/* Passengers */}
          <div className="glass p-5 sm:p-6">
            <h3 className="font-display font-semibold mb-3">
              Passengers ({passengers.length})
            </h3>
            <ul className="divide-y divide-border-subtle">
              {passengers.map((p, i) => {
                const seat = seats.find((s) => s.seatNumber === p.seatNumber);
                return (
                  <li
                    key={p.seatNumber}
                    className="py-3 flex items-center gap-3 justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="grid place-items-center h-8 w-8 rounded-full bg-linear-to-br from-brand-500 to-accent-500 text-[#02110b] font-bold text-xs">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{p.name}</div>
                        <div className="text-xs text-text-muted">
                          {p.age} ·{" "}
                          <span className="capitalize">{p.gender}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-mono font-semibold text-brand-300">
                        {p.seatNumber}
                      </div>
                      <div className="text-[10px] text-text-muted uppercase tracking-wider">
                        Coach {seat?.coachNumber}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/booking/passengers")}
              className="btn-ghost"
              disabled={submitting}
            >
              <HiOutlineArrowLeft className="h-4 w-4" />
              Edit passengers
            </button>
          </div>
        </section>

        <aside>
          <FareSummary
            fare={fareForDisplay}
            seatCount={seats.length}
            trainName={train.train.name}
            className={cls.name}
          />

          <button
            onClick={proceedToPayment}
            disabled={submitting}
            className="btn-primary w-full mt-3"
          >
            {submitting ? (
              <>
                <Loader size="sm" />
                Redirecting…
              </>
            ) : (
              <>
                <HiOutlineLockClosed className="h-4 w-4" />
                Pay securely with Stripe
                <HiOutlineArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
          <p className="text-[11px] text-text-muted text-center mt-2">
            You'll be redirected to Stripe's secure checkout. We never see your
            card details.
          </p>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-text-muted">
        {label}
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
