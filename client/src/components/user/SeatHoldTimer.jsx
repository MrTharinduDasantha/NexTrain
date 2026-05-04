import { useDispatch, useSelector } from "react-redux";
import { HiOutlineClock } from "react-icons/hi2";
import { selectHold, clearSelection } from "../../app/features/seatSlice.js";
import { useSeatHoldTimer } from "../../hooks/useSeatHoldTimer.js";

/**
 * Sticky-friendly banner showing the 10-minute seat hold countdown.
 *
 * Props:
 *  onExpire — optional callback when the timer hits zero. Defaults to
 *             clearing the local seat selection so the UI resets.
 *  variant  — 'banner' (default, full width) | 'pill' (compact)
 */
export default function SeatHoldTimer({ onExpire, variant = "banner" }) {
  const dispatch = useDispatch();
  const hold = useSelector(selectHold);
  const handleExpire = () => {
    dispatch(clearSelection());
    if (onExpire) onExpire();
  };

  const { mmss, secondsLeft, percentage, isExpired } = useSeatHoldTimer(
    hold.expiresAt,
    handleExpire,
  );

  if (!hold.active || !hold.expiresAt) return null;

  const danger = secondsLeft < 60;

  if (variant === "pill") {
    return (
      <span
        className={[
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border",
          danger
            ? "bg-rose-500/15 border-rose-500/40 text-rose-300 animate-pulse-soft"
            : "bg-amber-500/15 border-amber-500/40 text-amber-300",
        ].join(" ")}
      >
        <HiOutlineClock className="h-3.5 w-3.5" />
        {isExpired ? "Expired" : mmss}
      </span>
    );
  }

  return (
    <div
      className={[
        "glass p-4 sm:p-5 flex items-center gap-4 overflow-hidden relative",
        danger ? "border-rose-500/40" : "",
      ].join(" ")}
    >
      <div
        className="absolute inset-x-0 bottom-0 h-1 transition-[width] duration-1000 ease-linear"
        style={{
          width: `${percentage}%`,
          background: danger
            ? "linear-gradient(90deg, #f43f5e, #fb7185)"
            : "linear-gradient(90deg, #f59e0b, #fbbf24)",
        }}
      />

      <div
        className={[
          "h-12 w-12 rounded-full grid place-items-center shrink-0",
          danger
            ? "bg-rose-500/15 text-rose-300 animate-pulse-soft"
            : "bg-amber-500/15 text-amber-300",
        ].join(" ")}
      >
        <HiOutlineClock className="h-6 w-6" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-display font-semibold">
          {isExpired ? "Hold expired" : "Seats reserved for you"}
        </div>
        <div className="text-xs text-text-secondary">
          {isExpired
            ? "Your seat hold has ended. Please reselect to continue."
            : danger
              ? "Hurry — checkout before the timer runs out"
              : "Complete your booking before the timer ends"}
        </div>
      </div>

      <div className="text-right">
        <div
          className={[
            "font-mono font-bold tabular-nums text-2xl tracking-wider",
            danger ? "text-rose-300" : "text-amber-300",
          ].join(" ")}
        >
          {isExpired ? "00:00" : mmss}
        </div>
        <div className="text-[10px] uppercase tracking-wider text-text-muted">
          remaining
        </div>
      </div>
    </div>
  );
}
