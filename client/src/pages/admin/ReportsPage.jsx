import { useEffect, useState } from "react";
import {
  HiOutlineChartBar,
  HiOutlineCurrencyDollar,
  HiOutlineUsers,
} from "react-icons/hi2";
import ReportExportBtn from "../../components/admin/ReportExportBtn.jsx";
import Loader from "../../components/common/Loader.jsx";
import { reportApi } from "../../api/report.api.js";

export default function ReportsPage() {
  const [tab, setTab] = useState("revenue");
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400 * 1000)
    .toISOString()
    .slice(0, 10);
  const [range, setRange] = useState({ from: monthAgo, to: today });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = {
        from: new Date(range.from).toISOString(),
        to: new Date(range.to).toISOString(),
      };
      const res =
        tab === "revenue"
          ? await reportApi.revenue(params)
          : await reportApi.occupancy(params);
      setData(res?.report || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [tab]);

  const totalRevenue = data.reduce((s, r) => s + Number(r.revenue || 0), 0);
  const totalSeats = data.reduce((s, r) => s + Number(r.seatsBooked || 0), 0);
  const totalBookings = data.reduce((s, r) => s + Number(r.bookings || 0), 0);

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="section-title">Reports</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Revenue and occupancy aggregations across trains and date ranges.
          </p>
        </div>
        {tab === "revenue" && (
          <ReportExportBtn
            from={range.from}
            to={range.to}
            label="Export revenue PDF"
            filename={`NexTrain-Revenue-${range.from}_to_${range.to}.pdf`}
          />
        )}
      </header>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border-subtle">
        {[
          { key: "revenue", label: "Revenue", Icon: HiOutlineCurrencyDollar },
          { key: "occupancy", label: "Occupancy", Icon: HiOutlineUsers },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={[
              "px-4 py-2 -mb-px text-sm font-medium border-b-2 transition-colors inline-flex items-center gap-2",
              tab === t.key
                ? "border-(--color-brand-400) text-text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary",
            ].join(" ")}
          >
            <t.Icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Range */}
      <div className="glass p-4 grid sm:grid-cols-[1fr_1fr_auto] gap-3">
        <div>
          <label className="field-label">From</label>
          <input
            type="date"
            value={range.from}
            onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label">To</label>
          <input
            type="date"
            value={range.to}
            onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
            className="field-input"
          />
        </div>
        <div className="flex items-end">
          <button onClick={load} className="btn-primary w-full">
            Refresh
          </button>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid sm:grid-cols-3 gap-3">
        {tab === "revenue" ? (
          <>
            <SummaryTile
              label="Total revenue"
              value={`LKR ${totalRevenue.toFixed(0)}`}
            />
            <SummaryTile label="Total bookings" value={totalBookings} />
            <SummaryTile label="Trains in report" value={data.length} />
          </>
        ) : (
          <>
            <SummaryTile label="Total seats booked" value={totalSeats} />
            <SummaryTile label="Trains in report" value={data.length} />
            <SummaryTile
              label="Avg seats / train"
              value={data.length ? (totalSeats / data.length).toFixed(1) : 0}
            />
          </>
        )}
      </div>

      {/* Table */}
      <div className="glass overflow-hidden">
        <div className="px-5 py-3 border-b border-border-subtle flex items-center gap-2">
          <HiOutlineChartBar className="h-5 w-5 text-(--color-brand-400)" />
          <span className="font-display font-semibold">
            {tab === "revenue" ? "Revenue by train" : "Occupancy by train"}
          </span>
        </div>

        {loading ? (
          <div className="p-12 grid place-items-center">
            <Loader size="md" />
          </div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center text-sm text-text-muted">
            No data for this range.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-text-muted bg-bg-base/40">
                  <th className="px-5 py-3 font-medium">Train</th>
                  {tab === "revenue" ? (
                    <>
                      <th className="px-5 py-3 font-medium text-right">
                        Bookings
                      </th>
                      <th className="px-5 py-3 font-medium text-right">
                        Revenue (LKR)
                      </th>
                    </>
                  ) : (
                    <th className="px-5 py-3 font-medium text-right">
                      Seats booked
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {data.map((row) => {
                  const name = row._id?.trainName || row._id || "—";
                  return (
                    <tr
                      key={String(row._id?.trainId || name)}
                      className="hover:bg-bg-base/30"
                    >
                      <td className="px-5 py-3 font-medium">{name}</td>
                      {tab === "revenue" ? (
                        <>
                          <td className="px-5 py-3 text-right font-mono">
                            {row.bookings}
                          </td>
                          <td className="px-5 py-3 text-right font-mono">
                            {Number(row.revenue || 0).toFixed(2)}
                          </td>
                        </>
                      ) : (
                        <td className="px-5 py-3 text-right font-mono">
                          {row.seatsBooked}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryTile({ label, value }) {
  return (
    <div className="glass p-4">
      <div className="text-[10px] uppercase tracking-wider text-text-muted">
        {label}
      </div>
      <div className="font-display font-bold text-2xl mt-1">{value}</div>
    </div>
  );
}
