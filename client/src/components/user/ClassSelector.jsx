import { HiOutlineCheck } from "react-icons/hi2";

/**
 * Tile selector for choosing a train class.
 *
 * Props:
 *  classes:   [{ classId, code, name, isReserved, fare, available }]
 *  selectedId: currently chosen classId
 *  onSelect:  (cls) => void
 */
export default function ClassSelector({ classes = [], selectedId, onSelect }) {
  if (!classes.length) {
    return (
      <div className="glass p-6 text-center text-sm text-text-muted">
        No classes are configured for this train yet.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {classes.map((cls) => {
        const selected = selectedId === cls.classId;
        const sold =
          cls.isReserved && cls.available != null && cls.available <= 0;

        return (
          <button
            key={cls.classId}
            type="button"
            onClick={() => !sold && onSelect(cls)}
            disabled={sold}
            className={[
              "relative text-left p-5 rounded-xl border transition-all",
              selected
                ? "border-(--color-brand-400) bg-brand-500/10 shadow-[0_0_24px_-8px_rgba(52,211,153,0.6)]"
                : "border-border-subtle glass glass-hover",
              sold && "opacity-50 cursor-not-allowed",
            ].join(" ")}
          >
            {selected && (
              <span className="absolute top-3 right-3 grid place-items-center h-6 w-6 rounded-full bg-brand-500 text-[#02110b]">
                <HiOutlineCheck className="h-4 w-4" />
              </span>
            )}

            <div className="flex items-center gap-2 mb-2">
              <span className="chip chip-brand font-mono">{cls.code}</span>
              {!cls.isReserved && <span className="chip">Unreserved</span>}
            </div>

            <div className="font-display font-semibold leading-tight mb-3">
              {cls.name}
            </div>

            <div className="flex items-end justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-text-muted">
                  Fare per seat
                </div>
                <div className="font-display font-bold text-xl">
                  LKR {(cls.fare ?? 0).toFixed(0)}
                </div>
              </div>
              {cls.isReserved && cls.available != null && (
                <div
                  className={[
                    "text-xs font-medium",
                    cls.available <= 0
                      ? "text-rose-400"
                      : cls.available <= 5
                        ? "text-amber-400"
                        : "text-brand-300",
                  ].join(" ")}
                >
                  {cls.available <= 0
                    ? "Sold out"
                    : cls.available <= 5
                      ? `Only ${cls.available} left`
                      : `${cls.available} seats`}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
