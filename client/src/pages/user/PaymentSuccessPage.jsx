import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  HiOutlineCheckCircle,
  HiOutlineTicket,
  HiOutlineHome,
} from "react-icons/hi2";
import StepIndicator from "../../components/common/StepIndicator.jsx";
import ETicketView from "../../components/user/ETicketView.jsx";
import TicketDownloadBtn from "../../components/user/TicketDownloadBtn.jsx";
import Loader from "../../components/common/Loader.jsx";
import { ticketApi } from "../../api/ticket.api.js";
import { paymentApi } from "../../api/payment.api.js";
import { bookingApi } from "../../api/booking.api.js";
import { clearSelection } from "../../app/features/seatSlice.js";
import { clearTrainSelection } from "../../app/features/trainSlice.js";
import { clearPassengers } from "../../app/features/passengerSlice.js";
import { clearCurrent } from "../../app/features/bookingSlice.js";

const STEPS = [
  { key: "seats", label: "Seats" },
  { key: "passengers", label: "Passengers" },
  { key: "review", label: "Review" },
  { key: "payment", label: "Payment" },
];

export default function PaymentSuccessPage() {
  const [params] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const sessionId = params.get("session_id");
  const bookingId = params.get("bookingId");

  const [status, setStatus] = useState("verifying"); // 'verifying' | 'ready' | 'error'
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Webhook may have already confirmed the booking; if so the booking
        // status will be 'confirmed' on first fetch. Otherwise we explicitly
        // verify the Stripe session as a fallback (useful for local dev).
        let confirmed = null;

        if (bookingId) {
          const data = await bookingApi.get(bookingId).catch(() => null);
          if (data?.booking?.status === "confirmed") confirmed = data.booking;
        }

        if (!confirmed && sessionId) {
          const data = await paymentApi.verify(sessionId);
          confirmed = data?.booking || null;
        }

        if (!confirmed) {
          throw new Error("Couldn't verify payment");
        }

        // Fetch the populated ticket payload
        const ticketRes = await ticketApi.get(confirmed.pnr);
        if (cancelled) return;
        setBooking(ticketRes?.booking || confirmed);
        setStatus("ready");

        // Wipe transient state so the next booking starts fresh
        dispatch(clearSelection());
        dispatch(clearTrainSelection());
        dispatch(clearPassengers());
        dispatch(clearCurrent());

        toast.success("Booking confirmed!");
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          toast.error(err.message || "Could not verify payment");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, bookingId, dispatch]);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <StepIndicator steps={STEPS} current="payment" />
      </div>

      {status === "verifying" && (
        <div className="glass p-12 grid place-items-center text-center">
          <Loader size="lg" label="Confirming your booking…" />
          <p className="text-sm text-text-secondary mt-3 max-w-md">
            Just a moment while we verify your payment with Stripe and lock in
            your seats.
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="glass p-10 text-center">
          <div className="text-5xl mb-3">😕</div>
          <h2 className="font-display font-bold text-2xl">
            Hmm, something went sideways
          </h2>
          <p className="mt-2 text-text-secondary max-w-md mx-auto">
            We couldn't verify your payment automatically. If you were charged,
            your booking should appear under My Bookings within a minute or two.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2">
            <button
              onClick={() => navigate("/my-bookings")}
              className="btn-primary"
            >
              <HiOutlineTicket className="h-4 w-4" />
              Go to My Bookings
            </button>
            <Link to="/" className="btn-ghost">
              <HiOutlineHome className="h-4 w-4" />
              Home
            </Link>
          </div>
        </div>
      )}

      {status === "ready" && booking && (
        <div className="space-y-6 animate-slide-up">
          {/* Success banner */}
          <div className="glass p-6 sm:p-8 relative overflow-hidden text-center">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-emerald-500/30 blur-3xl" />
            <div className="relative">
              <div className="grid place-items-center h-16 w-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-300 mb-3 animate-pulse-soft">
                <HiOutlineCheckCircle className="h-10 w-10" />
              </div>
              <h1 className="font-display font-bold text-3xl">
                Booking <span className="gradient-text">confirmed</span>
              </h1>
              <p className="mt-2 text-text-secondary">
                Your e-ticket has been emailed to{" "}
                <span className="text-text-primary font-medium">
                  {booking.user?.email}
                </span>
                .
              </p>
            </div>
          </div>

          {/* Ticket */}
          <ETicketView
            booking={booking}
            actions={<TicketDownloadBtn booking={booking} pnr={booking.pnr} />}
          />

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/my-bookings" className="btn-ghost">
              <HiOutlineTicket className="h-4 w-4" />
              All my bookings
            </Link>
            <Link to="/" className="btn-primary">
              <HiOutlineHome className="h-4 w-4" />
              Back to home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
