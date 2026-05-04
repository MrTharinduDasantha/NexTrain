/**
 * Color legend for the seat map.
 * Compact bar with the five visual statuses.
 */
const items = [
  {
    key: "available",
    label: "Available",
    className: "bg-emerald-500/30 border-emerald-500/50",
  },
  {
    key: "selected",
    label: "Selected",
    className: "bg-amber-400 border-amber-300",
  },
  {
    key: "held",
    label: "Held by another",
    className: "bg-orange-500/40 border-orange-500/60",
  },
  {
    key: "booked",
    label: "Booked",
    className: "bg-rose-500/40 border-rose-500/60",
  },
  {
    key: "blocked",
    label: "Unavailable",
    className: "bg-slate-700 border-slate-600",
  },
];

export default function SeatLegend({ orientation = "horizontal" }) {
  return (
    <div
      className={[
        "glass px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs",
        orientation === "vertical" ? "flex-col items-start" : "",
      ].join(" ")}
    >
      <span className="text-[10px] uppercase tracking-wider text-text-muted">
        Legend
      </span>
      {items.map((it) => (
        <div key={it.key} className="flex items-center gap-2">
          <span
            aria-hidden
            className={`inline-block h-4 w-4 rounded border ${it.className}`}
          />
          <span className="text-text-secondary">{it.label}</span>
        </div>
      ))}
    </div>
  );
}
