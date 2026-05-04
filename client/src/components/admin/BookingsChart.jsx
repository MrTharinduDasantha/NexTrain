import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { format, parseISO } from "date-fns";

/**
 * Bookings-per-day bar chart.
 *
 * Props:
 *  data — [{ _id: 'YYYY-MM-DD', count: number }]
 *  height — px (default 300)
 */
export default function BookingsChart({ data = [], height = 300 }) {
  const formatted = data.map((d) => ({
    date: d._id,
    label: safeFormat(d._id, "EEE d"),
    count: Number(d.count || 0),
  }));

  const max = Math.max(1, ...formatted.map((d) => d.count));

  return (
    <div className="glass p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-lg">
            Bookings · last 7 days
          </h3>
          <p className="text-xs text-text-muted">All booking attempts</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-text-muted">
            Total
          </div>
          <div className="font-display font-bold text-xl gradient-text">
            {formatted.reduce((s, d) => s + d.count, 0)}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={formatted}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.95} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.7} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="#1f2a44"
            strokeDasharray="4 4"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={{ stroke: "#1f2a44" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={{ stroke: "#1f2a44" }}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: "#131c33",
              border: "1px solid #1f2a44",
              borderRadius: 10,
              color: "#f1f5f9",
            }}
            cursor={{ fill: "rgba(34, 211, 238, 0.08)" }}
            formatter={(v) => [v, "Bookings"]}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {formatted.map((d, i) => (
              <Cell
                key={i}
                fill={d.count === max ? "#34d399" : "url(#barGrad)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function safeFormat(iso, pattern) {
  try {
    return format(parseISO(iso), pattern);
  } catch {
    return iso || "";
  }
}
