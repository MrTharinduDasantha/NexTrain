/**
 * KPI card for the admin dashboard.
 *
 * Props:
 *  label, value: required
 *  icon:        React component (e.g. HiOutlineTicket)
 *  hint:        optional sub-text
 *  trend:       { dir: 'up' | 'down' | 'flat', value: '+12%' }
 *  accent:      'brand' (default) | 'gold' | 'cyan' | 'rose'
 */
const ACCENTS = {
  brand: {
    text: "text-emerald-300",
    bg: "from-emerald-500/15 to-emerald-500/0",
    ring: "ring-emerald-500/30",
    iconBg: "bg-emerald-500/15 text-emerald-300",
  },
  cyan: {
    text: "text-cyan-300",
    bg: "from-cyan-500/15 to-cyan-500/0",
    ring: "ring-cyan-500/30",
    iconBg: "bg-cyan-500/15 text-cyan-300",
  },
  gold: {
    text: "text-amber-300",
    bg: "from-amber-500/15 to-amber-500/0",
    ring: "ring-amber-500/30",
    iconBg: "bg-amber-500/15 text-amber-300",
  },
  rose: {
    text: "text-rose-300",
    bg: "from-rose-500/15 to-rose-500/0",
    ring: "ring-rose-500/30",
    iconBg: "bg-rose-500/15 text-rose-300",
  },
};

export default function StatsCard({
  label,
  value,
  icon: Icon,
  hint,
  trend,
  accent = "brand",
  loading = false,
}) {
  const a = ACCENTS[accent] || ACCENTS.brand;

  return (
    <div
      className={[
        "relative glass p-5 overflow-hidden transition-transform hover:-translate-y-0.5",
        `ring-1 ${a.ring}`,
      ].join(" ")}
    >
      <div
        className={`absolute inset-0 bg-linear-to-br ${a.bg} pointer-events-none`}
      />
      <div className="relative flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.18em] text-text-muted">
            {label}
          </div>
          {loading ? (
            <div className="skeleton h-8 w-28 mt-2" />
          ) : (
            <div className="font-display font-bold text-3xl mt-1">{value}</div>
          )}
          {hint && (
            <div className="text-xs text-text-secondary mt-1">{hint}</div>
          )}
        </div>
        {Icon && (
          <div
            className={`h-11 w-11 rounded-xl grid place-items-center ${a.iconBg} shrink-0`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {trend && !loading && (
        <div
          className={[
            "relative mt-4 inline-flex items-center gap-1 text-xs font-medium",
            trend.dir === "up"
              ? "text-emerald-300"
              : trend.dir === "down"
                ? "text-rose-300"
                : "text-text-muted",
          ].join(" ")}
        >
          <span>
            {trend.dir === "up" ? "▲" : trend.dir === "down" ? "▼" : "—"}{" "}
            {trend.value}
          </span>
          <span className="text-text-muted font-normal">vs. previous</span>
        </div>
      )}
    </div>
  );
}
