import { Link } from "react-router";
import {
  HiOutlineCalendarDays,
  HiOutlineMapPin,
  HiOutlineArrowRight,
  HiOutlineTicket,
} from "react-icons/hi2";
import { formatDate, formatRelativeDay } from "../../utils/formatDate.js";

/**
 * Booking card used in the My Bookings dashboard.
 *
 * Props:
 *  booking — populated booking returned from /api/bookings/mine
 */
export default function BookingCard({ booking }) {
  const status = booking.status;
  const journey = new Date(booking.journeyDate);
  const isPast = journey.getTime() < Date.now() - 24 * 60 * 60 * 1000;

  return (
    <article className="glass glass-hover overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Status strip */}
        <div
          className={[
            "sm:w-1.5 h-1.5 sm:h-auto",
            statusBg(status, isPast),
          ].join(" ")}
        />

        <div className="flex-1 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="chip chip-brand font-mono">
                  {booking.train?.number}
                </span>
                <h3 className="font-display font-semibold text-lg truncate">
                  {booking.train?.name}
                </h3>
                <StatusBadge status={status} isPast={isPast} />
              </div>

              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <HiOutlineMapPin className="h-4 w-4 shrink-0 text-(--color-brand-400)" />
                <span className="truncate">{booking.fromStation?.name}</span>
                <HiOutlineArrowRight className="h-3 w-3 text-text-muted" />
                <span className="truncate">{booking.toStation?.name}</span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                <span className="flex items-center gap-1.5">
                  <HiOutlineCalendarDays className="h-3.5 w-3.5" />
                  {formatDate(booking.journeyDate)}{" "}
                  <span className="text-brand-300">
                    ({formatRelativeDay(booking.journeyDate)})
                  </span>
                </span>
                <span>·</span>
                <span>{booking.trainClass?.name}</span>
                <span>·</span>
                <span>
                  {booking.seats?.length} seat
                  {booking.seats?.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="mt-3 inline-flex items-center gap-2 text-xs">
                <span className="text-text-muted uppercase tracking-wider">
                  PNR
                </span>
                <span className="font-mono font-semibold text-brand-300">
                  {booking.pnr}
                </span>
              </div>
            </div>

            <div className="flex sm:flex-col items-start sm:items-end gap-3 sm:gap-2">
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-text-muted">
                  Total paid
                </div>
                <div className="font-display font-bold text-xl">
                  LKR {Number(booking.fare?.total || 0).toFixed(0)}
                </div>
              </div>
              {status === "confirmed" && (
                <Link
                  to={`/tickets/${booking.pnr}`}
                  className="btn-primary py-2 px-3 text-sm whitespace-nowrap"
                >
                  <HiOutlineTicket className="h-4 w-4" />
                  View ticket
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ status, isPast }) {
  const cfg = statusConfig(status, isPast);
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border",
        cfg.cls,
      ].join(" ")}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function statusConfig(status, isPast) {
  if (status === "confirmed" && isPast) {
    return {
      label: "Completed",
      cls: "bg-slate-500/10 text-slate-400 border-slate-500/30",
      dot: "bg-slate-400",
    };
  }
  switch (status) {
    case "confirmed":
      return {
        label: "Confirmed",
        cls: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
        dot: "bg-emerald-400",
      };
    case "pending_payment":
      return {
        label: "Awaiting payment",
        cls: "bg-amber-500/10 text-amber-300 border-amber-500/30",
        dot: "bg-amber-400 animate-pulse-soft",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        cls: "bg-rose-500/10 text-rose-300 border-rose-500/30",
        dot: "bg-rose-400",
      };
    case "failed":
      return {
        label: "Failed",
        cls: "bg-rose-500/10 text-rose-300 border-rose-500/30",
        dot: "bg-rose-400",
      };
    default:
      return {
        label: status,
        cls: "bg-slate-500/10 text-slate-300 border-slate-500/30",
        dot: "bg-slate-400",
      };
  }
}

function statusBg(status, isPast) {
  if (status === "confirmed" && !isPast)
    return "bg-gradient-to-b from-emerald-400 to-cyan-400";
  if (status === "confirmed" && isPast) return "bg-slate-500";
  if (status === "pending_payment") return "bg-amber-400";
  if (status === "cancelled" || status === "failed") return "bg-rose-500";
  return "bg-slate-600";
}
