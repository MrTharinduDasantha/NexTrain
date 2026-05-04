import { useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  HiOutlineArrowRight,
  HiOutlineClock,
  HiOutlineMapPin,
} from "react-icons/hi2";
import { toast } from "react-toastify";
import { selectTrainAndClass } from "../../app/features/trainSlice.js";
import { clearSelection } from "../../app/features/seatSlice.js";
import { selectIsAuthenticated } from "../../app/features/authSlice.js";
import { formatDuration } from "../../utils/formatDuration.js";

/**
 * Result card for a single matched train.
 * Shows route summary, duration, and a clickable class/fare grid.
 * Selecting a class jumps to /booking/seats (or /login for guests).
 */
export default function TrainCard({ train }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthed = useSelector(selectIsAuthenticated);
  const [openClasses, setOpenClasses] = useState(true);

  const cheapest = (train.classes || []).reduce(
    (acc, c) => (c.fare != null && c.fare < acc ? c.fare : acc),
    Infinity,
  );

  const handleSelectClass = (cls) => {
    if (!cls.isReserved) {
      toast.info(
        "Unreserved classes don't require seat selection — buy a ticket at the station.",
      );
      return;
    }
    if (cls.available != null && cls.available <= 0) {
      toast.warn("No seats available in this class");
      return;
    }
    dispatch(selectTrainAndClass({ train, cls }));
    dispatch(clearSelection());
    if (!isAuthed) {
      toast.info("Please sign in to continue booking");
      navigate("/login", { state: { from: { pathname: "/booking/seats" } } });
      return;
    }
    navigate("/booking/seats");
  };

  return (
    <article className="glass glass-hover overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between border-b border-border-subtle">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="chip chip-brand font-mono">
              {train.train.number}
            </span>
            <h3 className="text-lg sm:text-xl font-display font-semibold truncate">
              {train.train.name}
            </h3>
          </div>
          <div className="mt-3 flex items-center gap-3 text-sm">
            <TimePoint
              time={train.departure}
              code={train.from?.code}
              name={train.from?.name}
            />
            <div className="flex-1 min-w-20 flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <HiOutlineClock className="h-3.5 w-3.5" />
                {formatDuration(train.durationMinutes)}
              </div>
              <div className="relative w-full h-px bg-border-subtle my-1">
                <span className="absolute -top-1 left-0 h-2 w-2 rounded-full bg-(--color-brand-400)" />
                <span className="absolute -top-1 right-0 h-2 w-2 rounded-full bg-accent-400" />
              </div>
              {train.distanceKm > 0 && (
                <div className="text-[10px] uppercase tracking-wider text-text-muted">
                  {train.distanceKm} km
                </div>
              )}
            </div>
            <TimePoint
              time={train.arrival}
              code={train.to?.code}
              name={train.to?.name}
              align="right"
            />
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs uppercase tracking-wider text-text-muted">
            Starting from
          </div>
          <div className="font-display font-bold text-2xl gradient-text">
            LKR {Number.isFinite(cheapest) ? cheapest.toFixed(0) : "—"}
          </div>
          <button
            onClick={() => setOpenClasses((v) => !v)}
            className="text-xs text-(--color-brand-400) hover:underline"
          >
            {openClasses ? "Hide classes ↑" : "Show classes ↓"}
          </button>
        </div>
      </div>

      {/* Classes grid */}
      {openClasses && (
        <div className="p-5 sm:p-6 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {(train.classes || []).map((cls) => (
            <ClassChoice
              key={cls.classId}
              cls={cls}
              onSelect={handleSelectClass}
            />
          ))}
        </div>
      )}
    </article>
  );
}

function TimePoint({ time, code, name, align }) {
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <div className="font-display text-xl font-semibold">{time || "—"}</div>
      <div className="flex items-center gap-1 text-xs text-text-muted justify-start">
        {align !== "right" && <HiOutlineMapPin className="h-3 w-3" />}
        <span className="font-mono">{code}</span>
        {align === "right" && <HiOutlineMapPin className="h-3 w-3" />}
      </div>
      <div className="text-[11px] text-text-muted truncate max-w-30">
        {name}
      </div>
    </div>
  );
}

function ClassChoice({ cls, onSelect }) {
  const isReserved = cls.isReserved;
  const available = cls.available;
  const sold = !isReserved
    ? null
    : available == null
      ? null
      : available <= 0
        ? "Sold out"
        : available <= 5
          ? `Only ${available} left`
          : `${available} seats`;

  const palette = (() => {
    switch (cls.code) {
      case "FCO":
        return "from-amber-500/20 to-violet-500/10 border-amber-500/30";
      case "FAC":
        return "from-sky-500/20 to-cyan-500/10 border-sky-500/30";
      case "SCR":
        return "from-emerald-500/20 to-teal-500/10 border-emerald-500/30";
      case "SCU":
        return "from-teal-500/20 to-cyan-500/10 border-teal-500/30";
      case "TCR":
        return "from-orange-500/20 to-rose-500/10 border-orange-500/30";
      default:
        return "from-slate-500/20 to-slate-700/10 border-slate-500/30";
    }
  })();

  const disabled = isReserved && available != null && available <= 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(cls)}
      disabled={disabled}
      className={[
        "relative text-left p-4 rounded-xl border bg-linear-to-br transition-transform",
        palette,
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:scale-[1.02] hover:border-(--color-brand-400)",
      ].join(" ")}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="chip chip-brand font-mono">{cls.code}</span>
        {!isReserved && <span className="chip">Unreserved</span>}
      </div>
      <div className="text-sm font-medium leading-tight mb-3">{cls.name}</div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-text-muted">
            Per seat
          </div>
          <div className="font-display font-bold text-lg">
            LKR {(cls.fare ?? 0).toFixed(0)}
          </div>
        </div>
        {sold && (
          <div
            className={[
              "text-xs font-medium",
              available <= 0
                ? "text-rose-400"
                : available <= 5
                  ? "text-amber-400"
                  : "text-brand-300",
            ].join(" ")}
          >
            {sold}
          </div>
        )}
        {!disabled && (
          <HiOutlineArrowRight className="h-4 w-4 text-(--color-brand-400)" />
        )}
      </div>
    </button>
  );
}
