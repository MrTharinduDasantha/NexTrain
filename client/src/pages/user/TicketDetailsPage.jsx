import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import ETicketView from "../../components/user/ETicketView.jsx";
import TicketDownloadBtn from "../../components/user/TicketDownloadBtn.jsx";
import Loader from "../../components/common/Loader.jsx";
import { ticketApi } from "../../api/ticket.api.js";

export default function TicketDetailsPage() {
  const { pnr } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    ticketApi
      .get(pnr)
      .then((data) => {
        if (cancelled) return;
        setBooking(data?.booking);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "Ticket not found");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [pnr]);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
        <button onClick={() => navigate(-1)} className="btn-ghost">
          <HiOutlineArrowLeft className="h-4 w-4" />
          Back
        </button>
        {booking && <TicketDownloadBtn booking={booking} pnr={booking.pnr} />}
      </div>

      {loading ? (
        <div className="glass p-12 grid place-items-center">
          <Loader size="lg" label="Loading ticket…" />
        </div>
      ) : error ? (
        <div className="glass p-10 text-center">
          <div className="text-4xl mb-3">🎫</div>
          <h2 className="font-display font-bold text-2xl">
            Ticket unavailable
          </h2>
          <p className="text-sm text-text-secondary mt-1 max-w-md mx-auto">
            {error}
          </p>
          <Link to="/my-bookings" className="btn-primary mt-5 inline-flex">
            View all my bookings
          </Link>
        </div>
      ) : booking ? (
        <ETicketView booking={booking} />
      ) : null}
    </div>
  );
}
