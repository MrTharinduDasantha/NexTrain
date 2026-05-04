import { useEffect, useState } from "react";
import {
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineCalendarDays,
} from "react-icons/hi2";
import { toast } from "react-toastify";
import Loader from "../../components/common/Loader.jsx";
import Modal from "../../components/common/Modal.jsx";
import { scheduleApi } from "../../api/schedule.api.js";
import { trainApi } from "../../api/train.api.js";
import { formatDate } from "../../utils/formatDate.js";

const STATUSES = ["scheduled", "running", "completed", "cancelled"];

export default function SchedulesPage() {
  const [trains, setTrains] = useState([]);
  const [filter, setFilter] = useState({ train: "", from: "", to: "" });
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [newRow, setNewRow] = useState({ train: "", date: "" });

  const reloadTrains = async () => {
    const t = await trainApi.list();
    setTrains(t?.trains || []);
  };

  const reload = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.train) params.train = filter.train;
      if (filter.from) params.from = filter.from;
      if (filter.to) params.to = filter.to;
      const data = await scheduleApi.list(params);
      setSchedules(data?.schedules || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadTrains();
    reload();
  }, []);

  const updateStatus = async (id, status) => {
    await scheduleApi.update(id, { status });
    toast.success("Schedule updated");
    reload();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newRow.train || !newRow.date) {
      return toast.warn("Pick a train and date");
    }
    setSubmitting(true);
    try {
      await scheduleApi.create({
        train: newRow.train,
        date: newRow.date,
      });
      toast.success("Schedule created");
      setCreating(false);
      setNewRow({ train: "", date: "" });
      reload();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await scheduleApi.remove(deleteTarget._id);
      toast.success("Schedule deleted");
      setDeleteTarget(null);
      reload();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="section-title">Schedules</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Per-day train instances. Schedules are auto-created when users
            search, but you can also create them manually here.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="btn-primary cursor-pointer"
        >
          <HiOutlinePlus className="h-4 w-4" /> New schedule
        </button>
      </header>

      {/* Filters */}
      <div className="glass p-4">
        <div className="grid sm:grid-cols-4 gap-3">
          <div>
            <label className="field-label">Train</label>
            <select
              value={filter.train}
              onChange={(e) =>
                setFilter((f) => ({ ...f, train: e.target.value }))
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
            <label className="field-label">From</label>
            <input
              type="date"
              value={filter.from}
              onChange={(e) =>
                setFilter((f) => ({ ...f, from: e.target.value }))
              }
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label">To</label>
            <input
              type="date"
              value={filter.to}
              onChange={(e) => setFilter((f) => ({ ...f, to: e.target.value }))}
              className="field-input"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={reload}
              className="btn-ghost w-full cursor-pointer"
            >
              Apply filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden">
        {loading ? (
          <div className="p-12 grid place-items-center">
            <Loader size="md" />
          </div>
        ) : schedules.length === 0 ? (
          <div className="p-12 text-center text-sm text-text-muted">
            No schedules in this range.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-text-muted bg-bg-base/40">
                  <th className="px-5 py-3 font-medium">Train</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium w-44">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {schedules.map((s) => (
                  <tr key={s._id} className="hover:bg-bg-base/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="chip chip-brand font-mono">
                          {s.train?.number}
                        </span>
                        <span className="font-medium">{s.train?.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-2">
                        <HiOutlineCalendarDays className="h-4 w-4 text-(--color-brand-400)" />
                        {formatDate(s.date)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={s.status}
                        onChange={(e) => updateStatus(s._id, e.target.value)}
                        className="field-input py-1.5! text-xs!"
                      >
                        {STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setDeleteTarget(s)}
                        className="p-2 rounded-md text-text-secondary hover:text-rose-300 hover:bg-rose-500/10"
                        title="Delete"
                      >
                        <HiOutlineTrash className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create modal */}
      <Modal
        open={creating}
        onClose={() => !submitting && setCreating(false)}
        title="New schedule"
        size="md"
      >
        <form onSubmit={handleCreate} className="grid gap-4">
          <div>
            <label className="field-label">Train</label>
            <select
              value={newRow.train}
              onChange={(e) =>
                setNewRow((n) => ({ ...n, train: e.target.value }))
              }
              className="field-input"
              required
            >
              <option value="">Select train…</option>
              {trains.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.number} · {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Journey date</label>
            <input
              type="date"
              value={newRow.date}
              onChange={(e) =>
                setNewRow((n) => ({ ...n, date: e.target.value }))
              }
              min={new Date().toISOString().slice(0, 10)}
              className="field-input"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setCreating(false)}
              disabled={submitting}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? "Creating…" : "Create schedule"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={!!deleteTarget}
        onClose={() => !submitting && setDeleteTarget(null)}
        title="Delete schedule"
        size="sm"
        footer={
          <>
            <button
              onClick={() => setDeleteTarget(null)}
              disabled={submitting}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={submitting}
              className="btn-danger"
            >
              {submitting ? "Deleting…" : "Delete"}
            </button>
          </>
        }
      >
        <p className="text-sm">
          Delete schedule for{" "}
          <span className="font-semibold">
            {deleteTarget?.train?.number} on {formatDate(deleteTarget?.date)}
          </span>
          ? Existing bookings on this schedule will not be deleted.
        </p>
      </Modal>
    </div>
  );
}
