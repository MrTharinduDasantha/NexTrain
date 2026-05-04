import { useState } from "react";
import { Link } from "react-router";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineFunnel,
  HiOutlineArrowRight,
} from "react-icons/hi2";
import { formatDate } from "../../utils/formatDate.js";

/**
 * Admin booking table.
 *
 * Props:
 *   bookings: array of populated Booking objects
 *   trains:   optional [{ _id, number, name }] for the filter dropdown
 *   onSearch: ({ pnr, train, status, from, to }) => void
 *   loading:  boolean
 */
export default function BookingTable({
  bookings = [],
  trains = [],
  onSearch,
  loading,
}) {
  const [filters, setFilters] = useState({
    pnr: "",
    train: "",
    status: "",
    from: "",
    to: "",
  });

  const submit = (e) => {
    e.preventDefault();
    onSearch &&
      onSearch({
        pnr: filters.pnr.trim() || undefined,
        train: filters.train || undefined,
        status: filters.status || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
      });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <form onSubmit={submit} className="glass p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4 text-sm">
          <HiOutlineFunnel className="h-5 w-5 text-(--color-brand-400)" />
          <span className="font-medium">Filter bookings</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="lg:col-span-2">
            <label className="field-label">PNR</label>
            <input
              type="text"
              value={filters.pnr}
              onChange={(e) =>
                setFilters((f) => ({ ...f, pnr: e.target.value.toUpperCase() }))
              }
              placeholder="NX12345678"
              className="field-input font-mono"
            />
          </div>
          <div>
            <label className="field-label">Train</label>
            <select
              value={filters.train}
              onChange={(e) =>
                setFilters((f) => ({ ...f, train: e.target.value }))
              }
              className="field-input"
            >
              <option value="">All trains</option>
              {trains.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.number} · {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Status</label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((f) => ({ ...f, status: e.target.value }))
              }
              className="field-input"
            >
              <option value="">All</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending_payment">Pending payment</option>
              <option value="cancelled">Cancelled</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div>
            <label className="field-label">From</label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) =>
                setFilters((f) => ({ ...f, from: e.target.value }))
              }
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label">To</label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) =>
                setFilters((f) => ({ ...f, to: e.target.value }))
              }
              className="field-input"
            />
          </div>
        </div>
        <div className="flex justify-end mt-3">
          <button type="submit" disabled={loading} className="btn-primary">
            <HiOutlineMagnifyingGlass className="h-4 w-4" />
            {loading ? "Searching…" : "Search"}
          </button>
        </div>
      </form>

      {/* Results */}
      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-text-muted bg-bg-base/40">
                <th className="px-4 py-3 font-medium">PNR</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Train</th>
                <th className="px-4 py-3 font-medium">Route</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Seats</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {bookings.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-text-muted"
                  >
                    No bookings match the current filters.
                  </td>
                </tr>
              )}
              {bookings.map((b) => (
                <tr key={b._id} className="hover:bg-bg-base/30">
                  <td className="px-4 py-3">
                    <Link
                      to={`/tickets/${b.pnr}`}
                      className="font-mono font-semibold text-brand-300 hover:underline"
                    >
                      {b.pnr}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium truncate max-w-45">
                      {b.user?.name || "—"}
                    </div>
                    <div className="text-xs text-text-muted truncate max-w-45">
                      {b.user?.email}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs text-text-muted">
                      {b.train?.number}
                    </div>
                    <div className="font-medium truncate max-w-40">
                      {b.train?.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono">{b.fromStation?.code}</span>
                      <HiOutlineArrowRight className="h-3 w-3 text-text-muted" />
                      <span className="font-mono">{b.toStation?.code}</span>
                    </div>
                    <div className="text-[10px] text-text-muted mt-0.5">
                      {b.trainClass?.code}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {formatDate(b.journeyDate)}
                  </td>
                  <td className="px-4 py-3">{b.seats?.length}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {Number(b.fare?.total || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={b.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {b.status === "confirmed" && (
                      <Link
                        to={`/tickets/${b.pnr}`}
                        className="text-xs text-(--color-brand-400) hover:underline whitespace-nowrap"
                      >
                        View →
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    confirmed: {
      label: "Confirmed",
      cls: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    },
    pending_payment: {
      label: "Pending",
      cls: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    },
    cancelled: {
      label: "Cancelled",
      cls: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    },
    failed: {
      label: "Failed",
      cls: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    },
  };
  const cfg = map[status] || {
    label: status,
    cls: "bg-slate-500/10 text-slate-300 border-slate-500/30",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
}
