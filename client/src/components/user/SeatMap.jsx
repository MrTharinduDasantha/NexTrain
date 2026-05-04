import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { seatApi } from "../../api/seat.api.js";
import {
  toggleSeat,
  selectSelectedSeats,
  SEAT_LIMIT,
} from "../../app/features/seatSlice.js";
import { useSocket } from "../../hooks/useSocket.js";
import Loader from "../common/Loader.jsx";

/**
 * Interactive seat map for a schedule + class.
 *
 * Props:
 *  scheduleId, trainClassId — required
 *
 * Behaviour:
 *  - Loads the seat map from the API on mount
 *  - Joins the Socket.io room and patches local state on `seat:update`
 *  - Click toggles selection (capped at SEAT_LIMIT, currently 6)
 *  - Color coding follows the spec: green=available, red=booked,
 *    yellow=selected by current user, plus orange=held-by-other and slate=blocked
 */
export default function SeatMap({ scheduleId, trainClassId }) {
  const dispatch = useDispatch();
  const selected = useSelector(selectSelectedSeats);
  const [coaches, setCoaches] = useState([]);
  const [activeCoachId, setActiveCoachId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMap = useCallback(async () => {
    try {
      const data = await seatApi.getMap({ scheduleId, trainClassId });
      const list = data?.seatMap || [];
      setCoaches(list);
      if (list.length && !activeCoachId) setActiveCoachId(list[0].coach._id);
    } finally {
      setLoading(false);
    }
  }, [scheduleId, trainClassId, activeCoachId]);

  useEffect(() => {
    setLoading(true);
    fetchMap();
  }, [fetchMap]);

  /* Live updates from other users / server */
  const onSeatUpdate = useCallback(({ seatId, status }) => {
    setCoaches((prev) =>
      prev.map((c) => ({
        ...c,
        seats: c.seats.map((s) =>
          String(s._id) === String(seatId)
            ? // Don't overwrite a seat the current user has selected locally
              s.status === "selected"
              ? s
              : { ...s, status }
            : s,
        ),
      })),
    );
  }, []);
  useSocket({ scheduleId, classId: trainClassId, onSeatUpdate });

  if (loading) {
    return (
      <div className="glass p-10 grid place-items-center">
        <Loader size="md" label="Loading seat map…" />
      </div>
    );
  }

  if (!coaches.length) {
    return (
      <div className="glass p-8 text-center">
        <div className="text-3xl mb-2">🛤️</div>
        <h3 className="font-display font-semibold mb-1">
          No coaches configured
        </h3>
        <p className="text-sm text-text-secondary">
          This class doesn't have a coach layout yet. Try another class or
          contact support.
        </p>
      </div>
    );
  }

  const activeCoach =
    coaches.find((c) => c.coach._id === activeCoachId) || coaches[0];
  const isSelectedById = (id) => selected.some((s) => s._id === id);

  const handleSeatClick = (seat, coach) => {
    if (seat.status === "booked") return;
    if (seat.status === "blocked") {
      toast.warn("Seat unavailable");
      return;
    }
    if (seat.status === "held" && !isSelectedById(seat._id)) {
      toast.warn("That seat is being held by another user");
      return;
    }
    if (!isSelectedById(seat._id) && selected.length >= SEAT_LIMIT) {
      toast.warn(`You can select at most ${SEAT_LIMIT} seats`);
      return;
    }
    dispatch(
      toggleSeat({
        _id: seat._id,
        seatNumber: seat.seatNumber,
        coachNumber: coach.coachNumber,
        row: seat.row,
        column: seat.column,
      }),
    );
  };

  return (
    <div className="space-y-4">
      {/* Coach tabs */}
      {coaches.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {coaches.map((c) => {
            const active = c.coach._id === activeCoachId;
            return (
              <button
                key={c.coach._id}
                onClick={() => setActiveCoachId(c.coach._id)}
                className={[
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-500/20 text-brand-300 border border-(--color-brand-400)"
                    : "bg-bg-elevated text-text-secondary border border-border-subtle hover:text-text-primary",
                ].join(" ")}
              >
                Coach {c.coach.coachNumber}
              </button>
            );
          })}
        </div>
      )}

      {/* Coach body */}
      <div className="glass p-4 sm:p-6">
        {/* Coach header — driver/engine icon */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-bg-overlay grid place-items-center text-lg">
              🚆
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-text-muted">
                Coach
              </div>
              <div className="font-display font-semibold">
                {activeCoach.coach.coachNumber}
              </div>
            </div>
          </div>
          <div className="text-xs text-text-muted">← Front of train</div>
        </div>

        {/* Seat grid */}
        <div className="overflow-x-auto -mx-2 px-2">
          <SeatGrid
            coach={activeCoach.coach}
            seats={activeCoach.seats}
            isSelectedById={isSelectedById}
            onSeatClick={(seat) => handleSeatClick(seat, activeCoach.coach)}
          />
        </div>

        <p className="mt-5 text-xs text-text-muted text-center">
          Tap any green seat to select. You can pick up to {SEAT_LIMIT} seats
          per booking.
        </p>
      </div>
    </div>
  );
}

/* ----------------- Grid renderer ----------------- */

function SeatGrid({ coach, seats, isSelectedById, onSeatClick }) {
  const aisleAfter = Number.isInteger(coach.aisleAfterColumn)
    ? coach.aisleAfterColumn
    : 1;

  // Group seats by row, then sort by column
  const rowMap = new Map();
  for (const s of seats) {
    if (!rowMap.has(s.row)) rowMap.set(s.row, []);
    rowMap.get(s.row).push(s);
  }
  const rows = Array.from(rowMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([row, list]) => [row, list.sort((a, b) => a.column - b.column)]);

  return (
    <div className="inline-block min-w-full">
      <div className="space-y-1.5">
        {rows.map(([row, list]) => (
          <div key={row} className="flex items-center gap-1.5">
            <span className="w-6 text-[10px] text-text-muted text-right select-none">
              {row}
            </span>
            <div className="flex items-center gap-1.5">
              {list.map((seat, i) => {
                // 1-indexed column number; seat.column is 1-based
                const isSelectedLocal = isSelectedById(seat._id);
                const visualStatus = isSelectedLocal ? "selected" : seat.status;
                const showAisle =
                  i < list.length - 1 && seat.column === aisleAfter + 1 - 1;
                // ↑ render aisle gap immediately after column index `aisleAfterColumn`
                return (
                  <div key={seat._id} className="flex items-center gap-1.5">
                    <SeatButton
                      seat={seat}
                      status={visualStatus}
                      onClick={() => onSeatClick(seat)}
                    />
                    {showAisle && <Aisle />}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Aisle() {
  return (
    <span
      aria-hidden
      className="inline-block w-5 h-px self-center bg-border-subtle"
    />
  );
}

function SeatButton({ seat, status, onClick }) {
  const styles = {
    available:
      "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 hover:scale-110",
    selected:
      "bg-amber-400 border-amber-300 text-[#1a1300] shadow-[0_0_20px_-4px_rgba(251,191,36,0.7)] scale-110",
    booked:
      "bg-rose-500/30 border-rose-500/40 text-rose-300 cursor-not-allowed",
    held: "bg-orange-500/25 border-orange-500/40 text-orange-300 cursor-not-allowed animate-pulse-soft",
    blocked:
      "bg-slate-700/60 border-slate-600 text-slate-400 cursor-not-allowed",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={`${seat.seatNumber} · ${labelFor(status)}`}
      aria-label={`Seat ${seat.seatNumber}, ${labelFor(status)}`}
      disabled={
        status === "booked" || status === "blocked" || status === "held"
      }
      className={[
        "relative h-9 w-9 sm:h-10 sm:w-10 rounded-lg border text-[10px] font-mono font-semibold grid place-items-center transition-all",
        styles[status] || styles.available,
      ].join(" ")}
    >
      {seat.seatNumber}
    </button>
  );
}

function labelFor(status) {
  switch (status) {
    case "available":
      return "Available";
    case "selected":
      return "Selected by you";
    case "booked":
      return "Booked";
    case "held":
      return "Being held by another user";
    case "blocked":
      return "Unavailable";
    default:
      return status;
  }
}
