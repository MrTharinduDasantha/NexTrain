import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";

/**
 * Revenue area chart.
 *
 * Props:
 *  data — [{ _id: 'YYYY-MM-DD', revenue: number }] (matches /api/admin/dashboard payload)
 *  height — px (default 300)
 */
export default function RevenueChart({ data = [], height = 300 }) {
  const formatted = data.map((d) => ({
    date: d._id,
    label: safeFormat(d._id, "EEE d"),
    revenue: Number(d.revenue || 0),
  }));

  return (
    <div className="glass p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-lg">
            Revenue · last 7 days
          </h3>
          <p className="text-xs text-text-muted">Confirmed bookings only</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-text-muted">
            Total
          </div>
          <div className="font-display font-bold text-xl gradient-text">
            LKR {formatted.reduce((s, d) => s + d.revenue, 0).toFixed(0)}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={formatted}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
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
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              background: "#131c33",
              border: "1px solid #1f2a44",
              borderRadius: 10,
              color: "#f1f5f9",
            }}
            formatter={(v) => [`LKR ${Number(v).toFixed(2)}`, "Revenue"]}
            labelFormatter={(l) => `Day · ${l}`}
            cursor={{
              stroke: "#34d399",
              strokeWidth: 1,
              strokeDasharray: "3 3",
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#34d399"
            strokeWidth={2}
            fill="url(#revGrad)"
          />
        </AreaChart>
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
